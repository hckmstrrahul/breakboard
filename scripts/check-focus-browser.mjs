// Project actual selected geometry after focus and viewport changes. This catches
// stale deforming bounds, assembled/exploded scale confusion and depth clipping.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';

const project=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.BREAKBOARD_PROOF_DIR||path.join(os.tmpdir(),'breakboard-proof/final-focus');
const server=await createServer({root:project,server:{host:'127.0.0.1',port:0}});
await server.listen();
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/__focus_gate',route=>route.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0"><div id="host" style="width:100vw;height:100vh"></div></body></html>'}));
 await page.goto(server.resolvedUrls.local[0]+'__focus_gate');
 const ids=await page.evaluate(async()=>{
  const T=await import('/node_modules/three/build/three.module.js');
  const {BOARD_LIST}=await import('/src/boards.js'),{createScene}=await import('/src/scene.js');
  window.gate={T,boards:BOARD_LIST,stage:createScene(document.getElementById('host'),()=>{}),state:null};
  gate.measure=()=>{
   const {stage,state}=gate;stage.camera.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(stage.model.groups[state.selected],true),point=new T.Vector3(),extent={x:0,y:0,z:0};
   for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
    point.set(x,y,z).project(stage.camera);
    for(const axis of['x','y','z'])extent[axis]=Math.max(extent[axis],Math.abs(point[axis]));
   }
   return{...extent,zoom:stage.camera.zoom,size:bounds.getSize(new T.Vector3()).toArray()};
  };
  return BOARD_LIST.map(def=>def.id);
 });
 const rows=[],resizes=[];
 for(const id of ids){
  await page.evaluate(async id=>{const {stage,boards}=gate;await stage.setBoard({...boards.find(def=>def.id===id),start:0});},id);
  for(const [width,height]of[[1440,900],[390,580],[390,180]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(30);
   const measured=await page.evaluate(async id=>{
    const{stage,boards}=gate,def=boards.find(d=>d.id===id),result=[];
    for(const explode of[0,1])for(const part of def.parts){
     gate.state={explode,selected:part.id,isolate:true,xray:false,guides:false,rotate:false,playing:false};
     stage.select(part.id,true,false,explode);await new Promise(resolve=>setTimeout(resolve,4));stage.render(gate.state,0,0);
     result.push({id,part:part.id,explode,...gate.measure()});
    }
    return result;
   },id);
   rows.push(...measured.map(row=>({...row,width,height})));
  }
  // Keep the largest selected part isolated while resizing; do not reselect it.
  await page.evaluate(id=>{
   const{stage,boards,T}=gate,def=boards.find(d=>d.id===id);stage.model.setPose(0);
   const part=def.parts.reduce((a,b)=>{
    const extent=p=>new T.Box3().setFromObject(stage.model.groups[p.id],true).getSize(new T.Vector3()).length();return extent(a)>extent(b)?a:b;
   });
   gate.state={explode:0,selected:part.id,isolate:true,xray:false,guides:false,rotate:false,playing:false};stage.select(part.id,true,false,0);
  },id);
  await page.waitForTimeout(10);await page.evaluate(()=>gate.stage.render(gate.state,0,0));
  for(const[width,height]of[[1440,900],[390,580],[390,180],[1440,900]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(60);
   const row=await page.evaluate(()=>{gate.stage.render(gate.state,0,0);return{part:gate.state.selected,...gate.measure()};});resizes.push({id,width,height,...row});
  }
  console.log(`Checked ${id}: both poses, three viewport shapes and resize while isolated`);
 }
 const failures=[...rows,...resizes].filter(row=>['x','y','z'].some(axis=>!Number.isFinite(row[axis])||row[axis]>1.0001));
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'focus-bounds.json'),JSON.stringify({ids,rows,resizes,errors,failures},null,2));
 assert.deepEqual(errors,[],'No browser errors');assert.deepEqual(failures,[],'Every selected component fits horizontal, vertical and depth clipping planes');
 console.log(`PASS ${ids.length} models, ${rows.length} part/pose/viewport checks, ${resizes.length} isolated resize checks`);
}finally{await browser?.close();await server.close();}
