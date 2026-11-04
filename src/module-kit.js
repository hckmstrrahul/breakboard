import * as T from 'three';
import {mesh,box,material,textDecal,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';
export {T,mesh,box,material,textDecal,M,makeAssembly,finishAssembly};
export const TAU=Math.PI*2;
export const palette=()=>({nickel:material('#b8bec0',.85,.28),gold:material('#bd9340',.82,.27),ceramic:material('#e3d9bb',.05,.62),black:material('#242a2c',.35,.45),copper:material('#a96b3d',.72,.32),silicon:material('#465365',.7,.26),green:material('#254f3e',.05,.7)});
export function part(id,name,kind,anchor,offset,description,specs,short=name){return{id,name,short,kind,anchor,offset,description,specs:specs||[['Construction','Illustrative reconstruction']]};}
export function definition({id,tab,category,parts,build,dimensions,half=45,target=[0,15,0],assembledHalf=half*.75,assembledTarget=[0,5,0],...rest}){return{id,tab,title:tab,category,parts,build,dimensions,half,target,assembledHalf,assembledTarget,camera:[half*1.5,half*1.7,half*2],floorY:-8,groundRadius:half*.8,start:.65,hidden:[],stats:[],basis:'Source-based reconstruction',...rest};}
export function rod(parent,a,b,r,mat,segments=8){const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);const o=mesh(new T.CylinderGeometry(r,r,d.length(),segments),mat,parent,va.add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
export function wire(parent,points,r,mat){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(12,points.length*8),r,6,false),mat,parent);}
export function cylinder(parent,r,h,p,mat,segments=64){return mesh(new T.CylinderGeometry(r,r,h,segments),mat,parent,p);}
export function ring(parent,outer,inner,h,p,mat,segments=64){const s=new T.Shape();s.absarc(0,0,outer,0,TAU,false);const hole=new T.Path();hole.absarc(0,0,inner,0,TAU,true);s.holes.push(hole);const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:segments/4});geo.rotateX(-Math.PI/2);return mesh(geo,mat,parent,[p[0],p[1]-h/2,p[2]]);}
export function plate(parent,w,d,t,p,mat,holes=[]){const s=new T.Shape();s.moveTo(-w/2,-d/2);s.lineTo(w/2,-d/2);s.lineTo(w/2,d/2);s.lineTo(-w/2,d/2);s.closePath();for(const[x,z,r]of holes){const h=new T.Path();h.absarc(x,-z,r,0,TAU,true);s.holes.push(h);}const geo=new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:20});geo.rotateX(-Math.PI/2);return mesh(geo,mat,parent,[p[0],p[1]-t/2,p[2]]);}
export function frame(parent,w,d,h,t,p,mat){for(const z of[-1,1])box(parent,w,h,t,[p[0],p[1],p[2]+z*(d-t)/2],mat,.03);for(const x of[-1,1])box(parent,t,h,d-t*2,[p[0]+x*(w-t)/2,p[1],p[2]],mat,.03);}
export function screw(parent,p,r=1,mat=M.silver){cylinder(parent,r,.5,p,mat,24);rod(parent,[p[0],p[1]-.25,p[2]],[p[0],p[1]-2,p[2]],r*.5,mat);for(const a of[0,Math.PI/2]){const o=box(parent,r*1.3,.04,.16,[p[0],p[1]+.27,p[2]],M.black,.01);o.rotation.y=a;}}
export function glass(parent,geometry,p,opacity=.12){const mat=new T.MeshPhysicalMaterial({color:'#bad6d0',metalness:.12,roughness:.08,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});const o=mesh(geometry,mat,parent,p);o.userData.anatomyTransparent=true;return o;}
export function smdField(parent,positions,mat=M.ceramic,scale=1){for(const[x,y,z]of positions){box(parent,1.05*scale,.45*scale,.6*scale,[x,y,z],mat,.025*scale);for(const s of[-1,1])box(parent,.2*scale,.45*scale,.62*scale,[x+s*.44*scale,y,z],M.silver,.01);}}
export function pins(parent,positions,{length=3,r=.23,mat=M.gold}={}){for(const[x,y,z]of positions)rod(parent,[x,y,z],[x,y-length,z],r,mat,10);}
export function inscription(parent,text,w,d,p,color='#d4d5cb'){return textDecal(parent,text,w,d,p,{size:64,color});}
// Functional floorplans are explanatory regions, never an invented transistor layout.
export function dieRegions(parent,w,d,p,{columns=4,rows=2,color='#9c744a'}={}){const mat=material(color,.6,.36);for(let z=0;z<rows;z++)for(let x=0;x<columns;x++){const ww=w/columns*.84,dd=d/rows*.78;box(parent,ww,.015,dd,[p[0]+(x-(columns-1)/2)*w/columns,p[1],p[2]+(z-(rows-1)/2)*d/rows],mat,0);}}
