import {indicatorMaterial} from './hardware-motion.js';
import * as T from 'three';
import {mesh,box,material,M} from './model.js';
import {pcb,pinHeader,usbPort,ethernet,ic,passive,silk} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';
import {batchAssembly} from './batching.js';
const part=(id,name,kind,description,specs,anchor,offset,detail=false)=>({id,name,short:name.toUpperCase(),kind,description,specs,anchor,offset,detail});
export const ORANGEPI_PARTS=[
 part('cpu','Rockchip RK3588S','APPLICATION PROCESSOR','The RK3588S integrates four Cortex-A76 and four Cortex-A55 CPU cores, Mali-G610 graphics and an NPU. This is the original Orange Pi 5, with RK3588S rather than the RK3588 fitted to the 5 Plus.',[['CPU','4 × A76 + 4 × A55'],['Big-core clock','Up to 2.4 GHz'],['NPU','Up to 6 TOPS']],[-4.2,2,1.2],[0,24,0]),
 part('memory','LPDDR4 / LPDDR4X memory','TWO MEMORY PACKAGES','Two packages provide system memory around the processor. The package arrangement follows the original blue-board reference; available capacities depend on the board variant.',[['Packages','2'],['Type','LPDDR4 / LPDDR4X'],['Capacity','Variant dependent']],[-15,2,-10],[-4,19,-3]),
 part('ports','External connectors','USB, HDMI, NETWORK & AUDIO','The original board has three USB-A ports, separate USB-C power and data ports, full-size HDMI, Gigabit Ethernet and a 3.5 mm audio jack. One USB 2.0 port shares its interface with USB-C.',[['USB-A','1 × USB 3.0 + 2 × USB 2.0'],['Display','HDMI + USB-C DP'],['Ethernet','Gigabit']],[43,8,2],[9,14,5]),
 part('headers','26-pin expansion header','2 × 13 CONTACTS','The original Orange Pi 5 uses a 26-pin expansion header for GPIO, UART, PWM, I²C, SPI and CAN. It is not the 40-pin header found on some other Orange Pi models.',[['Contacts','26'],['Pitch','2.54 mm'],['Layout','2 × 13']],[-23,5,-28],[0,18,-7]),
 part('board','Orange Pi 5 PCB','XUNLONG · ORIGINAL BLUE BOARD','The 100 × 62 mm PCB, blue solder mask and characteristic connector arrangement follow Xunlong’s original Orange Pi 5 photographs. Hole centers and minor body dimensions are estimated from those images.',[['Envelope','100 × 62 mm'],['Manufacturer','Shenzhen Xunlong'],['Reference','Original Pi 5 / V1.3.x']], [20,.8,2],[0,0,0]),
 part('power','RK806 power management','REGULATORS & INDUCTORS','The RK806-1 power-management IC and nearby inductors generate the rails used by the processor and memory. Power enters through the dedicated 5 V USB-C input.',[['Controller','RK806-1'],['Input','5 V / 4 A'],['Role','Power regulation']],[-40,3,8],[-7,17,2],true),
 part('storage','microSD socket','REMOVABLE BOOT STORAGE','The top-mounted microSD socket opens at the left edge. It supplies removable boot and file storage; no card is shown inserted.',[['Format','microSD'],['Location','Top / left edge']],[-43,2,-16],[-11,10,0],true),
 part('flash','SPI NOR flash','BOOT FLASH','The small SPI NOR package beside the Ethernet circuitry provides the board’s boot flash.',[['Capacity','16 MB'],['Interface','QSPI']], [16.5,2,1],[4,16,0],true),
 part('network','Ethernet PHY','YT8531C','The YT8531C physical-layer transceiver connects the RK3588S Ethernet interface to the Gigabit RJ45 connector.',[['Controller','YT8531C'],['Speed','10 / 100 / 1000 Mb/s']], [25,2,0],[5,22,0],true),
 part('ribbon','Camera & display connectors','MIPI INTERFACES','Three camera connectors and two display connectors are distributed across both sides of the PCB. Their latch and contact bodies are reconstructed from the manufacturer’s top and underside images.',[['Camera connectors','3'],['Display connectors','2'],['Interface','MIPI']], [20,3,26],[0,12,7],true),
 part('m2','M.2 expansion socket','UNDERSIDE KEY-M','The underside M.2 Key-M socket exposes PCIe 2.0 ×1 for NVMe storage or the supported wireless adapter. No SSD or wireless module is fitted in this base-board model.',[['Bus','PCIe 2.0 ×1'],['Key','M'],['Location','Underside']], [21,-3,14],[0,-9,0],true),
 part('controls','Buttons & auxiliary connections','RECOVERY, MASKROM & POWER','Power, recovery and MaskROM controls support normal use and firmware recovery. The group also includes the microphone and status LEDs; debug and fan connections are labeled separately.',[['Buttons','3'],['Indicators','2 status LEDs']], [-36,2,18],[-6,13,5],true),
 part('uart','Debug UART header','THREE-PIN SERIAL CONSOLE','The three-pin debug header exposes the board serial console for boot diagnostics and development. It is separate from the 26-pin expansion header.',[['Contacts','3'],['Function','Serial console']], [1.8,4,-29],[0,12,-5],true),
 part('fanheader','Fan connector','5 V COOLING CONNECTION','The two-contact fan socket provides a power connection for an optional cooling fan. No fan is fitted to this base-board model.',[['Contacts','2'],['Supply','5 V']], [34.2,4,17.3],[7,12,3],true),
 part('smd','SMD components','SUPPORT CIRCUITRY','Small surface-mount parts on both sides move together as one group. The visible clusters are reconstructed from photographs; the model does not claim an exact passive count, routing or electrical values.',[['Location','Top and underside'],['Layout','Photo reconstruction'],['Grouping','One assembly']], [-17,2,17],[0,8,0],true)
];
ORANGEPI_PARTS.forEach((p,i)=>p.n=String(i+1).padStart(2,'0'));
const toXZ=(x,z)=>[(x-921)/10.54,(z-672.5)/10.56];
function ribbon(parent,x,z,count=30,width=19.8,rotation=0,base=.8){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);box(g,width,1.4,4.3,[0,base+.7,0],material('#e1e0d3',0,.6),.08);box(g,width-1.1,.55,1.25,[0,base+1.67,.75],M.black,.06);for(let i=0;i<count;i++)box(g,.21,.15,1.2,[(i-(count-1)/2)*.5,base+.1,-2.25],M.silver,.015);g.userData.connector={type:'ffc',contacts:count};return g;}
function mezzanine(parent,x,z,base=.8){const g=new T.Group();g.position.set(x,0,z);parent.add(g);box(g,8.7,1.1,3.1,[0,base+.55,0],M.black,.05);for(let row of [-1,1])for(let i=0;i<15;i++)box(g,.22,.16,.45,[(i-7)*.5,base+.95,row*1.3],M.gold,.01);return g;}
function button(parent,x,z,rotation=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);box(g,2.8,1.1,4,[0,1.4,0],M.silver,.1);mesh(new T.CylinderGeometry(.8,.8,.7,16),M.black,g,[0,2.25,0]);return g;}
function microsd(parent){const g=new T.Group();g.position.set(-42.6,.8,-16.1);g.rotation.y=-Math.PI/2;parent.add(g);box(g,14.5,.18,15,[0,1.7,0],M.silver,.06);box(g,14.5,.18,15,[0,.1,0],M.silver,.06);for(const s of [-1,1])box(g,.2,1.6,15,[s*7.15,.9,0],M.silver,.03);box(g,13.9,1.45,.35,[0,.85,-7.3],M.black,.03);for(let i=0;i<8;i++)box(g,.5,.14,3.2,[(i-3.5)*1.1,.25,-4],M.gold,.015);for(const x of [-4.5,4.5])box(g,3,.06,.45,[x,1.82,2],M.black,.02);}
function audioJack(parent){const g=new T.Group();g.position.set(-29,0,26.5);parent.add(g);box(g,6.4,5.1,11.6,[0,3.35,0],M.black,.12);const s=new T.Shape();s.absarc(0,0,2.8,0,Math.PI*2);const h=new T.Path();h.absarc(0,0,1.75,0,Math.PI*2,true);s.holes.push(h);mesh(new T.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:false,curveSegments:20}),M.silver,g,[0,3.35,5.4]);}
function qfn(parent,{x,z,width,depth,pins,pitch,height=.9,label}){
 const g=ic(parent,{x,z,width,depth,height,label});
 const count=pins/4;
 for(let i=0;i<count;i++)for(const side of [-1,1]){const p=(i-(count-1)/2)*pitch;box(g,pitch*.55,.18,.4,[p,.9,side*depth/2],M.silver,.012);box(g,.4,.18,pitch*.55,[side*width/2,.9,p],M.silver,.012);}
 g.userData.package={type:'QFN',pins,width,depth,pitch};return g;
}
function bootFlash(parent){
 const g=ic(parent,{x:16.5,z:1,width:5.3,depth:5.2,height:1.2,label:'NOR'});
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const z=(i-1.5)*1.27;
  box(g,.75,.18,.45,[side*3.425,.92,z],M.silver,.025);
  box(g,.18,.52,.45,[side*3.0,1.13,z],M.silver,.025);
  box(g,.55,.18,.45,[side*2.8,1.4,z],M.silver,.025);
 }
 g.userData.package={type:'SOIC',pins:8,pitch:1.27,body:[5.3,5.2],leadSpan:7.6};
}
export function buildOrangePi5(){
 const{root,groups}=makeAssembly(ORANGEPI_PARTS),board=groups.board;
 const holes=[[-47.2,-28.3,3.1],[47.2,-28.3,3.1],[-47.2,28.2,3.1],[47.2,28.2,3.1],[20.6,-28.3,3.1],[20.6,-16.2,3.1],[21.7,19.8,3.1],[-22.2,-20.5,3.1]];
 pcb(board,{width:100,depth:62,color:'#1768a0',holes,radius:1.4});
 for(const[x,z,d]of holes){const ring=new T.RingGeometry(d/2,d/2+1.15,32);ring.rotateX(-Math.PI/2);mesh(ring,material('#d3bd78',.58,.47),board,[x,.815,z]);}
 silk(board,'Orange pi',13,-9,18,4,{color:'#e3e7de'});silk(board,'OPi 5 V1.3.2',17,-6,18,2.5);silk(board,'HDMI',-12.5,20,7,2);silk(board,'TYPE-C',5.5,22,9,2);silk(board,'PWR IN',-38,22,8,2);silk(board,'LAN',39,-5,5,2);silk(board,'USB3.0',39,-26.8,9,1.8);silk(board,'LCD2',20,24,8,2);silk(board,'CAM1',22,13,6,1.8);silk(board,'UART',2,-26,7,1.6);silk(board,'26',-7.3,-24.5,2,1.3);silk(board,'1',-39.8,-24.5,1.5,1.3);
 ic(groups.cpu,{x:-4.2,z:1.2,width:17.4,depth:17.4,height:1.5,label:'RK3588S'});
 ic(groups.memory,{x:-19.8,z:.1,width:10.4,depth:15.4,height:1.1,label:'SAMSUNG'});ic(groups.memory,{x:-3.4,z:-14.6,width:15.3,depth:10.2,height:1.1,label:'LPDDR4X'});
 // Original Pi 5: one stacked USB 3/2 pair, a separate USB 2 port, two Type-Cs.
 usbPort(groups.ports,'a',{x:47,z:-17.4,rotation:Math.PI/2});usbPort(groups.ports,'a',{x:47,z:-17.4,base:8.5,rotation:Math.PI/2,contacts:9,tongueColor:'#236ca7'});
 usbPort(groups.ports,'a',{x:47,z:20.3,rotation:Math.PI/2});ethernet(groups.ports,{x:43.5,z:2.5,rotation:Math.PI/2});
 usbPort(groups.ports,'c',{x:-38.5,z:29.2});usbPort(groups.ports,'c',{x:5,z:29.2});usbPort(groups.ports,'hdmi',{x:-12.3,z:29.3});audioJack(groups.ports);
 const header=pinHeader(groups.headers,{x:-23.3,z:-28.0,rows:2,count:13,axis:'x',pinLength:8.1});
 // Colour coding is visible on the manufacturer’s original 26-pin block.
 const colors=['#ce3631','#347aa9','#347aa9','#202429','#347aa9','#347aa9','#202429','#347aa9','#c7c343','#347aa9','#347aa9','#347aa9','#202429'];
 for(let r=0;r<2;r++)for(let i=0;i<13;i++)box(header,2.43,2.52,2.43,[(r-.5)*2.54,2.07,(i-6)*2.54],material(colors[i],0,.65),.1);
 qfn(groups.power,{x:-40,z:2,width:7,depth:7,height:.9,pins:68,pitch:.35,label:'RK806'});
 for(const[x,z,t]of [[-32.5,8,'R22'],[-29,-16,'1R0'],[7.5,-21.7,'4R7']]){box(groups.power,4.4,2.5,4.4,[x,2.1,z],material('#54575a',.15,.65),.15);silk(groups.power,t,x,z,3.5,2.3,{y:3.37,color:'#b2b6af'});}
 microsd(groups.storage);bootFlash(groups.flash);ic(groups.network,{x:25,z:0,width:5.7,depth:5.7,height:.85,pins:48,pitch:.4,label:'YT8531'});
 ribbon(groups.ribbon,20,28,30,20);mezzanine(groups.ribbon,21,10);mezzanine(groups.ribbon,39,28);
 const underRibbon=new T.Group();underRibbon.rotation.x=Math.PI;groups.ribbon.add(underRibbon);ribbon(underRibbon,22,-28,30,20);mezzanine(underRibbon,39,-28);
 const under=new T.Group();under.rotation.x=Math.PI;groups.m2.add(under);box(under,21,2.4,5.4,[21,2.05,-16],M.black,.08);box(under,19.5,.4,1,[21,1.0,-18.9],M.black,.03);for(let i=0;i<36;i++)box(under,.22,.15,1.4,[21+(i-17.5)*.5,1,-19.3],M.gold,.01);silk(under,'M.2 M-KEY',21,-21,17,2,{y:.82});
 button(groups.controls,-29.5,-11);button(groups.controls,-34.5,18.5);const powerButton=button(groups.controls,-48,16,Math.PI/2);
 pinHeader(groups.uart,{x:1.8,z:-29,rows:1,count:3,axis:'x',pinLength:5.5});
 box(groups.fanheader,4.8,4.4,5.7,[34.2,3,17.3],material('#e6e0cf',0,.6),.14);box(groups.fanheader,3.6,2.6,4.2,[34.2,4,17.3],M.black,.05);for(const s of [-1,1])box(groups.fanheader,.45,3.1,.45,[34.2+s,3.2,17.3],M.silver,.02);
 mesh(new T.CylinderGeometry(2.1,2.1,1.5,24),M.black,groups.controls,[-47,1.55,22]);mesh(new T.CylinderGeometry(.28,.28,.04,12),material('#4a4d49'),groups.controls,[-47,2.32,22]);
 for(const[x,c]of [[10.5,'#b42c24'],[13.2,'#57904d']])box(groups.controls,1.1,.65,1.6,[x,1.15,-26.8],indicatorMaterial(c,x===10.5?'power':'activity'),.08);
 // Visible packages sampled from the manufacturer top photograph; no invented copper routing.
 const points=[[407,608],[407,630],[418,661],[423,700],[436,742],[445,765],[465,772],[487,768],[508,766],[535,750],[582,713],[622,714],[622,742],[614,691],[625,659],[581,644],[582,620],[554,613],[509,610],[467,608],[459,650],[538,665],[545,693],[598,602],[643,604],[643,644],[644,685],[640,741],[640,770],[629,807],[625,830],[643,844],[667,842],[695,836],[724,837],[742,840],[741,857],[775,854],[789,853],[807,852],[836,839],[857,820],[821,809],[813,788],[759,788],[723,790],[692,787],[667,785],[998,792],[998,809],[1041,803],[1060,809],[1066,793],[1096,729],[1117,730],[1135,727],[1153,728],[1170,731],[1216,782],[1225,746],[1226,718],[1214,700],[1218,654],[1200,628],[1150,630],[1117,617],[1065,614],[1022,643],[1027,687],[1025,714],[988,666],[1013,654],[1021,490],[1045,483],[1046,438],[1066,438],[1067,412],[1038,411],[1012,409],[1004,384],[969,412],[943,411],[914,414],[894,412],[885,437],[864,420],[824,419],[795,417],[764,425],[754,450],[739,434],[710,419],[677,418],[653,421],[638,444],[633,469],[617,481],[596,474],[576,466],[574,432],[557,433],[1205,487],[1234,482],[1237,458],[1242,428],[1255,417],[465,401],[468,379],[883,367],[1010,368],[1233,393]];
 for(const[px,py]of points){const[x,z]=toXZ(px,py);passive(groups.smd,{x,z,width:1.15,depth:.6});}
 // Underside clusters are a representative subset of the photographed passives.
 const underside=new T.Group();underside.rotation.x=Math.PI;groups.smd.add(underside);
 for(const[x,z]of [[-44,16],[-42,16],[-40,16],[-44,13],[-42,13],[-40,13],[-36,11],[-35,8],[-33,5],[-33,2],[-30,2],[-28,5],[-25,8],[-22,8],[-20,5],[-18,2],[-15,2],[-12,5],[-10,8],[-7,8],[-4,5],[0,5],[3,8],[3,11],[0,14],[-3,14],[-6,14],[-10,14],[-14,14],[-17,14],[-20,14],[-23,14],[-26,14],[-30,14],[-33,14],[-36,17],[-32,19],[-28,20],[-24,20],[-20,20],[-16,20],[-12,20],[-8,20],[-4,20],[0,20],[4,20],[8,20],[10,16],[10,12],[10,8],[10,4],[7,1],[3,-2],[-1,-2],[-5,-2],[-9,-2],[-13,-2],[-17,-2],[-21,-2],[-25,-2]])passive(underside,{x,z,width:.95,depth:.5});
 ic(underside,{x:-25,z:-20,width:4,depth:4,height:.8,pins:28,pitch:.45,label:'ES8388'});
 root.userData={board:'orangepi5',boardSize:[100,62],boardThickness:1.6,mountingHoles:holes,source:'Xunlong user manual and product photographs',geometryBasis:'dimension-and-photo reconstruction',headerContacts:26};
 return batchAssembly(finishAssembly(root,groups,ORANGEPI_PARTS));
}
export const ORANGEPI_BOARD={id:'orangepi5',tab:'Orange Pi 5',title:'Orange<br>Pi 5',edition:'007',subtitle:'Eight cores on a blue board.',intro:'Explore Xunlong’s original RK3588S single-board computer.',model:'Shenzhen Xunlong Orange Pi 5 / original blue PCB',basis:'Dimensions & photo reconstruction',dimensions:'100 × 62 MM',parts:ORANGEPI_PARTS,build:buildOrangePi5,half:74,camera:[110,120,140],target:[0,12,0],start:0,stats:[['8','CORES','ARM CPU'],['6','TOPS','NPU CAPABILITY'],['26','PINS','EXPANSION HEADER'],['100 × 62','mm','PCB ENVELOPE']],sources:[['Xunlong · Official Orange Pi 5 manual','https://drive.google.com/file/d/1vkLacoP3UiOWDQ3Z0vA9xyLeo9nIkiTi/view'],['Xunlong · Orange Pi 5 product','http://www.orangepi.org/html/hardWare/computerAndMicrocontrollers/details/Orange-Pi-5.html'],['Manufacturer board images · regional distributor','https://orange-pi.it/products/orange-pi-5']],accuracy:'The 100 × 62 mm envelope, 26-pin expansion, interface counts and component functions follow Xunlong’s official Orange Pi 5 manual. Blue solder mask, component positions and connector orientation follow the manufacturer’s top and underside photographs. Hole centers, package heights, connector internals and the representative passive subset are estimated. No PCB routing is inferred. This is the original Pi 5, without the integrated Wi-Fi/eMMC of the 5B or the 40-pin header of the 5 Plus.',hidden:[]};
