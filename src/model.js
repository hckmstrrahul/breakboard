import {prepareSurface} from './surface.js';
import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {DIM as D,PINS,PARTS,assemblyPose} from './data.js';

const V=T.Vector3;
function material(color,metalness=0,roughness=.55){return new T.MeshStandardMaterial({color,metalness,roughness});}
const M={pcb:material('#111a23',0,.58),edge:material('#18202a',0,.72),black:material('#111317',0,.63),silver:material('#bfc3c6',.9,.3),gold:material('#c7a24b',.82,.32),ceramic:material('#ad9476',0,.76),silk:material('#eeefea',0,.72),copper:material('#596651',.45,.5)};
function mesh(g,mat,parent,p=[0,0,0]){let m=new T.Mesh(g,mat);m.position.set(...p);prepareSurface(m);parent.add(m);return m;}
function box(parent,w,h,d,p,mat,r=.07){return mesh(r?new RoundedBoxGeometry(w,h,d,2,r):new T.BoxGeometry(w,h,d),mat,parent,p);}
function texture(w,h,draw,{anatomyBackground}={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);let tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;if(anatomyBackground)tx.userData.anatomyBackground=anatomyBackground;return tx;}
function decal(parent,w,h,p,tx){const m=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tx,transparent:true,roughness:.65,metalness:.2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),parent,p);m.rotation.x=-Math.PI/2;m.castShadow=false;m.userData.decal=true;return m;}
function textDecal(parent,text,w,d,p,{size=68,color='#b9bdb5',sub=''}={}){return decal(parent,w,d,p,texture(512,256,(g,W,H)=>{g.fillStyle=color;g.textAlign='center';g.font=`500 ${size}px monospace`;g.fillText(text,W/2,H*.47);if(sub){g.font='32px monospace';g.fillText(sub,W/2,H*.72);}}));}
function trace(parent,pts,r=.09,mat=M.gold){const curve=new T.CurvePath();for(let i=1;i<pts.length;i++)curve.add(new T.LineCurve3(new V(...pts[i-1]),new V(...pts[i])));return mesh(new T.TubeGeometry(curve,Math.max(4,pts.length*3),r,5,false),mat,parent);}
function chip(parent,w,d,h,x,y,z,label){box(parent,w,h,d,[x,y,z],M.black,.12);if(label)textDecal(parent,label,w*.9,d*.65,[x,y+h/2+.015,z],{size:70});}
function smd(parent,x,z,w=.65,d=1.1,y=1.02,mat=M.ceramic){box(parent,w,.45,d*.66,[x,y,z],mat,.03);box(parent,w+.03,.46,d*.2,[x,y,z-d*.4],M.silver,.02);box(parent,w+.03,.46,d*.2,[x,y,z+d*.4],M.silver,.02);}
function pcbGeometry(w,l,t,holes=[]){const shape=new T.Shape();const r=.65;shape.moveTo(-w/2+r,-l/2);shape.lineTo(w/2-r,-l/2);shape.quadraticCurveTo(w/2,-l/2,w/2,-l/2+r);shape.lineTo(w/2,l/2-r);shape.quadraticCurveTo(w/2,l/2,w/2-r,l/2);shape.lineTo(-w/2+r,l/2);shape.quadraticCurveTo(-w/2,l/2,-w/2,l/2-r);shape.lineTo(-w/2,-l/2+r);shape.quadraticCurveTo(-w/2,-l/2,-w/2+r,-l/2);for(const [x,z]of holes){const h=new T.Path();h.absarc(x,-z,.48,0,Math.PI*2,true);shape.holes.push(h);}const geo=new T.ExtrudeGeometry(shape,{depth:t,bevelEnabled:false,curveSegments:8});geo.rotateX(-Math.PI/2);geo.translate(0,-t/2,0);return geo;}

export function buildModel(){
 const root=new T.Group();const groups=Object.fromEntries(PARTS.map(p=>{let g=new T.Group();g.name=p.name;g.userData.partId=p.id;root.add(g);return[p.id,g]}));
 const board=groups.board;
 const holes=[];for(let s of [-1,1])for(let i=0;i<19;i++)holes.push([s*12.7,-22.86+i*D.pitch]);
 mesh(pcbGeometry(D.width,D.length,D.thickness,holes),M.edge,board);
 // Board artwork uses the same physical pin coordinates as the through holes.
 const boardArt=texture(1024,1768,(g,W,H)=>{
   g.fillStyle='#121b25';g.fillRect(0,0,W,H);const x=v=>(v/D.width+.5)*W,z=v=>(v/D.length+.5)*H;
   g.strokeStyle='#24303c';g.lineWidth=1.8;
   for(let s of [-1,1])for(let i=0;i<19;i++){const zz=-22.86+i*D.pitch;g.beginPath();g.moveTo(x(s*12),z(zz));g.lineTo(x(s*(10.1-i%3*.18)),z(zz));g.lineTo(x(s*7.8),z(zz+(i%2?1:-1)*2.1));g.lineTo(x(s*(3.5+i%5*.5)),z(zz+(i%2?1:-1)*2.1));g.stroke();}
   g.strokeStyle='#3e4950';g.lineWidth=1;for(let i=0;i<23;i++){let xx=-9+(i*17%19);let zz=-20+(i*13%42);g.beginPath();g.arc(x(xx),z(zz),2.5,0,Math.PI*2);g.stroke();}
   g.strokeStyle='#b1bbab';g.lineWidth=2;g.strokeRect(x(-9.1),z(-23.7),18.2/D.width*W,19.3/D.length*H);
   g.fillStyle='#eaeee9';g.font='500 26px monospace';g.textBaseline='middle';
   PINS.forEach((side,s)=>side.forEach((pin,i)=>{g.save();g.translate(x(s?10.55:-10.55),z(-22.86+i*D.pitch));g.rotate(s?Math.PI/2:-Math.PI/2);g.textAlign='center';g.fillText(pin,0,0);g.restore();}));
   g.font='500 32px monospace';g.textAlign='center';g.fillText('ESP32-DevKitC',x(0),z(4));g.font='23px monospace';g.fillText('V4',x(0),z(6));
   g.fillText('EN',x(-8.2),z(18.5));g.fillText('BOOT',x(8.2),z(18.5));g.fillText('5V',x(-8),z(10));g.fillText('U2',x(3.5),z(14));g.fillText('U3',x(4.3),z(1));
   g.strokeStyle='#96a895';g.lineWidth=2;for(let [xx,zz,ww,ll]of[[-8.7,12,2.3,1.6],[-2.7,9.8,5.4,5.4],[-3.3,-2.5,6.6,5.5]])g.strokeRect(x(xx),z(zz),ww/D.width*W,ll/D.length*H);
 },{anatomyBackground:'#121b25'});
 decal(board,D.width-.05,D.length-.05,[0,.808,0],boardArt);
 const bottom=decal(board,D.width-.05,D.length-.05,[0,-.808,0],texture(512,884,(g,W,H)=>{g.fillStyle='#1a2d29';g.fillRect(0,0,W,H);g.fillStyle='#b7c3b2';g.textAlign='center';g.font='22px monospace';g.fillText('ESP32-DevKitC V4',W/2,H/2);g.font='14px monospace';g.fillText('espressif.com',W/2,H/2+30);g.strokeStyle='#3a5144';g.lineWidth=2;for(let i=0;i<19;i++){const y=H*(i+.5)/19;g.beginPath();g.moveTo(25,y);g.lineTo(180,y);g.lineTo(260,y+12);g.lineTo(W-25,y+12);g.stroke();}},{anatomyBackground:'#1a2d29'}));bottom.rotation.x=Math.PI/2;
 const ringGeo=new T.TorusGeometry(.75,.16,6,16);ringGeo.rotateX(Math.PI/2);for(const [x,z] of holes){mesh(ringGeo,M.gold,board,[x,.82,z]);mesh(ringGeo,M.gold,board,[x,-.82,z]);}
 // USB connector: a real open shell with a recessed tongue and five contacts.
 const usb=new T.Group();usb.position.set(0,1.95,22.55);groups.usb.add(usb);
 box(usb,7.6,.26,5.8,[0,1.25,0],M.silver,.1);box(usb,7.6,.24,5.8,[0,-1.1,0],M.silver,.08);
 for(let s of [-1,1])box(usb,.28,2.3,5.8,[s*3.66,.05,0],M.silver,.08);
 box(usb,7.1,2.1,.25,[0,0,-2.75],M.silver,.05);box(usb,5.9,.68,4,[0,-.4,.15],M.black,.09);
 for(let i=0;i<5;i++)box(usb,.3,.12,2.2,[(i-2)*.7,-.01,1],M.gold,.02);
 for(let s of [-1,1]){box(usb,1,.16,.7,[s*2.1,1.41,1.3],M.black,.02);box(usb,.65,.38,1.9,[s*4,-.7,-1],M.silver,.05);}
 // CP2102N USB bridge and 3.3 V regulator.
 chip(groups.bridge,4.4,4.4,.8,0,1.3,12.5,'CP2102N');
 for(let s of [-1,1])for(let i=0;i<7;i++)box(groups.bridge,.65,.25,.26,[s*2.45,1.05,10.85+i*.55],M.silver,.02);
 chip(groups.power,6.3,3.5,1.5,0,1.6,0,'3.3 V');box(groups.power,4,.27,2.6,[0,1.02,-2.9],M.silver,.04);
 for(let i=0;i<3;i++)box(groups.power,.8,.3,1.7,[(i-1)*2.1,1.04,2.4],M.silver,.04);
 for(let s of [-1,1]){
   box(groups.buttons,4,1,3.3,[s*8.1,1.32,21.6],M.silver,.22);box(groups.buttons,2.3,.85,2.3,[s*8.1,2.1,21.6],M.black,.35);
   for(let z of [20.5,22.7])box(groups.buttons,4.8,.3,.6,[s*8.1,1.04,z],M.silver,.03);
 }
 for(let [x,z,w,d]of[[-6,0,1.6,2.7],[-6,-3,1.6,2.7],[6,0,1.6,2.7],[6,-3,1.6,2.7],[-7,7,1,2],[-7,10,1,1.5],[7,8,1.3,2],[6,15,1,1.8],[-4,16,1,1.4],[-4,8,1,1.4],[4,17,1,1.4]])smd(groups.smd,x,z,w,d,1.1);
 for(let x of [-7,7]){chip(groups.smd,1.8,2.9,.75,x,1.2,5.2,'');for(let i=0;i<3;i++)box(groups.smd,.5,.22,.3,[x+(i===2?.95:-.95),1,4.5+(i%2)*1.4],M.silver,.02);}
 const ledMat=indicatorMaterial('#e9471b');box(groups.led,1,.65,1.65,[-8,1.25,13],ledMat,.1);
 // Module substrate: 18 × 25.5 mm, antenna projects beyond the carrier PCB.
 const module=groups.module;const mz=D.moduleZ;
 const modGeo=pcbGeometry(18,25.5,.8);mesh(modGeo,material('#18232a',0,.55),module,[0,1.22,mz]);
 decal(module,17.9,25.4,[0,1.63,mz],texture(720,1020,(g,W,H)=>{g.fillStyle='#17232a';g.fillRect(0,0,W,H);g.strokeStyle='#2a3a43';g.lineWidth=2;for(let i=0;i<30;i++){let x=45+(i*113)%640,y=310+(i*79)%650;g.beginPath();g.moveTo(x,y);g.lineTo(x+35,y);g.lineTo(x+53,y+18);g.lineTo(x+53,y+65);g.stroke();}g.strokeStyle='#899772';g.lineWidth=1.5;for(let y=300;y<960;y+=60)for(let x=40;x<700;x+=65){g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.stroke();}g.fillStyle='#121c23';g.fillRect(0,0,W,235);g.strokeStyle='#acb79d';g.lineWidth=2;g.strokeRect(34,270,W-68,H-300);},{anatomyBackground:'#17232a'}));
 // Printed inverted-F antenna: continuous folded conductor, schematic trace routing.
 trace(module,[[-7,1.66,-28.6],[-7,1.66,-24.7],[-4.6,1.66,-24.7],[-4.6,1.66,-28.6],[-2.2,1.66,-28.6],[-2.2,1.66,-24.7],[.2,1.66,-24.7],[.2,1.66,-28.6],[2.6,1.66,-28.6],[2.6,1.66,-24.7],[5,1.66,-24.7],[5,1.66,-28.6],[7,1.66,-28.6]],.21);
 trace(module,[[-7,1.66,-24.7],[-7,1.66,-22.6],[-4.7,1.66,-22.6],[-4.7,1.66,-20.8]],.18);
 const platedGold=M.gold.clone();platedGold.polygonOffset=true;platedGold.polygonOffsetFactor=-1;platedGold.polygonOffsetUnits=-2;
 for(let s of [-1,1])for(let i=0;i<14;i++)box(module,1.1,.2,.9,[s*8.45,1.25,-23.2+i*1.27],platedGold,.03);
 for(let i=0;i<10;i++)box(module,.9,.2,1.1,[-5.7+i*1.27,1.25,-5.22],platedGold,.03);
 // Discrete module components lift independently of its etched antenna and PCB.
 box(groups.crystal,3.2,.9,2.5,[3.7,2.1,-20.3],M.silver,.38);textDecal(groups.crystal,'40.0',2.7,1.8,[3.7,2.56,-20.3],{size:88,color:'#333d37'});
 for(let i=0;i<12;i++)smd(groups.rf,-6.5+(i%3)*1.45,-19.5+Math.floor(i/3)*2.9,.55,.9,1.9,i%3?M.ceramic:M.black);
 for(let i=0;i<8;i++)smd(groups.rf,2+(i%4)*1.4,-17.5+Math.floor(i/4)*2,.6,.9,1.9);
 // QFN package with 48 perimeter pads. Internal placement is an illustrative reconstruction.
 chip(groups.cpu,6,6,.9,-1.6,2.15,-13.4,'ESP32');textDecal(groups.cpu,'D0WD-V3',5,1.3,[-1.6,2.615,-11.8],{size:56});
 for(let s of [-1,1])for(let i=0;i<12;i++){
 box(groups.cpu,.26,.23,.5,[-1.6+(i-5.5)*.45,1.82,-13.4+s*3.04],M.silver,.02);
 box(groups.cpu,.5,.23,.26,[-1.6+s*3.04,1.82,-13.4+(i-5.5)*.45],M.silver,.02);
 }
 box(groups.cpu,3.7,.1,3.7,[-1.6,1.66,-13.4],M.silver,.04);
 chip(groups.flash,3.5,4.4,.85,4.5,2.12,-8.1,'FLASH');
 for(let s of [-1,1])for(let i=0;i<4;i++)box(groups.flash,.8,.25,.45,[4.5+s*2,1.84,-9.55+i*.96],M.silver,.03);
 // Shield is a hollow five-sided shell, so its underside is credible in every view.
 const shield=groups.shield;const sz=-14.15;
 box(shield,18,.22,19.2,[0,3.82,sz],M.silver,.1);
 for(let s of [-1,1]){box(shield,.22,2.08,19.2,[s*8.89,2.67,sz],M.silver,.07);box(shield,17.6,2.08,.22,[0,2.67,sz+s*9.49],M.silver,.07);}
 for(let s of [-1,1])for(let i=0;i<6;i++)box(shield,.34,.4,1.5,[s*8.85,1.63,sz-8+i*3.15],M.silver,.02);
 const shieldInk=texture(1024,1092,(g,W,H)=>{
  g.fillStyle='#454f4b';g.textAlign='left';g.font='500 62px monospace';g.fillText('ESPRESSIF',160,180);g.font='500 55px monospace';g.fillText('ESP32-WROOM-32E',95,315);g.font='31px monospace';g.fillText('Wi-Fi 802.11 b/g/n',100,410);g.fillText('Bluetooth · 2.4 GHz',100,460);g.font='25px monospace';g.fillText('MODEL: ESP32-WROOM-32E',100,555);g.fillText('N4  ·  4 MB SPI FLASH',100,595);g.font='51px sans-serif';g.fillText('CE  ◉  FCC',430,855);
  for(let y=0;y<23;y++)for(let x=0;x<23;x++){const finder=(x<7&&y<7)||(x>15&&y<7)||(x<7&&y>15);const localX=x>15?x-16:x,localY=y>15?y-16:y;const bit=finder?(localX===0||localX===6||localY===0||localY===6||(localX>1&&localX<5&&localY>1&&localY<5)):((x*17+y*13+x*y)%11<5);if(bit)g.fillRect(100+x*11,700+y*11,11,11);}
  g.font='23px monospace';g.fillText('ESPRESSIF SYSTEMS',430,930);
  g.lineWidth=9;for(let i=0;i<3;i++){g.beginPath();g.arc(112,150,20+i*13,-Math.PI*.9,Math.PI*.6);g.strokeStyle='#454f4b';g.stroke();}
 });decal(shield,17.5,18.7,[0,3.94,sz],shieldInk);
 // Two 19-way pin headers, with square posts and chamfered plastic blocks.
 for(let s of [-1,1])for(let i=0;i<19;i++){
 const z=-22.86+i*D.pitch;box(groups.headers,2.5,2.5,2.5,[s*12.7,-2.08,z],M.black,.22);
 box(groups.headers,.64,10.8,.64,[s*12.7,-2.1,z],M.gold,.06);
 }
 // Consolidate small repeated meshes by material within each selectable part.
 for(const [id,group]of Object.entries(groups)){
   const buckets=new Map();const collect=[];group.updateMatrixWorld(true);
   group.traverse(o=>{if(o.isMesh&&!o.material.map){o.updateWorldMatrix(true,false);const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const list=buckets.get(o.material)||[];list.push(geo);buckets.set(o.material,list);collect.push(o)}});
   for(const o of collect)o.removeFromParent();
   for(const [mat,geos]of buckets){let geo=mergeGeometries(geos,false);if(!geo)throw new Error(`Geometry merge failed for ${id}`);mesh(geo,mat,group);geos.forEach(g=>g.dispose());}
   group.traverse(o=>{if(o.isMesh)o.userData.partId=id});
 }
 const guides=new T.Group();root.add(guides);const guideMat=new T.LineDashedMaterial({color:'#8b9185',transparent:true,opacity:.45,dashSize:.6,gapSize:.7});
 for(const p of PARTS.filter(p=>!p.detail&&p.offset.some(v=>v))){const g=new T.BufferGeometry().setFromPoints([new V(...p.anchor),new V(...p.anchor)]);const line=new T.Line(g,guideMat);line.userData.part=p;guides.add(line);}
 const setPose=(e)=>{const poses=assemblyPose(e);for(const[id,p]of Object.entries(poses))groups[id].position.set(...p);for(const line of guides.children){const p=line.userData.part,a=line.geometry.attributes.position;a.setXYZ(1,...p.anchor.map((v,i)=>v+poses[p.id][i]));a.needsUpdate=true;line.geometry.computeBoundingSphere();line.computeLineDistances();}guides.visible=e>.06;};
 const setSelection=(id,isolate,xray)=>{
 for(const[key,g]of Object.entries(groups)){
  g.visible=!isolate||id===key;
  g.traverse(o=>{if(!o.isMesh)return;if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;
   const muted=xray&&id&&key!==id;
   if(muted){if(!o.userData.ghost){o.userData.ghost=o.userData.originalMaterial.clone();o.userData.ghost.transparent=true;o.userData.ghost.opacity=.1;o.userData.ghost.depthWrite=false;}o.material=o.userData.ghost;o.castShadow=false;}else{o.material=o.userData.originalMaterial;prepareSurface(o);}
  });
 }
 guides.visible=!isolate;
 };
 return{root,groups,guides,setPose,setSelection,ledMat};
}

export {mesh,box,material,texture,decal,textDecal,M};
