import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from 'three';
import {buildGrobot,GROBOT_BOARD,GROBOT_PERF_HOLES} from '../src/grobot.js';
import {createOperation} from '../src/operation.js';

const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const data=JSON.parse(zlib.gunzipSync(fs.readFileSync('public/models/grobot.json.gz')));
const model=await buildGrobot(data);model.root.updateMatrixWorld(true);
const close=(actual,expected,message,tolerance=.025)=>assert(Math.abs(actual-expected)<tolerance,`${message}: ${actual} vs ${expected}`);
for(const [id,dimensions]of [['ups',[56,85,1.6]],['display',[22,38.5,1.6]]]){
 const source=data.meshes.find(m=>m.group===id&&m.material[0]==='#194871');
 const box=new T.Box3();for(let i=0;i<source.p.length;i+=3)box.expandByPoint(new T.Vector3(...source.p.slice(i,i+3)));
 box.getSize(new T.Vector3()).toArray().forEach((v,i)=>close(v,dimensions[i],id+' manufacturer PCB dimensions'));
}
assert.equal(data.metadata.counts.ups,281);assert.equal(data.metadata.counts.holder,5);assert.equal(data.metadata.counts.display,39);
const bounds=id=>new T.Box3().setFromObject(model.groups[id]);
for(const id of ['cell1','cell2']){
 const size=bounds(id).getSize(new T.Vector3());close(size.z,70.5,id+' BAK nominal length');close(size.x,21.25,id+' BAK nominal diameter');
 assert(bounds(id).min.z>bounds('holder').min.z&&bounds(id).max.z<bounds('holder').max.z,id+' sits between holder end walls');
 assert(bounds(id).min.y>8.8,id+' clears the carrier');
}
assert(bounds('cell1').max.x<bounds('cell2').min.x,'Parallel cells have physical clearance');
assert(bounds('holder').max.x<bounds('controller').min.x,'Controller clears the holder laterally');
assert(bounds('servo').min.y>bounds('controller').max.y,'Servo clears the controller vertically');
assert(bounds('speaker').min.y>bounds('amplifier').max.y,'Speaker clears the audio electronics');
assert(bounds('display').max.y<76.5-1.5,'LCD clears the upper brass rail');
for(const id of ['fascia','lid','shell','anchor','guard','diffusers'])assert(!model.groups[id],id+' is removed from the open design');
assert.equal(GROBOT_BOARD.parts.length,20);
// Cast through actual manufactured UPS holes and the actual new perfboard holes.
const ray=new T.Raycaster();
for(const x of[10.5,59.5])for(const d of[28.5,86.5]){
 ray.set(new T.Vector3(x-50,37.5,d-34),new T.Vector3(0,-1,0));ray.far=3;
 assert.equal(ray.intersectObject(model.groups.ups,true).length,0,'UPS standoff axis uses an original PCB mounting hole');
}
ray.far=Infinity;
for(const [x,d]of [[18.34,4.51],[33.58,7.05],[112.32,88.33]]){
 assert(GROBOT_PERF_HOLES.some(([px,pd])=>Math.hypot(px-x,pd-d)<.001));
 ray.set(new T.Vector3(x-50,30,d-34),new T.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(model.groups.carrier,true).length,0,'Perfboard has an open hole, not a printed dot');
 ray.set(new T.Vector3(x-49,30,d-34),new T.Vector3(0,-1,0));assert(ray.intersectObject(model.groups.carrier,true).length>0,'Solid carrier surrounds the hole');
}
let sockets=0;model.groups.carrier.traverse(o=>{
 if(!o.userData.header)return;assert(o.userData.header.female);sockets+=o.userData.header.contacts;
 for(const[x,z]of o.userData.header.centers){const p=o.localToWorld(new T.Vector3(x,0,z));assert(GROBOT_PERF_HOLES.some(([px,pd])=>Math.hypot(px-50-p.x,pd-34-p.z)<.001),'Controller socket fits the real 2.54 mm pad grid');}
});assert.equal(sockets,44,'Both 22-contact controller sockets are retained');
ray.set(new T.Vector3(10,51,66),new T.Vector3(0,0,-1));
assert(ray.intersectObject(model.groups.servo,true).length>0,'Pointer axis passes through the servo output');
close(bounds('pointer').min.z,bounds('servo').max.z,'Pointer hub seats on the output shaft');
const operation=createOperation(model,GROBOT_BOARD),filaments=[...operation.indicators].filter(m=>m.userData.indicator.kind==='filament');
assert.equal(filaments.length,4,'Exactly four real filaments, not a third installed pair');
assert.deepEqual(filaments.map(m=>m.userData.indicator.row).sort(),[0,0,1,1]);
assert.equal(operation.motions.length,1,'Only the bare pointer moves');
const motion=operation.motions[0],played={playing:true,explode:0,reduced:false,isolate:false};
let min=Infinity,max=-Infinity;
for(let frame=0;frame<900;frame++){
 operation.update(1/60,played);const angle=motion.object.rotation.z;min=Math.min(min,angle);max=Math.max(max,angle);
 assert(Math.abs(angle)<=Math.PI/6+.000001,'Servo demo respects ±30°');
 for(const row of[0,1])assert(filaments.filter(m=>m.userData.indicator.row===row&&m.emissiveIntensity>0).length<=1,'Red and green are mutually exclusive');
}
assert(min<-.52&&max>.52,`Command reaches both ends of its illustrative sweep: ${min} to ${max}`);
operation.reset();assert(motion.object.quaternion.angleTo(motion.rest)<1e-8,'Reset returns pointer to neutral');
for(const fraction of[0,.25,.5,.75,1]){
 model.setPose(fraction);model.root.updateMatrixWorld(true);
 for(const part of GROBOT_BOARD.parts)assert(bounds(part.id).min.y>=GROBOT_BOARD.floorY,part.id+' clears the Grobot floor throughout separation');
}
// The complete assembly must fit a phone viewport, including the broad brass cage.
for(const pose of[0,1]){
 model.setPose(pose);model.root.updateMatrixWorld(true);
 const aspect=365/600,base=T.MathUtils.lerp(GROBOT_BOARD.assembledHalf,GROBOT_BOARD.half,pose),half=Math.max(base,Math.max(T.MathUtils.lerp(GROBOT_BOARD.minHalfWidth,GROBOT_BOARD.explodedMinHalfWidth,pose),base*.82)/aspect);
 const camera=new T.OrthographicCamera(-half*aspect,half*aspect,half,-half,.1,800),target=new T.Vector3(...GROBOT_BOARD.assembledTarget).lerp(new T.Vector3(...GROBOT_BOARD.target),pose);
 camera.position.set(...GROBOT_BOARD.camera).add(target.clone().sub(new T.Vector3(...GROBOT_BOARD.target)));camera.lookAt(target);camera.updateMatrixWorld(true);
 for(const part of GROBOT_BOARD.parts){const box=bounds(part.id);
  for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const point=new T.Vector3(x,y,z).project(camera);assert(Math.abs(point.x)<1&&Math.abs(point.y)<1,part.id+' fits phone framing at separation '+pose);}
 }
}
console.log('PASS · Grobot: manufacturer PCB dimensions, cell fit and clearance, open perfboard holes, socket registration, original UPS mounting axes, common servo axis, two fitted light-bar pairs, bounded servo activity, full-pose floor clearance and phone framing');
