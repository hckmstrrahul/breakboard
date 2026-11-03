import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import {mesh,box,material,texture,textDecal,M} from './model.js';
import {pinHeader,usbPort,ic,passive} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';

const W=70,D=82.5,TH=1.6;
const P=(x,v,y=0)=>[x-W/2,y,v-D/2];
const blue='#205cb2',padMaterial=new T.MeshStandardMaterial({color:'#bebca6',metalness:.65,roughness:.4,side:T.DoubleSide});
const bodyWhite=material('#d7d8ce'),buttonBlue=material('#0759c9'),tantalum=material('#c6ad36');
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const NUCLEO_PARTS=[
 part('cpu','STM32F401RET6','CORTEX-M4 MICROCONTROLLER','The 64-contact target microcontroller runs the application. It includes a floating-point unit, 512 KB of flash and 96 KB of SRAM; the maximum core clock is 84 MHz.',P(32.5,59.3,1.8),[0,24,1],[['Core','Arm Cortex-M4F'],['Clock','84 MHz maximum'],['Package','LQFP-64 · 10 × 10 mm']]),
 part('stlink','ST-LINK/V2-1 debugger','ON-BOARD PROGRAMMER','A separate STM32F103CBT6 on the upper breakaway section provides SWD programming, debugging and a virtual COM port. It is distinct from the F401 application processor.',P(35,15.2,1.8),[0,20,-8],[['Controller','STM32F103CBT6'],['Package','LQFP-48'],['Interface','SWD / virtual COM']]),
 part('usb','ST-LINK USB connector','MINI-B POWER & DATA','The five-contact Mini-B connector powers the board and connects the integrated ST-LINK/V2-1 debugger to a host computer. It is not a native USB connector for the target application.',P(47,3.1,3),[7,13,-8],[['Connector','USB Mini-B'],['Contacts','5'],['Function','ST-LINK programming']]),
 part('arduino','Arduino Uno headers','32 FEMALE CONTACTS','Four female socket banks provide Arduino Uno V3 shield connectivity. The 10-, 8-, 8- and 6-position banks preserve the nonuniform digital-header gap and 2.54 mm pin pitch.',P(59.13,55,7),[10,15,0],[['Banks','10 + 8 + 8 + 6'],['Pitch','2.54 mm'],['Bank spacing','48.26 mm']]),
 part('morpho','ST morpho headers','76 MALE CONTACTS','Two 38-position, dual-row headers expose the microcontroller signals and power rails. Their long posts can be accessed from either side of the PCB.',P(65.48,54.56,6),[-10,18,0],[['Contacts','2 × 38'],['Rows','2 × 19 per header'],['Pitch','2.54 mm']]),
 part('buttons','User & reset buttons','BLUE USER · BLACK RESET','The blue B1 button is connected to PC13 for application use. Black B2 resets the target microcontroller. They sit below the breakaway debugger section.',P(35,29.2,3),[0,13,-3],[['B1','User input · PC13'],['B2','Target reset']]),
 part('power','Power regulation','3.3 V SUPPLY & POWER SELECTION','The linear regulator and support devices provide the 3.3 V rail. JP5 selects the incoming 5 V supply and JP6 is the target current-measurement link; their physical jumpers are in the debug/jumper group.',P(28,36.8,2),[-4,14,1],[['Target rail','3.3 V'],['Input selection','JP5'],['Current link','JP6 / IDD']]),
 part('clocks','Clock components','DEBUGGER CRYSTAL & TARGET LSE','X1 supplies the debugger clock and X2 is the 32.768 kHz low-speed crystal on this C-03-style board. The target HSE X3 footprint remains unpopulated; the default high-speed reference comes from ST-LINK MCO.',P(25.3,19,2),[-6,13,2],[['X1','8 MHz · debugger'],['X2','32.768 kHz · target LSE'],['X3','Unpopulated HSE footprint']]),
 part('debug','Debug headers & jumpers','SWD, SERIAL & POWER LINKS','The six-pin SWD connector, CN3 serial pins and two fitted CN2 shunts support the debugger. Power links and underside spare-jumper positions are included with this group.',P(10.2,16.5,5),[-8,12,-6],[['CN4','6-pin SWD'],['CN2','2 fitted shunts'],['Other links','JP1 / JP5 / JP6']]),
 part('leds','Status LEDs','COMMUNICATION · USER · POWER','LD1 reports ST-LINK communication, LD2 is the application-controlled LED on Arduino D13, and LD3 indicates board power.',P(43.2,43.7,1.7),[6,11,2],[['LD1','ST-LINK communication'],['LD2','User / Arduino D13'],['LD3','Power']]),
 part('smd','SMD components','PASSIVES & SUPPORT PACKAGES','The small resistors, capacitors and transistors form one selectable group. Their visible placement is reconstructed from ST’s board drawing; values and hidden copper routing are not invented.',P(45,39,1.2),[0,8,0],[['Placement','Manufacturer drawing'],['Grouping','Support packages']]),
 part('board','White Nucleo PCB','MB1136 · WHITE & BLUE','The 70 × 82.5 mm white PCB carries blue identification artwork, Arduino-compatible headers and the scored ST-LINK breakaway section. Routed slots retain the narrow connecting bridges.',P(15,67,.8),[0,0,0],[['Envelope','70 × 82.5 mm'],['Reference','MB1136 C-03 style'],['Thickness','1.6 mm assumed']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));

// Connector coordinates follow UM1724 Figure5. Origin: upper-left board edge.
const last=77.42;
const headers=[
 {id:'CN7',group:'morpho',x:4.52,v:last-9*2.54,rows:2,count:19,female:false},
 {id:'CN10',group:'morpho',x:65.48,v:last-9*2.54,rows:2,count:19,female:false},
 {id:'CN6',group:'arduino',x:10.87,v:last-7*2.54-3.5*2.54,rows:1,count:8,female:true},
 {id:'CN8',group:'arduino',x:10.87,v:last-2.5*2.54,rows:1,count:6,female:true},
 {id:'CN5',group:'arduino',x:59.13,v:last-7*2.54-4.064-4.5*2.54,rows:1,count:10,female:true},
 {id:'CN9',group:'arduino',x:59.13,v:last-3.5*2.54,rows:1,count:8,female:true}
];
const headerPads=headers.flatMap(h=>Array.from({length:h.rows},(_,r)=>Array.from({length:h.count},(_,i)=>[h.x+(r-(h.rows-1)/2)*2.54,h.v+(i-(h.count-1)/2)*2.54,1])).flat());
const holes=[[10.87,27.85,3.2],[59.13,29.25,3.2],[43.89,79.9,3.2]];
const debugPads=[[22.3,6.45,1,4,'CN2'],[8.3,15.7,1,6,'CN4'],[12.1,21.25,1,2,'CN3'],[34.1,2.6,2,1,'JP1'],[45.8,35,3,1,'JP5'],[33.1,41.3,2,1,'JP6']];
function outline(){
 const s=new T.Shape(),move=(x,v)=>s.moveTo(x-35,41.25-v),line=(x,v)=>s.lineTo(x-35,41.25-v),quad=(cx,cv,x,v)=>s.quadraticCurveTo(cx-35,41.25-cv,x-35,41.25-v);
 move(0,0);line(70,0);line(70,24.65);line(54.5,24.65);quad(54,24.65,54,25.15);quad(54,25.65,54.5,25.65);line(70,25.65);line(70,80.3);line(48.8,80.3);line(46.5,82.5);line(13.5,82.5);line(11.2,80.3);line(0,80.3);line(0,25.65);line(15.8,25.65);quad(16.3,25.65,16.3,25.15);quad(16.3,24.65,15.8,24.65);line(0,24.65);s.closePath();
 for(const[a,b]of[[18.8,39.5],[42,51.4]]){const p=new T.Path(),v=41.25-25.15;p.moveTo(a-35,v-.5);p.lineTo(b-35,v-.5);p.absarc(b-35,v,.5,-Math.PI/2,Math.PI/2,false);p.lineTo(a-35,v+.5);p.absarc(a-35,v,.5,Math.PI/2,Math.PI*1.5,false);p.closePath();s.holes.push(p);}
 for(const[x,v,d]of [...holes,...headerPads]){const p=new T.Path();p.absarc(x-35,41.25-v,d/2,0,Math.PI*2,true);s.holes.push(p);}return s;
}
const toRef=(x,y)=>[(x-268)/601*70,(y-264)/708*82.5];
// Centres sampled from ST's Figure5, rather than a procedural component scatter.
const smallPixels=[[374, 324],[386, 324],[374,350],[391,351],[373,371],[392,372],[370,393],[391,395],[410,387],[434,382],[438,401],[438,417],[438,433],[411,421],[521, 325],[521,341],[539, 323],[550, 322],[568, 323],[582, 324],[644,346],[658,345],[673,346],[688,346],[644,361],[658,361],[673,361],[689,361],[703,347],[711, 328],[711,345],[734,357],[748,357],[763,357],[779,357],[793,357],[809,357],[593,414],[594,431],[612,412],[613,430],[713,420],[730,422],[748,420],[716,438],[733,440],[750,438],[562,449],[579,449],[536,493],[551,493],[557,510],[559,525],[559,543],[560,559],[536,563],[483,626],[485,649],[468,667],[496,667],[498,687],[460,713],[468,735],[647,710],[649,733],[650,752],[625,807],[645,805],[638,825],[451,855],[467,856],[479,856],[491,856],[505,856],[518,856],[532,856],[453,875],[467,875],[478,875],[493,875],[506,875],[519,875],[533,875],[458,921],[481,921],[495,922],[508,922]];
function boardArt(shape,bottom=false){
 const tx=texture(1400,1650,g=>{g.scale(20,20);g.fillStyle=blue;g.strokeStyle=blue;g.lineWidth=.09;
  const label=(txt,x,v,size=.8,rot=0)=>{g.save();g.translate(x,v);g.rotate(rot);if(bottom)g.scale(-1,1);g.font=`${size}px sans-serif`;g.textAlign='center';g.fillText(txt,0,0);g.restore();};
  if(bottom){label('NUCLEO-F401RE',35,43,2);label('MB1136 C-03',35,46,1);label('ST-LINK / SWD',35,16,1.3);return;}
  label('ST-LINK',20.8,10.7,1.1,-Math.PI/2);label('Nucleo',7,11.8,1.2);label('SWD',8.2,8.2,.9);label('USB PWR',41.5,5.5,.9,-Math.PI/2);label('CN1',54,8.5,.8);label('COM',61.7,10.8,.8);label('MB1136',9, 32,1.5);label('rev C',8.6,34,1);label('USER',20,27.1,.9);label('RESET',45.3,27.1,.9);label('NUCLEO-F401RE',35,48.5,1.25);label('JP5',49, 32.5,.8);label('PWR',45,37.7,.8);label('IDD',33,43.5,.8);label('CN7',3.9,79.5,.9);label('CN10',65,79.5,.9);label('www.st.com/stm32nucleo',27.5,80.4,1.25);
  g.save();g.translate(48,73.5);g.font='italic bold 7px sans-serif';g.fillText('ST',0,0);g.restore();
  const upper=['SCL/D15','SDA/D14','AVDD','GND','SCK/D13','MISO/D12','MOSI/D11','PWM/D10','PWM/D9','D8'],lower=['D7','PWM/D6','PWM/D5','D4','PWM/D3','D2','TX/D1','RX/D0'];
  for(const[h,list]of[[headers[4],upper],[headers[5],lower]])for(let i=0;i<h.count;i++)label(list[i],53.5,h.v+(i-(h.count-1)/2)*2.54+.25,.82);
  for(const[h,list]of[[headers[2],['','IOREF','NRST','3V3','5V','GND','GND','VIN']],[headers[3],['A0','A1','A2','A3','A4','A5']]])for(let i=0;i<h.count;i++)label(list[i],14.1,h.v+(i-(h.count-1)/2)*2.54+.25,.85);
  for(const[px,py]of smallPixels){const[x,v]=toRef(px,py);g.strokeRect(x-.8,v-.55,1.6,1.1);}
  // X3 remains an empty plated footprint, as specified for the default board.
  g.strokeRect(25.3,71.1,10.7,4.3);label('X3',37,74.8,.9);label('X2',18.4,72.6,.9);label('X1',23.7,22,.9);
 });
 const geo=new T.ShapeGeometry(shape,16),p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+35)/W,(p.getY(i)+41.25)/D);geo.rotateX(-Math.PI/2);
 return{geo,mat:new T.MeshStandardMaterial({map:tx,transparent:true,side:T.DoubleSide,roughness:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})};
}
function button(parent,x,v,color){const [xx,,z]=P(x,v);box(parent,6,1.5,6,[xx,1.65,z],M.silver,.18);for(const s of [-1,1])for(const t of [-1,1]){box(parent,.8,.3,1.2,[xx+s*3.2,1,z+t*2],M.silver,.025);mesh(new T.CylinderGeometry(.55,.55,.3,16),M.black,parent,[xx+s*2.2, 2.54,z+t*2.2]);}mesh(new T.CylinderGeometry(2,2,1.5, 32),color,parent,[xx,3,z]);}
export function buildNucleo(){
 const{root,groups}=makeAssembly(NUCLEO_PARTS),shape=outline(),geo=new T.ExtrudeGeometry(shape,{depth:TH,bevelEnabled:false,curveSegments:14});geo.rotateX(-Math.PI/2);geo.translate(0,-.8,0);const board=mesh(geo,material('#e4e4d9',0,.72),groups.board);board.userData.pcb=true;board.userData.dimensions=[W,TH,D];
 for(const bottom of[false,true]){const a=boardArt(shape,bottom);mesh(a.geo,a.mat,groups.board,[0,bottom?-.817:.817,0]);}
 const ring=(x,v,d)=>{for(const y of[-.813,.813]){const r=new T.RingGeometry(d/2,d/2+.3,20);r.rotateX(-Math.PI/2);mesh(r,padMaterial,groups.board,P(x,v,y));}};for(const[x,v,d]of headerPads)ring(x,v,d);
 for(const h of headers){const[x,,z]=P(h.x,h.v),g=pinHeader(groups[h.group],{x,z,rows:h.rows,count:h.count,pitch:2.54,female:h.female,height:h.female?8.5:2.5,pinLength:10.5});g.name=h.id;g.userData.reference=h.id;}
 let[x,,z]=P(32.5,59.3);ic(groups.cpu,{x,z,width:10,depth:10,height:1.4,pins:64,pitch:.5,label:'STM32F401',base:.8});textDecal(groups.cpu,'RET6',6,1.8,[x,2.35,z+2.1],{size:72,color:'#8f9392'});
 [x,,z]=P(35,15.2);ic(groups.stlink,{x,z,width:7,depth:7,height:1.3,pins:48,pitch:.5,label:'STM32F103',base:.8});
 [x,,z]=P(47,3.1);usbPort(groups.usb,'mini',{x,z,base:.8,rotation:Math.PI});
 button(groups.buttons,26.5,29.2,buttonBlue);button(groups.buttons,43.5,29.2,M.black);
 // SOT-223 body, three narrow terminals and its broad thermal tab.
 [x,,z]=P(28.5,36.5);box(groups.power,3.6,1.65,6.6,[x,1.85,z],M.black,.1);box(groups.power,3.1,.2,3,[x+2.8,.99,z],M.silver,.03);for(let i=0;i<3;i++)box(groups.power,1.65,.2,.7,[x-2.4,.99,z+(i-1)*2.1],M.silver,.025);textDecal(groups.power,'3V3',3,4,[x,2.69,z],{size:82});
 for(const[xx,v]of[[21.8,37.6],[36.5,36.4]]){[x,,z]=P(xx,v);box(groups.power,2,1.8,3.4,[x,1.75,z],tantalum,.1);for(const s of[-1,1])box(groups.power,2.1,.2,.4,[x,.98,z+s*1.7],M.silver,.02);}
 [x,,z]=P(43.5,39);ic(groups.power,{x,z,width:3,depth:3,height:.8,label:'',pins:0});
 [x,,z]=P(25.4,17.5);box(groups.clocks,3.4,2,8,[x,1.85,z],M.silver,1.4);textDecal(groups.clocks,'8.000',2.6,5.5,[x,2.88,z],{size:75,color:'#737875'});
 [x,,z]=P(20.3,73.3);box(groups.clocks,3.2,.9,5.2,[x,1.3,z],M.black,.15);for(const s of[-1,1])box(groups.clocks,3.5,.15,.7,[x,.94,z+s*2.5],M.silver,.025);
 for(const xx of[27.5,33.8])ring(xx,73.2,1.1);
 for(const[xx,v,rows,count,name]of debugPads){[x,,z]=P(xx,v);const g=pinHeader(groups.debug,{x,z,rows,count,height:2.1,pinLength:8});g.name=name;g.userData.reference=name;
  if(name==='CN2')for(const vv of[-2.54, 2.54])box(groups.debug,2.45,2.9,5.02,[x,5.25,z+vv],M.black,.14);
  // Default USB-powered configuration: JP1 open, JP5 U5V (pins1–2), JP6 fitted.
  if(['JP5','JP6'].includes(name))box(groups.debug,5.05,2.7,2.45,[x+(name==='JP5'?1.27:0),5,z],M.black,.14);
 }
 for(const xx of[3.25,66.75]){const g=new T.Group();g.rotation.z=Math.PI;groups.debug.add(g);[x,,z]=P(xx,5.1);pinHeader(g,{x:-x,z,rows:1,count:2,base:.8,height:2.1,pinLength:7});}
 for(const[px,py]of smallPixels){const[xx,v]=toRef(px,py);[x,,z]=P(xx,v);passive(groups.smd,{x,z,width:1.2,depth:.65,base:.8,color:py<370?'#373b38':'#b19e80'});}
 for(const[xx,v,c]of[[61.5,7.2,'#b04d42'],[43.2,43.7,'#5b985a'],[23,43.7,'#b94a3d']]){[x,,z]=P(xx,v);box(groups.leds,2,.7,1.3,[x,1.22,z],bodyWhite,.08);box(groups.leds,1.1,.12,.8,[x,1.64,z],indicatorMaterial(c,xx===23?'power':'activity',xx===61.5?1.2:0),.03);}
 // Visible upper-section regulator / transistor packages, photo-derived envelopes.
 for(const[xx,v,w,d]of[[49,20.1,3,2],[55,20.3,2.4,2.3],[61,21.5,4.8,3.4],[19.8,35,3.6,2.2]]){[x,,z]=P(xx,v);ic(groups.smd,{x,z,width:w,depth:d,height:.8,label:''});}
 root.userData={board:'nucleo',dimensions:[W,TH,D],arduinoContacts:32,morphoContacts:76,headerPitch:2.54,arduinoRowSpacing:48.26,outerMorphoColumns:63.5,digitalHeaderGap:4.064,unpopulatedTargetHSE:true,reference:'UM1724 Fig5 / MB1136 C-03'};
 return finishAssembly(root,groups,NUCLEO_PARTS);
}
export const NUCLEO_BOARD={id:'nucleo',tab:'STM32 Nucleo',title:'STM32<br>Nucleo-F401RE',edition:'009',subtitle:'The classic white and blue development board.',intro:'Explore the target microcontroller, integrated debugger and expansion headers.',model:'STMicroelectronics NUCLEO-F401RE / MB1136 C-03',basis:'Manufacturer drawing & dimensions',dimensions:'70 × 82.5 MM',parts:NUCLEO_PARTS,build:buildNucleo,half:66,camera:[100,110,125],target:[0,8,0],start:0,stats:[['84','MHz','CORTEX-M4F'],['512','KB','FLASH'],['96','KB','SRAM'],['76','PINS','ST MORPHO']],sources:[['STMicroelectronics · UM1724 user manual','https://www.st.com/resource/en/user_manual/dm00105823-nucleo-f401re-user-manual-stmicroelectronics.pdf'],['STMicroelectronics · NUCLEO-F401RE','https://www.st.com/en/evaluation-tools/nucleo-f401re.html'],['ST-authored UM1724 Rev14 · archived copy','https://webcms3.cse.unsw.edu.au/files/36a49249be66c1b00456439cf7c0fdac4f49d727b91f1a2923218cb1a3fcc627']],accuracy:'The 70 × 82.5 mm envelope, 76 ST morpho positions, 32 Arduino contacts, 2.54 mm pitches, 48.26 mm Arduino spacing and 4.064 mm digital-header gap follow ST’s mechanical drawing. Component centers, breakaway slots, blue artwork and hole bores are reconstructed from the manufacturer drawing. PCB thickness and package heights are estimated. This C-03-style configuration includes X2 LSE but leaves target HSE X3 unpopulated as documented. Fine underside passives and hidden copper layers are omitted.',hidden:[]};
