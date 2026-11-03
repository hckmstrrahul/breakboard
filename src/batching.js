import * as T from 'three';
import {isMovingPart} from './hardware-motion.js';

// Keep the original part meshes as pick/bounds proxies, while submitting shared
// materials in batches. Hundreds of selectable CAD packages need not become
// hundreds of renderer state changes. Layer 1 is reserved for these proxies.
export function batchAssembly(model){
 const bins=new Map();
 model.root.updateMatrixWorld(true);
 for(const [partId,group]of Object.entries(model.groups))group.traverse(o=>{
  if(!o.isMesh||isMovingPart(o)||o.material.map||Array.isArray(o.material))return;
  const material=o.userData.originalMaterial||o.material;
  if(!bins.has(material))bins.set(material,[]);
  bins.get(material).push({object:o,group,partId,base:o.matrixWorld.clone()});
  o.layers.set(1);
 });
 const records=[];
 function createBatch(material,entries){
  const vertices=entries.reduce((n,e)=>n+e.object.geometry.attributes.position.count,0),indices=entries.reduce((n,e)=>n+(e.object.geometry.index?.count||e.object.geometry.attributes.position.count),0);
  const batch=new T.BatchedMesh(entries.length,vertices,indices,material);
  batch.frustumCulled=false;batch.perObjectFrustumCulled=false;batch.sortObjects=false;
  batch.castShadow=!material.transparent;batch.receiveShadow=true;
  for(const e of entries){const id=batch.addInstance(batch.addGeometry(e.object.geometry));batch.setMatrixAt(id,e.base);}
  model.root.add(batch);return batch;
 }
 for(const[material,entries]of bins)records.push({material,entries,opaque:createBatch(material,entries),ghost:null});
 const matrix=new T.Matrix4();let lastPose=NaN,selected=null,xray=false;
 function matrices(){for(const r of records)r.entries.forEach((e,i)=>{matrix.makeTranslation(...e.group.position.toArray()).multiply(e.base);r.opaque.setMatrixAt(i,matrix);r.ghost?.setMatrixAt(i,matrix);});}
 function visibility(){for(const r of records){
  if(xray&&!r.ghost){const mat=r.material.clone();mat.transparent=true;mat.opacity=.1;mat.depthWrite=false;r.ghost=createBatch(mat,r.entries);r.entries.forEach((e,i)=>{matrix.makeTranslation(...e.group.position.toArray()).multiply(e.base);r.ghost.setMatrixAt(i,matrix);});}
  r.entries.forEach((e,i)=>{const ghost=xray&&e.partId!==selected;r.opaque.setVisibleAt(i,e.group.visible&&!ghost);r.ghost?.setVisibleAt(i,e.group.visible&&ghost);});
 }}
 const pose=model.setPose,selection=model.setSelection,accessories=model.setAccessories;
 model.setPose=e=>{pose(e);if(e!==lastPose){matrices();lastPose=e;}};
 model.setSelection=(id,isolate,ghost)=>{selection(id,isolate,ghost);selected=id;xray=ghost;visibility();};
 model.setAccessories=enabled=>{accessories(enabled);visibility();};
 model.batches=records;
 return model;
}
