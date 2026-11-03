import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import {mesh,box,material,texture,textDecal,M} from './model.js';
import {usbPort,ic,passive} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';

const W=21,D=51,TH=1;
const platedGold=new T.MeshStandardMaterial({color:'#bcac69',metalness:.72,roughness:.42,side:T.DoubleSide});
const platedBarrel=new T.MeshStandardMaterial({color:'#b9a463',metalness:.7,roughness:.4,side:T.DoubleSide});
// Component coordinates digitised from Appendix B of the official Pico 2 W
// datasheet. Pixel coordinates refer to reference/pico2w/components.png.
const at=(px,py,h=0)=>[(px-190)/343*W-W/2,h,(py-397)/833*D-D/2];
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const PICO_PARTS=[
 part('cpu','RP2350A microcontroller','DUAL-CORE MCU','RP2350A provides two Arm Cortex-M33 cores or two Hazard3 RISC-V cores, with 520 KB of on-chip SRAM. The soldered QFN-60 package occupies the center of the board.',at(362,772,1.2),[0,20,0],[['Clock','Up to 150 MHz'],['SRAM','520 KB'],['Package','QFN-60 · 7 × 7 mm']]),
 part('flash','QSPI flash memory','EXTERNAL PROGRAM STORAGE','The separate 4 MB flash package stores the program and supports execution in place through the RP2350 QSPI interface.',at(305,661,1.1),[-4,15,-1],[['Capacity','4 MB'],['Interface','QSPI'],['Reference','U3']]),
 part('rfshield','Wireless shield','METAL RF ENCLOSURE','The soldered metal shield covers the wireless IC and its support network. It lifts here to reveal the documented component layout beneath it.',at(362,1014,2.5),[0,27,2],[['Role','RF shielding'],['Reference','SH1'],['Finish','Silver metal']]),
 part('radio','CYW43439 wireless IC','WI-FI & BLUETOOTH','Infineon’s CYW43439 supplies 2.4 GHz Wi-Fi and Bluetooth, communicating with RP2350 over SPI. Its position under the shield comes from the manufacturer’s component-location drawing.',at(355,1013,1.1),[0,14,4],[['Wi-Fi','2.4 GHz · 802.11n'],['Bluetooth','5.2'],['Reference','U4']]),
 part('usb','Micro-B USB port','POWER & DATA','The five-contact Micro-B socket powers the board and connects the RP2350 USB 1.1 interface. Holding BOOTSEL during connection exposes the bootloader for drag-and-drop programming.',[0,1.8,-23.9],[-2,11,-5],[['Connector','USB Micro-B'],['Data','USB 1.1'],['Contacts','5']]),
 part('bootsel','BOOTSEL button','BOOT MODE SELECTION','Holding BOOTSEL while connecting USB starts the ROM bootloader. It is a boot selection switch, not a dedicated reset button.',at(305,592,1.7),[-5,11,-2],[['Action','Enter USB bootloader'],['Reference','SW1']]),
 part('power','Power conversion circuit','BUCK-BOOST SUPPLY','The switching regulator and surrounding power components generate the 3.3 V rail from USB or an external VSYS supply. Their arrangement follows the official component drawing.',at(403,568,1.3),[5,13,-3],[['VSYS input','1.8–5.5 V'],['Output','3.3 V'],['Role','Buck-boost regulation']]),
 part('crystal','System crystal','CLOCK REFERENCE','The metal-capped crystal supplies the RP2350 reference clock. Its footprint follows the official drawing; the package height is reconstructed.',at(289,882,1.2),[-4,12,3],[['Frequency','12 MHz'],['Reference','X1']]),
 part('smd','SMD components','PASSIVES & RF SUPPORT','The small capacitors, resistors, LED and radio support packages are combined into one group. Their locations follow the official component diagram; package heights are representative.',[0,1.1,0],[0,8,0],[['Placement','Official component diagram'],['Location','Top side']]),
 part('board','Pico 2 W PCB','CASTELLATED MODULE','The 1 mm PCB carries 40 through-hole and castellated contacts, three SWD pads and four mounting holes. The antenna region is part of the PCB and stays with it.',[7,.5,17],[0,0,0],[['Outline','21 × 51 mm'],['Contacts','40 · 2.54 mm pitch'],['Mounting holes','4 × Ø2.1 mm']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
const pinZ=Array.from({length:20},(_,i)=>-24.13+i*2.54);
const mounting=[[-5.7,-23.5],[5.7,-23.5],[-5.7,23.5],[5.7,23.5]];
const debug=[.5,3.04,5.58].map(x=>[x,5.7]);
function outline(){
 const s=new T.Shape(),r=.5;
 s.moveTo(-10,-25.5);s.lineTo(10,-25.5);s.quadraticCurveTo(10.5,-25.5,10.5,-25);
 for(const y of pinZ){s.lineTo(10.5,y-r);s.absarc(10.5,y,r,-Math.PI/2,-Math.PI*1.5,true);}
 s.lineTo(10.5,25);s.quadraticCurveTo(10.5,25.5,10,25.5);s.lineTo(-10,25.5);s.quadraticCurveTo(-10.5,25.5,-10.5,25);
 for(const y of pinZ.toReversed()){s.lineTo(-10.5,y+r);s.absarc(-10.5,y,r,Math.PI/2,-Math.PI/2,true);}
 s.lineTo(-10.5,-25);s.quadraticCurveTo(-10.5,-25.5,-10,-25.5);s.closePath();
 const holes=[...pinZ.flatMap(z=>[[-8.89,z,.5],[8.89,z,.5]]),...mounting.map(([x,z])=>[x,z,1.05]),...debug.map(([x,z])=>[x,z,.5])];
 for(const[x,z,r]of holes){const h=new T.Path();h.absarc(x,-z,r,0,Math.PI*2,true);s.holes.push(h);}return s;
}
function goldRing(parent,x,z,r,outer,y){const geo=new T.RingGeometry(r,outer,24);geo.rotateX(-Math.PI/2);mesh(geo,platedGold,parent,[x,y,z]);}
function pad(parent,side,z){
 const x=side*8.89;
 for(const y of [-.512,.512]){
  goldRing(parent,x,z,.5,.89,y);
  // Pad joins the through-hole to the semicircular plated edge cutout.
  const s=new T.Shape();s.moveTo(9.35,-.89);s.lineTo(10.5,-.89);s.lineTo(10.5,-.5);s.absarc(10.5,0,.5,-Math.PI/2,-Math.PI*1.5,true);s.lineTo(10.5,.89);s.lineTo(9.35,.89);s.closePath();
  const geo=new T.ShapeGeometry(s,12);geo.rotateX(-Math.PI/2);geo.scale(side,1,1);mesh(geo,platedGold,parent,[0,y,z]);
 }
 const wall=new T.CylinderGeometry(.5,.5,1,16,1,true,side>0?Math.PI:0,Math.PI);mesh(wall,platedBarrel,parent,[side*10.5,0,z]);
}
function boardArtwork(shape,bottom){
 const tx=texture(840,2040,(g)=>{
  g.scale(40,40);g.translate(10.5,25.5);
  g.strokeStyle='#d4e4d5';g.fillStyle='#e3eade';g.lineWidth=.08;
  const label=(text,x,z,size=.65,rotation=0)=>{g.save();g.translate(x,z);g.rotate(rotation);if(bottom)g.scale(-1,1);g.font=`${size}px monospace`;g.textAlign='center';g.fillText(text,0,0);g.restore();};
  if(!bottom){label('Pico 2 W',-6.9,-2.5,1.2,-Math.PI/2);label('BOOTSEL',-3.8,-16.2,.65);label('USB',5.15,-22,.7,Math.PI/2);label('DEBUG',-1.2,6.5,.65,Math.PI/2);label('1',-7.5,-24.1,.6);label('40',7.4,-24.1,.6);label('21',7.4,24.2,.6);label('20',-7.4,24.2,.6);
   g.strokeRect(-6.15,6.8,12.3,10.5);g.strokeRect(-.55,4.65,7.2,2.1);
  }else{
   // Pin function labels are transcribed, rather than an invented trace texture.
   const left=['GP0','GP1','GND','GP2','GP3','GP4','GP5','GND','GP6','GP7','GP8','GP9','GND','GP10','GP11','GP12','GP13','GND','GP14','GP15'];
   const right=['VBUS','VSYS','GND','3V3_EN','3V3','ADC_REF','GP28','AGND','GP27','GP26','RUN','GP22','GND','GP21','GP20','GP19','GP18','GND','GP17','GP16'];
   for(let i=0;i<20;i++){label(left[i],-6.7,pinZ[i]+.2,.61);label(right[i],6.2,pinZ[i]+.2,.61);}
   label('Raspberry Pi',0,-8,1);label('Pico 2 W',0,-6,1.2);label('3V3 GPIO',0,15,.8);
  }
 });
 const geo=new T.ShapeGeometry(shape,20),p=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+W/2)/W,(p.getY(i)+D/2)/D);geo.rotateX(-Math.PI/2);
 return{geo,mat:new T.MeshStandardMaterial({map:tx,transparent:true,roughness:.8,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})};
}
// Reference centres measured on the official Figure 12 component-location plot.
// Small body dimensions are representative footprint envelopes, not tolerances.
const small=[
 ['R8',310,499,1,.5],['R3',310,511,1,.5],['C1',402,513,1.8,1],['R2',478,514,.6,.35],['C20',361,592,.45,.75],['R20',386,606,.65,.35],['R21',401,606,.65,.35],['C2',394,626,1.7,1],['C21',457,626,1.7,1],['R7',460,655,.9,.45],['L2',394,660,1.8,1.4],['C15',349,651,.4,.7],['R11',266,652,.4,.7],['R12',347,679,.4,.7],['R13',366,678,.4,.7],['C19',395,686,1,.45],['C22',395,702,1,.45],['R17',430,668,.4,.7],['C23',425,696,.4,.8],['C13',451,694,.5,1],['R9',469,687,.4,.7],['C18',292,705,1,.45],['C16',351,700,.7,.45],['C4',291,724,.6,.4],['C11',290,760,.6,.4],['C5',290,791,.6,.4],['C6',438,724,.6,.4],['R5',468,724,.4,.7],['C12',438,765,.6,.4],['C7',438,775,.6,.4],['R6',468,790,.6,.4],['R1',465,804,.4,.7],['R18',476,804,.4,.7],['C14',436,828,.6,.4],['C8',331,845,.7,.45],['C9',357,860,.4,.8],['R19',371,849,.4,.7],['R10',382,848,.4,.7],['C16b',329,871,.4,.7],['C17',328,897,.4,.7],['R14',338,897,.4,.7],
 ['FB1',295,951,1.6,.7],['C24',319,975,1,.45],['C26',288,976,1,.45],['C33',337,955,.45,.8],['C29',352,963,.45,.8],['C35',364,975,.45,.6],['C28',389,956,.45,.65],['R22',407,954,.7,.4],['R25',428,970,.7,.4],['C41',444,965,.4,.65],['L3',285,1005,.7,1.5],['C34',304,1029,.4,.65],['C30',320,1053,1,.45],['C32',342,1053,.4,.65],['C28b',364,1056,.7,.45],['C39',391,1044,.7,.4],['C25',416,1045,.7,.4],['C27',403,1057,.7,.4],['C38',376,1067,.7,.4],['C37',384,1080,.7,.45],['C40',435,1019,.7,.4],['C42',443,1039,.7,.4],['R26',414,1068,.4,.65],
 ['R24',251,1138,.4,.65],['C36',248,1158,.7,.4],['C101',342,1164,1,.5],['C100',383,1164,1,.5],['C102',342,1217,1,.5],['C103',383,1217,1,.5]
];
export function buildPico(){
 const{root,groups}=makeAssembly(PICO_PARTS),shape=outline(),geo=new T.ExtrudeGeometry(shape,{depth:TH,bevelEnabled:false,curveSegments:16});geo.rotateX(-Math.PI/2);geo.translate(0,-.5,0);
 const pcb=mesh(geo,material('#288259',0,.7),groups.board);pcb.userData.pcb=true;pcb.userData.dimensions=[W,TH,D];
 for(const bottom of [false,true]){const a=boardArtwork(shape,bottom);mesh(a.geo,a.mat,groups.board,[0,bottom?-.52:.52,0]);}
 for(const z of pinZ)for(const side of [-1,1])pad(groups.board,side,z);
 for(const[x,z]of mounting)for(const y of [-.515,.515])goldRing(groups.board,x,z,1.05,1.45,y);
 for(const[x,z]of debug)for(const y of [-.515,.515])goldRing(groups.board,x,z,.5,.9,y);
 const cpuAt=at(362,772),cpu=ic(groups.cpu,{x:cpuAt[0],z:cpuAt[2],width:7,depth:7,height:.85,base:.5,label:'RP2350A'});
 for(let i=0;i<15;i++)for(const side of [-1,1]){const p=(i-7)*.4;box(cpu,.2,.18,.5,[p,.61,side*3.48],M.silver,.012);box(cpu,.5,.18,.2,[side*3.48,.61,p],M.silver,.012);}
 const chipAt=(id,px,py,w,d,label,h=.8)=>{const[x,,z]=at(px,py);return ic(groups[id],{x,z,width:w,depth:d,height:h,base:.5,label});};
 chipAt('flash',305,661,3,2,'FLASH');
 chipAt('radio',355,1013,4.53,2.88,'CYW43439',.7);
 usbPort(groups.usb,'micro',{x:0,z:-23.9,base:.5,rotation:Math.PI});
 // The shield is a hollow five-sided can, so the radio can be seen from below.
 const[x,,z]=at(362,1014),sw=12.2,sd=10.4,bottom=.65,top=2.65;
 box(groups.rfshield,sw,.18,sd,[x,top,z],M.silver,.05);
 for(const side of [-1,1]){box(groups.rfshield,.18,top-bottom,sd,[x+side*(sw-.18)/2,(top+bottom)/2,z],M.silver,.04);box(groups.rfshield,sw-.36,top-bottom,.18,[x,(top+bottom)/2,z+side*(sd-.18)/2],M.silver,.04);}
 for(const side of [-1,1])for(let i=0;i<4;i++)box(groups.rfshield,.35,.3,.8,[x+side*6,(bottom+.5)/2,z-3.6+i*2.4],M.silver,.025);
 const[bX,,bZ]=at(305,592);box(groups.bootsel,3.4,1.1,4.4,[bX,1.06,bZ],M.silver,.12);mesh(new T.CylinderGeometry(1.32,1.32,.75,32),material('#e3e3d5'),groups.bootsel,[bX,1.97,bZ]);
 for(const side of [-1,1])for(const zz of [-1.35,1.35])box(groups.bootsel,.5,.2,.8,[bX+side*1.8,.61,bZ+zz],M.silver,.025);
 chipAt('power',403,568,4.1,3.2,'',.9);
 const pow=[['L1',462,569,2,2.5,'#434846'],['D1',451,498,2,2.5,'#1c2020']];
 for(const[ref,px,py,w,d,color]of pow){const[x,,z]=at(px,py);box(groups.power,w,1.25,d,[x,1.2,z],material(color),.1);for(const side of [-1,1])box(groups.power,w*.9,.18,.35,[x,.64,z+side*d*.49],M.silver,.02);}
 const[cX,,cZ]=at(289,882);box(groups.crystal,3.2,.8,2.5,[cX,1.05,cZ],M.silver,.3);textDecal(groups.crystal,'12.0',2.6,1.6,[cX,1.46,cZ],{size:75,color:'#6b6d67'});
 for(const[ref,px,py,w,d]of small){const[x,,z]=at(px,py);passive(groups.smd,{x,z,width:w,depth:d,base:.5,color:ref.startsWith('R')?'#222726':'#b5a17d'});}
 chipAt('smd',468,755,1.6,.9,'',.6); // Q1, from the component-location plot.
 const ledAt=at(269,475);box(groups.smd,1.6,.5,.8,[ledAt[0],.8,ledAt[2]],material('#d8d3a7'),.04);box(groups.smd,.75,.08,.55,[ledAt[0],1.09,ledAt[2]],indicatorMaterial('#739c42','activity'),.02);
 const rfX=at(429,996);box(groups.smd,1.6,.6,1.2,[rfX[0],.85,rfX[2]],M.silver,.12);
 const filterAt=at(307,1076);box(groups.smd,2,.65,1.4,[filterAt[0],.88,filterAt[2]],material('#c9c8b8'),.07);
 root.userData={board:'pico2w',dimensions:[W,TH,D],headerPins:40,headerPitch:2.54,headerRowSpacing:17.78,mountingHoles:mounting.map(([x,z])=>[x,z,2.1]),debugPads:debug,source:'Pico 2 W datasheet mechanical drawing and Appendix B'};
 return finishAssembly(root,groups,PICO_PARTS);
}
export const PICO_BOARD={id:'pico2w',tab:'Pico 2 W',title:'Raspberry Pi<br>Pico 2 W',edition:'005',subtitle:'A wireless microcontroller, down to the pins.',intro:'Explore the RP2350, external flash and shielded wireless circuit.',model:'Raspberry Pi Pico 2 W / bare board',basis:'Official dimensions & component layout',dimensions:'21 × 51 MM',parts:PICO_PARTS,build:buildPico,half:39,camera:[60,70,80],target:[0,5,0],start:0,stats:[['150','MHz','MCU CLOCK'],['520','KB','SRAM'],['4','MB','FLASH'],['26','','GPIO']],sources:[['Raspberry Pi · Pico 2 W datasheet and component locations','https://datasheets.raspberrypi.com/picow/pico-2-w-datasheet.pdf'],['Raspberry Pi · Pico-series hardware documentation','https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html'],['Raspberry Pi · Pico 2 product page','https://www.raspberrypi.com/products/raspberry-pi-pico-2/']],accuracy:'The 21 × 51 × 1 mm outline, four Ø2.1 mm holes, 40 contacts, 2.54 mm pitch and SWD pads follow the official mechanical drawing. Component centers are digitised from Appendix B; body heights, shield construction and connector interiors are reconstructed. The wireless IC under the shield is placed from the documented component layout. Board traces and the proprietary antenna routing are not invented. The Pico 2 STEP linked by the datasheet is not used as a wireless-board replica.',hidden:['radio']};
