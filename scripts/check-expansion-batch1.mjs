import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createOperation} from '../src/operation.js';
import {createAnatomy} from '../src/anatomy.js';
import {isMovingPart} from '../src/hardware-motion.js';

// Production geometry, material ownership and behaviours run in Node. Browser
// proofs remain necessary for text, transparency, framing and visual quality.
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:String(text).length*30}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const definitions=[
 (await import('../src/relay.js')).RELAY_BOARD,
 (await import('../src/bldc.js')).BLDC_BOARD,
 (await import('../src/haptic.js')).HAPTIC_BOARD,
 (await import('../src/as5600.js')).AS5600_BOARD,
 (await import('../src/quartz.js')).QUARTZ_BOARD
];
assert.deepEqual(definitions.map(d=>d.id),['relay','bldc','haptic','as5600','quartz']);
const running={playing:true,explode:0,reduced:false,isolate:false,selected:null};
function tick(operation,seconds=1,options=running,rate=60){
 for(let i=0;i<Math.round(seconds*rate);i++)operation.update(1/rate,options);
}
function meshState(model){
 model.root.updateMatrixWorld(true);
 const result=[];
 model.root.traverse(o=>{
  if(!o.isMesh||o.isBatchedMesh)return;
  result.push(...o.matrixWorld.elements);
  const positions=o.geometry.attributes.position;
  // Deforming membranes and springs do not necessarily change their transform.
  for(let i=0;i<positions.array.length;i+=Math.max(1,Math.floor(positions.array.length/40)))result.push(positions.array[i]);
 });
 return result;
}
// Sub-nanometre accumulation in floating point transforms is not visible motion.
function signature(model){return JSON.stringify([meshState(model).map(v=>Math.round(v*1e9)/1e9),model.behavior.getReadouts()]);}
function finiteReadouts(model,id){
 const values=model.behavior.getReadouts();
 assert(Array.isArray(values)&&values.length>0,id+' exposes useful readouts');
 for(const row of values){
  assert.equal(typeof row.label,'string');assert(row.label.length>0);
  assert(['string','number'].includes(typeof row.value),id+' formatted readout value');
  assert(!/NaN|Infinity|undefined/.test(String(row.value)),id+' finite readout');
 }
}
const reports=[];
for(const def of definitions.filter(d=>!process.argv.includes('--micro')||['haptic','as5600','quartz'].includes(d.id))){
 const evidence=fs.readFileSync(`reference/${def.id}/evidence.md`,'utf8');
 assert(/documented/i.test(evidence)&&/representative|estimated/i.test(evidence),def.id+' distinguishes evidence types');
 assert(def.sources.length>=2&&def.accuracy.length>60,def.id+' public provenance');
 assert(Array.isArray(def.controls)&&def.controls.length>0,def.id+' meaningful inputs');
 const model=await def.build(),operation=createOperation(model,def);
 assert(model.behavior,def.id+' behaviour exists');
 for(const name of ['update','reset','setControl','getReadouts'])assert.equal(typeof model.behavior[name],'function',def.id+'/'+name);
 assert.deepEqual(Object.keys(model.groups).sort(),def.parts.map(p=>p.id).sort(),def.id+' inventory matches geometry');
 const moving=[];let triangles=0;
 model.root.traverse(o=>{
  if(!o.isMesh||o.isBatchedMesh)return;
  const attr=o.geometry.attributes.position;
  assert(attr&&attr.count>0,def.id+' nonempty mesh');
  for(const v of attr.array)assert(Number.isFinite(v),def.id+' finite vertices');
  if(o.geometry.index)for(const i of o.geometry.index.array)assert(i>=0&&i<attr.count,def.id+' valid mesh indices');
  triangles+=(o.geometry.index?.count||attr.count)/3;
  if(isMovingPart(o))moving.push(o);
  if(o.userData.decal)assert(!o.castShadow,def.id+' markings do not cast rectangular shadows');
 });
 assert(moving.length>0,def.id+' moving geometry survives construction');
 for(const record of model.batches||[])assert(record.entries.every(entry=>!isMovingPart(entry.object)),def.id+' moving hardware excluded from static batches');
 for(const separation of [0,.25,.5,.75,1]){
  model.setPose(separation);model.root.updateMatrixWorld(true);
  for(const p of def.parts){
   const box=new T.Box3().setFromObject(model.groups[p.id]);
   assert(!box.isEmpty(),def.id+'/'+p.id+' present at every separation');
   assert(box.min.y>=(def.floorY??-19.2)-.01,def.id+'/'+p.id+' clears floor');
   assert.deepEqual(model.groups[p.id].position.toArray(),p.offset.map(n=>n*separation));
  }
 }
 model.setPose(0);operation.reset();operation.update(0,running);
 finiteReadouts(model,def.id);
 for(const c of def.controls){
  assert([c.min,c.max,c.step,c.value].every(Number.isFinite),def.id+'/'+c.id+' finite input limits');
  assert(c.max>c.min&&c.step>0&&c.value>=c.min&&c.value<=c.max,def.id+'/'+c.id+' coherent input range');
  const signatures=[];
  for(const value of [c.min,c.value,Math.min(c.max,c.min+Math.round((c.max-c.min)/2/c.step)*c.step),c.max]){
   operation.reset();model.behavior.setControl(c.id,value);tick(operation,.37);finiteReadouts(model,def.id);signatures.push(signature(model));
  }
  // Rotary 0/360 endpoints may legitimately describe the same physical state.
  assert(new Set(signatures).size>1,def.id+'/'+c.id+' input changes the mechanism or output');
 }
 operation.reset();tick(operation,.47);const active=signature(model);
 tick(operation,.5,{...running,playing:false});const paused=signature(model);
 tick(operation,.5,{...running,playing:false});assert.equal(signature(model),paused,def.id+' paused mechanism remains still');
 operation.reset();operation.update(0,{...running,playing:false});const reset=signature(model);
 assert.notEqual(active,reset,def.id+' Play operates the device');
 tick(operation,1);operation.reset();operation.update(0,{...running,playing:false});assert.equal(signature(model),reset,def.id+' repeated reset restores default geometry and readouts');
 // Reduced motion permits a static powered state, not ongoing displacement.
 operation.reset();tick(operation,1,{...running,reduced:true});const reduced=signature(model);
 tick(operation,1,{...running,reduced:true});assert.equal(signature(model),reduced,def.id+' reduced-motion state remains still');
 // Operation is gated while the assembly is separated.
 operation.reset();model.setPose(.5);tick(operation,1,{...running,explode:.5});const separated=signature(model);
 tick(operation,1,{...running,explode:.5});assert.equal(signature(model),separated,def.id+' separated parts do not run');
 model.setPose(0);operation.reset();
 // Selection must restore the exact material objects after every part. Context
 // remains visible and ghosted in both rendered normal and anatomy views.
 model.setSelection(null,false,false);
 const materials=new Map();model.root.traverse(o=>{if(o.isMesh&&!o.isBatchedMesh)materials.set(o,o.material);});
 for(const p of def.parts){
  model.setSelection(p.id,false,true);
  for(const [id,g]of Object.entries(model.groups))g.traverse(o=>{
   if(!o.isMesh)return;
   if(id===p.id)assert.equal(o.material,materials.get(o),def.id+' selected material stays original');
   else assert(o.material.transparent&&o.material.opacity<=.1&&!o.material.depthWrite,def.id+' context ghost');
  });
  model.setSelection(p.id,true,true);assert.equal(Object.values(model.groups).filter(g=>g.visible).length,1,def.id+' isolation');
 }
 model.setSelection(null,false,false);for(const[o,m]of materials)assert.equal(o.material,m,def.id+' deselection restores material identity');
 const anatomy=createAnatomy(model);
 anatomy.update(null);
 const restContours=new Map(anatomy.entries.map(entry=>[entry,Array.from(entry.lines.geometry.attributes.position.array)]));
 tick(operation,.47);anatomy.update(null);
 let deformedContours=0;
 for(const entry of anatomy.entries){
  assert.equal(entry.body.geometry,entry.source.geometry,def.id+' anatomy shares actual geometry');
  assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements,def.id+' anatomy follows operated hardware');
  const expected=new T.EdgesGeometry(entry.source.geometry,20);
  assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),Array.from(expected.attributes.position.array),def.id+' anatomy contours follow actual deformed surface');expected.dispose();
  if(JSON.stringify(restContours.get(entry))!==JSON.stringify(Array.from(entry.lines.geometry.attributes.position.array)))deformedContours++;
 }
 if(['relay','haptic','quartz'].includes(def.id))assert(deformedContours>0,def.id+' operating flexures actually change anatomy contours');
 operation.reset();anatomy.update(null);
 for(const entry of anatomy.entries)assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),restContours.get(entry),def.id+' reset restores undeformed anatomy contours');
 const size=id=>new T.Box3().setFromObject(model.groups[id],true).getSize(new T.Vector3());
 const close=(actual,expected,tolerance=.025)=>assert(Math.abs(actual-expected)<tolerance,`${def.id}: ${actual} should match documented ${expected} ± ${tolerance}`);
 const output=label=>model.behavior.getReadouts().find(row=>row.label===label)?.value;
 if(def.id==='relay'){
  close(size('cover').x,28.8);close(size('cover').z,12.7);
  // Independent bottom-view pin coordinates from the manufacturer's drawing.
  for(const[x,z,id]of [[-12.3,-3.75,'coilpins'],[-12.3,3.75,'coilpins'],[4.2,-3.75,'nc'],[11.2,-3.75,'no'],[7.7,3.75,'common']]){
   const ray=new T.Raycaster(new T.Vector3(x,-10,z),new T.Vector3(0,1,0));const hit=ray.intersectObject(model.groups[id],true)[0];assert(hit,'documented PCB terminal exists');close(hit.point.y,-4,.002);
  }
  model.behavior.setControl('cycle',0);model.behavior.setControl('coil',0);assert.equal(output('Contact path'),'4 → 2 (NC)');assert.equal(output('Coil current'),'0');
  model.behavior.setControl('coil',1);assert.equal(output('Contact path'),'4 → 3 (NO)');assert.equal(output('Coil current'),'43.6');
  const contactGroup=model.groups.common.children.find(o=>o.isGroup&&o.userData.dynamic),contacts=contactGroup.children.filter(o=>o.geometry?.type==='CylinderGeometry');assert.equal(contacts.length,2);
  for(const command of [0,1]){
   model.behavior.setControl('coil',command);model.root.updateMatrixWorld(true);
   const moving=contacts[command],center=moving.getWorldPosition(new T.Vector3()),direction=new T.Vector3(0,command?-1:1,0),target=model.groups[command?'no':'nc'];
   const hit=new T.Raycaster(center,direction).intersectObject(target,true)[0];assert(hit,'moving silver face meets fixed contact');close(hit.distance,.125,.002);
  }
 }
 if(def.id==='bldc'){
  close(size('shaft').x,4,.002);close(size('shaft').y,32.6,.002);close(size('shaft').z,4,.002);
  const rotor=model.groups.magnets.children.find(o=>o.userData.dynamic);assert.equal(rotor.children.filter(o=>o.isMesh).length,12,'twelve actual magnet sectors');
  const capRay=(x,z)=>new T.Raycaster(new T.Vector3(x,40,z),new T.Vector3(0,-1,0)).intersectObject(model.groups.bell,true);
  for(let opening=0;opening<6;opening++){const angle=opening*Math.PI/3;assert.equal(capRay(Math.cos(angle)*8,Math.sin(angle)*8).length,0,`BLDC cap vent ${opening+1} is an actual through-aperture`);}
  for(const z of [-6,6])assert.equal(capRay(0,z).length,0,'BLDC adapter bore is an actual through-aperture');
  assert(capRay(0,11).length>0,'BLDC bridge remains solid between apertures');
  const before=new Map(['stator','phaseu','phasev','phasew','base','leads'].map(id=>[id,model.groups[id].matrixWorld.clone()]));
  model.behavior.setControl('speed',1200);model.behavior.setControl('direction',1);tick(operation,1);
  close(rotor.rotation.y,-Math.PI*2/3,1e-8);assert.equal(output('Electrical frequency'),'120');
  for(const[id,matrix]of before)assert.deepEqual(model.groups[id].matrixWorld.elements,matrix.elements,id+' stays fixed while external rotor turns');
  model.behavior.setControl('speed',0);const angle=rotor.rotation.y;tick(operation,.4);close(rotor.rotation.y,angle,1e-10);
  operation.reset();model.behavior.setControl('direction',-1);tick(operation,1);close(rotor.rotation.y,Math.PI*2/3,1e-8);
  const field=model.fieldOverlay;assert(field?.userData.illustrative&&field.children.length===12,'twelve explicitly illustrative field arrows');close(field.rotation.y,rotor.rotation.y,1e-10);assert(field.visible,'field follows assembled Play');
  const radialDirections=field.children.map(arrow=>{const direction=new T.Vector3(0,1,0).applyQuaternion(arrow.quaternion),radial=arrow.position.clone().setY(0).normalize();return Math.sign(direction.dot(radial));});
  for(let i=0;i<12;i++)assert.equal(radialDirections[i],i%2===0?-1:1,'alternating pole field directions');
  for(const patch of [{playing:false},{selected:'stator'},{isolate:true},{explode:.5}]){operation.update(0,{...running,...patch});assert.equal(field.visible,false,'field hides for paused, selected, isolated and separated views');}
  operation.reset();assert(!field.visible,'reset hides field');operation.update(0,{...running,reduced:true});const frozenField=field.rotation.y;tick(operation,.5,{...running,reduced:true});close(field.rotation.y,frozenField,1e-10);
 }
 if(def.id==='haptic'){
  close(size('case').x,10);close(size('case').z,10);
  const shell=new T.Box3().setFromObject(model.groups.case),lid=new T.Box3().setFromObject(model.groups.lid);close(lid.max.y-shell.min.y,3.7);
  const amplitudeFor=frequency=>{operation.reset();model.behavior.setControl('amplitude',100);model.behavior.setControl('frequency',frequency);let amplitude=0;for(let i=0;i<120;i++){operation.update(1/120,running);const moving=model.groups.mass.children.find(o=>o.userData.dynamic);const magnet=model.groups.magnet.children.find(o=>o.userData.dynamic);close(moving.position.y,magnet.position.y,1e-8);amplitude=Math.max(amplitude,Math.abs(moving.position.y));}return amplitude;};
  const resonant=amplitudeFor(175),below=amplitudeFor(140),above=amplitudeFor(210);assert(resonant>.14&&resonant<=.150001);assert(below<resonant*.5&&above<resonant*.5,'illustrative haptic resonance peaks at documented 175 Hz');
  model.behavior.setControl('amplitude',0);tick(operation,.4);close(model.groups.mass.children.find(o=>o.userData.dynamic).position.y,0,1e-8);
  const displacementAt=(pattern,time)=>{operation.reset();model.behavior.setControl('amplitude',100);model.behavior.setControl('pattern',pattern);tick(operation,time);return Math.abs(model.groups.mass.children.find(o=>o.userData.dynamic).position.y);};
  for(const pattern of [1,2]){close(displacementAt(pattern,.05),0,1e-8);assert(displacementAt(pattern,.35)>.14,'tap first pulse moves the mass');close(displacementAt(pattern,.7),0,1e-8);}
  close(displacementAt(1,1.1),0,1e-8);assert(displacementAt(2,1.1)>.1,'double tap has a second pulse');close(displacementAt(2,1.6),0,1e-8);
 }
 if(def.id==='as5600'){
  close(size('pcb').x,22);close(size('pcb').z,28);close(size('magnet').x,6);close(size('magnet').z,6);
  const magnet=new T.Box3().setFromObject(model.groups.magnet),mold=new T.Box3().setFromObject(model.groups.mold);close(magnet.min.y-mold.max.y,1.5);
  for(const[angle,raw]of [[0,0],[90,1024],[180,2048],[270,3072],[360,0]]){model.behavior.setControl('angle',angle);assert.equal(output('Raw angle'),raw,'12-bit angle mapping');}
  model.behavior.setControl('angle',30);model.behavior.setControl('speed',-90);tick(operation,1);assert.equal(output('Magnet angle'),'300.0','negative angular speed wraps continuously');
 }
 if(def.id==='quartz'){
  close(size('package').x,3.2,.001);close(size('package').z,1.5,.001);
  const body=new T.Box3().setFromObject(model.groups.package),lid=new T.Box3().setFromObject(model.groups.lid);assert(lid.max.y<.91&&body.min.y>=0,'FC-135 maximum height');
  const terminals=new T.Box3().setFromObject(model.groups.terminals);assert(terminals.max.x>body.max.x+.003&&terminals.max.x<body.max.x+.05,'terminal exposed faces stand clear of ceramic rather than occupying a coplanar surface');
  for(let stages=0;stages<=15;stages++){model.behavior.setControl('divider',stages);assert.equal(output('External clock output'),32768/2**stages,'external binary division');}
  const tines=[];model.groups.fork.traverse(o=>{if(o.userData.deforming)tines.push(o);});assert.equal(tines.length,2,'two quartz tines');
  operation.reset();const rest=tines.map(o=>o.geometry.attributes.position.array.slice());model.behavior.setControl('amplitude',100);tick(operation,.13);
  const displacement=tines.map((o,i)=>{const pos=o.geometry.attributes.position.array;for(let v=0;v<12;v++)close(pos[v],rest[i][v],1e-8);return pos[pos.length-1]-rest[i][pos.length-1];});
  assert(displacement[0]*displacement[1]<0,'quartz tines flex in opposition');close(displacement[0]+displacement[1],0,1e-6);assert(displacement.every(v=>Math.abs(v)>.04&&Math.abs(v)<=.04501),'enlarged travel remains bounded');
 }
 operation.reset();reports.push({device:def.tab,parts:def.parts.length,movingMeshes:moving.length,triangles});
 console.log(`PASS · ${def.tab}: geometry, full separation, input causality, reset, reduced motion, assembly gating, material restoration and anatomy`);
}
console.table(reports);
