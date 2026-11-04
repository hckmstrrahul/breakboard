import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createOperation} from '../src/operation.js';
import {createAnatomy} from '../src/anatomy.js';
import {isMovingPart} from '../src/hardware-motion.js';
import {pickComponent} from '../src/selection.js';

const canvasContext=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:String(text).length*30}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>canvasContext})};
const ids=['imu','tof','radar','pir','ultrasonic'];
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
// Recover disconnected physical solids from merged mesh triangles. This checks
// pin counts after rendering optimization rather than trusting reference metadata.
function solids(group,color){const result=[];group.updateWorldMatrix(true,true);for(const mesh of objects(group,o=>o.isMesh&&o.material.color.getHexString()===color)){
 const p=mesh.geometry.attributes.position,index=mesh.geometry.index,parents=[],points=[],keys=new Map(),vertex=[];
 const find=i=>parents[i]===i?i:parents[i]=find(parents[i]);
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld),key=v.toArray().map(n=>n.toFixed(4)).join(',');let k=keys.get(key);if(k===undefined){k=points.length;keys.set(key,k);points.push(v);parents.push(k);}vertex.push(k);}
 for(let i=0;i<(index?.count||p.count);i+=3){const ids=[0,1,2].map(k=>vertex[index?index.getX(i+k):i+k]);parents[find(ids[1])]=find(ids[0]);parents[find(ids[2])]=find(ids[0]);}
 const boxes=new Map();points.forEach((v,i)=>{const root=find(i);if(!boxes.has(root))boxes.set(root,new T.Box3());boxes.get(root).expandByPoint(v);});result.push(...boxes.values());
 }return result;}
function checkWaveform(model,operation,id){
 if(!model.behavior.getWaveform)return;
 operation.reset();const check=()=>{const w=model.behavior.getWaveform();assert(typeof w.label==='string'&&typeof w.caption==='string');assert(w.samples.length>=32);assert(w.samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=1+1e-6),id+' bounded relative waveform');return JSON.stringify(w);};
 const first=check();tick(operation,.071);const active=check();assert(active!==first,id+' waveform phase advances');tick(operation,.2,{...running,playing:false});assert.equal(check(),active,id+' waveform freezes with pause');operation.reset();assert.equal(check(),first,id+' waveform reset');

}
function checkPackageAndBehavior(id,model,operation){
 const g=model.groups,control=(key,value)=>model.behavior.setControl(key,value);
 operation.reset();model.setPose(0);
 if(id==='imu'){
  const b=bounds(g.substrate);close(b.max.x-b.min.x,3,1e-6);close(b.max.z-b.min.z,2.5,1e-6);close(b.max.y,.105,1e-6);close(bounds(g.mold).max.y,.916,1e-5);
  for(const x of[-1.1625,1.1625])for(const z of[-.75,-.25,.25,.75])assert(rays(g.substrate,x,z,-.1,1).some(hit=>hit.point.y<.001),'IMU four contacts per long side');
  for(const z of[-.9125,.9125])for(const x of[-.5,0,.5])assert(rays(g.substrate,x,z,-.1,1).some(hit=>hit.point.y<.001),'IMU three contacts per short side');
  const output=()=>readouts(model,id).slice(0,3).map(row=>Number(row.value));
  assert.deepEqual(output(),[0,0,1]);control('pitch',90);assert.deepEqual(output(),[-1,0,0]);control('pitch',-90);assert.deepEqual(output(),[1,0,0]);control('pitch',0);control('roll',90);assert.deepEqual(output(),[0,1,0]);control('roll',-90);assert.deepEqual(output(),[0,-1,0]);operation.reset();
  const movers=group=>objects(group,o=>o.isGroup&&o.parent?.userData.dynamic&&o.children.some(c=>c.isMesh));
  const a=['X','Y','Z'].map(k=>movers(g['accel'+k])[0]);assert(a.every(Boolean));
  const axes=[new T.Vector3(1,0,0),new T.Vector3(0,0,-1),new T.Vector3(0,1,0)];
  for(let i=0;i<3;i++){operation.reset();control('accel'+'XYZ'[i],-2);const low=a[i].position.clone();control('accel'+'XYZ'[i],2);const delta=a[i].position.clone().sub(low);assert(delta.dot(axes[i])<0,'mass moves opposite applied specific force');assert(delta.clone().cross(axes[i]).length()<1e-8,'axis-specific proof-mass motion');}
  const before=JSON.stringify(output());model.root.rotation.set(.4,.5,.6);tick(operation,.02);assert.equal(JSON.stringify(output()),before,'scene orbit cannot supply stimulus');model.root.rotation.set(0,0,0);
  for(let i=0;i<3;i++){
   operation.reset();const pair=movers(g['gyro'+'XYZ'[i]]);assert.equal(pair.length,2);control('rate'+'XYZ'[i],0);const rest=pair.map(o=>o.position.clone());
   control('rate'+'XYZ'[i],250);const positive=pair.map((o,j)=>o.position.clone().sub(rest[j]));control('rate'+'XYZ'[i],-250);pair.forEach((o,j)=>close(o.position.clone().sub(rest[j]).add(positive[j]).length(),0,1e-8,'gyro signed response'));
   close(positive[0].clone().add(positive[1]).length(),0,1e-8,'opposed sense masses');close(positive[0].length(),.004,1e-8);
   control('rate'+'XYZ'[i],0);tick(operation,.125);const drive=pair[0].position.clone().sub(rest[0]);close(drive.length(),.018,1e-8,'display drive excursion');close(drive.dot(positive[0]),0,1e-8,'drive and sense perpendicular');
   // At phase zero velocity is along the later positive quarter-cycle drive.
   assert(drive.clone().cross(axes[i]).dot(positive[0])>0,'Coriolis sense follows drive velocity cross angular rate');
  }
  operation.reset();
 }

 if(id==='tof'){
  const cap=bounds(g.cap),base=bounds(objects(g.substrate,o=>o.isMesh&&o.material.color.getHexString()==='42624b')[0]);close(cap.max.x-cap.min.x,6.4,1e-5);close(cap.max.z-cap.min.z,3.03,1e-5);close(cap.max.y,1.75,1e-5);close(base.max.x-base.min.x,6.2,1e-5);close(base.max.z-base.min.z,2.83,1e-5);
  for(const z of[-1.0575,1.0575])for(const x of[-2.25,-1.5,-.75,0,.75,1.5,2.25])assert(rays(g.pads,x,z).length,'ToF seven pads on each long edge');for(const x of[-2.6675,2.6675,0])assert(rays(g.pads,x,0).length,'ToF two end contacts and B4');assert.equal(rays(g.pads,1.7,0).length,0,'ToF separate central thermal pad');
  assert.equal(rays(g.cap,-1.74,.1).length,0,'ToF receiver optical opening');assert.equal(rays(g.cap,2.29,.1).length,0,'ToF transmitter optical opening');assert(rays(g.cap,-1.74+.27,.1).length,'receiver aperture rim');assert(rays(g.cap,2.29+.38,.1).length,'transmitter aperture rim');
  const depth=()=>model.behavior.getDepthMap();let map=depth();assert.equal(map.rows,8);assert.equal(map.columns,8);assert.equal(map.values.length,64);assert.equal(map.values.filter(v=>v===850).length,4);assert.equal(map.values.filter(v=>v===1500).length,60);
  for(const [native,rc]of [[0,'1 / 8'],[7,'1 / 1'],[56,'8 / 8'],[63,'8 / 1']]){control('zone',native);assert.equal(readouts(model,id).find(r=>r.label==='Scene row / column').value,rc,'lens inversion matches source orientation');}
  control('column',7);control('row',7);control('width',4);assert.equal(depth().values.filter(v=>v===850).length,1,'target clips at field boundary');control('distance',100);control('depth',2000);assert.equal(Math.min(...depth().values),20,'foreground clamps above sensor minimum');control('zone',56);close(Number(readouts(model,id).find(r=>r.label==='Axial-equivalent light time').value),40/299.792458,.00051,'ideal axial light time');
  control('depth',0);assert(depth().values.every(v=>v===100),'zero offset is planar scene');control('distance',4000);assert(depth().values.every(v=>v===4000));
  const overlay=objects(model.root,o=>o.userData.explanatoryEffect)[0],dots=objects(overlay,o=>o.geometry?.type==='SphereGeometry');assert.equal(dots.length,2);operation.reset();tick(operation,.3);assert.equal(dots.filter(o=>o.visible).length,1);const outward=dots.find(o=>o.visible);const y=outward.position.y;tick(operation,.3);assert(outward.position.y>y,'pulse leaves transmitter toward scene');tick(operation,.9);const inward=dots.find(o=>o.visible);assert.notEqual(inward,outward);const ry=inward.position.y;tick(operation,.3);assert(inward.position.y<ry,'return pulse approaches receiver');
 }
 if(id==='radar'){
  const board=bounds(objects(g.board,o=>o.isMesh&&o.material.color.getHexString()==='852e29')[0]);close(board.max.x-board.min.x,55,1e-4);close(board.max.z-board.min.z,68.4561506,1e-4);
  for(const x of[3,52])for(const y of[8.624316,27.624278,35.718496,57.124346])assert.equal(rays(g.board,x-27.5,26.394-y).length,0,'eight real RevD mounting holes');
  for(const [i,x]of[21.1,23.6,26.1,28.6,33.6,38.6,43.6].entries())for(const k of[-1,0,1]){const cy=51+(i===5?2.5:0)+k*2.5;assert(rays(g.antenna,x-27.5,26.394-cy).length,'seven three-patch arrays');assert.equal(rays(g.antenna,x-27.5+.8,26.394-cy).length,0,'separated patch aperture');}
  assert(bounds(g.soc).min.y>=1.45719,'BGA balls seat above FR4');
  const silver=solids(g.support,'aeb6bc');
  for(const [ref,x,z,count]of[['U13',16.83481-27.5,26.394-7.33062,16],['U15',47.82211-27.5,26.394-7.66163,10],['U9',21.30408-27.5,26.394-22.38832,6],['U17',14.06069-27.5,26.394-26.44493,6]]){
   const pins=silver.filter(b=>{const center=b.getCenter(new T.Vector3()),height=b.max.y-b.min.y;return Math.abs(center.x-x)<2&&Math.abs(center.z-z)<2&&Math.abs(center.y-1.56)<.06&&height<.18;});assert.equal(pins.length,count,ref+' physical contact count after geometry merge');
  }
  const refs=model.root.userData.hardware.renderedDesignators;assert(Array.isArray(refs),'actual rendered population recorded');for(const ref of['U1','U4','S1','J1','J3','J5','J6','Q1','Q2'])assert(refs.includes(ref));assert(!refs.includes('J2'),'RevD DNP connector omitted');
  const r=label=>Number(readouts(model,id).find(row=>row.label===label).value);
  for(const range of[.5,3,10]){control('range',range);close(r('Round-trip delay'),2*range/299792458*1e9,.0051,'RF round-trip delay');close(r('Illustrative beat'),50e12*2*range/299792458/1000,.051,'FMCW beat follows slope times delay');}
  const target=model.stimulus.target;control('angle',-60);const left=target.position.clone();control('angle',60);const right=target.position.clone();close(left.y,right.y,1e-6);assert(left.x<right.x,'target azimuth follows input');close((left.x+right.x)/2,8,1e-6);
  operation.reset();assert.equal(readouts(model,id).at(-1).value,'TX1');tick(operation,1.22);assert.equal(readouts(model,id).at(-1).value,'TX2');tick(operation,1.2);assert.equal(readouts(model,id).at(-1).value,'TX3');checkWaveform(model,operation,id);
 }
 if(id==='pir'){
  const lens=bounds(g.lens);close(lens.max.x-lens.min.x,11,1e-5);close(lens.max.y,14.4,1e-5);close(bounds(g.pins).min.y,-4.6,1e-5);
  for(const [x,z]of[[1.796,-1.796],[1.796,1.796],[-1.796,1.796]])assert(rays(g.pins,x,z,-5,1).length,'three source-positioned leads');assert.equal(rays(g.can,0,0).length,0,'PIR true infrared opening');
  const output=()=>readouts(model,id).find(row=>row.label==='Digital output').value;
  control('movement',0);tick(operation,.1);assert.equal(output(),'Low','stationary initial warmth does not trigger');control('angle',6);tick(operation,.02);assert.equal(output(),'High','warm target crossing zone triggers');tick(operation,2.7);assert.equal(output(),'Low · mask','typical hold expires into mask');tick(operation,1.4);assert.equal(output(),'Low','stationary target settles after hold and mask');
  operation.reset();control('contrast',0);tick(operation,5);assert.equal(output(),'Low','zero thermal contrast never detects');operation.reset();control('movement',0);control('angle',55);tick(operation,.1);control('angle',50);tick(operation,.02);assert.equal(output(),'Low','out-of-field change does not detect');
  operation.reset();tick(operation,.1);const dot=model.stimulus.rays[0],previous=dot.position.clone(),sensor=new T.Vector3(0,14.4,0);control('movement',0);tick(operation,.1);assert(dot.position.distanceTo(sensor)<previous.distanceTo(sensor),'infrared travels from target into passive sensor');
 }
 if(id==='ultrasonic'){
  const board=bounds(g.board);close(board.max.x-board.min.x,43,1e-5);close(board.max.z-board.min.z,20,1e-5);
  for(const id of['txcase','rxcase']){const can=bounds(g[id]);close(can.max.x-can.min.x,16.2,1e-5);close(can.max.y-can.min.y,12.25,1e-5);}
  // Probe the substrate itself, excluding rings and traces, at every real lead opening.
  const substrate=objects(g.board,o=>o.isMesh&&o.material.color.getHexString()==='1b6753')[0];assert(substrate);
  for(const x of[-11,11])for(const z of[-5,5])assert.equal(rays(substrate,x,z).length,0,'transducer through-hole');for(let i=0;i<5;i++)assert.equal(rays(substrate,(i-2)*2.54,8.4).length,0,'header through-hole');
  const r=label=>readouts(model,id).find(row=>row.label===label).value;
  for(const temperature of[0,20,40])for(const distance of[3,100,300]){control('temperature',temperature);control('distance',distance);const expected=2*Math.hypot(distance/100,.011)/(331.3+.606*temperature)*1000;close(Number(r('Acoustic round trip')),expected,.00051,'actual bistatic acoustic path');}
  const advance=seconds=>{while(seconds>1e-10){const dt=Math.min(seconds,1/120);operation.update(dt,running);seconds-=dt;}};
  operation.reset();advance(.001875);close(peak(model.stimulus.tx.film),.055,1e-6);close(peak(model.stimulus.rx.film),0,1e-8,'receiver waits for echo');close(model.stimulus.tx.cone.position.y,.055,1e-6,'cone attached to bender center');
  operation.reset();const travel=2*Math.hypot(1,.011)/343.42;advance(travel*300+.001875);close(peak(model.stimulus.rx.film),.018,1e-6);close(peak(model.stimulus.tx.film),0,1e-8,'transmitter rests at received echo');assert.equal(r('Sequence'),'Echo received');
  operation.update(.02,{...running,reduced:true});close(peak(model.stimulus.rx.film),0,1e-8,'reduced motion parks bender');
  operation.reset();advance(.001875);operation.update(.01,{...running,explode:.5});close(peak(model.stimulus.tx.film),0,1e-8,'separation parks bender');
 }
 // Explanatory fields and targets must clear hardware inspection in both selection modes.
 for(const options of[{selected:Object.keys(g)[0]},{isolate:true,selected:Object.keys(g)[0]}]){operation.reset();tick(operation,.1,{...running,...options});for(const overlay of objects(model.root,o=>o.userData.explanatoryEffect))assert(!overlay.visible,id+' explanatory overlay hidden during hardware selection');}
 operation.reset();
}
for(const id of ids.filter(id=>process.argv.length<3||process.argv.slice(2).includes(id))){
 const module=await import(`../src/${id}.js`),definition=module[`${id.toUpperCase()}_BOARD`];assert(definition?.id===id);
 const evidence=fs.readFileSync(`reference/${id}/evidence.md`,'utf8');assert(/documented/i.test(evidence)&&/representative/i.test(evidence),id+' source classes');assert(definition.sources.length>=2&&definition.accuracy.length>60,id+' public reference limits');
 const model=await definition.build(),operation=createOperation(model,definition),size=group=>new T.Box3().setFromObject(model.groups[group],true).getSize(new T.Vector3());
 assert.deepEqual(Object.keys(model.groups).sort(),definition.parts.map(part=>part.id).sort());
 for(const method of ['update','setControl','reset','getReadouts'])assert.equal(typeof model.behavior?.[method],'function');
 let triangles=0,moving=0;
 model.root.traverse(object=>{if(!object.isMesh||object.isBatchedMesh)return;const positions=object.geometry.attributes.position;assert(positions?.count>0);for(const value of positions.array)assert(Number.isFinite(value),id+' finite geometry');for(const index of object.geometry.index?.array||[])assert(index>=0&&index<positions.count);triangles+=(object.geometry.index?.count||positions.count)/3;if(isMovingPart(object))moving++;if(object.userData.decal)assert(!object.castShadow,id+' artwork does not cast rectangular shadows');});
 if(['imu','ultrasonic'].includes(id))assert(moving>0,id+' moving geometry registered');for(const batch of model.batches||[])assert(batch.entries.every(entry=>!isMovingPart(entry.object)),id+' animated meshes outside batches');
 for(const separation of [0,.25,.5,.75,1]){model.setPose(separation);model.root.updateMatrixWorld(true);for(const part of definition.parts){const box=new T.Box3().setFromObject(model.groups[part.id]);assert(!box.isEmpty());assert(box.min.y>=(definition.floorY??-19.2)-.01,id+'/'+part.id+' clear of floor');assert.deepEqual(model.groups[part.id].position.toArray(),part.offset.map(n=>n*separation));}}
 model.setPose(0);operation.reset();operation.update(0,{...running,playing:false});readouts(model,id);const initial=state(model);
 for(const control of definition.controls){
  assert([control.min,control.max,control.step,control.value].every(Number.isFinite));assert(control.max>control.min&&control.step>0&&control.value>=control.min&&control.value<=control.max);
  const responses=[];for(const value of [control.min,control.value,control.max]){operation.reset();model.behavior.setControl(control.id,value);tick(operation,.37);readouts(model,id);responses.push(state(model));}
  assert(new Set(responses).size>1,id+'/'+control.id+' input causes response');
 }
 operation.reset();tick(operation,.37);const active=state(model);tick(operation,.5,{...running,playing:false});const paused=state(model);tick(operation,.5,{...running,playing:false});assert(state(model)===paused,id+' pause stable');
 operation.reset();operation.update(0,{...running,playing:false});if(state(model)!==initial){const a=JSON.parse(initial),b=JSON.parse(state(model));console.error('reset differences',a[0].map((v,i)=>v===b[0][i]?null:[i,v,b[0][i]]).filter(Boolean).slice(0,25),a[1],b[1]);}assert(state(model)===initial,id+' reset repeatable');assert(active!==initial,id+' Play changes meaningful state');
 tick(operation,.5,{...running,reduced:true});const reduced=state(model);tick(operation,.5,{...running,reduced:true});assert.equal(state(model),reduced,id+' reduced motion stable');
 model.setPose(.5);tick(operation,.5,{...running,explode:.5});const separated=state(model);tick(operation,.5,{...running,explode:.5});assert.equal(state(model),separated,id+' separated mechanism stops');model.setPose(0);operation.reset();
 operation.reset();for(let i=0;i<27;i++)operation.update(1/30,running);const at30=JSON.parse(state(model))[0];operation.reset();for(let i=0;i<108;i++)operation.update(1/120,running);assert.deepEqual(JSON.parse(state(model))[0],at30,id+' geometry independent of 30/120Hz update cadence');operation.reset();
 model.setSelection(null,false,false);const originals=new Map();for(const group of Object.values(model.groups))group.traverse(object=>{if(object.isMesh)originals.set(object,object.material);});
 for(const part of definition.parts){model.setSelection(part.id,false,true);for(const [groupId,group]of Object.entries(model.groups))group.traverse(object=>{if(!object.isMesh)return;if(groupId===part.id)assert.equal(object.material,originals.get(object));else assert(object.material.transparent&&object.material.opacity<=.1&&!object.material.depthWrite,id+' context ghost');});model.setSelection(part.id,true,true);assert.equal(Object.values(model.groups).filter(group=>group.visible).length,1);}
 model.setSelection(null,false,false);for(const[object,material]of originals)assert.equal(object.material,material,id+' restores exact material');
 const anatomy=createAnatomy(model);anatomy.update(null);
 const physical=Object.values(model.groups).flatMap(group=>objects(group,o=>o.isMesh&&!o.isBatchedMesh&&!effect(o))),drawings=[...anatomy.entries,...anatomy.markings];
 assert.equal(drawings.length,physical.length,id+' anatomy retains every physical surface');for(const source of physical)assert(drawings.some(entry=>entry.source===source),id+' physical source retained');assert(drawings.every(entry=>!effect(entry.source)),id+' explanatory effects excluded from anatomy');assert(drawings.every(entry=>entry.body.visible),id+' full physical context visible');
 const overlays=objects(model.root,o=>o.userData.explanatoryEffect);assert(overlays.length>=1,id+' explicit effect classification');
 // A visible explanatory overlay must not intercept the component picker.
 for(const overlay of overlays){const mesh=objects(overlay,o=>o.isMesh)[0];const point=bounds(mesh).getCenter(new T.Vector3());const visible=overlay.visible,meshVisible=mesh.visible;overlay.visible=true;mesh.visible=true;model.root.updateMatrixWorld(true);const ray=new T.Raycaster(point.clone().add(new T.Vector3(20,0,0)),new T.Vector3(-1,0,0));ray.layers.enable(1);assert(ray.intersectObject(overlay,true).length>0,id+' test ray actually intersects annotation');assert.equal(pickComponent(ray,{[mesh.userData.partId]:overlay}),null,id+' annotations never pick as hardware');overlay.visible=visible;mesh.visible=meshVisible;}
 const rest=new Map(anatomy.entries.map(entry=>[entry,Array.from(entry.lines.geometry.attributes.position.array)]));tick(operation,.37);anatomy.update(null);
 for(const entry of anatomy.entries){assert.equal(entry.body.geometry,entry.source.geometry);assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements);const expected=new T.EdgesGeometry(entry.source.geometry,20);assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),Array.from(expected.attributes.position.array),id+' deformed anatomy contour');expected.dispose();}
 operation.reset();anatomy.update(null);for(const entry of anatomy.entries)assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),rest.get(entry),id+' restored anatomy contour');
 checkPackageAndBehavior(id,model,operation);
 console.log(`PASS ${id}: package, causal behavior and runtime gate, ${definition.parts.length} groups, ${moving} moving meshes, ${triangles} triangles`);
}
