import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import layout from './uno-layout.json' with {type:'json'};
import {mesh,box,material,texture,decal,textDecal,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';
export const UNO_PARTS=[
 {id:'cpu',n:'01',name:'ATmega328P',short:'ATMEGA328P',kind:'SOCKETED 8-BIT AVR',description:'The Uno’s removable DIP-28 microcontroller. Its 28 leads fit a 7.62 mm row-spaced socket; the ceramic resonator supplies the 16 MHz clock.',specs:[['Clock','16 MHz'],['Flash / SRAM','32 KB / 2 KB'],['Package','DIP-28']],anchor:[12.065,7,10.287],offset:[0,28,0]},
 {id:'headers',n:'02',name:'Shield headers',short:'SHIELD INTERFACE',kind:'10 + 8 + 8 + 6 SOCKETS',description:'Four female header banks expose digital, analog and power signals. The original board coordinates preserve the Uno’s distinctive 4.064 mm gap between digital banks.',specs:[['Socket positions','32'],['Within-bank pitch','2.54 mm'],['Digital bank gap','4.064 mm']],anchor:[10,9,-24.13],offset:[0,17,0]},
 {id:'usb',n:'03',name:'USB Type-B port',short:'USB TYPE-B',kind:'FULL-SIZE USB CONNECTOR',description:'The shielded Type-B connector carries USB data and 5 V from the host. Its footprint, through-hole leads and shell tabs follow Arduino’s EAGLE board.',specs:[['Interface','USB 2.0'],['Signal contacts','4'],['Footprint','PN61729']],anchor:[-33,7,-11.43],offset:[-8,14,0]},
 {id:'bridge',n:'04',name:'USB serial bridge',short:'ATMEGA16U2',kind:'ATMEGA16U2-MU',description:'A second AVR handles the USB-to-serial connection used for uploading sketches. It has its own 16 MHz quartz crystal and ICSP programming header.',specs:[['Controller','ATmega16U2'],['Package','QFN-32'],['Clock','16 MHz']],anchor:[-14.351,2,-8.001],offset:[-4,23,0]},
 {id:'power',n:'05',name:'DC barrel jack',short:'DC BARREL JACK',kind:'2.1 MM DC JACK / 5 V RAIL',description:'The DC barrel jack accepts external power. The regulators, protection parts and capacitors now separate as individual components.',specs:[['Recommended input','7–12 V'],['Main rail','5 V'],['Center pin','2.1 mm']],anchor:[-29,6,18.288],offset:[-6,13,6]},
 {id:'board',n:'06',name:'Uno R3 PCB',short:'UNO R3 · REV3e',kind:'ARDUINO OFFICIAL EAGLE LAYOUT',description:'The shaped PCB, four mounting holes, routed copper, pad positions and silkscreen come from Arduino’s UNO-TH_Rev3e design files.',specs:[['CAD outline','68.58 × 53.34 mm'],['Mounting holes','4 × Ø3.2 mm'],['Revision','UNO-TH_Rev3e']],anchor:[20,.9,-9],offset:[0,0,0]}
];
const xy=(x,y,h=.8)=>[Number(x)-34.29,h,26.67-Number(y)];
const angle=s=>Number((s||'R0').replace(/[^\d.-]/g,''))*Math.PI/180;
export function padWorld(el,p){const a=angle(el.rot),x=Number(p.x),y=Number(p.y);return[Number(el.x)+x*Math.cos(a)-y*Math.sin(a),Number(el.y)+x*Math.sin(a)+y*Math.cos(a)];}
const majorRefs=new Set(['ZU4','IOL','IOH','AD','POWER','X2','U3','X1']);
const ignoredPackages=new Set(['FRAME','TP-SP','FIDUCIA-MOUNT','SJ','2X02']);
const smallElements=layout.components.filter(e=>!majorRefs.has(e.name)&&!ignoredPackages.has(e.package)&&!e.rot?.startsWith('M'));
function smallType(e){
 if(e.package==='PANASONIC_D')return['Electrolytic capacitor','Power-rail smoothing in an aluminium electrolytic package.'];
 if(e.name==='Y1')return['16 MHz crystal','Quartz reference for the ATmega16U2 USB interface.'];
 if(e.name==='Y2')return['16 MHz resonator','The ceramic clock resonator for the main ATmega328P.'];
 if(e.name==='RESET')return['Reset switch','Momentary switch that pulls the reset signal low.'];
 if(e.package==='2X03')return['ICSP header','Six-contact in-circuit programming header.'];
 if(e.package==='CHIP-LED0805')return['Indicator LED','A small status LED with separate body and terminals.'];
 if(e.name==='U1')return['5 V regulator','The linear regulator that supplies the 5 V rail from the DC input.'];
 if(e.name==='U2')return['3.3 V regulator','The smaller regulator for the 3.3 V supply output.'];
 if(e.name==='U5')return['Comparator','The power-selection comparator package.'];
 if(e.name.startsWith('RN'))return['Resistor network','Multiple resistors in a single surface-mount package.'];
 if(e.name.startsWith('R'))return['Resistor','An individual surface-mount resistor at its original footprint.'];
 if(e.name.startsWith('C'))return['Ceramic capacitor','An individual surface-mount capacitor at its original footprint.'];
 if(e.name==='F1')return['USB resettable fuse','Overcurrent protection for the USB power input.'];
 if(e.name.startsWith('D')||e.name.startsWith('Z'))return['Protection diode','A discrete protection component from the official board layout.'];
 if(e.name==='T1')return['Power MOSFET','Switching transistor in the board power-selection circuit.'];
 return['Filter component','A discrete component at its official EAGLE footprint.'];
}
for(const [i,e]of smallElements.entries()){
 const [type,description]=smallType(e),anchor=xy(e.x,e.y,2);
 UNO_PARTS.push({id:'u-'+e.name,n:'',name:`${e.name} · ${type}`,short:e.name+' · '+type.toUpperCase(),tag:e.name,kind:'DISCRETE COMPONENT · '+e.package,description:description+' Position and rotation follow the original EAGLE layout; body height is reconstructed.',specs:[['Reference',e.name],['Value',e.value||'Not specified'],['Package',e.package]],anchor,offset:[anchor[0]*.14,10+(i%5)*3,anchor[2]*.12],detail:true,category:'Small components'});
}
UNO_PARTS.push({id:'socket',n:'',name:'28-pin IC socket',short:'DIP-28 SOCKET',kind:'REMOVABLE MICROCONTROLLER SOCKET',description:'The socket lifts separately from the ATmega328P. Its contacts retain the 7.62 mm row spacing and 2.54 mm pin pitch of the original footprint.',specs:[['Contacts','28'],['Row spacing','7.62 mm'],['Pitch','2.54 mm']],anchor:[12.065,3.8,10.287],offset:[0,13,0],detail:true,category:'Board components'});
UNO_PARTS.forEach((p,i)=>p.n=String(i+1).padStart(2,'0'));
export function buildUno(){
 const{root,groups}=makeAssembly(UNO_PARTS),board=groups.board;const blue=material('#007e83',0,.55),solder=material('#a9ada7',.7,.55);
 const physical=layout.components.filter(e=>!['FRAME','TP-SP','FIDUCIA-MOUNT','SJ','2X02'].includes(e.package)&&!e.rot?.startsWith('M'));
 const pads=[];for(const el of physical)for(const p of layout.packages[el.library+'/'+el.package]||[])if(p.type==='pad')pads.push({el,p,point:padWorld(el,p)});
 const shape=new T.Shape();let wires=[...layout.outline],w=wires.shift();shape.moveTo(+w.x1-34.29,+w.y1-26.67);
 while(w){let x1=+w.x1,y1=+w.y1,x2=+w.x2,y2=+w.y2;
  if(w.curve){const theta=+w.curve*Math.PI/180,dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),d=l/(2*Math.tan(theta/2)),cx=(x1+x2)/2-dy/l*d,cy=(y1+y2)/2+dx/l*d,a0=Math.atan2(y1-cy,x1-cx),r=Math.hypot(x1-cx,y1-cy);shape.absarc(cx-34.29,cy-26.67,r,a0,a0+theta,theta<0);}else shape.lineTo(x2-34.29,y2-26.67);
  const i=wires.findIndex(v=>Math.abs(+v.x1-x2)<.001&&Math.abs(+v.y1-y2)<.001);w=i<0?null:wires.splice(i,1)[0];
 }shape.closePath();
 const holeSet=[...layout.holes.map(h=>({x:+h.x,y:+h.y,r:+h.drill/2})),...pads.map(({point,p})=>({x:point[0],y:point[1],r:+p.drill/2}))];
 // Merge collinear overlapping drill hits into the DC-jack's three routed
 // slots. Ordinary through holes keep their original center and diameter.
 const remaining=[...holeSet];
 while(remaining.length){const cluster=[remaining.shift()];let added=true;
  while(added){added=false;for(let i=remaining.length-1;i>=0;i--)if(cluster.some(h=>Math.hypot(h.x-remaining[i].x,h.y-remaining[i].y)<h.r+remaining[i].r+.01)){cluster.push(remaining.splice(i,1)[0]);added=true;}}
  const p=new T.Path(),r=cluster[0].r;
  if(cluster.length===1)p.absarc(cluster[0].x-34.29,cluster[0].y-26.67,r,0,2*Math.PI,true);
  else{let a=cluster[0],b=a,max=0;for(const u of cluster)for(const v of cluster){const d=Math.hypot(u.x-v.x,u.y-v.y);if(d>max){a=u;b=v;max=d;}}const t=Math.atan2(b.y-a.y,b.x-a.x);p.absarc(a.x-34.29,a.y-26.67,r,t-Math.PI/2,t+Math.PI/2,true);p.absarc(b.x-34.29,b.y-26.67,r,t+Math.PI/2,t+3*Math.PI/2,true);p.closePath();}
  shape.holes.push(p);
 }
 const geo=new T.ExtrudeGeometry(shape,{depth:1.6,bevelEnabled:false,curveSegments:24});geo.rotateX(-Math.PI/2);geo.translate(0,-.8,0);const pcb=mesh(geo,blue,board);pcb.name='UNO official board outline';pcb.userData.pcb=true;
 // Paint the original routed copper, footprint pads and board artwork.
 const art=texture(2048,1593,(g,W,H)=>{
  const S=W/68.58;g.scale(S,S);g.translate(0,53.34);g.scale(1,-1);
  function primitive(p,color){g.strokeStyle=color;g.fillStyle=color;g.lineWidth=Math.max(.05,+p.width||.1);g.lineCap='round';if(p.type==='wire'){g.beginPath();g.moveTo(+p.x1,+p.y1);g.lineTo(+p.x2,+p.y2);g.stroke();}else if(p.type==='rectangle'){g.fillRect(+p.x1,+p.y1,+p.x2-p.x1,+p.y2-p.y1);}else if(p.type==='circle'){g.beginPath();g.arc(+p.x,+p.y,+p.radius,0,Math.PI*2);g.stroke();}else if(p.type==='text'&&p.text&&!p.text.startsWith('>')){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));g.scale(1,-1);g.font=`${+p.size||1}px monospace`;g.fillText(p.text,0,0);g.restore();}}
  for(const p of layout.copper)if(p.type==='wire'&&p.layer==='1')primitive(p,'#237f83');
  for(const p of layout.art)if(['21','25','27'].includes(p.layer))primitive(p,'#f0f0e8');
  g.fillStyle='#f0f0e8';for(const [x1,y1,x2,y2]of layout.frame||[])g.fillRect(x1,y1,x2-x1,y2-y1);
  for(const el of physical){g.save();g.translate(+el.x,+el.y);g.rotate(angle(el.rot));for(const p of layout.packages[el.library+'/'+el.package]||[]){if(p.type==='wire'&&p.layer==='21')primitive(p,'#e0e8e0');if(p.type==='smd'){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));g.fillStyle='#b8bba6';g.fillRect(-p.dx/2,-p.dy/2,+p.dx,+p.dy);g.restore();}if(p.type==='pad'){g.beginPath();g.fillStyle='#c3c5ac';g.arc(+p.x,+p.y,+p.diameter/2||.8,0,Math.PI*2);g.fill();}}g.restore();}
 });
 // Routed copper is context in the normal view, not printed anatomy linework.
 art.userData.anatomyCopperColor='#237f83';
 // ShapeGeometry keeps artwork clipped to the authentic outline and holes.
 const topGeo=new T.ShapeGeometry(shape,24);const pos=topGeo.attributes.position,uv=topGeo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+34.29)/68.58,(pos.getY(i)+26.67)/53.34);topGeo.rotateX(-Math.PI/2);mesh(topGeo,new T.MeshStandardMaterial({map:art,transparent:true,roughness:.66,metalness:.1,depthWrite:false}),board,[0,.815,0]);
 const ringGeo=new T.TorusGeometry(.7,.15,6,16);ringGeo.rotateX(Math.PI/2);for(const{point,p}of pads){if(+p.drill>1.4)continue;mesh(ringGeo,solder,board,xy(...point,.81));mesh(ringGeo,solder,board,xy(...point,-.81));}
 for(const h of layout.holes){const rim=new T.TorusGeometry(+h.drill/2+.19,.16,6,32);rim.rotateX(Math.PI/2);mesh(rim,M.silver,board,xy(h.x,h.y,.82));}
 const groupFor=e=>e.name==='ZU4'?'cpu':['IOL','IOH','AD','POWER'].includes(e.name)?'headers':e.name==='X2'?'usb':e.name==='U3'?'bridge':e.name==='X1'?'power':'u-'+e.name;
 for(const el of physical){const id=groupFor(el),g=new T.Group();g.position.set(...xy(el.x,el.y,0));g.rotation.y=angle(el.rot);groups[id].add(g);g.name=el.name;const pkg=layout.packages[el.library+'/'+el.package]||[],pins=pkg.filter(p=>p.type==='pad'||p.type==='smd');
  const local=(p,h)=>[+p.x,h,-p.y];
  if(el.package==='DIL28-3'){
   const socket=new T.Group();socket.position.copy(g.position);socket.rotation.copy(g.rotation);groups.socket.add(socket);
   box(socket,35.56,3,9.8,[0,2.3,0],M.black,.2);box(socket,32.8,.2,4.4,[0,3.82,0],material('#303b37'),.04);
   for(const p of pins){box(socket,1.2,.22,1.25,local(p,3.83),M.silver,.04);box(socket,.48,4.6,.48,local(p,-.2),M.silver,.03);}
   box(g,34.8,3.4,6.35,[0,5.8,0],M.black,.35);textDecal(g,'ATMEGA328P-PU',30,4.5,[0,7.51,0],{size:53,color:'#c7c9b9'});
   const notch=mesh(new T.CylinderGeometry(1,1,.07,24),material('#333b36'),g,[-16.75,7.53,0]);
   for(const p of pins){const sign=Math.sign(+p.y);box(g,.48,3.6,.32,local(p,2.8),M.silver,.03);box(g,.48,.25,1.2,[+p.x,4.5,-sign*3.4],M.silver,.02);}
  }else if(['1X06','1X08','1X10'].includes(el.package)){
   // Per-pin collars are hollow: sockets remain visible from above.
   const xs=pins.map(p=>+p.x),center=(Math.min(...xs)+Math.max(...xs))/2,width=pins.length*2.54;
   box(g,width,7.6,.65,[center,4.6,-.95],M.black,.06);box(g,width,7.6,.65,[center,4.6,.95],M.black,.06);box(g,width,.8,2.54,[center,1.2,0],M.black,.05);
   for(let i=0;i<=pins.length;i++)box(g,.55,7.6,2.54,[Math.min(...xs)-1.27+i*2.54,4.6,0],M.black,.04);
   for(const p of pins){box(g,.48,5.2,.48,local(p,-.2),M.silver,.025);box(g,.2,5.5,.9,[+p.x-.5,3.8,0],M.gold,.02);box(g,.2,5.5,.9,[+p.x+.5,3.8,0],M.gold,.02);}
  }else if(el.package==='PN61729'){
   // Local -Y is the connector face; PCB placement/rotation is from EAGLE.
   box(g,11.8,.35,15.75,[0,11.65,2.275],M.silver,.12);box(g,11.8,.35,15.75,[0,.99,2.275],M.silver,.08);
   for(const s of [-1,1])box(g,.35,10.5,15.75,[s*5.73,6.3,2.275],M.silver,.1);
   box(g,11.4,10.3,.35,[0,6.3,-5.43],M.silver,.08);box(g,7.4,6,11.6,[0,5.2,.7],material('#d8d5b9'),.35);
   // Empty rectangular opening around the raised central USB-B tongue.
   box(g,4,3.2,6.5,[0,6.3,6.7],material('#d8d5b9'),.25);
   for(let s of [-1,1])for(let x of [-1.2,1.2])box(g,.65,.16,5.6,[x,6.3+s*1.68,6.6],M.gold,.04);
   for(const p of pins)box(g,+p.drill>1.5?.45:.5,4.5,+p.drill>1.5?1.8:.5,local(p,-.3),M.silver,.02);
  }else if(el.package==='POWERSUPPLY_DC-21MM'){
   box(g,8.99,10.7,9.2,[-.584,6.15,2],M.black,.22);
   // Open front cylinder and center pin on a 2.1 mm DC jack.
   const tube=new T.Shape();tube.absarc(0,0,4.35,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,3.1,0,Math.PI*2,true);tube.holes.push(h);const tg=new T.ExtrudeGeometry(tube,{depth:4,bevelEnabled:false,curveSegments:40});mesh(tg,M.black,g,[-.584,6.1,-7.14]);
   const center=mesh(new T.CylinderGeometry(1.05,1.05,6,24),M.silver,g,[-.584,6.1,-4.5]);center.rotation.x=Math.PI/2;
   for(const p of pins.slice(0,3))box(g,.5,4.4,1.7,local(p,-.3),M.silver,.03);
  }else if(el.package==='PANASONIC_D'){
   box(g,6.5,.7,6.5,[0,1.15,0],M.black,.15);mesh(new T.CylinderGeometry(3.15,3.15,5.4,36),M.silver,g,[0,4.2,0]);textDecal(g,'47',4,3,[0,6.92,0],{size:120,color:'#343d37'});
  }else if(el.package==='MLF32'){
   box(g,5,1,5,[0,1.35,0],M.black,.12);for(const p of pins){let b=box(g,+p.dx,.17,+p.dy,local(p,.9),M.silver,.02);b.rotation.y=angle(p.rot);}textDecal(g,'MEGA16U2',4.6,3,[0,1.86,0],{size:55});
  }else if(el.package==='2X03'){
   box(g,7.62,2.54,5.08,[0,2.07,0],M.black,.1);for(const p of pins)box(g,.64,10.7,.64,local(p,2.5),M.gold,.04);
  }else if(el.package==='TS42'){
   box(g,5.7,1.4,4,[0,1.5,0],M.silver,.16);mesh(new T.CylinderGeometry(1.5,1.5,1.15,24),material('#d8d8cd'),g,[0,2.75,0]);for(const p of pins)box(g,+p.dx,.22,+p.dy,local(p,.95),M.silver,.03);
  }else if(el.package==='QS'){
   box(g,11.43,.3,4.57,[0,1,0],M.silver,.8);box(g,10.8,2.7,4,[0,2.4,0],M.silver,1.3);textDecal(g,'16.000',8,3,[0,3.76,0],{size:68,color:'#465147'});for(const p of pins)box(g,.5,3,.5,local(p,-.4),M.silver,.02);
  }else{
   const sizes={'C0603-ROUND':[1.6,.8,.55],'R0603-ROUND':[1.6,.8,.5],'CT/CN0603':[1.6,.8,.6],'0805':[2,1.25,1],'L1812':[4.5,3.2,1.2],'CHIP-LED0805':[1.25,2,1],'CAY16':[3.2,1.6,.7],'SOT223':[6.55,3.55,1.8],'SOT-23':[2.9,1.3,1.1],'SOT23-DBV':[2.9,1.6,1.1],'MSOP08':[3,3,1.1],'RESONATOR':[3.2,1.3,1.1],'MINIMELF':[3.5,1.6,1.5],'SMB':[4.6,3.6,2.3]};
   const[w,d,h]=sizes[el.package]||[1.6,.8,.55];const mat=el.name.startsWith('C')?M.ceramic:el.package==='L1812'?material('#b1a558'):el.package==='CHIP-LED0805'?indicatorMaterial(el.name==='ON'?'#77a736':'#cca848',el.name==='ON'?'power':'activity',el.name==='RX'?0:el.name==='TX'?1.2:2.4):M.black;
   box(g,w,h,d,[0,.83+h/2,0],mat,.07);for(const p of pins){if(p.type==='smd'){const contact=box(g,+p.dx,.18,+p.dy,local(p,.91),M.silver,.025);contact.rotation.y=angle(p.rot);}}
  }
 }
 root.userData={board:'uno',cad:'UNO-TH_Rev3e',mountingHoles:layout.holes.map(h=>[+h.x,+h.y,+h.drill]),headerPins:32};
 return finishAssembly(root,groups,UNO_PARTS);
}
