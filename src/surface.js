// Printed artwork is a surface treatment, not another shadow-casting shell.
export function prepareSurface(object){
 if(!object.isMesh)return;
 const material=object.userData.originalMaterial||object.material;
 const decal=!!(object.userData.decal||(material.map&&material.transparent&&!material.depthWrite&&!object.userData.anatomyTransparent));
 if(decal){object.userData.decal=true;material.polygonOffset=true;material.polygonOffsetFactor=-1;material.polygonOffsetUnits=-2;}
 object.castShadow=!decal;object.receiveShadow=true;
}
