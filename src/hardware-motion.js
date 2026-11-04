import * as T from 'three';

// Keep movable hardware out of static geometry/material batches.
export function isMovingPart(object){
 for(let node=object;node;node=node.parent)if(node.userData.rotor||node.userData.motion)return true;
 return false;
}
export function makeRotor(parent,objects,pivot){
 const rotor=new T.Group();rotor.name='Impeller';rotor.userData.rotor=true;
 rotor.position.set(...pivot);parent.add(rotor);
 for(const object of objects){object.position.sub(rotor.position);rotor.add(object);}
 return rotor;
}
export function indicatorMaterial(color,kind='power',phase=0){
 const material=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0,roughness:.4});
 material.userData.indicator={kind,phase};return material;
}
