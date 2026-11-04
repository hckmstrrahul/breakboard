import assert from 'node:assert/strict';
import * as T from 'three';
import {createOperation} from '../src/operation.js';
const context=new Proxy({}, {get:(_,key)=>key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const {BOARDS}=await import('../src/boards.js');
const ids=['pmt','spectrometer','epyc','lidar','vfd','corememory','lepton','intel4004','sps30'];
for(const id of ids){
 const def=BOARDS[id],model=await def.build();model.setPose(0);const operation=createOperation(model,def),powered={playing:true,explode:0,reduced:false,isolate:false,selected:null};
 model.setSelection(null,false,false);
 const original=new Map();model.root.traverse(o=>{if(o.isMesh)original.set(o,o.material);});
 for(const part of def.parts){
  model.setSelection(part.id,false,true);
  for(const[k,group]of Object.entries(model.groups))group.traverse(o=>{if(!o.isMesh)return;if(k===part.id)assert.equal(o.material,original.get(o),id+' selection retains real material');else{assert(o.material.transparent);assert(o.material.opacity<=.1);assert(!o.material.depthWrite);}});
 }
 model.setSelection(null,false,false);for(const[o,mat]of original)assert.equal(o.material,mat,id+' deselection restores every material');
 for(let n=0;n<240;n++)operation.update(1/60,powered);
 for(const p of operation.effects.paths){assert(p.dots.length>0);for(const dot of p.dots){assert(dot.position.toArray().every(Number.isFinite));assert(dot.material.opacity>.8);}}
 if(operation.effects.covers.length){assert(operation.effects.covers.every(c=>c.mat.opacity<.15),id+' playback exposes the reconstruction');operation.update(1/60,{...powered,selected:def.parts[0].id});assert(operation.effects.covers.every(c=>c.mat.opacity===c.opacity),id+' selected covers retain their materials');}
 const before=operation.effects.paths.flatMap(p=>p.dots.map(d=>d.position.toArray()));operation.update(1/60,{...powered,reduced:true});const still=operation.effects.paths.flatMap(p=>p.dots.map(d=>d.position.toArray()));operation.update(1/60,{...powered,reduced:true});assert.deepEqual(operation.effects.paths.flatMap(p=>p.dots.map(d=>d.position.toArray())),still,id+' reduced-motion particles are stationary');
 operation.reset();for(const c of operation.effects.covers)assert.equal(c.mat.opacity,c.opacity);
 if(id==='pmt'){assert.equal(def.parts.filter(p=>p.id.startsWith('dynode')).length,9);assert.equal(operation.effects.paths[0].config.points.length,12);}
 if(id==='epyc')assert.equal(def.parts.filter(p=>p.id.startsWith('ccd')).length,12);
 if(id==='vfd'){assert.equal(operation.indicators.size,64);for(let n=0;n<120;n++)operation.update(1/60,powered);assert([...operation.indicators].some(m=>m.emissiveIntensity>1));}
 if(id==='lidar'){assert.equal(operation.motions.length,4);for(let n=0;n<60;n++)operation.update(1/60,powered);const poses=operation.motions.map(m=>m.object.quaternion.toArray());for(const pose of poses)assert.deepEqual(pose,poses[0],'All rotating range-head parts stay registered');}
 if(id==='lepton'){model.setPose(0);model.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model.root).getSize(new T.Vector3());assert(bounds.x<12&&bounds.z<13,'Open shutter stays inside the module envelope');}
 if(id==='corememory'){let vertices=0;model.groups.cores.traverse(o=>{if(o.isMesh)vertices+=o.geometry.attributes.position.count;});assert.equal(vertices,1024*16*6*6,'All 1024 ferrite rings retain their geometry');}
 if(id==='spectrometer'){model.setPose(1);model.root.updateMatrixWorld(true);const cap=new T.Box3().setFromObject(model.groups.lid),sensor=new T.Box3().setFromObject(model.groups.sensor);assert(cap.min.y>sensor.max.y+2,'Lifted cap clears the detector');}
 console.log('PASS · '+def.tab+': selection restoration, restrained operation, reduced motion and device-specific construction');
}
