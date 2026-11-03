import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3,Raycaster} from 'three';
import {DIM,PARTS,PINS,assemblyPose} from '../src/data.js';
import {pickComponent} from '../src/selection.js';
// Canvas artwork is irrelevant to geometry auditing. A no-op drawing context lets
// the actual Three.js mesh builder run in Node without a browser or GPU.
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:(tag)=>{assert.equal(tag,'canvas');return{width:0,height:0,getContext:()=>context}}};
const {buildModel}=await import('../src/model.js');
const model=buildModel();
const componentIds=['shield','cpu','flash','crystal','rf','module','usb','bridge','power','buttons','led','smd','board','headers'];
assert.deepEqual(PARTS.map(p=>p.id),componentIds);assert.equal(new Set(PARTS.map(p=>p.id)).size,componentIds.length);
assert.deepEqual(PINS.map(p=>p.length),[19,19]);
assert.equal(DIM.pitch,2.54);assert.equal(DIM.width,27.94);assert.equal(DIM.length,48.26);
assert.deepEqual(assemblyPose(-1),assemblyPose(0));assert.deepEqual(assemblyPose(2),assemblyPose(1));
for(const pose of Object.values(assemblyPose(0)))assert(pose.every(n=>Math.abs(n)===0));
let meshes=0,triangles=0;
model.root.traverse(o=>{if(!o.isMesh)return;meshes++;const pos=o.geometry.getAttribute('position');assert(pos,'Every mesh has positions');for(let i=0;i<pos.array.length;i++)assert(Number.isFinite(pos.array[i]),'All mesh coordinates are finite');triangles+=(o.geometry.index?.count||pos.count)/3;});
for(const e of [0,.2,.5,.78,1]){
 model.setPose(e);model.root.updateMatrixWorld(true);
 for(const p of PARTS){assert.deepEqual(model.groups[p.id].position.toArray(),assemblyPose(e)[p.id]);const b=new Box3().setFromObject(model.groups[p.id]);assert(!b.isEmpty(),p.name+' has visible geometry');assert(b.min.y>-19.2,p.name+' clears the studio floor');}
}
model.setPose(0);model.root.updateMatrixWorld(true);
const headers=new Box3().setFromObject(model.groups.headers),hs=headers.getSize(new Vector3());
assert(Math.abs(hs.z-(18*2.54+2.5))<.01,'19 pins at 2.54 mm pitch fit header length');
assert(Math.abs(hs.x-(25.4+2.5))<.01,'Header rows are 25.4 mm apart');
const mod=new Box3().setFromObject(model.groups.module),ms=mod.getSize(new Vector3());
assert(Math.abs(ms.z-25.5)<.01,'Module is 25.5 mm long');
assert(Math.abs(mod.min.z+DIM.length/2+6.04)<.01,'Antenna projects 6.04 mm beyond carrier');
const cpu=new Box3().setFromObject(model.groups.cpu),flash=new Box3().setFromObject(model.groups.flash);
assert(cpu.max.y<3.71&&flash.max.y<3.71,'Packages fit beneath the shield ceiling');
assert(!cpu.intersectsBox(flash),'CPU and flash do not collide');
assert(new Box3().setFromObject(model.groups.board).max.y<1,'Carrier PCB contains only laminate, artwork and plated holes; no mounted components');
assert(mod.max.y<1.9,'Module PCB retains its printed antenna, not its crystal or SMD packages');
const assembledBounds=Object.fromEntries(PARTS.map(p=>[p.id,new Box3().setFromObject(model.groups[p.id])]));
for(const e of [.2,.5,.78,1]){
 model.setPose(e);model.root.updateMatrixWorld(true);
 for(const p of PARTS.filter(p=>p.id!=='board')){
  const b=new Box3().setFromObject(model.groups[p.id]);
  assert(b.getCenter(new Vector3()).distanceTo(assembledBounds[p.id].getCenter(new Vector3()))>.5,p.name+' separates from its assembled position');
  if(['cpu','flash','crystal','rf'].includes(p.id))assert(b.min.y>new Box3().setFromObject(model.groups.module).max.y,p.name+' clears the module substrate');
  if(['usb','bridge','power','buttons','led','smd'].includes(p.id))assert(b.min.y>assembledBounds.board.max.y,p.name+' clears the carrier PCB');
 }
}
// Exercise the actual model's new groups, rather than just their pose metadata.
const ray=new Raycaster();
for(const e of [0,.78,1])for(const id of ['usb','bridge','power','buttons','led','smd','crystal','rf']){
 model.setPose(e);model.setSelection(id,true,false);model.root.updateMatrixWorld(true);
 const part=PARTS.find(p=>p.id===id),position=new Vector3(...part.anchor).add(model.groups[id].position);
 ray.set(new Vector3(position.x,70,position.z),new Vector3(0,-1,0));
 const hit=pickComponent(ray,model.groups);assert.equal(hit?.id,id,id+' is independently selectable at separation '+e);
 assert(Math.abs(hit.anchor.x-part.anchor[0])<1e-6&&Math.abs(hit.anchor.z-part.anchor[2])<1e-6,'Selection anchor stays attached to '+id);
}
model.setPose(0);model.root.updateMatrixWorld(true);
for(const p of PARTS){const b=new Box3().setFromObject(model.groups[p.id]);assert(b.min.distanceTo(assembledBounds[p.id].min)<1e-6&&b.max.distanceTo(assembledBounds[p.id].max)<1e-6,p.name+' returns to its assembled placement');}
for(const id of PARTS.map(p=>p.id)){model.setSelection(id,true,false);assert.equal(Object.values(model.groups).filter(g=>g.visible).length,1);assert(model.groups[id].visible);}
model.setSelection('shield',false,false);assert(Object.values(model.groups).every(g=>g.visible));
const standalone=fs.readFileSync('dist/breakboard.html','utf8');
assert(!standalone.includes('src="/src/main.js"'),'Offline entry is embedded');
assert(!standalone.includes('@import'),'Offline CSS has no runtime imports');
assert(standalone.includes('data:font/')||standalone.includes('data:application/'),'Fonts are embedded');
assert(standalone.includes('__BREAKBOARD_ASSETS'),'Offline collection includes the Pi CAD asset');
console.log(`PASS · ${PARTS.length} component groups, 38 header contacts, ${meshes} mesh draws, ${Math.round(triangles).toLocaleString()} triangles`);
console.log('PASS · bare carrier/module PCBs, all mounted components separate, new groups pick correctly, exact assembly restoration');
console.log('PASS · finite geometry, package clearances, floor clearance, header spacing, module overhang, assembled and exploded poses, isolation');
console.log(`PASS · offline HTML (${Math.round(Buffer.byteLength(standalone)/1024)} KB), embedded scripts and fonts`);
console.log('Note: source/geometry checks do not replace a browser render review.');
