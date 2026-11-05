// A model owns geometry, effects and anatomy copies, while materials/textures
// may be shared with another retained model. Dispose only unreferenced resources.
export function modelResources(model){
 const geometry=new Set(),materials=new Set(),textures=new Set(),batches=new Set(),instances=new Set();
 const addMaterial=value=>{for(const material of Array.isArray(value)?value:[value]){if(!material?.isMaterial||materials.has(material))continue;materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);}};
 for(const root of [model.root,model.operation?.root,model.anatomy?.context,model.anatomy?.subject])root?.traverse(object=>{
  if(object.geometry){geometry.add(object.geometry);if(object.geometry.userData.anatomyEdges)geometry.add(object.geometry.userData.anatomyEdges);}if(object.isBatchedMesh)batches.add(object);if(object.isInstancedMesh)instances.add(object);
  addMaterial(object.material);addMaterial(object.userData.originalMaterial);addMaterial(object.userData.ghost);
 });
 for(const marking of model.anatomy?.markings||[]){addMaterial(marking.solid);addMaterial(marking.ghost);}
 for(const material of model.anatomy?.materials||[])addMaterial(material);
 for(const contour of model.anatomy?.contourGeometries||[])geometry.add(contour);
 return{geometry,materials,textures,batches,instances};
}
export function disposeModel(model,retained=[]){
 const resources=modelResources(model),keep={geometry:new Set(),materials:new Set(),textures:new Set(),batches:new Set(),instances:new Set()};
 for(const other of retained){const set=modelResources(other);for(const type of Object.keys(keep))for(const item of set[type])keep[type].add(item);}
 model.behavior?.dispose?.();
 for(const type of ['batches','instances','geometry','materials','textures'])for(const item of resources[type])if(!keep[type].has(item))item.dispose();
}
export function createModelCache({limit=3,dispose=disposeModel}={}){
 const entries=new Map();let protectedIds=new Set(),tick=0;
 function trim(){
  const ready=[...entries.entries()].filter(([,entry])=>entry.model);
  let excess=ready.length-limit;
  for(const[id,entry]of ready.sort((a,b)=>a[1].used-b[1].used)){
   if(excess<=0)break;if(protectedIds.has(id))continue;
   entries.delete(id);dispose(entry.model,[...entries.values()].flatMap(value=>value.model?[value.model]:[]));excess--;
  }
 }
 function protect(ids){protectedIds=new Set(ids.filter(Boolean));trim();}
 function load(id,build){
  let entry=entries.get(id);
  if(!entry){
   entry={used:++tick,model:null,promise:null};entries.set(id,entry);
   entry.promise=Promise.resolve().then(build).then(model=>{entry.model=model;trim();return model;},error=>{if(entries.get(id)===entry)entries.delete(id);throw error;});
  }
  entry.used=++tick;return entry.promise;
 }
 return{load,protect,get size(){return entries.size;},get ids(){return[...entries.keys()];}};
}
