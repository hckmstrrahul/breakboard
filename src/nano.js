import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import layout from './nano-layout.json' with {type:'json'};
import {mesh,box,material,texture,textDecal,M} from './model.js';
import {usbPort} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';

const W=43.18,D=17.78,TH=1.6;
const platedPads=new T.MeshStandardMaterial({color:'#b7b6a2',metalness:.7,roughness:.35,side:T.DoubleSide});
const ledBody=material('#ddd8ad'),tantalumBody=material('#c8ad63');
const ledColors={RX:material('#be614d'),L:material('#d8bb4e'),green:material('#76a55b')};
const world=(x,y,h=0)=>[+x-W/2,h,D/2-y];
const angle=r=>+(r||'R0').replace(/[^\d.-]/g,'')*Math.PI/180;
const mirrored=e=>(e.rot||'').includes('M');
const physical=layout.components.filter(e=>e.value!=='DNP'&&e.package!=='FRAME');
export function nanoPadWorld(e,p){const a=angle(e.rot),x=+p.x*(mirrored(e)?-1:1),y=+p.y;return[+e.x+x*Math.cos(a)-y*Math.sin(a),+e.y+x*Math.sin(a)+y*Math.cos(a)];}
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const NANO_PARTS=[
 part('cpu','ATmega328P','8-BIT AVR MICROCONTROLLER','The classic Nano’s 16 MHz AVR runs the sketch. This V3.3 revision uses a soldered 32-contact VQFN package, not a removable DIP chip.',world(15.494,8.8392,1.7),[0,20,0],[['Clock','16 MHz'],['Flash / SRAM','32 KB / 2 KB'],['Package','VQFN-32']]),
 part('usb','Mini-B USB port','POWER & PROGRAMMING','The five-contact Mini-B socket supplies USB power and connects to the FT232RL serial bridge on the underside.',world(2.8,8.89,3),[-8,12,0],[['Connector','USB Mini-B'],['Data','USB 2.0 full speed'],['Contacts','5']]),
 part('headers','Breadboard headers','TWO 15-PIN STRIPS','Thirty square posts sit on 2.54 mm pitch, with the plastic spacers below the board. The two rows are 15.24 mm apart. They carry power, digital I/O and eight analog inputs.',world(21.59,16.51,-2),[0,-7,0],[['Contacts','2 × 15'],['Pitch','2.54 mm'],['Row spacing','15.24 mm']]),
 part('bridge','FT232RL USB bridge','UNDERSIDE · USB TO UART','The FTDI chip converts USB to serial for sketch uploads and serial communication. Its 28 gull-wing leads and underside position follow the official layout.',world(10.38,8.865,-2.3),[-4,-10,0],[['Controller','FT232RL'],['Package','SSOP-28'],['Location','Underside']]),
 part('power','5 V regulator','UNDERSIDE · LM1117','The linear regulator supplies the 5 V rail when the Nano is powered through VIN. USB power enters through the separate protection circuit.',world(33.147,6.477,-2),[6,-9,0],[['Regulator','LM1117-5.0'],['Package','SOT-223'],['VIN recommended','7–12 V']]),
 part('reset','Reset button','MOMENTARY SWITCH','The tactile button pulls RESET low. It resets the sketch without disconnecting power.',world(24.511,8.92,2),[3,14,-3],[['Action','Reset microcontroller'],['Reference','SW1']]),
 part('clock','16 MHz resonator','CLOCK REFERENCE','A three-terminal ceramic resonator provides the ATmega328P clock. It retains its 45° orientation from the PCB file.',world(20.8534,13.2064,1.6),[0,12,-4],[['Frequency','16 MHz'],['Reference','Y1']]),
 part('leds','Status LEDs','POWER · RX · TX · D13','The four indicator LEDs show board power, serial receive/transmit activity and the sketch-controlled D13 signal.',world(28.956,8.89,1.5),[5,10,2],[['Indicators','4'],['Labels','ON / RX / TX / L']]),
 part('fuse','USB resettable fuse','F1 · USB OVERCURRENT PROTECTION','The underside F1 resettable fuse protects the USB supply path. Its position and package come from the official Nano V3.3 layout.',world(2.0828,4.4958,-1.52),[-3,-9,-2],[['Reference','F1'],['Device','MFFSMF050'],['Location','Underside']]),
 part('diode','USB power diode','D1 · SCHOTTKY DIODE','The D1 Schottky diode belongs to the USB power path. Its original underside footprint and orientation are retained.',world(28.575,12.319,-1.72),[4,-10,2],[['Reference','D1'],['Device','SS1P3L'],['Location','Underside']]),
 part('smd','SMD components','PASSIVES & PROTECTION','The remaining capacitors and resistor networks stay together as one selectable group. Positions and values come from the Nano V3.3 schematic and layout.',world(25,8.89,-1.2),[0,-6,0],[['Placement','Official EAGLE coordinates'],['Location','Underside']]),
 part('board','Nano V3.3 PCB','OFFICIAL ARDUINO BOARD LAYOUT','The rectangular PCB includes the original copper routing, four mounting holes and six unpopulated ICSP pads. The CAD outline is 43.18 × 17.78 mm; Arduino quotes a nominal 45 × 18 mm product envelope.',world(35,12,.8),[0,0,0],[['CAD outline','43.18 × 17.78 mm'],['Mounting holes','4 × Ø1.651 mm'],['Revision','Nano V3.3']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));

function groupFor(e){return e.name==='F1'?'fuse':e.name==='D1'?'diode':e.name==='IC3'?'cpu':e.name==='J3'?'usb':['J1','J2'].includes(e.name)?'headers':e.name==='IC1'?'bridge':e.name==='IC2'?'power':e.name==='SW1'?'reset':e.name==='Y1'?'clock':['RX','TX','PWR','L'].includes(e.name)?'leds':'smd';}
function shapeBoard(){
 const s=new T.Shape();s.moveTo(-W/2,-D/2);s.lineTo(W/2,-D/2);s.lineTo(W/2,D/2);s.lineTo(-W/2,D/2);s.closePath();
 const holes=layout.holes.map(h=>({x:+h.x,y:+h.y,r:+h.drill/2}));
 for(const e of physical)for(const p of layout.packages[e.library+'/'+e.package])if(p.type==='pad'){const[x,y]=nanoPadWorld(e,p);holes.push({x,y,r:+p.drill/2});}
 for(const h of holes){const p=new T.Path();p.absarc(h.x-W/2,h.y-D/2,h.r,0,Math.PI*2,true);s.holes.push(p);}return s;
}
function artwork(shape,bottom){
 const tx=texture(2048,843,(g)=>{
  const scale=2048/W;g.scale(scale,scale);g.translate(0,D);g.scale(1,-1);
  const draw=(p,color)=>{g.strokeStyle=color;g.fillStyle=color;g.lineWidth=Math.max(.04,+p.width||.1);g.lineCap='round';
   if(p.type==='wire'){g.beginPath();g.moveTo(+p.x1,+p.y1);g.lineTo(+p.x2,+p.y2);g.stroke();}
   if(p.type==='rectangle')g.fillRect(+p.x1,+p.y1,p.x2-p.x1,p.y2-p.y1);
   if(p.type==='circle'){g.beginPath();g.arc(+p.x,+p.y,+p.radius,0,Math.PI*2);g.stroke();}
   if(p.type==='text'&&p.text&&!p.text.startsWith('>')){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));if((p.rot||'').includes('M'))g.scale(-1,1);g.scale(1,-1);g.font=`${+p.size||.8}px monospace`;g.fillText(p.text,0,0);g.restore();}
  };
  for(const p of layout.copper)if(p.type==='wire'&&p.layer===(bottom?'16':'1'))draw(p,'#39858a');
  for(const p of layout.art)if((bottom?['22','26','28']:['21','25','27']).includes(p.layer))draw(p,'#ebeee5');
  for(const e of physical){g.save();g.translate(+e.x,+e.y);g.rotate(angle(e.rot));if(mirrored(e))g.scale(-1,1);
   for(const p of layout.packages[e.library+'/'+e.package]){
    if(p.type==='wire'&&p.layer==='21'&&mirrored(e)===bottom)draw(p,'#cedbd6');
    if(p.type==='smd'&&mirrored(e)===bottom){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));g.fillStyle='#c8bea0';g.fillRect(-p.dx/2,-p.dy/2,+p.dx,+p.dy);g.restore();}
   }g.restore();
  }
  // Pin labels are transcribed from the official Nano pinout; not decoration.
  if(!bottom){g.fillStyle='#edf0e7';g.font='.72px monospace';g.textAlign='center';
   const upper=['D12','D11','D10','D9','D8','D7','D6','D5','D4','D3','D2','GND','RST','RX0','TX1'];
   const lower=['D13','3V3','REF','A0','A1','A2','A3','A4','A5','A6','A7','5V','RST','GND','VIN'];
   for(let i=0;i<15;i++)for(const[list,y]of[[upper,14.9],[lower,2.8]]){g.save();g.translate(3.81+i*2.54,y);g.scale(1,-1);g.fillText(list[i],0,0);g.restore();}
  }
 });
 tx.userData.anatomyCopperColor='#39858a';
 const geo=new T.ShapeGeometry(shape,20),pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+W/2)/W,(pos.getY(i)+D/2)/D);geo.rotateX(-Math.PI/2);
 return{geo,mat:new T.MeshStandardMaterial({map:tx,transparent:true,side:T.DoubleSide,roughness:.72,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})};
}
export function buildNano(){
 const{root,groups}=makeAssembly(NANO_PARTS),shape=shapeBoard();
 const geo=new T.ExtrudeGeometry(shape,{depth:TH,bevelEnabled:false,curveSegments:20});geo.rotateX(-Math.PI/2);geo.translate(0,-TH/2,0);
 const pcb=mesh(geo,material('#087984',0,.66),groups.board);pcb.userData.pcb=true;pcb.userData.dimensions=[W,TH,D];
 for(const bottom of [false,true]){const{geo,mat}=artwork(shape,bottom);mesh(geo,mat,groups.board,[0,bottom?-.812:.812,0]);}
 const ring=(x,y,r)=>{for(const h of [-.815,.815]){const g=new T.RingGeometry(r,r+.24,24);g.rotateX(-Math.PI/2);mesh(g,platedPads,groups.board,world(x,y,h));}};
 for(const h of layout.holes)ring(h.x,h.y,+h.drill/2);
 for(const e of physical){const pkg=layout.packages[e.library+'/'+e.package];for(const p of pkg)if(p.type==='pad'){const[x,y]=nanoPadWorld(e,p);ring(x,y,+p.drill/2);}
  if(e.name==='J4')continue; // Official product has unpopulated six-pad ICSP footprint.
  const g=new T.Group();g.name=e.name;g.userData.reference=e.name;g.position.set(...world(e.x,e.y));g.rotation.y=angle(e.rot);if(mirrored(e))g.scale.set(-1,-1,1);groups[groupFor(e)].add(g);
  const pins=pkg.filter(p=>p.type==='smd');
  const contacts=()=>{for(const p of pins){const c=box(g,+p.dx,.19,+p.dy,[+p.x,.92,-p.y],M.silver,.025);c.rotation.y=angle(p.rot);}};
  switch(e.package){
   case 'VQFN32':contacts();box(g,5,.9,5,[0,1.4,0],M.black,.08);textDecal(g,'ATMEL',4.6,1.4,[0,1.862,-.9],{size:72});textDecal(g,'MEGA328P',4.6,1.5,[0,1.862,.55],{size:52});break;
   case 'USB-MINI-B_2':{const usb=usbPort(g,'mini',{x:1.6,z:-4.29,base:.8,rotation:Math.PI});for(const p of pins.slice(5))box(g,1.2,.2,1.7,[+p.x,.9,-p.y],M.silver,.02);break;}
   case 'HEAD15-NOSS':for(const p of pkg.filter(p=>p.type==='pad')){box(g,2.5,2.5,2.5,[+p.x,-2.05,-p.y],M.black,.18);box(g,.64,9,.64,[+p.x,-3.2,-p.y],M.gold,.03);mesh(new T.CylinderGeometry(.62,.62,.22,12),M.silver,g,[+p.x,.91,-p.y]);}break;
   case 'SSOP28':contacts();box(g,9.9,1.7,5.3,[4.225,1.85,-3.556],M.black,.12);for(const p of pins){const sign=+p.y<3?-1:1;box(g,.29,.65,.25,[+p.x,1.35,-(3.556+sign*2.9)],M.silver,.02);}textDecal(g,'FTDI',8,2,[4.225,2.71,-4.5],{size:87});textDecal(g,'FT232RL',8,2,[4.225,2.71,-2.7],{size:65});break;
   case 'LINEAR_SOT223':contacts();box(g,6.55,1.65,3.56,[0,1.85,0],M.black,.1);textDecal(g,'LM1117',5.8,2.6,[0,2.69,0],{size:60});break;
   case 'SMD_157SW':contacts();box(g,3.9,1.1,2.5,[2,1.45,0],M.silver,.1);mesh(new T.CylinderGeometry(.95,.95,.65,24),material('#e2e2dc'),g,[2,2.2,0]);break;
   case 'RESONATOR':contacts();box(g,3.2,.85,1.3,[0,1.28,0],M.silver,.18);textDecal(g,'16.0',2.8,1,[0,1.72,0],{size:80,color:'#55595a'});break;
   case 'CHIPLED_0805':contacts();box(g,1.25,.65,2,[0,1.2,0],ledBody,.08);box(g,.7,.1,.9,[0,1.57,0],indicatorMaterial(e.name==='PWR'?'#76a55b':e.name==='RX'?'#be614d':'#d8bb4e',e.name==='PWR'?'power':'activity',e.name==='RX'?0:e.name==='TX'?1.2:2.4),.03);break;
   default:{contacts();const dims={'C0603-ROUND':[1.6,.8,.55,0],'CAY16':[3.2,1.6,.7,0],'TAN-A':[3.2,1.6,1.6,1.397],'DO220AAL':[3.2,2,.9,0],'0603-1608X90N':[1.6,.8,.7,0]},[w,d,h,x]=dims[e.package]||[1,.5,.5,0];box(g,w,h,d,[x,.82+h/2,0],e.package==='TAN-A'?tantalumBody:e.name.startsWith('C')?M.ceramic:M.black,.055);}
  }
 }
 root.userData={board:'nano',cad:'NanoV3.3.brd',dimensions:[W,TH,D],headerPins:30,mountingHoles:layout.holes.map(h=>[+h.x,+h.y,+h.drill]),unpopulatedICSP:6};
 return finishAssembly(root,groups,NANO_PARTS);
}
export const NANO_BOARD={id:'nano',tab:'Arduino Nano',title:'Arduino<br>Nano',edition:'006',subtitle:'The classic AVR in a breadboard footprint.',intro:'Explore both sides of the original Nano architecture.',model:'Arduino Nano / V3.3 / ATmega328P',basis:'Official PCB coordinates',dimensions:'43.18 × 17.78 MM',parts:NANO_PARTS,build:buildNano,half:36,camera:[-55,65,72],target:[0,4,0],start:0,stats:[['16','MHz','AVR CLOCK'],['32','KB','FLASH'],['30','PINS','BREADBOARD CONTACTS'],['8','','ANALOG INPUTS']],sources:[['Arduino · Nano documentation','https://docs.arduino.cc/hardware/nano'],['Arduino · Official Nano V3.3 CAD','https://docs.arduino.cc/static/e3c4fe1f9bee7ec63df398422b3257f4/A000005-cad-files.zip'],['Arduino · Product photographs and specifications','https://store.arduino.cc/products/arduino-nano']],accuracy:'The PCB outline, mounting holes, copper, component centers, rotations and contact footprints are extracted from Arduino’s NanoV3.3 EAGLE file. Both sides are modeled, including the underside FT232RL and regulator. Package heights and connector interiors are reconstructed. The 1.6 mm PCB thickness is assumed. The unpopulated ICSP footprint remains part of the board. This is an educational reconstruction, not a manufacturing model.',license:'Arduino Nano CAD and adapted geometry: CC BY-SA 4.0. https://creativecommons.org/licenses/by-sa/4.0/',hidden:[]};
