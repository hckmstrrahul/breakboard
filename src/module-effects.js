import * as T from 'three';
// Educational overlays share the operation clock. They are not physical parts,
// wiring netlists, measurements, or a second model of the device.
export function createModuleEffects(model){
 const spec=model.root.userData.effects||{},root=new T.Group(),paths=[],covers=[],pulseMeshes=[];
 root.name='Illustrative module operation';
 for(const id of spec.cutaway||[])model.groups[id]?.traverse(object=>{
  if(!object.isMesh)return;const original=object.userData.originalMaterial||object.material,mat=original.clone();object.material=mat;object.userData.originalMaterial=mat;
  covers.push({mat,opacity:original.opacity,transparent:original.transparent,depthWrite:original.depthWrite});
 });
 for(const config of spec.paths||[]){
  const points=config.points.map(p=>new T.Vector3(...p)),curve=new T.CatmullRomCurve3(points,false,'centripetal');
  const mat=new T.LineBasicMaterial({color:config.color,transparent:true,opacity:0,depthWrite:false});
  const line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(128)),mat);root.add(line);
  const dots=[];for(let i=0;i<(config.count||1);i++){const dot=new T.Mesh(new T.SphereGeometry(config.radius||.2,10,6),new T.MeshBasicMaterial({color:config.color,transparent:true,opacity:0,depthWrite:false}));root.add(dot);dots.push(dot);}
  paths.push({curve,line,dots,config});
 }
 for(const p of [...(spec.pulses||[]),...(spec.bit?[spec.bit]:[])]){const dot=new T.Mesh(new T.SphereGeometry(spec.bit?.45:.35,16,12),new T.MeshBasicMaterial({color:'#e7aa68',transparent:true,depthWrite:false}));dot.position.set(...p);root.add(dot);pulseMeshes.push(dot);}
 let scan;
 if(spec.scan){const {origin,radius}=spec.scan,mat=new T.LineBasicMaterial({color:'#86bfc2',transparent:true,opacity:0});const beam=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,0,radius)]),mat);beam.position.set(...origin);root.add(beam);
  const points=[];for(let i=0;i<180;i++){const a=i*Math.PI*2/180,r=radius*(.76+.13*Math.sin(a*5)+.08*Math.cos(a*3));points.push(new T.Vector3(Math.sin(a)*r,origin[1],Math.cos(a)*r));}const cloud=new T.Points(new T.BufferGeometry().setFromPoints(points),new T.PointsMaterial({color:'#b5ded9',size:2.2,transparent:true,opacity:0}));root.add(cloud);scan={beam,cloud};
 }
 let thermal;
 if(spec.thermal){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,value=Math.exp(-((x-26)**2/110+(y-31)**2/230))+.5*Math.exp(-((x-51)**2+(y-15)**2)/90),c=new T.Color().setHSL(.77-Math.min(1,value)*.69,.9,.25+Math.min(1,value)*.35);data[i]=c.r*255;data[i+1]=c.g*255;data[i+2]=c.b*255;data[i+3]=255;}const tx=new T.DataTexture(data,size,size);tx.needsUpdate=true;thermal=new T.Mesh(new T.PlaneGeometry(spec.thermal.width,spec.thermal.depth),new T.MeshBasicMaterial({map:tx,transparent:true,opacity:0,depthWrite:false}));thermal.rotation.x=-Math.PI/2;thermal.position.set(...spec.thermal.position);root.add(thermal);}
 function update(state,{assembled,reduced,selected}){
  for(const c of covers){const fade=assembled&&!selected?state.power:0,opacity=c.opacity*(1-fade*.92),transparent=c.transparent||fade>.001;if(c.mat.transparent!==transparent){c.mat.transparent=transparent;c.mat.needsUpdate=true;}c.mat.opacity=opacity;c.mat.depthWrite=fade>.1?false:c.depthWrite;}
  paths.forEach(({curve,line,dots,config},index)=>{line.material.opacity=state.power*.25;dots.forEach((dot,i)=>{const t=reduced?(i+.5)/dots.length:(state.time*.2+i/dots.length+index*.13)%1;dot.position.copy(curve.getPoint(t));dot.material.opacity=state.power*.9;if(config.cascade)dot.scale.setScalar(.35+t*.85);});});
  pulseMeshes.forEach(dot=>{const p=reduced?1:.35+.65*(.5+.5*Math.sin(state.time*3));dot.material.opacity=state.power*p;dot.scale.setScalar(.7+p*.5);});
  if(scan){scan.beam.rotation.y=state.angle;scan.beam.material.opacity=state.power*.6;scan.cloud.material.opacity=state.power*.55;scan.cloud.geometry.setDrawRange(0,reduced?180:Math.min(180,Math.floor(state.time*35)));}
  if(thermal)thermal.material.opacity=state.power*.9;
 }
 function reset(){for(const c of covers){c.mat.opacity=c.opacity;c.mat.transparent=c.transparent;c.mat.depthWrite=c.depthWrite;c.mat.needsUpdate=true;}root.visible=false;}
 return{root,paths,covers,scan,thermal,update,reset};
}
