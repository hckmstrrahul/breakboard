import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from 'three';
import {buildGrobot,GROBOT_BOARD} from '../src/grobot.js';
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
 const size=bounds(id).getSize(new T.Vector3());close(size.y,70.5,id+' BAK nominal length');close(size.x,21.25,id+' BAK nominal diameter');
 assert(bounds(id).min.y>bounds('holder').min.y&&bounds(id).max.y<bounds('holder').max.y,id+' sits between holder end walls');
}
assert(bounds('cell1').max.x<bounds('cell2').min.x,'Parallel cells have physical clearance');
assert(bounds('holder').max.x<bounds('controller').min.x,'Controller clears the holder laterally');
assert(bounds('controller').min.z>bounds('shell').min.z,'Controller header pins clear the back wall');
assert(bounds('servo').min.z>bounds('controller').max.z,'Servo clears the controller');
assert(bounds('display').max.y<GROBOT_BOARD.assembledTarget[1]*2-2,'LCD clears the lid');
// Cast through actual holes, rather than merely checking declared dimensions.
const ray=new T.Raycaster();
for(const [name,x,h]of [['LCD',30,104.25],['dial',73,104.1],['microphone',22.35,22.9],['light bar',47,78],['screw',10,126],['speaker grille gap',72,32.8]]){
 ray.set(new T.Vector3(x-50,h,80),new T.Vector3(0,0,-1));
 assert.equal(ray.intersectObject(model.groups.fascia,true).length,0,name+' opening is cut through the fascia');
}
ray.set(new T.Vector3(23,104.1,45),new T.Vector3(0,0,-1));
assert(ray.intersectObject(model.groups.servo,true).length>0,'Anchor axis passes through the servo output');
const operation=createOperation(model,GROBOT_BOARD),filaments=[...operation.indicators].filter(m=>m.userData.indicator.kind==='filament');
assert.equal(filaments.length,4,'Exactly four real filaments, not a third installed pair');
assert.deepEqual(filaments.map(m=>m.userData.indicator.row).sort(),[0,0,1,1]);
assert.equal(operation.motions.length,1,'Only the anchor/horn moves');
const motion=operation.motions[0],played={playing:true,explode:0,reduced:false,isolate:false};
let min=Infinity,max=-Infinity;
for(let frame=0;frame<900;frame++){
 operation.update(1/60,played);const angle=motion.object.rotation.z;min=Math.min(min,angle);max=Math.max(max,angle);
 assert(Math.abs(angle)<=Math.PI/6+.000001,'Servo demo respects ±30°');
 for(const row of[0,1])assert(filaments.filter(m=>m.userData.indicator.row===row&&m.emissiveIntensity>0).length<=1,'Red and green are mutually exclusive');
}
assert(min<-.52&&max>.52,`Command reaches both ends of its illustrative sweep: ${min} to ${max}`);
operation.reset();assert(motion.object.quaternion.angleTo(motion.rest)<1e-8,'Reset returns anchor to neutral');
for(const fraction of[0,.25,.5,.75,1]){
 model.setPose(fraction);model.root.updateMatrixWorld(true);
 for(const part of GROBOT_BOARD.parts)assert(bounds(part.id).min.y>=GROBOT_BOARD.floorY,part.id+' clears the Grobot floor throughout separation');
}
console.log('PASS · Grobot: manufacturer PCB dimensions, cell fit and clearance, open fascia holes, common servo axis, two fitted light-bar pairs, bounded servo activity and full-pose floor clearance');
