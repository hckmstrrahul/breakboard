import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createOperation} from '../src/operation.js';
import {createAnatomy} from '../src/anatomy.js';
import {isMovingPart} from '../src/hardware-motion.js';
import {pickComponent} from '../src/selection.js';

const canvasContext=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:String(text).length*30}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>canvasContext})};
const ids=['memsmic','armature','planar','bme688','scd41'];
const running={playing:true,explode:0,reduced:false,isolate:false,selected:null};
const round=value=>Math.round(value*1e9)/1e9;
const close=(actual,expected,tolerance=1e-6,message='numeric agreement')=>assert(Math.abs(actual-expected)<=tolerance,`${message}: ${actual} vs ${expected} ±${tolerance}`);
function tick(operation,seconds,options=running){for(let i=0;i<Math.round(seconds*120);i++)operation.update(1/120,options);}
function state(model){
 model.root.updateMatrixWorld(true);const values=[];
 model.root.traverse(object=>{
  if(!object.geometry||object.isBatchedMesh)return;
  values.push(object.visible,...object.matrixWorld.elements.map(round));
  const position=object.geometry.attributes.position;if(position)for(let i=0;i<position.array.length;i+=Math.max(1,Math.floor(position.array.length/70)))values.push(round(position.array[i]));
  // Shared lighting/cutaway fades may settle after Pause. Kinematic stability
  // concerns physical transforms and vertices; material responses are checked
  // separately for the environmental inputs below.
 });
 return JSON.stringify([values,model.behavior.getReadouts()]);
}
function readouts(model,id){const rows=model.behavior.getReadouts();assert(Array.isArray(rows)&&rows.length,id+' exposes output');for(const row of rows){assert.equal(typeof row.label,'string');assert(!/NaN|Infinity|undefined/.test(String(row.value)),id+' finite readout');}return rows;}
function objects(group,predicate=()=>true){const found=[];group.traverse(o=>{if(predicate(o))found.push(o);});return found;}
function effect(object){for(let node=object;node;node=node.parent)if(node.userData.explanatoryEffect)return true;return false;}
function bounds(group){group.updateWorldMatrix(true,true);return new T.Box3().setFromObject(group,true);}
function rays(group,x,z,y=20,direction=-1){group.updateWorldMatrix(true,true);return new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,direction,0)).intersectObject(group,true);}
function vertexY(mesh){const p=mesh.geometry.attributes.position;return Array.from({length:p.count},(_,i)=>p.getY(i));}
function peak(mesh){return Math.max(...vertexY(mesh).map(Math.abs));}
function geometrySignature(group){return JSON.stringify(objects(group,o=>o.isMesh).map(o=>[o.position.toArray(),Array.from(o.geometry.attributes.position.array)]));}
function rimFixed(mesh,radius){const p=mesh.geometry.attributes.position;let tested=0;for(let i=0;i<p.count;i++)if(Math.hypot(p.getX(i),p.getZ(i))>radius-1e-5){close(p.getY(i),0,1e-6,'clamped perimeter');tested++;}assert(tested>=24);}
function checkWaveform(model,operation,id){
 if(!model.behavior.getWaveform)return;
 operation.reset();const check=()=>{const w=model.behavior.getWaveform();assert(typeof w.label==='string'&&typeof w.caption==='string');assert(w.samples.length>=32);assert(w.samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=1+1e-6),id+' bounded relative waveform');return JSON.stringify(w);};
 const first=check();tick(operation,.071);const active=check();assert(active!==first,id+' waveform phase advances');tick(operation,.2,{...running,playing:false});assert.equal(check(),active,id+' waveform freezes with pause');operation.reset();assert.equal(check(),first,id+' waveform reset');
 if(['memsmic','armature','planar'].includes(id)){
  model.behavior.setControl('amplitude',0);assert(model.behavior.getWaveform().samples.every(v=>v===0),id+' zero input silences plotted output');operation.reset();
  const crossings=samples=>samples.slice(1).filter((v,i)=>v*samples[i]<0).length;
  model.behavior.setControl('frequency',200);const low=crossings(model.behavior.getWaveform().samples);model.behavior.setControl('frequency',2000);const high=crossings(model.behavior.getWaveform().samples);assert(high>low+4,id+' input frequency changes waveform period');operation.reset();
 }
}
function checkPackageAndBehavior(id,model,operation){
 const g=model.groups,control=(key,value)=>model.behavior.setControl(key,value);
 operation.reset();model.setPose(0);
 if(id==='bme688'){
  const b=bounds(g.substrate);close(b.max.x-b.min.x,3,1e-6);close(b.max.z-b.min.z,3,1e-6);close(bounds(g.cap).max.y,.942,1e-6);
  for(const z of[-1.2,1.2])for(const x of[-1.2,-.4,.4,1.2])assert(rays(g.lands,x,z).length,'BME eight physical contacts');
  assert.equal(rays(g.lands,0,0).length,0);assert.equal(rays(g.cap,.6,.6).length,0,'BME real vent');assert(rays(g.cap,.83,.6).length,'BME vent perimeter solid');
  const membrane=objects(g.pressure,o=>o.userData.deforming)[0];assert(membrane);
  control('pressure',300);close(peak(membrane),.028,1e-6);const low=vertexY(membrane);control('pressure',1100);close(peak(membrane),.028,1e-6);const high=vertexY(membrane);for(let i=0;i<low.length;i++)close(low[i],-high[i],1e-7,'pressure response reverses');
  const p=membrane.geometry.attributes.position;for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i))>.35999||Math.abs(p.getZ(i))>.35999)close(p.getY(i),0,1e-6,'BME pressure rim fixed');
  const pressureState=geometrySignature(g.pressure),polymer=objects(g.humidity,o=>o.isMesh&&o.userData.dynamic)[0],temperature=objects(g.temperature,o=>o.isMesh)[0];
  control('humidity',0);const dry=polymer.material.color.getHex();control('humidity',100);assert.notEqual(polymer.material.color.getHex(),dry,'humidity changes sensitive layer');assert.equal(geometrySignature(g.pressure),pressureState,'humidity leaves pressure channel unchanged');
  const wet=polymer.material.color.getHex();control('temperature',-20);const cold=temperature.material.color.getHex();control('temperature',60);assert.notEqual(temperature.material.color.getHex(),cold,'temperature color responds');assert.equal(polymer.material.color.getHex(),wet,'temperature does not change humidity cue');
  const particles=objects(g.gas,o=>o.isGroup&&o.userData.dynamic&&o.children.length===16)[0];assert(particles);control('gas',0);assert.equal(particles.children.filter(o=>o.visible).length,0);control('gas',100);assert.equal(particles.children.filter(o=>o.visible).length,16);assert.equal(geometrySignature(g.pressure),pressureState,'gas leaves pressure channel unchanged');
  assert(model.behavior.getReadouts().some(row=>/no direct CO₂/.test(String(row.value))));
 }
 if(id==='scd41'){
  const base=bounds(g.base);close(base.max.x-base.min.x,10.1,1e-5);close(base.max.z-base.min.z,10.1,1e-5);close(bounds(g.membrane).max.y,6.5,1e-6);
  assert.equal(rays(g.base,2.94,2.94).length,0,'SCD actual thermal relief opening');assert(rays(g.base,3.14,2.94).length);
  const centers=[];for(const a of[-4,4])for(let i=0;i<5;i++)centers.push([a,-2.5+i*1.25],[-2.5+i*1.25,a]);for(const x of[-1.47,1.47])for(const z of[-1.47,1.47])centers.push([x,z]);assert.equal(centers.length,24);for(const[x,z]of centers)assert(rays(g.pads,x,z).length,'SCD twenty perimeter/four central physical pads');assert.equal(rays(g.pads,0,0).length,0);
  const mic=objects(g.microphone,o=>o.userData.deforming)[0];assert(mic);const peaks=[];
  for(const ppm of[400,800,5000]){operation.reset();control('co2',ppm);tick(operation,2.68);peaks.push(peak(mic));close(peaks.at(-1),.055*ppm/5000,1e-6,'absorption increases microphone response');rimFixed(mic,.73);assert.equal(Number(model.behavior.getReadouts().find(row=>row.label==='Relative absorption').value),ppm/5000);}
  assert(peaks[0]<peaks[1]&&peaks[1]<peaks[2]);
  operation.reset();control('co2',5000);tick(operation,1.1);close(peak(mic),0,1e-7,'microphone waits for absorption and pressure');tick(operation,1.1);assert(peak(mic)>.02,'delayed microphone response');tick(operation,.1,{...running,reduced:true});close(peak(mic),0,1e-7,'reduced motion stops pressure membrane');
  // Changing only display-cycle duration retains the same normalized phase.
  operation.reset();control('duration',2);tick(operation,1.34);const short=peak(mic);operation.reset();control('duration',8);tick(operation,5.36);close(peak(mic),short,1e-6,'cycle speed does not change absorption amplitude');
 }
 if(id==='memsmic'){
  const b=bounds(g.base);close(b.max.x-b.min.x,3,1e-6);close(b.max.z-b.min.z,4,1e-6);close(bounds(g.lid).max.y,1.211,1e-5);assert(bounds(g.lid).max.y-b.min.y<=1.28,'microphone maximum package height');
  assert.equal(rays(g.base,0,.68).length,0,'microphone real bottom acoustic port');for(const[x,z]of[[-.85,-1.5],[-.85,-.8],[.85,-1.5],[.85,-.8],[.8,.68]])assert(rays(g.base,x,z,-.1,1).length,'four rectangular contacts and ground ring');
  for(const y of[.49,.76]){g.die.updateWorldMatrix(true,true);const hits=new T.Raycaster(new T.Vector3(2,y,.68),new T.Vector3(-1,0,0)).intersectObject(g.die,true);for(let a=0;a<hits.length;a++)for(let b=a+1;b<hits.length;b++)if(hits[a].object.material!==hits[b].object.material)assert(hits[a].point.distanceTo(hits[b].point)>.001,'silicon/gold seal walls must not be coplanar');}
  const lower=objects(g.lower,o=>o.isMesh&&o.userData.dynamic)[0],upper=objects(g.upper,o=>o.geometry?.type==='RingGeometry')[0];assert(lower&&upper);const fixed=geometrySignature(g.stator);control('amplitude',2);tick(operation,.1);close(peak(lower),.05,1e-6);assert.deepEqual(vertexY(lower),vertexY(upper),'paired membranes move together');rimFixed(lower,.58);rimFixed(upper,.58);assert.equal(geometrySignature(g.stator),fixed,'stator stationary');
  const stator=bounds(g.stator);assert(bounds(lower).max.y<stator.min.y&&bounds(upper).min.y>stator.max.y,'full excursion clears fixed stator');close(Number(model.behavior.getReadouts().find(row=>row.label==='Output at 1 kHz').value),25.18,.01,'nominal -38 dBV/Pa conversion');
  control('amplitude',0);close(peak(lower),0);assert(model.behavior.getWaveform().samples.every(v=>v===0),'silence flattens waveform');
 }
 if(id==='armature'){
  const b=bounds(g.case),lid=bounds(g.lid);close(b.max.x-b.min.x,6.3,1e-5);close(b.max.z-b.min.z,4.29,1e-5);close(lid.max.y,2.975,1e-5);
  const outlet=new T.Raycaster(new T.Vector3(5,1.84,0),new T.Vector3(-1,0,0));g.case.updateWorldMatrix(true,true);const hits=outlet.intersectObject(g.case,true);assert(hits.every(h=>h.point.x<0),'outlet passes front wall');g.port.updateWorldMatrix(true,true);assert.equal(outlet.intersectObject(g.port,true).length,0,'sound spout is open');
  const fixed=geometrySignature(g.coil)+geometrySignature(g.magnets),reed=objects(g.reed,o=>o.isMesh&&o.userData.dynamic)[0],diaphragm=objects(g.diaphragm,o=>o.isMesh&&o.userData.dynamic)[0],drive=objects(g.rod,o=>o.isGroup&&o.userData.dynamic)[0];control('amplitude',6.3);tick(operation,.1);close(peak(reed),.07,1e-6);close(peak(diaphragm),.07,1e-6);close(drive.position.y,.07,1e-6);assert.equal(geometrySignature(g.coil)+geometrySignature(g.magnets),fixed,'coil and magnets stay fixed');
  const p=reed.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getX(i)<-1.94999)close(p.getY(i),0,1e-6,'reed anchor fixed');const d=diaphragm.geometry.attributes.position;for(let i=0;i<d.count;i++)if(Math.abs(d.getX(i))>2.69999||Math.abs(d.getZ(i))>1.79999)close(d.getY(i),0,1e-6,'diaphragm surround fixed');
  assert.equal(model.behavior.getReadouts().find(row=>row.label==='Pressure phase').value,'Rarefaction','terminal2 positive-going pressure decreases');tick(operation,.2);close(drive.position.y,-.07,1e-6);assert.equal(model.behavior.getReadouts().find(row=>row.label==='Pressure phase').value,'Compression');
 }
 if(id==='planar'){
  const rear=bounds(g.rear);close(rear.max.x-rear.min.x,106,1e-4);close(rear.max.z-rear.min.z,106,1e-4);const fixed=geometrySignature(g.frontmagnets)+geometrySignature(g.rearmagnets),film=objects(g.diaphragm,o=>o.isMesh&&o.userData.dynamic)[0],trace=objects(g.trace,o=>o.isMesh&&o.userData.dynamic)[0];control('frequency',1000);control('amplitude',100);tick(operation,.1);close(peak(film),.65,1e-6);rimFixed(film,43);assert.equal(geometrySignature(g.frontmagnets)+geometrySignature(g.rearmagnets),fixed,'both magnet arrays fixed');
  const t=trace.geometry.attributes.position;for(let i=0;i<t.count;i++){const r=Math.hypot(t.getX(i),t.getZ(i)),u=Math.max(0,Math.min(1,(43-r)/5)),expected=.65*(r<=38?1:u*u*(3-2*u));close(t.getY(i),expected,1e-6,'trace registered to film deflection');}
  assert(bounds(g.diaphragm).max.y<bounds(g.frontmagnets).min.y&&bounds(g.diaphragm).min.y>bounds(g.rearmagnets).max.y,'positive travel clears stationary magnets');tick(operation,.2);assert(bounds(g.diaphragm).max.y<bounds(g.frontmagnets).min.y&&bounds(g.diaphragm).min.y>bounds(g.rearmagnets).max.y,'negative travel clears stationary magnets');
  control('amplitude',0);close(peak(film),0);assert(model.behavior.getWaveform().samples.every(v=>v===0));
 }
 checkWaveform(model,operation,id);operation.reset();
}
for(const id of ids.filter(id=>process.argv.length<3||process.argv.slice(2).includes(id))){
 const module=await import(`../src/${id}.js`),definition=module[`${id.toUpperCase()}_BOARD`];assert(definition?.id===id);
 const evidence=fs.readFileSync(`reference/${id}/evidence.md`,'utf8');assert(/documented/i.test(evidence)&&/representative/i.test(evidence),id+' source classes');assert(definition.sources.length>=2&&definition.accuracy.length>60,id+' public reference limits');
 const model=await definition.build(),operation=createOperation(model,definition),size=group=>new T.Box3().setFromObject(model.groups[group],true).getSize(new T.Vector3());
 assert.deepEqual(Object.keys(model.groups).sort(),definition.parts.map(part=>part.id).sort());
 for(const method of ['update','setControl','reset','getReadouts'])assert.equal(typeof model.behavior?.[method],'function');
 let triangles=0,moving=0;
 model.root.traverse(object=>{if(!object.isMesh||object.isBatchedMesh)return;const positions=object.geometry.attributes.position;assert(positions?.count>0);for(const value of positions.array)assert(Number.isFinite(value),id+' finite geometry');for(const index of object.geometry.index?.array||[])assert(index>=0&&index<positions.count);triangles+=(object.geometry.index?.count||positions.count)/3;if(isMovingPart(object))moving++;if(object.userData.decal)assert(!object.castShadow,id+' artwork does not cast rectangular shadows');});
 assert(moving>0,id+' moving geometry registered');for(const batch of model.batches||[])assert(batch.entries.every(entry=>!isMovingPart(entry.object)),id+' animated meshes outside batches');
 for(const separation of [0,.25,.5,.75,1]){model.setPose(separation);model.root.updateMatrixWorld(true);for(const part of definition.parts){const box=new T.Box3().setFromObject(model.groups[part.id]);assert(!box.isEmpty());assert(box.min.y>=(definition.floorY??-19.2)-.01,id+'/'+part.id+' clear of floor');assert.deepEqual(model.groups[part.id].position.toArray(),part.offset.map(n=>n*separation));}}
 model.setPose(0);operation.reset();operation.update(0,{...running,playing:false});readouts(model,id);const initial=state(model);
 for(const control of definition.controls){
  assert([control.min,control.max,control.step,control.value].every(Number.isFinite));assert(control.max>control.min&&control.step>0&&control.value>=control.min&&control.value<=control.max);
  const responses=[];for(const value of [control.min,control.value,control.max]){operation.reset();model.behavior.setControl(control.id,value);tick(operation,.37);readouts(model,id);responses.push(state(model));}
  assert(new Set(responses).size>1,id+'/'+control.id+' input causes response');
 }
 operation.reset();tick(operation,.37);const active=state(model);tick(operation,.5,{...running,playing:false});const paused=state(model);tick(operation,.5,{...running,playing:false});assert(state(model)===paused,id+' pause stable');
 operation.reset();operation.update(0,{...running,playing:false});assert(state(model)===initial,id+' reset repeatable');assert(active!==initial,id+' Play changes meaningful state');
 tick(operation,.5,{...running,reduced:true});const reduced=state(model);tick(operation,.5,{...running,reduced:true});assert.equal(state(model),reduced,id+' reduced motion stable');
 model.setPose(.5);tick(operation,.5,{...running,explode:.5});const separated=state(model);tick(operation,.5,{...running,explode:.5});assert.equal(state(model),separated,id+' separated mechanism stops');model.setPose(0);operation.reset();
 model.setSelection(null,false,false);const originals=new Map();for(const group of Object.values(model.groups))group.traverse(object=>{if(object.isMesh)originals.set(object,object.material);});
 for(const part of definition.parts){model.setSelection(part.id,false,true);for(const [groupId,group]of Object.entries(model.groups))group.traverse(object=>{if(!object.isMesh)return;if(groupId===part.id)assert.equal(object.material,originals.get(object));else assert(object.material.transparent&&object.material.opacity<=.1&&!object.material.depthWrite,id+' context ghost');});model.setSelection(part.id,true,true);assert.equal(Object.values(model.groups).filter(group=>group.visible).length,1);}
 model.setSelection(null,false,false);for(const[object,material]of originals)assert.equal(object.material,material,id+' restores exact material');
 const anatomy=createAnatomy(model);anatomy.update(null);
 const physical=Object.values(model.groups).flatMap(group=>objects(group,o=>o.isMesh&&!o.isBatchedMesh&&!effect(o))),drawings=[...anatomy.entries,...anatomy.markings];
 assert.equal(drawings.length,physical.length,id+' anatomy retains every physical surface');for(const source of physical)assert(drawings.some(entry=>entry.source===source),id+' physical source retained');assert(drawings.every(entry=>!effect(entry.source)),id+' explanatory effects excluded from anatomy');assert(drawings.every(entry=>entry.body.visible),id+' full physical context visible');
 const overlays=objects(model.root,o=>o.userData.explanatoryEffect);if(['bme688','scd41'].includes(id))assert.equal(overlays.length,id==='bme688'?1:3,id+' explicit effect classification');
 // A visible explanatory overlay must not intercept the component picker.
 for(const overlay of overlays){const mesh=objects(overlay,o=>o.isMesh)[0];const point=new T.Vector3();mesh.getWorldPosition(point);const visible=overlay.visible,meshVisible=mesh.visible;overlay.visible=true;mesh.visible=true;model.root.updateMatrixWorld(true);const ray=new T.Raycaster(point.clone().add(new T.Vector3(20,0,0)),new T.Vector3(-1,0,0));ray.layers.enable(1);assert(ray.intersectObject(overlay,true).length>0,id+' test ray actually intersects annotation');assert.equal(pickComponent(ray,{[mesh.userData.partId]:overlay}),null,id+' annotations never pick as hardware');overlay.visible=visible;mesh.visible=meshVisible;}
 const rest=new Map(anatomy.entries.map(entry=>[entry,Array.from(entry.lines.geometry.attributes.position.array)]));tick(operation,.37);anatomy.update(null);
 for(const entry of anatomy.entries){assert.equal(entry.body.geometry,entry.source.geometry);assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements);const expected=new T.EdgesGeometry(entry.source.geometry,20);assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),Array.from(expected.attributes.position.array),id+' deformed anatomy contour');expected.dispose();}
 operation.reset();anatomy.update(null);for(const entry of anatomy.entries)assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),rest.get(entry),id+' restored anatomy contour');
 checkPackageAndBehavior(id,model,operation);
 console.log(`PASS ${id}: package, causal behavior and runtime gate, ${definition.parts.length} groups, ${moving} moving meshes, ${triangles} triangles`);
}
