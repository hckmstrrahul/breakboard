// Full-catalogue GPU reuse and frame-submission gate. This measures desktop CPU
// submission, not GPU timer queries or physical-phone frame delivery.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../',import.meta.url));
const out=process.env.BREAKBOARD_PROOF_DIR||path.join(os.tmpdir(),'breakboard-proof/final-gpu');
const server=await createServer({root:project,server:{host:'127.0.0.1',port:0}});await server.listen();
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
 const page=await browser.newPage({viewport:{width:1280,height:960},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/__gpu_gate',r=>r.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0"><div id="host" style="width:1280px;height:960px"></div></body></html>'}));
 await page.goto(server.resolvedUrls.local[0]+'__gpu_gate');
 const environment=await page.evaluate(async()=>{const{createScene}=await import('/src/scene.js'),{BOARD_LIST}=await import('/src/boards.js');window.gate={stage:createScene(document.getElementById('host'),()=>{}),boards:BOARD_LIST};const gl=gate.stage.renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info');return{agent:navigator.userAgent,renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),ids:BOARD_LIST.map(d=>d.id),viewport:[1280,960],pixelRatio:devicePixelRatio};});
 const passes=[];
 for(let cycle=0;cycle<3;cycle++){
  const rows=[];
  for(const id of environment.ids){const row=await page.evaluate(async({id,cycle})=>{
   const{stage,boards}=gate,def=boards.find(d=>d.id===id);await stage.setBoard({...def,start:0});stage.setTheme('dark');
   const state={explode:0,selected:null,isolate:false,xray:false,guides:false,rotate:false,playing:true};
   const timing={};for(const mode of[false,true]){state.xray=mode;for(let i=0;i<12;i++)stage.render(state,i/60,1/60);const samples=[];for(let i=0;i<40;i++){const start=performance.now();stage.render(state,(i+12)/60,1/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);timing[mode?'anatomy':'normal']={p95:samples[Math.floor(samples.length*.95)],max:samples.at(-1)};}
   return{id,cycle,cache:stage.cachedDeviceIds,memory:{...stage.renderer.info.memory},programs:stage.renderer.info.programs.length,timing,contextLost:stage.renderer.getContext().isContextLost()};
  },{id,cycle});assert(row.cache.length<=3,`${id} bounded GPU model cache`);assert(row.cache.includes(id));assert(!row.contextLost,id+' WebGL context retained');rows.push(row);}
  passes.push(rows);console.log(`PASS catalogue traversal ${cycle+1}: ${rows.length} devices, bounded cache, no lost contexts`);
 }
 // Compare identical visits after one complete warm-up traversal. Even the
 // first few visits then begin with the same three previously retained models.
 for(let i=0;i<environment.ids.length;i++){
  const a=passes[1][i],b=passes[2][i];assert.deepEqual(b.memory,a.memory,b.id+' stable geometry and texture allocation on repeated full traversals');assert.equal(b.programs,a.programs,b.id+' stable compiled-program count');
 }
 assert.deepEqual(errors,[],'No page/WebGL errors');await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'catalogue-gpu.json'),JSON.stringify({environment,passes},null,2));
 console.log(`PASS ${environment.ids.length} devices ×3 traversals: stable GPU allocations after warm-up. Report ${out}/catalogue-gpu.json`);
}finally{await browser?.close();await server.close();}
