import * as T from 'three';

// Large assemblies need room for both their lifted parts and projected shadows.
// Compute once per device, from the same physical groups used by the viewer.
export function shadowFrame(model,floorY){
 const bounds=new T.Box3();
 for(const pose of [0,1]){model.setPose(pose);model.root.updateMatrixWorld(true);for(const group of Object.values(model.groups))bounds.union(new T.Box3().setFromObject(group,true));}
 const direction=new T.Vector3(-45,95,45).normalize(),corners=[];
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const corner=new T.Vector3(x,y,z),projection=corner.clone().addScaledVector(direction,-(y-floorY)/direction.y);corners.push(corner,projection);
 }
 const coverage=new T.Box3().setFromPoints(corners),center=coverage.getCenter(new T.Vector3()),radius=Math.max(1,coverage.getSize(new T.Vector3()).length()/2)*1.08;
 return{center,position:center.clone().addScaledVector(direction,radius*3),half:radius,near:radius*1.8,far:radius*4.2,floorScale:Math.max(1,...corners.flatMap(p=>[Math.abs(p.x),Math.abs(p.z)]))/250*1.1,corners};
}
