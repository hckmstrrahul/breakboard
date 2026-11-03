import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import {mesh,box,material,texture,decal,M} from './model.js';
import {pinHeader,usbPort,ethernet,barrelJack,ic,passive,silk} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';
import {batchAssembly} from './batching.js';

const W=86.36,D=54.61,THICKNESS=1.5748;
const HOLES=[[-28.575,-24.13,3.175],[-28.575,24.13,3.175],[37.465,-20.955,3.175],[37.465,20.955,3.175]];
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const BEAGLE_PARTS=[
 part('cpu','Sitara AM3358','ARM CORTEX-A8 PROCESSOR','The Texas Instruments AM3358 combines a Cortex-A8 CPU with graphics and two programmable real-time units. The BGA package sits at the centre of the board.',[2.7,2,-1.3],[0,25,0],[['CPU','1 GHz Cortex-A8'],['Real-time units','2 × PRU'],['Package','BGA']]),
 part('memory','512 MB DDR3L','SYSTEM MEMORY','The external DDR3L package supplies the processor’s working memory. Its location follows the component-side reference photograph.',[20.4,2,3.8],[5,19,3],[['Capacity','512 MB'],['Type','DDR3L'],['Bus width','16-bit']]),
 part('emmc','4 GB eMMC','ONBOARD STORAGE','Revision C uses 4 GB of managed flash storage. The package is separate from the underside microSD expansion slot.',[-13.5,2,-13.7],[-4,19,-4],[['Capacity','4 GB'],['Interface','8-bit eMMC'],['Board revision','C']]),
 part('headers','P8 / P9 cape headers','92 EXPANSION CONTACTS','Two 46-contact female headers accept BeagleBone expansion boards, called capes. Both banks have two rows of 23 contacts on a 2.54 mm grid.',[5.08,7,23.495],[0,14,0],[['Banks','2 × 46 contacts'],['Each bank','2 × 23'],['Pitch','2.54 mm']]),
 part('ethernet','Ethernet connector','10/100 ETHERNET','The shielded RJ45 connector includes magnetics. Its recessed opening and eight contacts face the left edge of the board.',[-36,7,-2.5],[-10,12,0],[['Network','10/100 Mb/s'],['Connector','RJ45'],['Contacts','8']]),
 part('usb','USB host connector','USB 2.0 TYPE-A','The full-size USB host connector supports peripherals. Its metal shell and four signal/power contacts face the opposite end of the board.',[37.5,4,12.5],[9,12,3],[['Interface','USB 2.0 host'],['Connector','Type-A'],['Contacts','4']]),
 part('power','5 V power jack','DC POWER INPUT','The barrel connector provides a dedicated 5 V input. It is a power input, not a regulator for arbitrary adapter voltages.',[-38,5,18],[-9,12,4],[['Input','5 V DC'],['Centre contact','Positive'],['Barrel','5.5 / 2.1 mm']]),
 part('phy','LAN8710A Ethernet PHY','NETWORK TRANSCEIVER','This Ethernet physical-layer device connects the processor’s network interface to the RJ45 magnetics.',[-17.5,2,-3.5],[-3,19,0],[['Device','LAN8710A'],['Link','10/100 Mb/s']]),
 part('pmic','TPS65217C power management','POWER RAILS','The power-management IC supplies and sequences the rails required by the AM3358 and its memory.',[-20,2,12.3],[-5,21,4],[['Device','TPS65217C'],['Function','Power sequencing']]),
 part('display','TDA19988 HDMI transmitter','DIGITAL DISPLAY','The HDMI transmitter converts the processor’s display interface into the signal delivered by the underside micro-HDMI port.',[20.5,2,-12.4],[6,24,-3],[['Device','TDA19988'],['Output','Micro-HDMI'],['Audio','HDMI audio']]),
 part('underside','Underside connectors','USB DEVICE · MICRO-HDMI · MICROSD','Mini-USB device, micro-HDMI and microSD connectors sit beneath the PCB. This group separates downward to expose their metal shells and contacts.',[32,-2,-8],[0,-9,0],[['USB device','Mini-B'],['Display','Micro-HDMI'],['Storage','microSD']]),
 part('buttons','Power, reset & boot buttons','THREE MOMENTARY SWITCHES','Power and reset switches sit near the left edge. The boot-selection switch is near the microSD end of the board.',[-33,2,-19],[0,12,-5],[['S1','Reset'],['S2','Boot select'],['S3','Power']]),
 part('uart','Serial debug header','J1 · UART0 CONSOLE','The six-pin serial header gives access to the boot console through a 3.3 V serial adapter. It is separate from the P8 and P9 cape headers.',[6.3,4.5,20.2],[0,12,5],[['Header','J1 · 6 positions'],['Interface','UART0 · 3.3 V']]),
 part('leds','Power & user LEDs','POWER · USR0–USR3','Four user LEDs indicate software-controlled activity and a separate LED indicates power. Playback uses illustrative activity rather than live operating-system status.',[-40,1.5,-17.15],[-5,10,-2],[['User indicators','4 · USR0–USR3'],['Power indicator','1']]),
 part('smd','SMD components','CLOCKS · FILTERS · PASSIVES','Small passives, clocks and supporting packages form one selectable group. Their visible placement is reconstructed from official photographs; individual passive values are not inferred.',[-3,2,12],[0,9,0],[['Location','Both sides'],['Grouping','One assembly'],['Layout','Photo reconstruction']]),
 part('board','BeagleBone Black PCB','REVISION C MAINBOARD','The black PCB uses the dimensioned official outline: 3.400 × 2.150 inches, including the unequal corner radii and four mounting holes. The cape header footprint has 92 plated through-holes.',[0,.8,11],[0,0,0],[['Outline','86.36 × 54.61 mm'],['PCB layers','6'],['Thickness','1.5748 mm']])
];
BEAGLE_PARTS.forEach((p,i)=>{p.n=String(i+1).padStart(2,'0');p.detail=!['cpu','memory','emmc','headers','board'].includes(p.id);});

function boardOutline(){
 const s=new T.Shape(),l=-W/2,r=W/2,b=-D/2,t=D/2,rl=6.35,rr=12.7;
 s.moveTo(l+rl,b);s.lineTo(r-rr,b);s.absarc(r-rr,b+rr,rr,-Math.PI/2,0,false);s.lineTo(r,t-rr);s.absarc(r-rr,t-rr,rr,0,Math.PI/2,false);s.lineTo(l+rl,t);s.absarc(l+rl,t-rl,rl,Math.PI/2,Math.PI,false);s.lineTo(l,b+rl);s.absarc(l+rl,b+rl,rl,Math.PI,Math.PI*1.5,false);
 for(const[x,z,d]of HOLES){const h=new T.Path();h.absarc(x,-z,d/2,0,Math.PI*2,true);s.holes.push(h);}
 for(const side of [-1,1])for(const row of [-1,1])for(let i=0;i<23;i++){const x=5.08+(i-11)*2.54,z=side*23.495+row*1.27;const h=new T.Path();h.absarc(x,-z,.48,0,Math.PI*2,true);s.holes.push(h);}
 const geo=new T.ExtrudeGeometry(s,{depth:THICKNESS,bevelEnabled:false,curveSegments:18});geo.rotateX(-Math.PI/2);geo.translate(0,-THICKNESS/2,0);return geo;
}
function qfn(parent,{x,z,width,depth,height=1,label,pins,pitch}){
 const g=ic(parent,{x,z,width,depth,height,label});
 for(let i=0;i<pins/4;i++)for(const sign of [-1,1]){const p=(i-(pins/4-1)/2)*pitch;box(g,pitch*.55,.15,.35,[p,.87,sign*(depth/2-.03)],M.silver,.012);box(g,.35,.15,pitch*.55,[sign*(width/2-.03),.87,p],M.silver,.012);}
 g.userData.package={pins,width,depth,type:'QFN'};return g;
}
function soic8(parent,x,z){const g=ic(parent,{x,z,width:3,depth:4,height:1});for(const side of[-1,1])for(let i=0;i<4;i++)box(g,.8,.18,.4,[side*1.75,.93,(i-1.5)*1.0],M.silver,.025);g.userData.package={pins:8,type:'SOIC'};}
function pushButton(parent,x,z){box(parent,5.2,1.3,3.7,[x,1.44,z],M.silver,.22);box(parent,2.4,1.2,1.8,[x,2.5,z],M.black,.48);for(const sign of [-1,1])for(const dz of [-1.15,1.15])box(parent,.8,.3,.65,[x+sign*2.65,1,z+dz],M.silver,.05);}
function bottomGroup(parent){const g=new T.Group();g.rotation.x=Math.PI;parent.add(g);return g;}
function microSD(parent,x,z){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=Math.PI/2;parent.add(g);
 box(g,14.4,.3,14.7,[0,2.5,0],M.silver,.1);box(g,13.5,.6,13.8,[0,1.08,-.25],M.black,.08);
 for(const sign of [-1,1])box(g,.32,1.7,14.5,[sign*7.04,1.6,0],M.silver,.05);
 box(g,14,1.6,.35,[0,1.6,-7.1],M.silver,.05);
 for(let i=0;i<8;i++)box(g,.7,.18,4.2,[(i-3.5)*1.1,1.48,-4.1],M.gold,.02);
 for(const sign of [-1,1])box(g,2.4,.1,1.1,[sign*5.2,2.72,3.5],M.black,.05);
 g.userData.connector={type:'microSD',contacts:8};
}
export function buildBeagleBone(){
 const{root,groups}=makeAssembly(BEAGLE_PARTS),board=groups.board;
 const body=mesh(boardOutline(),material('#181d1c',0,.7),board);body.userData.pcb=true;body.userData.dimensions=[W,THICKNESS,D];body.userData.holes=HOLES;
 for(const[x,z,d]of HOLES){for(const y of [THICKNESS/2+.012,-THICKNESS/2-.012]){const ring=mesh(new T.RingGeometry(d/2,d/2+.65,32),M.gold,board,[x,y,z]);ring.rotation.x=y>0?-Math.PI/2:Math.PI/2;}}
 for(const side of [-1,1])for(const row of [-1,1])for(let i=0;i<23;i++){const x=5.08+(i-11)*2.54,z=side*23.495+row*1.27;const ring=mesh(new T.RingGeometry(.48,.78,12),M.silver,board,[x,-.797,z]);ring.rotation.x=Math.PI/2;}
 const white='#cbd3ca';
 silk(board,'beaglebone',10,12.1,17,3.2,{color:white});silk(board,'beagleboard.org',27,-1.5,20,2.4,{color:white,rotation:Math.PI/2});
 silk(board,'AM335x',0,-10,10,2.1,{color:white});silk(board,'P8',-22,-19.9,3,1.8,{color:white});silk(board,'P9',-22,19.9,3,1.8,{color:white});
 silk(board,'10/100 Ethernet',-32,7.3,18,1.9,{color:white});silk(board,'5V',-39,11.8,4,2,{color:white});silk(board,'USB Host',33,20.4,11,1.7,{color:white});
 silk(board,'RESET',-35,-25,8,1.5,{color:white});silk(board,'POWER',-35,-10,8,1.5,{color:white});silk(board,'BOOT',34,-19,6,1.5,{color:white});
 silk(board,'BEAGLEBONE BLACK',3,26,27,1.5,{color:white});
 ic(groups.cpu,{x:2.7,z:-1.3,width:15,depth:15,height:1.3,label:'TI AM3358'});
 ic(groups.memory,{x:20.4,z:3.8,width:8,depth:13,height:1.1,label:'DDR3L'});
 ic(groups.emmc,{x:-13.5,z:-13.7,width:12,depth:12,height:1,label:'eMMC · 4GB'});
 qfn(groups.phy,{x:-17.5,z:-3.5,width:5,depth:5,height:.85,label:'LAN8710',pins:32,pitch:.5});
 qfn(groups.pmic,{x:-20,z:12.3,width:6,depth:6,height:1,label:'TPS65217',pins:48,pitch:.4});
 qfn(groups.display,{x:20.5,z:-12.4,width:9,depth:9,height:1,label:'NXP HDMI',pins:64,pitch:.5});
 for(const z of [-23.495,23.495])pinHeader(groups.headers,{x:5.08,z,rows:2,count:23,axis:'x',female:true,height:8.4,base:THICKNESS/2});
 ethernet(groups.ethernet,{x:-35.5,z:-2.5,base:.7874,rotation:-Math.PI/2});
 usbPort(groups.usb,'a',{x:37.5,z:12.5,base:.7874,rotation:Math.PI/2});
 barrelJack(groups.power,{x:-38,z:18,base:.7874,rotation:-Math.PI/2});
 const under=bottomGroup(groups.underside);
 usbPort(under,'mini',{x:-40,z:18,base:.7874,rotation:-Math.PI/2});
 usbPort(under,'micro-hdmi',{x:40.8,z:1,base:.7874,rotation:Math.PI/2});microSD(under,36.2,11.3);
 pushButton(groups.buttons,-35.2,-23.6);pushButton(groups.buttons,-35.2,-13.8);pushButton(groups.buttons,33.5,-15.4);
 const smd=groups.smd;
 // Explicit photo-derived component fields, never synthetic copper traces.
 const fields=[[-2,-18.4,7,1.5,3],[.3,-14.8,6,1.5,3],[-10.4,-3.2,9,1.2,1],[-33,-17.2,3,1.45,3],[-32,10.6,5,1.4,2],[29.8,-11.4,5,1.3,2],[15.2,-19.5,13,1.2,1],[-5.5,7.2,4,1.5,2],[-5.5,13.4,5,1.3,2],[4.5,9,4,1.5,2],[16,17,5,1.4,1]];
 for(const[x,z,n,pitch,rows]of fields)for(let row=0;row<rows;row++)for(let i=0;i<n;i++)passive(smd,{x:x+i*pitch,z:z+row*1.8,width:1,depth:.5,color:(i+row)%4?'#1e2220':'#b8a68a'});
 for(const[x,z]of[[-14.7,12],[-12.3,12],[-19,18.7],[-15,18.7],[-10,18.7],[13.5,13.6],[12.5,17.3]])passive(smd,{x,z,width:2.1,depth:1.3});
 for(const[x,z,w,d]of[[-18,2.2,5,3],[8,12.5,4,7],[-3,-14.8,3.2,2.5]]){box(smd,w,.8,d,[x,1.3,z],M.silver,.3);box(smd,w-.5,.03,d-.5,[x,1.72,z],M.black,.2);}
 pinHeader(groups.uart,{x:6.3,z:20.2,count:6,axis:'x',height:2.5,pinLength:6.2});
 for(let i=0;i<4;i++){box(groups.leds,1.6,.6,.9,[-40,1.15,-20+i*1.9],indicatorMaterial('#6da8ed','activity',i*.9),.12);}
 box(groups.leds,1.6,.6,.9,[-39.5,1.15,11.5],indicatorMaterial('#6da8ed'),.12);
 const can=mesh(new T.CylinderGeometry(3,3,4.9,32),M.black,smd,[22,3.3,17.2]);
 mesh(new T.CylinderGeometry(2.82,2.82,.12,32),M.silver,smd,[22,5.81,17.2]);silk(smd,'100',22,17.2,4,2,{y:5.9,color:'#303431'});
 const underside=bottomGroup(smd);
 for(const[x,z,n]of[[-8,-7,12],[-4,-3,10],[11,15,12],[24,12,11],[-20,8,8]])for(let i=0;i<n;i++)passive(underside,{x:x+(i%4)*1.7,z:z+Math.floor(i/4)*2,width:1,depth:.55});
 // U4, U6 and U8 are located against the official underside photograph.
 for(const[x,z]of[[-29.5,-10],[1.3,-16.4],[35.3,-12.7]])soic8(underside,x,z);
 root.userData={board:'beaglebone',dimensions:[W,D],pcbThickness:THICKNESS,mountingHoles:HOLES,capeContacts:92,reference:'BeagleBoard official dimensioned drawing + product photographs'};
 return batchAssembly(finishAssembly(root,groups,BEAGLE_PARTS));
}
export const BEAGLE_BOARD={id:'beaglebone',tab:'BeagleBone Black',title:'BeagleBone<br>Black',edition:'008',subtitle:'Open hardware. Real-time control.',intro:'Explore the Sitara processor and the cape interface of the classic BeagleBone Black.',model:'BeagleBone Black Rev C',basis:'Official drawings + photo reconstruction',dimensions:'86.36 × 54.61 MM',parts:BEAGLE_PARTS,build:buildBeagleBone,half:65,camera:[-100,115,125],target:[0,10,0],start:0,stats:[['1','GHz','CORTEX-A8'],['512','MB','DDR3L MEMORY'],['4','GB','EMMC STORAGE'],['92','PINS','CAPE CONTACTS']],sources:[['BeagleBoard · Mechanical drawing','https://docs.beagleboard.org/boards/beaglebone/black/ch09.html'],['BeagleBoard · Product photographs','https://docs.beagleboard.org/boards/beaglebone/black/ch10.html'],['BeagleBoard · System reference','https://docs.beagleboard.org/boards/beaglebone/black/ch04.html']],accuracy:'The PCB outline, corner radii and mounting-hole locations follow the official dimensioned drawing, whose 3.400 × 2.150 inch dimensions give 86.36 × 54.61 mm. The prose on that page contains inconsistent conversions; this model follows the drawing. Header counts and pitch are preserved. Package positions, body heights, connector interiors and silkscreen are reconstructed from official photographs. Passive values, buried routing and internal silicon are not inferred. This is an explanatory reconstruction, not manufacturing CAD.',license:'BeagleBoard documentation and reference imagery © BeagleBoard.org Foundation, CC BY-SA 4.0. The reconstructed BeagleBone geometry is offered under the same license.',hidden:[]};
