import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

function anatomyBody(source,material){
 const body=source.isInstancedMesh?new T.InstancedMesh(source.geometry,material,source.instanceMatrix.count):new T.Mesh(source.geometry,material);
 if(source.isInstancedMesh)body.instanceMatrix=source.instanceMatrix.clone();
 return body;
}
function instanceContours(source,edges){
 if(!source.count)return new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([],3));
 const matrix=new T.Matrix4(),copies=[];
 for(let i=0;i<source.count;i++){source.getMatrixAt(i,matrix);copies.push(edges.clone().applyMatrix4(matrix));}
 const geometry=mergeGeometries(copies);copies.forEach(copy=>copy.dispose());return geometry;
}

// Keep the original artwork and UVs, but print its coverage in the drawing's ink.
// Most decals have transparent backgrounds. The ESP32 PCB textures also contain
// solder-mask color, which must be removed instead of covering the anatomy fill.
function artworkMaterial(source,ghost){
 const background=source.map.userData.anatomyBackground,copper=source.map.userData.anatomyCopperColor,luminance=source.map.userData.anatomyLuminance;
 const material=new T.MeshBasicMaterial({map:source.map,color:'#384753',transparent:true,opacity:ghost?.16:.95,depthWrite:false,depthTest:true,side:source.side,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 material.onBeforeCompile=shader=>{
  if(background){shader.uniforms.anatomyBackground={value:new T.Color(background)};shader.fragmentShader='uniform vec3 anatomyBackground;\n'+shader.fragmentShader;}
  if(copper){shader.uniforms.anatomyCopper={value:new T.Color(copper)};shader.fragmentShader='uniform vec3 anatomyCopper;\n'+shader.fragmentShader;}
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   #ifdef USE_MAP
    vec4 artwork = texture2D(map, vMapUv);
    float coverage = artwork.a;
    ${luminance?'coverage *= 1.0 - dot(artwork.rgb, vec3(0.2126, 0.7152, 0.0722));':''}
    ${background?'vec3 difference = abs(artwork.rgb - anatomyBackground); coverage *= smoothstep(0.006, 0.065, max(difference.r, max(difference.g, difference.b)));':''}
    ${copper?'coverage *= smoothstep(0.005, 0.06, length(artwork.rgb - anatomyCopper));':''}
    diffuseColor.a *= coverage;
   #endif
  `);
 };
 material.customProgramCacheKey=()=>`anatomy-artwork-${background?'background':'alpha'}-${copper?'silkscreen':'all'}-${luminance?'luminance':'coverage'}-v3`;
 return material;
}

// Anatomy drawing: the actual model surfaces, four shaded tones and fine crease
// contours. Reusing geometry and world matrices keeps every view registered to
// CAD, including isolated parts, separation and the moving fan. No hidden PCB
// layers or silicon internals are invented. Depth testing resolves intersections.
export function createAnatomy(model){
 const context=new T.Scene(),subject=new T.Scene(),entries=[],markings=[],edgeCache=new Map(),edgeVersions=new Map();
 const ramp=new T.DataTexture(new Uint8Array([85,135,190,255]),4,1,T.RedFormat);
 ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.needsUpdate=true;
 const fill=new T.MeshToonMaterial({color:'#dbc2ab',gradientMap:ramp,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
 // Glass is a physical enclosure, not an opaque cover. Preserve the shared
 // anatomy ink while allowing the electrodes / optical stack to read through it.
 const glass=fill.clone();glass.transparent=true;glass.opacity=.14;glass.depthWrite=false;
 const glassInk={value:new T.Color('#617078')};
 glass.onBeforeCompile=shader=>{
  shader.uniforms.glassInk=glassInk;
  shader.vertexShader='varying vec3 vGlassNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\nvGlassNormal = normalize(transformedNormal);');
  shader.fragmentShader='uniform vec3 glassInk; varying vec3 vGlassNormal;\n'+shader.fragmentShader;
  // Orthographic view-space normals give a continuous silhouette on smooth
  // glass. Crease edges alone only draw the horizontal rings of a turned shell.
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   float contour = 1.0 - smoothstep(0.0, 0.11, abs(normalize(vGlassNormal).z));
   outgoingLight = mix(outgoingLight, glassInk, contour);
   diffuseColor.a = mix(0.10, 0.92, contour);
   #include <opaque_fragment>
  `);
 };
 glass.customProgramCacheKey=()=> 'anatomy-glass-contour-v1';
 const shell=new T.MeshToonMaterial({color:'#8b959e',gradientMap:ramp,transparent:true,opacity:.12,depthWrite:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
 const ink=new T.LineBasicMaterial({color:'#52616f',transparent:true,opacity:.92,depthWrite:false,toneMapped:false});
 const faint=new T.LineBasicMaterial({color:'#74818b',transparent:true,opacity:.2,depthWrite:false,toneMapped:false});
 for(const scene of[context,subject]){
  scene.add(new T.AmbientLight('#ffffff',1.7));
  const light=new T.DirectionalLight('#ffffff',2.2);light.position.set(-45,95,45);scene.add(light);
 }
 for(const[id,group]of Object.entries(model.groups))group.traverse(source=>{
  if(!source.isMesh||source.isBatchedMesh)return;
  // Colored particles and waves explain a process; they are not hardware and
  // must not become opaque anatomy surfaces when their animation is stopped.
  for(let node=source;node;node=node.parent)if(node.userData.explanatoryEffect)return;
  const original=source.userData.originalMaterial||source.material;
  if(original.map){
   const solid=artworkMaterial(original,false),ghost=artworkMaterial(original,true),body=anatomyBody(source,ghost);
   body.matrixAutoUpdate=false;body.renderOrder=2;context.add(body);
   markings.push({id,group,source,body,solid,ghost});return;
  }
  const geometry=source.geometry;
  // RoundedBoxGeometry's bevels turn by less than 28 degrees: the former
  // threshold removed every edge of the RF shield and all rounded packages.
  // A deforming model may supply crease topology once and deform those same
  // endpoints with its surface. This avoids re-extracting CAD edges per frame.
  if(!edgeCache.has(geometry)){edgeCache.set(geometry,geometry.userData.anatomyEdges||new T.EdgesGeometry(geometry,20));edgeVersions.set(geometry,geometry.attributes.position.version);}
  const body=anatomyBody(source,shell),lines=new T.LineSegments(source.isInstancedMesh?instanceContours(source,edgeCache.get(geometry)):edgeCache.get(geometry),faint);
  body.matrixAutoUpdate=lines.matrixAutoUpdate=false;lines.renderOrder=1;
  // Surface ownership is preserved; selection changes only the rendering pass.
  context.add(body,lines);entries.push({id,group,source,body,lines});
 });
 const drawings=[...entries,...markings];
 let selected;
 function update(id){
  id??=null;
  model.root.updateMatrixWorld(true);
  // Flexures and membranes can change vertex positions as well as transforms.
  // Refresh shared contours once per changed geometry; rigid parts keep theirs.
  for(const [geometry,edges]of edgeCache){if(geometry.userData.anatomyEdges===edges)continue;const version=geometry.attributes.position.version;if(edgeVersions.get(geometry)!==version){edgeCache.set(geometry,new T.EdgesGeometry(geometry,20));edgeVersions.set(geometry,version);edges.dispose();}}
  for(const entry of drawings){
   const{group,source,body,lines}=entry,isSubject=id===null||entry.id===id;
   if(source.isInstancedMesh){
    // Instance transforms belong to the actual hardware, just like its parent
    // matrix. Keep the fill instanced and batch transformed contours in one draw.
    const edges=lines&&edgeCache.get(source.geometry),stamp=`${source.instanceMatrix.version}:${source.count}:${edges?.id}`;
    if(entry.instanceStamp!==stamp){
     body.instanceMatrix.copy(source.instanceMatrix);body.instanceMatrix.needsUpdate=true;body.count=source.count;
     body.computeBoundingBox();body.computeBoundingSphere();
     if(lines){lines.geometry.dispose();lines.geometry=instanceContours(source,edges);}
     entry.instanceStamp=stamp;
    }
   }
   if(selected!==id){const scene=isSubject?subject:context;scene.add(body);if(lines){scene.add(lines);body.material=isSubject?(source.userData.anatomyTransparent?glass:fill):shell;lines.material=isSubject?ink:faint;}else body.material=isSubject?entry.solid:entry.ghost;}
   let visible=group.visible;for(let node=source;node&&node!==group;node=node.parent)visible&&=node.visible;
   body.visible=visible;body.matrix.copy(source.matrixWorld);if(lines){if(!source.isInstancedMesh)lines.geometry=edgeCache.get(source.geometry);lines.visible=visible;lines.matrix.copy(source.matrixWorld);}
  }
  selected=id;
 }
 function setTheme(dark){
  fill.color.set(dark?'#b8c2cb':'#d6d9d6');ink.color.set(dark?'#52616f':'#617078');
  glass.color.copy(fill.color);
  glassInk.value.copy(ink.color);
  shell.color.set(dark?'#738494':'#78868a');faint.color.set(dark?'#9baab6':'#6c797d');
  shell.opacity=dark?.13:.1;faint.opacity=dark?.23:.2;
  for(const mark of markings){mark.solid.color.set(dark?'#384753':'#44515a');mark.ghost.color.copy(faint.color);mark.ghost.opacity=dark?.2:.14;}
 }
 function render(renderer,camera){
  const autoClear=renderer.autoClear;renderer.autoClear=false;
  renderer.render(context,camera);
  // X-ray reveals the selected assembly through its housing. Each pass still
  // resolves its own actual surfaces, rather than drawing back edges everywhere.
  renderer.clearDepth();renderer.render(subject,camera);renderer.autoClear=autoClear;
 }
 return{entries,markings,context,subject,update,setTheme,render,materials:[fill,glass,shell,ink,faint],get contourGeometries(){return [...edgeCache.values()];}};
}
