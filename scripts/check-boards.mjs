import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from 'three';
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const {buildUno,UNO_PARTS,padWorld}=await import('../src/uno.js');
const {buildPi5,PI_PARTS}=await import('../src/pi5.js');
const layout=JSON.parse(fs.readFileSync('src/uno-layout.json'));
const piData=JSON.parse(zlib.gunzipSync(fs.readFileSync('public/models/pi5.json.gz')));
const uno=buildUno(),pi=await buildPi5(piData);
const eps=(a,b,message)=>assert(Math.abs(a-b)<.015,message+` (${a} vs ${b})`);
let pcb;uno.groups.board.traverse(o=>{if(o.userData.pcb)pcb=o;});
// The board bounding box excludes connector overhang and respects the original
// rounded, notched EAGLE outline, unlike an invented rectangular placeholder.
const ub=new T.Box3().setFromObject(pcb).getSize(new T.Vector3());eps(ub.x,68.58,'Uno outline length');eps(ub.z,53.34,'Uno outline width');
assert.deepEqual(uno.root.userData.mountingHoles,[[66.04,35.56,3.2],[66.04,7.62,3.2],[15.24,50.8,3.2],[13.97,2.54,3.2]]);
const hdr=Object.fromEntries(['IOH','IOL','AD','POWER'].map(id=>{const e=layout.components.find(x=>x.name===id);return[id,layout.packages[e.library+'/'+e.package].filter(p=>p.type==='pad').map(p=>padWorld(e,p)).sort((a,b)=>a[0]-b[0])]}));
assert.deepEqual(Object.values(hdr).map(p=>p.length),[10,8,6,8]);
for(const pins of Object.values(hdr))for(let i=1;i<pins.length;i++)eps(pins[i][0]-pins[i-1][0],2.54,'Uno header pitch');
eps(hdr.IOL[0][0]-hdr.IOH.at(-1)[0],4.064,'Uno digital header offset');
assert.equal(piData.metadata.sourceMeshes,2711,'All official Pi solids and free shells are present');
assert.equal(piData.metadata.counts.headers,41,'Pi header has one housing plus 40 posts');
const sources=JSON.parse(fs.readFileSync('reference/pi5/source-groups.json'));const pb=sources.find(s=>s.name==='OBJ8571');eps(pb.max[0]-pb.min[0],85,'Pi board length');eps(pb.max[1]-pb.min[1],56,'Pi board width');
assert.equal(sources.filter(s=>s.group==='ports'&&['OBJ5053','OBJ5085'].includes(s.name)).length,2,'Both micro-HDMI shells are retained');
for(const[name,model,parts]of[['Uno',uno,UNO_PARTS],['Pi 5',pi,PI_PARTS]]){
 assert.equal(Object.keys(model.groups).length,parts.length);
 assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);
 for(const p of parts)assert(!new T.Box3().setFromObject(model.groups[p.id]).isEmpty(),p.id+' has geometry');
 for(const e of [0,.25,.5,.75,1]){
  model.setPose(e);model.root.updateMatrixWorld(true);
  for(const p of parts){assert.deepEqual(model.groups[p.id].position.toArray(),p.offset.map(v=>v*e));assert(new T.Box3().setFromObject(model.groups[p.id]).min.y>-19.2,'Floor clearance');}
 }
 model.setPose(0);assert(Object.values(model.groups).every(g=>g.position.length()===0));
 let meshes=0,triangles=0;
 model.root.traverse(o=>{if(!o.isMesh||o.isBatchedMesh)return;meshes++;const p=o.geometry.attributes.position;assert(p.count>0);for(const n of p.array)assert(Number.isFinite(n));if(o.geometry.index){for(const n of o.geometry.index.array)assert(n<p.count);triangles+=o.geometry.index.count/3}else triangles+=p.count/3;});
 for(const p of parts){model.setSelection(p.id,true,false);assert.equal(Object.values(model.groups).filter(g=>g.visible).length,1);assert(model.groups[p.id].visible);model.setSelection(p.id,false,true);assert(Object.values(model.groups).every(g=>g.visible));model.setSelection(p.id,false,false);}
 console.log(`PASS · ${name}: ${parts.length} selectable parts, ${meshes} source meshes, ${Math.round(triangles).toLocaleString()} triangles; finite geometry, indices, assembly poses, isolation, X-ray and floor clearance`);
}
console.log('PASS · official Pi 85 × 56 mm envelope, complete 2711-shape inventory, 40-pin header and micro-HDMI shells');
console.log('PASS · Uno 68.58 × 53.34 mm outline, exact four mounting holes, 32 sockets, 2.54 mm pitch and 4.064 mm digital-header offset');

assert(UNO_PARTS.some(p=>p.id==='u-C2')&&UNO_PARTS.some(p=>p.id==='u-Y1')&&UNO_PARTS.some(p=>p.id==='u-RESET'));
assert.equal(PI_PARTS.filter(p=>p.id.startsWith('smd')).length,1,'SMD packages share one selectable group');
assert.equal(new Set(sources.map(s=>s.name)).size,2711,'No CAD shapes lost or duplicated during regrouping');
for(const part of PI_PARTS.filter(p=>p.id.startsWith('smd')))for(const name of part.sourceShapes)assert.equal(sources.find(s=>s.name===name).group,part.id);
const coolerSize=new T.Box3().setFromObject(pi.groups.heatsink).getSize(new T.Vector3());eps(coolerSize.x,63.5,'Cooler outline length');eps(coolerSize.z,42.5,'Cooler outline width');
assert.deepEqual(pi.groups.coolerPins.userData.mounts,[[3.5,9.5],[61.5,46.5]]);
pi.setAccessories(false);pi.setSelection('cpu',false,false);assert(PI_PARTS.filter(p=>p.accessory).every(p=>!pi.groups[p.id].visible));assert(pi.groups.cpu.visible);
pi.setAccessories(true);pi.setSelection('cpu',false,false);assert(Object.values(pi.groups).every(g=>g.visible));
console.log('PASS · grouped SMD component coverage, official cooler envelope, mounting axes and accessory visibility');

const mat=new T.Matrix4(),expected=new T.Matrix4();
for(const e of [0,.5,1]){pi.setPose(e);for(const r of pi.batches)r.entries.forEach((item,i)=>{r.opaque.getMatrixAt(i,mat);expected.makeTranslation(...item.group.position.toArray()).multiply(item.base);assert(mat.elements.every((v,k)=>Math.abs(v-expected.elements[k])<.0001),'Batched CAD follows component pose');});}
pi.setPose(0);pi.setSelection('pmic',true,false);for(const r of pi.batches)r.entries.forEach((item,i)=>assert.equal(r.opaque.getVisibleAt(i),item.partId==='pmic'));
pi.setSelection('pmic',false,true);for(const r of pi.batches)r.entries.forEach((item,i)=>{assert.equal(r.opaque.getVisibleAt(i),item.partId==='pmic');assert.equal(r.ghost.getVisibleAt(i),item.partId!=='pmic');});
pi.setSelection('cpu',false,false);console.log(`PASS · ${pi.batches.length} Pi material batches follow separation, isolation and X-ray`);

pi.setPose(0);pi.root.updateMatrixWorld(true);
const axisRay=new T.Raycaster();axisRay.layers.enable(1);
for(const [x,y]of [[3.5,9.5],[61.5,46.5]]){
 axisRay.set(new T.Vector3(x-42.5,50,28-y),new T.Vector3(0,-1,0));
 assert.equal(axisRay.intersectObject(pi.groups.board,true).length,0,'Cooler axis passes through the actual CAD PCB hole');
 assert.equal(axisRay.intersectObject(pi.groups.heatsink,true).length,0,'Cooler axis passes through the heatsink hole');
 assert(axisRay.intersectObject(pi.groups.coolerPins,true).length>0,'Push pin is on the mounting axis');
}
console.log('PASS · cooler pins, heatsink openings and official CAD board holes are coaxial');
