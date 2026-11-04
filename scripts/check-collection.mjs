import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';

// Exercise the real builders with canvas drawing stubbed; geometry, groups,
// material batching and pose/selection behavior are the production code.
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
globalThis.__BREAKBOARD_ASSETS=Object.fromEntries(fs.readdirSync('public/models').filter(f=>f.endsWith('.json.gz')).map(f=>[f.replace('.json.gz',''),fs.readFileSync('public/models/'+f).toString('base64')]));
const {BOARD_LIST}=await import('../src/boards.js');
assert.equal(new Set(BOARD_LIST.map(b=>b.id)).size,BOARD_LIST.length,'Unique board routes');
const expected=['esp32','pi5','uno','jetson','pico2w','nano','orangepi5','beaglebone','nucleo','portenta','nixie','neopixel','dlp','hqcamera','stepper','hackrf','grobot','pmt','spectrometer','epyc','lidar','vfd','corememory','lepton','intel4004','sps30'];
assert.deepEqual(BOARD_LIST.map(b=>b.id).toSorted(),expected.toSorted(),'All twenty-six requested and existing devices are available');
const verifiedDimensions={pico2w:[21,1,51],nano:[43.18,1.6,17.78],orangepi5:[100,1.6,62],beaglebone:[86.36,1.6,54.61],nucleo:[70,1.6,82.5]};
const reports=[];
for(const def of BOARD_LIST){
 assert(def.sources.length>=2&&def.accuracy.length>60,def.id+' has reference provenance');
 const model=await def.build(),ids=def.parts.map(p=>p.id);
 assert.deepEqual(Object.keys(model.groups).toSorted(),ids.toSorted(),def.id+' inventory matches selectable geometry');
 assert.equal(new Set(ids).size,ids.length,def.id+' unique component IDs');
 for(const part of def.parts){
  for(const field of ['name','short','kind','description'])assert(typeof part[field]==='string'&&part[field].length>0,def.id+'/'+part.id+' '+field);
  assert(part.specs.length>0,part.id+' explanatory specifications');
  assert(part.anchor.length===3&&part.anchor.every(Number.isFinite),part.id+' valid anchor');
  assert(part.offset.length===3&&part.offset.every(Number.isFinite),part.id+' valid separation');
 }
 let meshes=0,triangles=0;const boardMeshes=[];
 model.root.traverse(o=>{
  if(!o.isMesh||o.isBatchedMesh)return;meshes++;const p=o.geometry.attributes.position;
  assert(p&&p.count>0,def.id+' nonempty mesh');for(const v of p.array)assert(Number.isFinite(v),def.id+' finite vertices');
  const indices=o.geometry.index?.array;if(indices)for(const v of indices)assert(v>=0&&v<p.count,def.id+' valid indices');
  triangles+=(indices?.length||p.count)/3;if(o.userData.pcb)boardMeshes.push(o);
 });
 assert(meshes>0&&triangles>0);
 for(const e of [0,.25,.5,.75,1]){
  model.setPose(e);model.root.updateMatrixWorld(true);
  for(const part of def.parts){
   assert.deepEqual(model.groups[part.id].position.toArray(),part.offset.map(v=>v*e));
   const bounds=new T.Box3().setFromObject(model.groups[part.id]);assert(!bounds.isEmpty(),def.id+'/'+part.id+' geometry');
   assert(bounds.min.y>-19.2,def.id+'/'+part.id+' clears the floor at '+e);
  }
 }
 model.setPose(0);model.root.updateMatrixWorld(true);
 // PCB extents are checked against the board drawing, not connector overhang.
 if(verifiedDimensions[def.id]&&boardMeshes.length===1){
  const actual=new T.Box3().setFromObject(boardMeshes[0]).getSize(new T.Vector3()).toArray(),expected=verifiedDimensions[def.id];
  for(let i=0;i<3;i++)assert(Math.abs(actual[i]-expected[i])<.05,`${def.id} PCB axis ${i}: ${actual[i]} vs ${expected[i]}`);
 }
 for(const id of ids){
  model.setSelection(id,true,false);assert.equal(Object.values(model.groups).filter(g=>g.visible).length,1,def.id+' isolation');assert(model.groups[id].visible);
  for(const r of model.batches||[])r.entries.forEach((item,i)=>assert.equal(r.opaque.getVisibleAt(i),item.partId===id,def.id+' batched isolation'));
  model.setSelection(id,false,true);assert(Object.values(model.groups).every(g=>g.visible),def.id+' X-ray retains context');
  for(const r of model.batches||[])r.entries.forEach((item,i)=>{assert.equal(r.opaque.getVisibleAt(i),item.partId===id);assert.equal(r.ghost.getVisibleAt(i),item.partId!==id);});
  model.setSelection(id,false,false);
 }
 if(def.parts.some(p=>p.accessory)){
  model.setAccessories(false);model.setSelection(ids.find(id=>!def.parts.find(p=>p.id===id).accessory),false,false);
  for(const p of def.parts)assert.equal(model.groups[p.id].visible,!p.accessory);
  model.setAccessories(true);model.setSelection(ids[0],false,false);
 }
 if(!['esp32','pi5','uno','nixie','stepper','dlp','grobot','pmt','spectrometer','epyc','lidar','vfd','corememory','lepton','intel4004','sps30'].includes(def.id))assert.equal(def.parts.filter(p=>p.id==='smd').length,1,def.id+' has one SMD group');
 reports.push({board:def.tab,groups:ids.length,meshes,triangles});
 console.log(`PASS · ${def.tab}: ${ids.length} groups, ${triangles.toLocaleString()} triangles; full pose range, floor clearance, selection, isolation, X-ray and reference metadata`);
}
console.table(reports);
