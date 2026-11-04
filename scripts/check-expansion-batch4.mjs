import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createOperation} from '../src/operation.js';
import {createAnatomy} from '../src/anatomy.js';
import {isMovingPart} from '../src/hardware-motion.js';
import {pickComponent} from '../src/selection.js';
import {disposeModel,modelResources} from '../src/model-cache.js';

const canvasContext=new Proxy({}, {get:(_,key)=>key==='measureText'?text=>({width:String(text).length*30}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>canvasContext})};
const ids=['gnss','imx500','eventcamera','max30102','loadcell'];
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
 if(id==='gnss'){
  const substrate=objects(g.substrate,o=>o.isMesh&&o.material.color.getHexString()==='254b3d')[0],b=bounds(substrate);close(b.max.x-b.min.x,22,1e-5);close(b.max.z-b.min.z,17,1e-5);
  const pads=solids(g.lands,'bd9340');assert.equal(pads.length,102,'54 signal/perimeter plus 48 central ground contacts');
  const centers=pads.map(b=>b.getCenter(new T.Vector3()));for(const z of[-7.45,7.45])for(let i=0;i<14;i++)assert(centers.some(p=>Math.abs(p.x-(-7.15+i*1.1))<1e-5&&Math.abs(p.z-z)<1e-5),'14 contacts along each long edge');for(const x of[-9.95,9.95])for(let i=0;i<13;i++)assert(centers.some(p=>Math.abs(p.x-x)<1e-5&&Math.abs(p.z-(-6.6+i*1.1))<1e-5),'13 contacts along each short edge');for(let row=0;row<6;row++)for(let col=0;col<8;col++)assert(centers.some(p=>Math.abs(p.x-(-7.35+col*2.1))<1e-5&&Math.abs(p.z-(-5.25+row*2.1))<1e-5),'2.10 mm central ground grid');
  const index=solids(g.substrate,'bd9340').find(b=>Math.abs(b.max.x-b.min.x-.55)<1e-5);assert(index&&index.getCenter(new T.Vector3()).z>7,'pin-one index follows top-view source orientation');
  const r=label=>readouts(model,id).find(r=>r.label===label).value;
  assert.equal(r('Synthetic fix'),'Acquiring');tick(operation,2.1);assert.equal(r('Synthetic fix'),'RTK float');tick(operation,8);assert.equal(r('Synthetic fix'),'RTK fixed');assert.equal(r('Illustrated convergence'),100);
  for(const n of[0,3]){control('satellites',n);tick(operation,11);assert.equal(r('Synthetic fix'),'No 3D fix');assert.equal(r('Illustrated convergence'),0);}
  control('satellites',4);tick(operation,10.1);assert.equal(r('Synthetic fix'),'RTK fixed');control('obstruction',100);assert.equal(r('Usable satellites'),0);assert.equal(r('Synthetic fix'),'No 3D fix');
  operation.reset();control('corrections',0);tick(operation,12);assert.equal(r('Synthetic fix'),'Standalone');assert.equal(r('Correction feed'),'Absent');control('corrections',1);assert.equal(r('Synthetic fix'),'Acquiring','input change restarts authored acquisition');
 }
 if(id==='imx500'){
  const active=objects(g.pixels,o=>o.isMesh&&o.material.color.getHexString()==='516879')[0],b=bounds(active);close(b.max.x-b.min.x,4056*.00155,1e-6);close(b.max.z-b.min.z,3040*.00155,1e-6);
  const counts=['9d5457','597e62','5a709d'].map(color=>solids(g.filters,color).length);assert.deepEqual(counts,[192,384,192],'Bayer sample contains two green cells per red/blue pair');assert(bounds(g.logic).max.y<bounds(g.pixels).min.y,'upper pixel chip over lower logic');
  const r=label=>readouts(model,id).find(r=>r.label===label).value;assert.equal(r('Demo detections'),2);control('objects',3);assert.equal(r('Demo detections'),3);control('illumination',0);assert.equal(r('Demo detections'),0);control('illumination',100);assert.equal(r('Demo detections'),3);control('objects',0);assert.equal(r('Demo detections'),0);
  control('output',0);assert.equal(r('Output'),'Image + metadata');control('output',1);assert.equal(r('Output'),'Object metadata');assert.match(r('Inference'),/Scripted.*not an executed/);
  operation.reset();tick(operation,.05);for(const expected of['Pixel acquisition','Image preparation','DSP inference','Memory access','Output']){assert.equal(r('Illustrative pipeline'),expected);tick(operation,.8);}assert.equal(r('Illustrative pipeline'),'Pixel acquisition');
 }
 if(id==='eventcamera'){
  const ceramic=objects(g.ceramic,o=>o.isMesh&&o.material.map?.isDataTexture)[0],b=bounds(ceramic);close(b.max.x-b.min.x,13,1e-5);close(b.max.z-b.min.z,13,1e-5);
  const pads=solids(g.pads,'b59d59');assert.equal(pads.length,156);assert.equal(pads.filter(b=>b.max.x-b.min.x<.6).length,152);assert.equal(pads.filter(b=>b.max.x-b.min.x>1).length,4);assert.equal(rays(g.pads,0,0).length,0,'open central LGA region');
  const optical=objects(g.pixels,o=>o.isMesh&&o.material.isMeshPhysicalMaterial)[0],a=bounds(optical);close(a.max.x-a.min.x,1280*.00486,1e-6);close(a.max.z-a.min.z,720*.00486,1e-6);assert(bounds(g.logic).max.y<bounds(g.pixels).min.y,'documented pixel-over-logic stack');
  const pair=label=>readouts(model,id).find(r=>r.label===label).value.split(' / ').map(Number),sample=()=>pair('ON / OFF this sample'),total=()=>pair('Accumulated ON / OFF');
  control('speed',0);tick(operation,1);assert.deepEqual(total(),[0,0],'unchanged scene produces no events');
  control('size',50);control('brightness',100);control('threshold',.25);const baseline=total();control('brightness',125);assert.deepEqual(sample(),[0,0],'25% linear brightness is below 0.25 ln');control('brightness',130);assert.deepEqual(sample(),[128,0],'log threshold crossing at 30% emits ON for fully covered cells');control('brightness',164);assert.deepEqual(sample(),[32,0],'only partial cells cross their first threshold while full-cell residual stays below second');control('brightness',165);assert.deepEqual(sample(),[128,0],'full cells cross their second cumulative threshold');control('brightness',100);assert.deepEqual(sample(),[0,288],'return to original intensity emits signed whole thresholds');
  const accumulated=total();tick(operation,1);assert.deepEqual(total(),accumulated,'new stationary scene settles without repeated events');control('threshold',.05);assert.deepEqual(sample(),[0,0],'threshold edit rebases without false events');
  operation.reset();tick(operation,3);assert(total().every(n=>n>0),'moving rectangle emits both polarities');operation.reset();control('brightness',100);const atUniform=total();tick(operation,3);assert.deepEqual(total(),atUniform,'target motion at equal brightness causes no new events');
  const cadence=[];for(const hz of[30,120]){operation.reset();for(const[k,v]of[['speed',80],['brightness',10],['size',10],['threshold',.05]])control(k,v);for(let i=0;i<hz*5;i++)operation.update(1/hz,running);cadence.push([total(),model.behavior.getWaveform()]);}assert.deepEqual(cadence[0],cadence[1],'fixed sample-time simulation preserves extreme-input events and history across refresh rates');
  operation.reset();const grid=objects(model.root,o=>o.isInstancedMesh)[0];assert.equal(grid.count,32*18);tick(operation,.7);const colors=Array.from(grid.instanceColor.array);tick(operation,.5,{...running,playing:false});assert.deepEqual(Array.from(grid.instanceColor.array),colors,'instanced event colors freeze on pause');operation.reset();assert(new Set(Array.from(grid.instanceColor.array).map((_,i,a)=>i%3?null:a.slice(i,i+3).join(','))).size===2,'reset clears all event-cell colors');
 }
 if(id==='max30102'){
  const body=bounds(g.body);close(body.max.x-body.min.x,3.3,1e-5);close(body.max.z-body.min.z,5.6,1e-5);const glass=bounds(g.glass);close(glass.max.y,1.55,1e-5);close(glass.max.y-glass.min.y,.2,1e-5);assert(glass.min.y-body.max.y>.009,'glass underside has clearance above mask');assert(objects(g.glass,o=>o.isMesh).every(o=>!o.castShadow),'transparent cover does not cast an opaque slab shadow');
  const pads=solids(g.base,'c9ab70').filter(b=>Math.abs(b.getCenter(new T.Vector3()).y-.01)<1e-5);assert.equal(pads.length,14);for(const x of[-1.2,1.2])for(let i=0;i<7;i++)assert(pads.some(b=>b.getCenter(new T.Vector3()).distanceTo(new T.Vector3(x,.01,(i-3)*.8))<1e-5),'MAX contact pitch and row centers');
  for(const z of[-.822,1.64])assert.equal(rays(g.body,0,z).length,0,'real optical aperture');assert(rays(g.body,1.1,1.64).length,'aperture retains surrounding mask');assert(rays(g.body,0,.84).length,'physical divider between emitters and detector');
  const detector=objects(g.detector,o=>o.isMesh&&o.material.color.getHexString()==='171c24')[0],d=bounds(detector);close(d.max.x-d.min.x,1.38,1e-5);close(d.max.z-d.min.z,.98,1e-5);
  const r=label=>readouts(model,id).find(r=>r.label===label).value;tick(operation,.1);assert.match(r('Optical slot'),/^Red/);assert(model.stimulus.emitters[0].material.emissiveIntensity>0);assert.equal(model.stimulus.emitters[1].material.emissiveIntensity,0);tick(operation,.4);assert.equal(r('Optical slot'),'Dark interval');tick(operation,.2);assert.match(r('Optical slot'),/^Infrared/);assert.equal(model.stimulus.emitters[0].material.emissiveIntensity,0);assert(model.stimulus.emitters[1].material.emissiveIntensity>0);tick(operation,.4);assert.equal(r('Optical slot'),'Dark interval');
  control('current',0);assert.equal(r('Red return'),'0.000');assert.equal(r('IR return'),'0.000');assert(model.stimulus.emitters.every(o=>o.material.emissiveIntensity===0));control('current',50);control('contact',0);assert.equal(r('Red return'),'0.000');assert.equal(r('IR return'),'0.000');assert(model.behavior.getWaveform().samples.every(v=>v===0));control('contact',1);control('perfusion',0);assert(model.behavior.getWaveform().samples.every(v=>v===0));const dc=model.stimulus.response(0,0);close(model.stimulus.response(0,.19*60/72),dc,1e-8,'zero modulation leaves DC return constant');control('perfusion',2);assert(model.stimulus.response(0,.19*60/72)<dc,'increased absorption lowers received light');
  checkWaveform(model,operation,id);
 }
 if(id==='loadcell'){
  // Custom contours retain physical source creases, while omitting subdivision-only seams.
  for(const e of model.mechanism.elastic)if(e.m!==model.mechanism.body){const expected=new T.EdgesGeometry(e.m.geometry,20);assert.deepEqual(Array.from(e.edges.attributes.position.array),Array.from(expected.attributes.position.array),'unchanged rest crease extraction');expected.dispose();}
  const edgePosition=model.mechanism.body.geometry.userData.anatomyEdges.attributes.position,segments=[];for(let i=0;i<edgePosition.count;i+=2)segments.push(new T.Line3(new T.Vector3().fromBufferAttribute(edgePosition,i),new T.Vector3().fromBufferAttribute(edgePosition,i+1)));
  const pointDistance=p=>Math.min(...segments.map(line=>line.closestPointToPoint(p,true,new T.Vector3()).distanceTo(p)));
  for(const x of[-65,65])for(const y of[0,22])for(const z of[-12.7,12.7])close(pointDistance(new T.Vector3(x,y,z)),0,.001,'outer body corner retained');
  for(const z of[-12.7,12.7])for(const y of[7.5,14.5])close(pointDistance(new T.Vector3(0,y,z)),0,.001,'central machined-window crease retained');
  for(const x of[-53,53])for(const z of[-7.5,7.5])for(const y of[0,22])for(const sign of[-1,1])close(pointDistance(new T.Vector3(x+3*sign,y,z)),0,.03,'mounting-bore countersink outline retained');
  const mechanism=model.mechanism,body=mechanism.body,b=bounds(body);close(b.max.x-b.min.x,130,.001);close(b.max.y-b.min.y,22,.001);close(b.max.z-b.min.z,25.4,.001);
  for(const x of[-53,53])for(const z of[-7.5,7.5])assert.equal(rays(body,x,z,30).length,0,'four physical M6 mounting bores');
  body.updateMatrixWorld(true);for(const x of[-18,0,18])assert.equal(new T.Raycaster(new T.Vector3(x,11,25),new T.Vector3(0,0,-1)).intersectObject(body).length,0,'machined transverse opening');assert(new T.Raycaster(new T.Vector3(30,11,25),new T.Vector3(0,0,-1)).intersectObject(body).length,'material beyond cutout');
  const r=label=>Number(readouts(model,id).find(r=>r.label===label).value),capacity=20*9.80665;control('cycle',0);control('force',capacity);close(r('Applied force'),capacity,.0051);close(r('Equivalent mass'),20,.0051);close(r('Raw bridge'),11,.00051);close(r('Visual deflection'),-3.2,.0051);
  const elastic=mechanism.elastic,positions=elastic.map(e=>Array.from(e.m.geometry.attributes.position.array));control('tare',capacity);assert.equal(r('After tare'),0);elastic.forEach((e,i)=>assert.deepEqual(Array.from(e.m.geometry.attributes.position.array),positions[i],'tare does not relax physical spring'));
  const source=elastic.find(e=>e.m===body),p=body.geometry.attributes.position;let fixed=0,translated=0;for(let i=0;i<p.count;i++){const x=source.base[i*3],y=source.base[i*3+1],z=source.base[i*3+2];if(x<-31){close(p.getX(i),x,1e-5);close(p.getY(i),y,1e-5);fixed++;}if(x>31){close(p.getX(i),x,1e-5);close(p.getY(i),y-3.2,1e-5);translated++;}close(p.getZ(i),z,1e-5);}assert(fixed&&translated,'both rigid ends sampled');
  // Derive axial gauge strain from actual deformed film edge lengths.
  const strain={};for(const gauge of mechanism.gauges){const entry=elastic.find(e=>e.m===gauge.film),gp=gauge.film.geometry.attributes.position,base=entry.base;const lo=[],hi=[];for(let i=0;i<gp.count;i++){if(Math.abs(base[i*3]-(gauge.x-5))<1e-5)lo.push(i);if(Math.abs(base[i*3]-(gauge.x+5))<1e-5)hi.push(i);}const a=lo[0],j=hi.find(i=>Math.abs(base[i*3+2]-base[a*3+2])<1e-5);assert(j!==undefined);const length=new T.Vector3().fromBufferAttribute(gp,a).distanceTo(new T.Vector3().fromBufferAttribute(gp,j));const key=gauge.x<0?(gauge.upper?'A':'C'):(gauge.upper?'B':'D');strain[key]=Math.sign(length-10);}
  assert.deepEqual(strain,{A:1,C:-1,B:-1,D:1},'opposite S-bend curvature and upper/lower strain');
  // Trace the four inter-gauge wire endpoints from actual TubeGeometry paths.
  const terminals={A:[[-22.25,22.1,-2.3],[-22.25,22.1,2.25]],B:[[13.75,22.1,-2.3],[13.75,22.1,2.25]],C:[[-22.25,-.1,-2.3],[-22.25,-.1,2.25]],D:[[13.75,-.1,-2.3],[13.75,-.1,2.25]]};
  const identify=point=>Object.entries(terminals).flatMap(([arm,points])=>points.map((p,i)=>({name:arm+'.'+(i+1),distance:new T.Vector3(...p).distanceTo(point)}))).sort((a,b)=>a.distance-b.distance)[0];
  const links=mechanism.wires.slice(4).map(w=>{const path=w.geometry.parameters.path,ends=[identify(path.getPoint(0)),identify(path.getPoint(1))];assert(ends.every(e=>e.distance<.001));return{key:ends.map(e=>e.name).sort().join('/'),color:w.material.color.getHexString()};});
  for(const[key,color]of[['A.2/B.1','ad5148'],['C.1/D.2','dddcd3'],['B.2/D.1','34383d'],['A.1/C.2','3d699a']])assert(links.some(l=>l.key===key&&l.color===color),'actual bridge node '+key);
  const bridge=mechanism.bridge(),{A,B,C,D}=bridge.arms;assert(A>C&&D>B,'tensile resistance rises');close((5*D/(C+D)-5*B/(A+B))*1000,11,1e-8,'node voltages yield positive differential output');
  const curve=mechanism.cableMesh.geometry.parameters.path;close(curve.getLength(),350,.001,'documented cable centerline');for(let i=2;i<47;i++)assert(curve.points[i].distanceTo(curve.points[i+45])>4.3,'adjacent cable turns clear the sheath diameter');
  control('tare',0);control('force',-capacity);assert.equal(r('Raw bridge'),-11);assert.equal(r('Visual deflection'),3.2);operation.update(.02,{...running,reduced:true});assert.equal(r('Visual deflection'),0,'reduced motion parks enlarged bend');checkWaveform(model,operation,id);
 }
 // Explanatory fields and targets must clear hardware inspection in both selection modes.
 for(const options of[{selected:Object.keys(g)[0]},{isolate:true,selected:Object.keys(g)[0]}]){operation.reset();tick(operation,.1,{...running,...options});for(const overlay of objects(model.root,o=>o.userData.explanatoryEffect))assert(!overlay.visible,id+' explanatory overlay hidden during hardware selection');}
 operation.reset();
}
for(const id of ids.filter(id=>process.argv.length<3||process.argv.slice(2).includes(id))){
 const module=await import(`../src/${id}.js`),definition=module[`${id.toUpperCase()}_BOARD`];assert(definition?.id===id);
 const evidence=fs.readFileSync(`reference/${id}/evidence.md`,'utf8');assert(/documented/i.test(evidence)&&/representative/i.test(evidence),id+' source classes');assert(definition.sources.length>=1&&definition.accuracy.length>60,id+' public reference limits');
 const model=await definition.build(),operation=createOperation(model,definition),size=group=>new T.Box3().setFromObject(model.groups[group],true).getSize(new T.Vector3());
 assert.deepEqual(Object.keys(model.groups).sort(),definition.parts.map(part=>part.id).sort());
 for(const method of ['update','setControl','reset','getReadouts'])assert.equal(typeof model.behavior?.[method],'function');
 let triangles=0,moving=0;
 model.root.traverse(object=>{if(!object.isMesh||object.isBatchedMesh)return;const positions=object.geometry.attributes.position;assert(positions?.count>0);for(const value of positions.array)assert(Number.isFinite(value),id+' finite geometry');for(const index of object.geometry.index?.array||[])assert(index>=0&&index<positions.count);triangles+=(object.geometry.index?.count||positions.count)/3;if(isMovingPart(object))moving++;if(object.userData.decal)assert(!object.castShadow,id+' artwork does not cast rectangular shadows');});
 if(['loadcell'].includes(id))assert(moving>0,id+' moving geometry registered');for(const batch of model.batches||[])assert(batch.entries.every(entry=>!isMovingPart(entry.object)),id+' animated meshes outside batches');
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
 for(const overlay of overlays){const mesh=objects(overlay,o=>o.isMesh&&!o.isInstancedMesh)[0];const point=bounds(mesh).getCenter(new T.Vector3());const visible=overlay.visible,meshVisible=mesh.visible;overlay.visible=true;mesh.visible=true;model.root.updateMatrixWorld(true);const ray=new T.Raycaster(point.clone().add(new T.Vector3(20,0,0)),new T.Vector3(-1,0,0));ray.layers.enable(1);assert(ray.intersectObject(overlay,true).length>0,id+' test ray actually intersects annotation');assert.equal(pickComponent(ray,{[mesh.userData.partId]:overlay}),null,id+' annotations never pick as hardware');overlay.visible=visible;mesh.visible=meshVisible;}
 const rest=new Map(anatomy.entries.map(entry=>[entry,Array.from(entry.lines.geometry.attributes.position.array)]));tick(operation,.37);anatomy.update(null);
 for(const entry of anatomy.entries){assert.equal(entry.body.geometry,entry.source.geometry);assert.deepEqual(entry.body.matrix.elements,entry.source.matrixWorld.elements);if(entry.source.geometry.userData.anatomyEdges){assert.equal(entry.lines.geometry,entry.source.geometry.userData.anatomyEdges);const base=rest.get(entry),p=entry.lines.geometry.attributes.position,q=-3.2*model.mechanism.applied/(20*9.80665);for(let i=0;i<p.count;i++){const x=base[i*3],y=base[i*3+1],z=base[i*3+2],t=Math.max(0,Math.min(1,(x+30)/60)),s=t*t*(3-2*t),slope=t>0&&t<1?6*t*(1-t)/60:0;close(p.getX(i),x-(y-11)*q*slope,1e-5,'custom contour follows actual bend x');close(p.getY(i),y+q*s,1e-5,'custom contour follows actual bend y');close(p.getZ(i),z,1e-5);}}else{const expected=new T.EdgesGeometry(entry.source.geometry,20);assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),Array.from(expected.attributes.position.array),id+' deformed anatomy contour');expected.dispose();}}
 operation.reset();anatomy.update(null);for(const entry of anatomy.entries)assert.deepEqual(Array.from(entry.lines.geometry.attributes.position.array),rest.get(entry),id+' restored anatomy contour');
 checkPackageAndBehavior(id,model,operation);
 if(id==='loadcell'){const resources=modelResources(model),counts=new Map();for(const e of model.mechanism.elastic){assert(resources.geometry.has(e.edges),'owned contours collected before anatomy attachment');counts.set(e.edges,0);e.edges.addEventListener('dispose',()=>counts.set(e.edges,counts.get(e.edges)+1));}disposeModel({...model,anatomy});assert([...counts.values()].every(n=>n===1),'shared custom contours disposed exactly once with anatomy');}
 console.log(`PASS ${id}: package, causal behavior and runtime gate, ${definition.parts.length} groups, ${moving} moving meshes, ${triangles} triangles`);
}
