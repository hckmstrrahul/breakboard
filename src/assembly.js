import {prepareSurface} from './surface.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {isMovingPart} from './hardware-motion.js';
export function makeAssembly(parts){const root=new T.Group();const groups=Object.fromEntries(parts.map(p=>{const g=new T.Group();g.name=p.name;g.userData.partId=p.id;root.add(g);return[p.id,g]}));return{root,groups};}
export function finishAssembly(root,groups,parts,{merge=true,skipGroups=new Set()}={}){
 root.updateMatrixWorld(true);
 for(const [id,g] of Object.entries(groups)){
  if(merge&&!skipGroups.has(id)){const buckets=new Map(),remove=[];g.traverse(o=>{if(!o.isMesh||o.userData.pcb||o.userData.anatomyTransparent||isMovingPart(o)||o.material.map||Array.isArray(o.material))return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const list=buckets.get(o.material)||[];list.push(geo);buckets.set(o.material,list);remove.push(o)});remove.forEach(o=>{o.removeFromParent();o.geometry.dispose()});for(const[m,geos]of buckets){const geo=mergeGeometries(geos);if(!geo)throw Error('Cannot merge '+id);const o=new T.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;g.add(o);geos.forEach(x=>x.dispose())}}
  g.traverse(o=>{if(o.isMesh){o.userData.partId=id;prepareSurface(o);}});
 }
 let accessories=true;const byId=new Map(parts.map(p=>[p.id,p]));
 const guides=new T.Group();root.add(guides);
 const lineMat=new T.LineDashedMaterial({color:'#8b9185',transparent:true,opacity:.4,dashSize:.7,gapSize:1});
 parts.filter(p=>!p.detail&&p.offset.some(v=>v)).forEach(p=>{const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...p.anchor),new T.Vector3(...p.anchor).add(new T.Vector3(...p.offset))]),lineMat);line.computeLineDistances();line.userData.part=p;guides.add(line)});
 function setPose(e){e=Math.max(0,Math.min(1,e));for(const p of parts)groups[p.id].position.set(...p.offset.map(v=>v*e));for(const line of guides.children){const p=line.userData.part,a=line.geometry.attributes.position;line.visible=accessories||!p.accessory;a.setXYZ(1,...p.anchor.map((v,i)=>v+p.offset[i]*e));a.needsUpdate=true;line.computeLineDistances();}guides.visible=e>.05;}
 function setSelection(id,isolate,xray){for(const[k,g]of Object.entries(groups)){g.visible=(!isolate||k===id)&&(accessories||!byId.get(k).accessory);g.traverse(o=>{if(!o.isMesh)return;if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;const ghost=xray&&k!==id;if(ghost){if(!o.userData.ghost){o.userData.ghost=o.userData.originalMaterial.clone();o.userData.ghost.transparent=true;o.userData.ghost.opacity=.1;o.userData.ghost.depthWrite=false;}o.material=o.userData.ghost;o.castShadow=false;}else{o.material=o.userData.originalMaterial;prepareSurface(o);}})}guides.visible=!isolate;}
 function setAccessories(enabled){accessories=enabled;for(const p of parts)if(p.accessory)groups[p.id].visible=enabled;}
 return{root,groups,guides,setPose,setSelection,setAccessories};
}
