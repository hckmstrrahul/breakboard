import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createOperation,advanceOperation} from '../src/operation.js';
import {createAnatomy} from '../src/anatomy.js';
import {isMovingPart} from '../src/hardware-motion.js';

const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
globalThis.__BREAKBOARD_ASSETS=Object.fromEntries(fs.readdirSync('public/models').filter(f=>f.endsWith('.json.gz')).map(f=>[f.replace('.json.gz',''),fs.readFileSync('public/models/'+f).toString('base64')]));
const {BOARD_LIST}=await import('../src/boards.js');
const expectedLights={esp32:1,pi5:0,uno:4,jetson:0,pico2w:1,nano:4,orangepi5:2,beaglebone:5,nucleo:3};
const powered={playing:true,explode:0,reduced:false,isolate:false};
for(const def of BOARD_LIST){
 const model=await def.build();model.setPose(0);model.setSelection(def.parts[0].id,false,false);model.root.updateMatrixWorld(true);
 const operation=createOperation(model,def);
 assert.equal(operation.rotors.length,['pi5','jetson'].includes(def.id)?1:0,def.id+' has only its physical fan');
 assert.equal(operation.indicators.size,expectedLights[def.id],def.id+' only existing identified LEDs illuminate');
 for(const record of model.batches||[])assert(record.entries.every(entry=>!isMovingPart(entry.object)),def.id+' rotors excluded from static batches');
 const stationary=[];model.root.traverse(o=>{if(o.isMesh&&!o.isBatchedMesh&&!isMovingPart(o))stationary.push([o,o.matrixWorld.clone()]);});
 operation.update(1/60,{...powered,explode:.5});assert.equal(operation.state.power,0,'No operation before assembly');
 for(let frame=0;frame<180;frame++)operation.update(1/60,powered);
 assert(operation.state.power>.99);assert(operation.root.visible);
 if(operation.rotors.length)assert(operation.rotors[0].rotation.y>0,'Impeller rotates');
 model.root.updateMatrixWorld(true);for(const[o,matrix]of stationary)assert.deepEqual(o.matrixWorld.elements,matrix.elements,def.id+' shrouds, cables and sockets stay fixed');
 for(const mat of operation.indicators)assert(mat.emissiveIntensity>0,'LED has emissive activity');
 for(const route of operation.routes){
  assert(route.curve.v0.distanceTo(new T.Vector3(...def.parts.find(p=>p.id===route.from).anchor))<1e-6);
  assert(route.curve.v3.distanceTo(new T.Vector3(...def.parts.find(p=>p.id===route.to).anchor))<1e-6,'Routes terminate at their real assembly anchors');
 }
 operation.update(1/60,{...powered,isolate:true});assert(!operation.root.visible,'No floating connections to hidden parts');
 const angle=operation.state.angle,time=operation.state.time;operation.update(1/60,{...powered,reduced:true});assert.equal(operation.state.angle,angle);assert.equal(operation.state.time,time,'Reduced motion is a still powered state');
 for(let frame=0;frame<180;frame++)operation.update(1/60,{...powered,playing:false});assert.equal(operation.state.power,0);assert(!operation.root.visible);
 operation.reset();assert.equal(operation.state.angle,0);for(const mat of operation.indicators)assert.equal(mat.emissiveIntensity,0);

 const anatomy=createAnatomy(model);assert(anatomy.entries.length>0);
 const originalArtwork=[];model.root.traverse(source=>{if(source.isMesh&&!source.isBatchedMesh&&(source.userData.originalMaterial||source.material).map)originalArtwork.push(source);});
 assert(originalArtwork.length>0,def.id+' has original surface artwork');
 assert.equal(anatomy.markings.length,originalArtwork.length,def.id+' preserves every existing logo, label and graphic');
 for(const mark of anatomy.markings){
  assert(originalArtwork.includes(mark.source));assert.equal(mark.body.geometry,mark.source.geometry,'Artwork reuses exact surface geometry and UVs');
  const texture=(mark.source.userData.originalMaterial||mark.source.material).map;
  assert.equal(mark.solid.map,texture);assert.equal(mark.ghost.map,texture,'Both modes retain the original artwork');
  assert(mark.solid.depthTest&&!mark.solid.depthWrite,'Artwork is occluded by real parts and does not cover contours with a depth plane');
 }
 if(def.id==='esp32'){
  assert.equal(anatomy.markings.filter(mark=>mark.solid.map.userData.anatomyBackground).length,3,'Opaque PCB artwork backgrounds are removed without losing ink');
  for(const id of ['shield','cpu','flash','power','bridge'])assert(anatomy.entries.filter(entry=>entry.id===id).some(entry=>entry.lines.geometry.attributes.position.count>0),id+' has actual rounded-package contour lines');
 }
 for(const selected of [null,def.parts[0].id,null,def.parts.at(-1).id,null])for(const pose of [0,.5,1]){
  model.setPose(pose);model.setSelection(selected,false,true);anatomy.update(selected);
  for(const entry of anatomy.entries){
   assert.equal(entry.body.geometry,entry.source.geometry,def.id+' anatomy reuses exact geometry');
   assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements,def.id+' drawing follows source transform');
   assert.deepEqual(entry.lines.matrix.elements,entry.body.matrix.elements);
   const isSubject=selected===null||entry.id===selected;
   assert.equal(entry.body.parent,isSubject?anatomy.subject:anatomy.context);
   assert.equal(entry.body.material.transparent,!isSubject,'Unselected anatomy is fully drawn; only context around a selection is ghosted');
   assert(entry.body.visible,'Full context remains in X-ray');
   assert(entry.body.material.depthWrite,'Front surfaces retain depth ordering');
  }
  for(const mark of anatomy.markings){
   const isSubject=selected===null||mark.id===selected;
   assert.deepEqual(mark.body.matrix.elements,mark.source.matrixWorld.elements,'Surface artwork follows separation and pose');
   assert.equal(mark.body.parent,isSubject?anatomy.subject:anatomy.context);
   assert.equal(mark.body.material,isSubject?mark.solid:mark.ghost);
   assert.equal(mark.body.visible,mark.group.visible);assert(mark.solid.opacity>mark.ghost.opacity,'Only context artwork is ghosted');
  }
  if(selected!==null){model.setSelection(selected,true,true);anatomy.update(selected);
   for(const entry of [...anatomy.entries,...anatomy.markings])assert.equal(entry.body.visible,entry.id===selected,'Isolation is retained for geometry and artwork');}
 }
 for(const dark of[false,true]){anatomy.setTheme(dark);operation.setTheme(dark);}
 if(operation.rotors.length){model.setPose(0);model.setSelection(def.id==='jetson'?'fan':'blower',false,true);operation.update(1/60,powered);anatomy.update(def.id==='jetson'?'fan':'blower');for(const entry of [...anatomy.entries,...anatomy.markings].filter(e=>isMovingPart(e.source)))assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements,'Anatomy and markings follow rotating impeller');}
 console.log(`PASS · ${def.tab}: exact anatomy geometry/pose/isolation, ${anatomy.markings.length} original artwork layers; ${operation.rotors.length} rotor, ${operation.indicators.size} LEDs; assembly gating, reduced motion, stop/reset and attached signal paths`);
}
const first={power:0,angle:0,time:0},second={power:0,angle:0,time:0};
for(let i=0;i<60;i++)advanceOperation(first,1/60,{playing:true,assembled:true,reduced:false});
for(let i=0;i<120;i++)advanceOperation(second,1/120,{playing:true,assembled:true,reduced:false});
assert(Math.abs(first.power-second.power)<1e-10,'Power envelope is frame-rate independent');
