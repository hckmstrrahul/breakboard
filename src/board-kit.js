import * as T from 'three';
import {mesh,box,material,textDecal,M} from './model.js';

// Common mechanical primitives in millimetres. Board-specific locations and
// dimensions are supplied by each model, with provenance in reference/*/evidence.md.
function roundedRect(w,d,r){
 const s=new T.Shape(),x=-w/2,z=-d/2;r=Math.min(r,w/2,d/2);
 s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);
 s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);
 s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);
 s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;
}
function extrude(shape,height){const g=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:12});g.rotateX(-Math.PI/2);return g;}
export function pcb(parent,{width,depth,thickness=1.6,color='#207d52',holes=[],radius=1}){
 const s=roundedRect(width,depth,radius);
 for(const[x,z,d]of holes){const h=new T.Path();h.absarc(x,-z,d/2,0,Math.PI*2,true);s.holes.push(h);}
 const body=mesh(extrude(s,thickness),material(color,0,.69),parent,[0,-thickness/2,0]);body.userData.pcb=true;
 body.userData.dimensions=[width,thickness,depth];body.userData.holes=holes;
 for(const[x,z,d]of holes){const ring=new T.RingGeometry(d/2,d/2+.35,24);ring.rotateX(-Math.PI/2);mesh(ring,M.silver,parent,[x,thickness/2+.008,z]);}
 return body;
}
export function silk(parent,text,x,z,width,depth,{y=.82,color='#e9eeea',rotation=0}={}){
 const mark=textDecal(parent,text,width,depth,[x,y,z],{color,size:76});mark.rotation.z=rotation;return mark;
}
export function pinHeader(parent,{x=0,z=0,rows=1,count,pitch=2.54,rowSpacing=pitch,axis='z',female=false,base=.8,height=female?8.5:2.5,pinLength=8.5}){
 const g=new T.Group();g.position.set(x,0,z);if(axis==='x')g.rotation.y=Math.PI/2;parent.add(g);
 const w=(rows-1)*rowSpacing+2.5,d=(count-1)*pitch+2.5,centers=[];
 for(let r=0;r<rows;r++)for(let i=0;i<count;i++)centers.push([(r-(rows-1)/2)*rowSpacing,(i-(count-1)/2)*pitch]);
 if(female){
  const s=roundedRect(w,d,.16);
  for(const[xx,zz]of centers){const h=new T.Path();h.moveTo(xx-.5,-zz-.5);h.lineTo(xx-.5,-zz+.5);h.lineTo(xx+.5,-zz+.5);h.lineTo(xx+.5,-zz-.5);h.closePath();s.holes.push(h);}
  mesh(extrude(s,height),M.black,g,[0,base,0]);
  for(const[xx,zz]of centers){box(g,.85,.3,.85,[xx,base+height-1.7,zz],M.gold,.025);box(g,.5,3,.5,[xx,base-1.5,zz],M.silver,.025);}
 }else{
  box(g,w,height,d,[0,base+height/2,0],M.black,.12);
  for(const[xx,zz]of centers)box(g,.64,pinLength,.64,[xx,base+height/2,zz],M.gold,.035);
 }
 g.userData.header={contacts:rows*count,rows,count,pitch,rowSpacing,female,centers};return g;
}
const PORTS={a:[13.2,5.8,14.2,4],micro:[7.6,2.6,5.8,5],mini:[7.7,3.9,9.2,5],c:[9,3.2,7.4,24],hdmi:[15,5.6,11.5,19],'micro-hdmi':[6.4,2.8,5.8,19],displayport:[16,5,12,20]};
function portProfile(type,w,h){
 if(type==='c')return roundedRect(w,h,h/2-.02);
 if(type==='a')return roundedRect(w,h,.18);
 const bevel=type==='displayport'?.9:type==='hdmi'?1.5:type==='mini'?.8:.55;
 const points=type==='displayport'?[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2-bevel],[w/2-bevel,h/2],[-w/2,h/2]]:[[-w/2+bevel,-h/2],[w/2-bevel,-h/2],[w/2,h/2-.5],[w/2,h/2],[-w/2,h/2],[-w/2,h/2-.5]];
 const s=new T.Shape();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();return s;
}
export function usbPort(parent,type,{x=0,z=0,base=.8,rotation=0,contacts,tongueColor}={}){
 const[w,h,d,defaultPins]=PORTS[type],pins=contacts||defaultPins;const g=new T.Group();g.position.set(x,base+h/2,z);g.rotation.y=rotation;parent.add(g);
 const t=.23;
 const outer=portProfile(type,w,h),inner=portProfile(type,w-t*2,h-t*2),hole=new T.Path(inner.getPoints(16).reverse());outer.holes.push(hole);
 mesh(new T.ExtrudeGeometry(outer,{depth:d,bevelEnabled:false,curveSegments:16}),M.silver,g,[0,0,-d/2]);
 for(const side of [-1,1])box(g,.65,1.4,1.3,[side*(w/2+.15),-h/2+.25,-d*.25],M.silver,.04);
 box(g,w-t*2,h-t*2,.28,[0,0,-d/2+.14],M.black,.04);
 const tongueY=type==='c'?0:-h*.18;
 box(g,w*.73,Math.max(.38,h*.18),d*.67,[0,tongueY,-d*.03],tongueColor?material(tongueColor):M.black,.055);
 const tongueHalf=Math.max(.38,h*.18)/2;
 const contactRow=(count,side,zz,length)=>{const pitch=w*.66/count;for(let i=0;i<count;i++)box(g,Math.min(pitch*.53,.65),.07,length,[(i-(count-1)/2)*pitch,tongueY+side*(tongueHalf+.025),zz],M.gold,.012);};
 if(type==='a'&&pins===9){contactRow(4,1,d*.15,d*.22);contactRow(5,1,-d*.16,d*.14);}
 else if(['c','hdmi','micro-hdmi','displayport'].includes(type)){contactRow(Math.ceil(pins/2),1,d*.1,d*.32);contactRow(Math.floor(pins/2),-1,d*.1,d*.32);}
 else contactRow(pins,1,d*.1,d*.32);
 // Two retention springs on a Type-A shell.
 if(type==='a')for(const side of [-1,1]){box(g,1.4,.06,3.8,[side*3.3,h/2+.01,d*.18],M.black,.04);const spring=box(g,1.05,.15,3.1,[side*3.3,h/2+.12,d*.17],M.silver,.04);spring.rotation.x=-.06;}
 g.userData.connector={type,contacts:pins,opening:'+z'};return g;
}
export function ethernet(parent,{x=0,z=0,base=.8,rotation=0}={}){
 const g=new T.Group();g.position.set(x,base+6.7,z);g.rotation.y=rotation;parent.add(g);
 box(g,16,.3,21,[0,6.55,0],M.silver,.06);box(g,16,.3,21,[0,-6.55,0],M.silver,.06);
 for(const s of [-1,1]){box(g,.3,13.1,21,[s*7.85,0,0],M.silver,.06);box(g,2.1,11.8,20,[s*6.5,0,0],M.black,.07);}
 box(g,15.4,12.5,.5,[0,0,-10.25],M.black,.04);
 box(g,11,.9,17,[0,4.7,-1],M.black,.04);box(g,11,1.4,17,[0,-4.7,-1],M.black,.04);
 for(let i=0;i<8;i++){const contact=box(g,.4,.2,7,[(i-3.5)*1.02,-2.8,3],M.gold,.02);contact.rotation.x=-.18;}
 for(const[s,c]of [[-1,'#4f8e46'],[1,'#d1b33d']])box(g,1.7,1.4,.55,[s*6.6,-4.6,10.3],material(c,0,.35),.08);
 g.userData.connector={type:'ethernet',contacts:8,opening:'+z'};return g;
}
export function barrelJack(parent,{x=0,z=0,base=.8,rotation=0}={}){
 const g=new T.Group();g.position.set(x,base,z);g.rotation.y=rotation;parent.add(g);
 box(g,9,6.7,10.5,[0,3.35,-1.5],M.black,.12);
 const s=new T.Shape();s.absarc(0,0,4.4,0,Math.PI*2);const hole=new T.Path();hole.absarc(0,0,2.8,0,Math.PI*2,true);s.holes.push(hole);
 const geo=new T.ExtrudeGeometry(s,{depth:4,bevelEnabled:false,curveSegments:24});mesh(geo,M.black,g,[0,4.4,.5]);
 const pin=mesh(new T.CylinderGeometry(1,1,4.3,16),M.silver,g,[0,4.4,2.1]);pin.rotation.x=Math.PI/2;return g;
}
const pinOneMaterial=material('#525754');
export function ic(parent,{x=0,z=0,width,depth,height=1,base=.8,label='',pins=0,pitch=.5}){
 const g=new T.Group();g.position.set(x,0,z);parent.add(g);
 box(g,width,height,depth,[0,base+height/2+.12,0],M.black,.08);
 if(pins){const sideCount=pins/4;for(let i=0;i<sideCount;i++)for(const s of [-1,1]){
  const p=(i-(sideCount-1)/2)*pitch;box(g,pitch*.45,.18,1.2,[p,base+.13,s*(depth/2+.4)],M.silver,.02);box(g,1.2,.18,pitch*.45,[s*(width/2+.4),base+.13,p],M.silver,.02);
 }}
 if(label)silk(g,label,0,0,width*.86,depth*.7,{y:base+height+.135,color:'#979b98'});
 const dot=mesh(new T.CircleGeometry(.22,12),pinOneMaterial,g,[-width*.36,base+height+.14,depth*.35]);dot.rotation.x=-Math.PI/2;
 g.userData.package={pins,width,depth};return g;
}
const passiveMaterials=new Map();
export function passive(parent,{x=0,z=0,width=1,depth=.5,base=.8,color='#b39773'}){
 if(!passiveMaterials.has(color))passiveMaterials.set(color,material(color,0,.7));
 box(parent,width,.45,depth,[x,base+.25,z],passiveMaterials.get(color),.035);
 for(const s of [-1,1])box(parent,width*.19,.46,depth+.025,[x+s*width*.405,base+.25,z],M.silver,.018);
}
