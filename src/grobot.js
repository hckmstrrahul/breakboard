import * as T from 'three';
import {mesh,box,material,texture,M} from './model.js';
import {pcb,usbPort,ic,passive,silk,pinHeader} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';
import {indicatorMaterial} from './hardware-motion.js';

// The supplied revision B electronics, rearranged into an open-frame concept.
// Coordinates are x left→right, d back→front, h bottom→top, all in millimetres.
export const GROBOT_SPEC=Object.freeze({width:122,depth:100,height:80,carrier:[120,98,1.6],pitch:2.54,cellDiameter:21.25,cellLength:70.5,cellCount:2,filamentLength:40,filamentCount:4,installedBars:2,railDiameter:3,controllerPins:44,screen:[17.39,32.35],pixels:[172,320]});
const at=(x,d,h)=>[x-50,h,d-34];
const part=(id,name,short,kind,description,specs,p,offset)=>({id,name,short,kind,description,specs,anchor:at(...p),offset});
export const GROBOT_PARTS=[
 part('frame','Hand-bent brass frame','BRASS FRAME','OPEN STRUCTURAL CAGE','Round brass stock forms the open rails and corner posts. Small silver solder fillets mark the joints. The frame carries no supply or signal current; insulating mounts separate it from the electronics.',[['Rod','Ø3 mm brass'],['Envelope','122 × 100 × 80 mm · proposed']],[1.5,97,45],[-45,22,-35]),
 part('carrier','Perforated prototype PCB','PERFBOARD','2.54 MM PAD-PER-HOLE CARRIER','An amber FR-4 prototyping board provides real through-holes, individual copper pads and two socket rows for the controller. The pads are isolated; visible jumpers provide the proposed connections. This is a custom carrier concept, not a routed PCB or solderless breadboard.',[['Board','120 × 98 × 1.6 mm'],['Pitch','2.54 mm'],['Pads','Individually isolated']],[56,94,8.9],[0,0,0]),
 part('mounts','Insulators & module supports','MODULE MOUNTS','OPEN BRACKETS AND STANDOFFS','Small brass tabs, insulating washers and standoffs hold each module without a front panel, lid or side walls. Mount locations and tolerances remain proposed.',[['Construction','Brass tabs / insulating spacers'],['Status','Fit and tolerances unverified']],[112,43,64],[48,9,-25]),
 part('controller','ESP32-S3 N16R8','ESP32-S3','AYWHP DEVKITC CONTROLLER','The same dual-USB-C AYWHP controller plugs into two 22-contact socket rows on the perfboard. The shield, antenna, regulator, USB bridge and buttons remain exposed. The clone outline is reconstructed from photographs.',[['Flash / PSRAM','16 MB / 8 MB'],['Header contacts','44'],['Reserved envelope','28 × 69 mm']],[92,44,19],[64,55,-29]),
 part('display','1.47-inch IPS LCD','1.47-INCH LCD','WAVESHARE · ST7789V3','The original Waveshare PCB, connector, mounts and display sit directly on four open standoffs. Its portrait active area and pixel aspect ratio are unchanged. Play shows sample content.',[['Resolution','172 × 320 pixels'],['Active area','17.39 × 32.35 mm'],['PCB','22 × 38.5 mm']],[24,94.6,43],[-36,38,54]),
 part('servo','TowerPro SG90','SG90 SERVO','EXPOSED POSITION SERVO','The blue SG90 remains a complete servo. Its output drives a simple single-arm pointer, with no decorative anchor, dial plate or guard. The body envelope follows TowerPro; the custom mount is proposed.',[['Body envelope','23 × 12.2 × 29 mm'],['Interface','Power · ground · command'],['Feedback to ESP32','None']],[65.5,84,51],[52,82,12]),
 part('pointer','Single-arm servo pointer','SERVO POINTER','BARE OUTPUT HORN','A plain perforated horn fits the SG90 output shaft. Its single arm is the pointer; a small brass tip marks its end. Play demonstrates a slow ±30° command, not measured servo feedback.',[['Arm radius','14 mm · proposed horn'],['Demo command','±30°'],['Fixing','Central retaining screw']],[60,95.5,61],[51,86,64]),
 part('filaments','Four LED filaments','LED FILAMENTS','TWO EXPOSED RED / GREEN PAIRS','The same two red and two green 40 mm filaments run vertically along the left side. Ceramic-like end clips and insulated leads expose their construction. No third pair is added.',[['Installed','2 red + 2 green'],['Length','40 mm each'],['Driver requirement','Independent current limiting']],[4.7,53,47],[-50,32,42]),
 part('filamentmounts','Filament clips & terminals','FILAMENT CLIPS','OPEN INSULATED SUPPORTS','Eight small insulating clips retain the four filaments. The metal terminal cups and soldered wire ends remain visible; there are no trays or diffuser covers.',[['Clips','8'],['Pairs','2'],['Mounts','Proposed insulated clips']],[4.7,53,24],[-27,12,35]),
 part('ups','Waveshare UPS HAT (D)','UPS HAT (D)','CHARGER, BOOST & POWER PATH','The original manufacturer circuit board sits horizontally above its dual-cell holder. Components and connectors face upward, with access through the open sides. No vendor geometry is stretched.',[['PCB','56 × 85 mm'],['Output','5 V · rated up to 2.5 A'],['Geometry','281 official STEP solids']],[33,48,40],[-69,42,-45]),
 part('holder','Dual 21700 holder','CELL HOLDER','PARALLEL BATTERY CONTACTS','The original holder and four contacts stay registered to the UPS board. Both cells lie lengthwise below it in their original parallel orientation.',[['Arrangement','1S2P'],['Geometry','5 official STEP solids']],[36,47,14],[-48,24,-16]),
 part('cell1','BAK 21700 · cell 1','21700 · CELL 1','SEALED N21700CG-50 CELL','The same sealed BAK cell fits the first holder channel. Its body keeps the manufacturer’s nominal diameter and length; internal cell layers are not invented.',[['Capacity','5,000 mAh'],['Nominal voltage','3.6 V'],['Cell size','Ø21.25 × 70.50 mm']],[24.3,48,24],[-80,51,12]),
 part('cell2','BAK 21700 · cell 2','21700 · CELL 2','SECOND PARALLEL CELL','The second cell remains parallel to the first. Together the pair provides 36 Wh nominal before conversion losses; this model does not infer runtime.',[['Capacity','5,000 mAh'],['Nominal energy','18 Wh'],['Cell size','Ø21.25 × 70.50 mm']],[45.7,48,24],[-44,83,-15]),
 part('microphone','INMP441 microphone','INMP441','OPEN BOTTOM-PORT I²S MODULE','The same small microphone breakout sits beside the LCD. A short open collar exposes its acoustic path through the PCB to the bottom-port MEMS package. The kit breakout envelope remains unverified.',[['Interface','I²S'],['Package','4.72 × 3.76 × 1 mm'],['Breakout','16 × 14 mm · provisional']],[44,94.8,31],[-21,18,70]),
 part('amplifier','MAX98357A amplifier','MAX98357A','EXPOSED I²S CLASS-D MODULE','The purple amplifier breakout stands below the speaker. Its input header, package, passives and screw terminal remain visible, with a separate two-wire output run to the speaker.',[['Input','I²S'],['Output','Class-D speaker drive'],['Board reservation','20 × 20 mm']],[96,80,39],[72,33,39]),
 part('speaker','Voice speaker','SPEAKER','UPWARD-FACING OPEN SPEAKER','The same reserved speaker is mounted on open tabs at the top right. Its cone, basket, magnet and two terminals are visible from above and through the frame. Play adds a subtle illustrative cone vibration. Actual kit impedance and power remain unverified.',[['Reserved size','Ø40 × 10 mm'],['Impedance / rating','Unverified kit part']],[93,43,70],[44,98,-9]),
 part('drivers','Reserved driver carrier','DRIVER CARRIER','SIX UNPOPULATED CHANNEL POSITIONS','The original six driver positions sit on a small horizontal carrier at the front left. They remain empty because driver, resistor and protection parts have not been selected.',[['Channels reserved','6'],['Populated','0'],['Status','Component selection required']],[37,83,11],[-29,10,42]),
 part('controls','Power, talk & mute','FRONT CONTROLS','EXPOSED SWITCH PACKAGES','The same three controls mount to a small bare board across the front: push-to-talk, microphone mute and master power. Final packages, ratings and circuits are still provisional.',[['Controls','Power · push-to-talk · mute'],['Status','Packages provisional']],[76,95,17],[34,7,72]),
 part('harness','Point-to-point wiring','VISIBLE WIRING','INSULATED JUMPERS & SOLDER JOINTS','Visible red/black power pairs and signal bundles run between the modules and perfboard terminals. Short exposed solder tails identify real endpoints. These are proposed mechanical routes, not a verified electrical netlist; brass structure is never used as a conductor.',[['Routes','Power · display · servo · audio · LEDs'],['Construction','Hand-formed insulated jumpers']],[72,66,32],[5,42,31]),
 part('fasteners','Module fasteners','MOUNTING SCREWS','REMOVABLE MODULE FIXINGS','Four screws hold the LCD, four retain the UPS board, and four fix the perfboard to its insulated feet. The open design has no case fasteners.',[['Fixings','LCD · UPS · carrier'],['Geometry','Proposed M2 envelopes']],[16.5,94,27],[0,21,79])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
const C={shell:material('#d8d9d3',0,.66),edge:material('#b7bdb7',.1,.6),brass:material('#c29a51',.82,.28),rubber:material('#22272b',0,.84),blue:material('#234b9f',.14,.31),blueCap:material('#2d59b6',.12,.3),yellow:material('#cfba3f',0,.67),cell:material('#819d86',.08,.46),cone:material('#343a3d',0,.83),connector:material('#deded3',0,.65)};
const b=(g,x,d,h,w,depth,height,mat=C.shell,r=.25)=>box(g,w,height,depth,at(x,d,h),mat,r);
function cylinder(g,x,d,h,r,length,mat,axis='h',segments=48){const m=mesh(new T.CylinderGeometry(r,r,length,segments),mat,g,at(x,d,h));if(axis==='d')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;return m;}
function ring(g,x,d,h,inner,outer,depth,mat,axis='d'){
 const s=new T.Shape();s.absarc(0,0,outer,0,Math.PI*2);const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);
 const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:48});geo.translate(0,0,-depth/2);const m=mesh(geo,mat,g,at(x,d,h));if(axis==='h')m.rotation.x=-Math.PI/2;return m;
}
function outline(x,y,w,h,r=0){const s=new T.Shape();r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function plate(g,{x,d,h,w,height,depth=2,holes=[],mat=C.shell,side=false}){
 const shape=outline(-w/2,-height/2,w,height,1.2);
 for(const hole of holes){const path=new T.Path();if(hole.length===3)path.absarc(hole[0],hole[1],hole[2],0,Math.PI*2,true);else path.setFromPoints(outline(...hole).getPoints(12).reverse());shape.holes.push(path);}
 const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});geo.translate(0,0,-depth/2);const m=mesh(geo,mat,g,at(x,d,h));if(side)m.rotation.y=-Math.PI/2;return m;
}
function face(g,x,d,h,w,height,draw,{background,mat}={}){
 const tx=texture(768,Math.max(128,Math.round(768*height/w)),draw,{anatomyBackground:background});
 const m=mesh(new T.PlaneGeometry(w,height),mat||new T.MeshStandardMaterial({map:tx,transparent:true,roughness:.65,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),g,at(x,d,h));if(mat){mat.map=mat.emissiveMap=tx;mat.needsUpdate=true;}return m;
}
function label(g,text,x,d,h,w,height,color='#66716b'){return face(g,x,d,h,w,height,(c,W,H)=>{c.fillStyle=color;c.font=`500 ${Math.round(H*.55)}px monospace`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,H/2,W*.96);});}
function route(g,points,r,mat){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...at(...p))),false,'centripetal');return mesh(new T.TubeGeometry(curve,Math.max(24,points.length*8),r,8,false),mat,g);}
function screw(g,x,d,h,{length=5,r=1.5}={}){cylinder(g,x,d-length/2,h,.85,length,M.silver,'d',16);cylinder(g,x,d+.4,h,r,.8,M.silver,'d',32);for(const angle of [0,Math.PI/2]){const slot=b(g,x,d+.81,h,r*1.15,.025,.23,M.black,.02);slot.rotation.z=angle;}}
function vertical(g,x,d,h){const local=new T.Group();local.position.set(...at(x,d,h));local.rotation.x=Math.PI/2;g.add(local);return local;}


function buildController(g){
 const board=vertical(g,78,17,86.25),holes=[];for(const x of[-12.7,12.7])for(let i=0;i<22;i++)holes.push([x,26.25-i*2.54,1]);
 pcb(board,{width:28,depth:62.5,holes,color:'#172028',radius:.75});
 for(const x of[-12.7,12.7])for(let i=0;i<22;i++){const z=26.25-i*2.54;box(board,2.5,2.5,2.5,[x,-2.05,z],C.yellow,.18);box(board,.64,10,.64,[x,-3,z],M.silver,.04);}
 const substrate=box(board,18,.8,25.5,[0,1.2,-25],M.edge,.05);
 for(const x of[-8.65,8.65])for(let i=0;i<14;i++)box(board,.7,.3,.8,[x,1.2,-35.5+i*1.27],M.gold,.02);
 for(let i=0;i<12;i++)box(board,.75,.3,.7,[-7+i*1.27,1.2,-12.4],M.gold,.02);
 box(board,17.4,.23,18,[0,3.35,-21.5],M.silver,.12);for(const x of[-8.58,8.58])box(board,.23,1.65,18,[x,2.45,-21.5],M.silver,.05);for(const z of[-30.4,-12.6])box(board,17.4,1.65,.23,[0,2.45,z],M.silver,.05);
 // Only the visible antenna meander is reconstructed; buried RF is omitted.
 const antenna=new T.CurvePath(),points=[[-7,1.615,-37],[-7,1.615,-32.8],[-4.2,1.615,-32.8],[-4.2,1.615,-37],[-1.4,1.615,-37],[-1.4,1.615,-32.8],[1.4,1.615,-32.8],[1.4,1.615,-37],[4.2,1.615,-37],[4.2,1.615,-32.8],[7,1.615,-32.8]];
 for(let i=1;i<points.length;i++)antenna.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));mesh(new T.TubeGeometry(antenna,40,.13,6,false),material('#8d967a',.45,.55),board);
 for(const x of[-7.2,7.2])usbPort(board,'c',{x,z:28,base:.8});
 for(const x of[3,9]){box(board,4,1.2,3.5,[x,1.4,4.2],M.silver,.25);const cap=mesh(new T.CylinderGeometry(1.1,1.1,.7,24),M.black,board,[x,2.3,4.2]);silk(board,x===3?'BOOT':'RST',x,7.5,4.2,1.5);}
 ic(board,{x:-5.3,z:-3,width:6.5,depth:3.7,height:1.5,label:'3.3V',base:.8});
 ic(board,{x:6,z:18.2,width:4,depth:4,height:.75,pins:28,pitch:.5,base:.8});
 for(const[x,z]of[[-8,-7],[-8,1],[-2,-7],[-3,9],[-7,15],[-6,21],[0,18],[0,23],[7,12],[9,22],[-4,24]])passive(board,{x,z,width:1.7,depth:.9});
 const led=indicatorMaterial('#c5ccbf','power');box(board,4.8,1.1,4.8,[-6,1.55,8.8],led,.35);silk(board,'RGB',-6,12.2,4.8,1.2);
 silk(board,'ESP32-S3',0,-9,12,2);silk(board,'USB',7,24.5,5,1.6);silk(board,'UART',-7,24.5,5,1.6);
 // Retain only reliably visible labels; the listing's generic pin diagram differs.
 silk(board,'3V3',-10.5,-27,2.2,1);silk(board,'GND',10.5,-27,2.2,1);silk(board,'5V',-10.5,22,2,1);
 substrate.userData.module='ESP32-S3 N16R8';
}

function buildDisplay(g){
 const screen=indicatorMaterial('#020609','screen');
 face(g,30,64.603,104.25,17.39,32.35,(c,W,H)=>{
  c.fillStyle='#101c21';c.fillRect(0,0,W,H);c.fillStyle='#b4c7c0';c.font=`500 ${H*.035}px monospace`;c.fillText('GROBOT',W*.09,H*.12);
  c.fillStyle='#e0ebe3';c.font=`500 ${H*.075}px monospace`;c.fillText('GROBOT',W*.09,H*.31);c.fillStyle='#7bc7a2';c.font=`${H*.046}px monospace`;c.fillText('SYSTEM READY',W*.09,H*.43);
  c.strokeStyle='#7bc7a2';c.lineWidth=H*.006;c.beginPath();for(let i=0;i<35;i++){const x=W*(.09+.82*i/34),y=H*(.62+.055*Math.sin(i*.7));if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();c.fillStyle='#8ba69a';c.font=`${H*.03}px monospace`;c.fillText('DEMO / NO LIVE DATA',W*.09,H*.86);
 },{background:'#101c21',mat:screen});
 const back=label(g,'1.47inch LCD Module',30,60.99,120.8,18,2.2,'#eef0e7');back.rotation.y=Math.PI;
}

function buildCells(groups){
 for(const[id,x]of[['cell1',24.303],['cell2',45.703]]){
  const g=groups[id],d=26.797,h=55.5;const body=cylinder(g,x,d,h,10.625,69.9,C.cell);body.userData.cell={diameter:21.25,length:70.5,nominalVoltage:3.6,capacityAh:5};
  cylinder(g,x,d,20.4,9.8,.3,M.silver);ring(g,x,d,90.6,6,10.4,.3,C.rubber,'h');cylinder(g,x,d,90.675,5.8,.15,M.silver);
  // Cylindrical wrapper ink; a patch follows the actual radius instead of floating.
  const tx=texture(768,512,(c,W,H)=>{c.fillStyle='#2d4439';c.font='500 55px monospace';c.textAlign='center';c.fillText('BAK',W/2,120);c.font='38px monospace';c.fillText('N21700CG-50',W/2,210);c.font='30px monospace';c.fillText('3.6 V / 5000 mAh',W/2,295);c.fillText('+',W/2,65);c.fillText('−',W/2,460);});
  const geo=new T.CylinderGeometry(10.632,10.632,52,48,1,true,-.7,1.4);mesh(geo,new T.MeshStandardMaterial({map:tx,transparent:true,depthWrite:false,roughness:.65,polygonOffset:true,polygonOffsetFactor:-1}),g,at(x,d,h));
 }
}

function buildServo(g){
 b(g,78.5,43.5,104.1,23,21,12.2,C.blue,.65);b(g,78.5,54.4,104.1,23,1,12.2,C.blueCap,.2);b(g,78.5,56.5,104.1,23,3.2,12.2,C.blue,.55);
 cylinder(g,73,59,104.1,5.65,2.2,C.blueCap,'d');cylinder(g,73,61.65,104.1,2.3,3.1,M.silk,'d',32);
 for(const x of[64.3,92.7]){plate(g,{x,d:54.2,h:104.1,w:5.5,height:4.4,depth:1.6,holes:[[0,0,.9]],mat:C.blueCap});screw(g,x,55.3,104.1,{length:5,r:1.3});}
 for(const x of[68.4,88.6])for(const h of[99.5,108.7])screw(g,x,58.1,h,{length:2,r:.75});
 const badge=face(g,78.5,43.5,110.23,17,14,(c,W,H)=>{c.fillStyle='#161b19';c.fillRect(0,0,W,H);c.strokeStyle='#cabd84';c.lineWidth=5;c.strokeRect(12,12,W-24,H-24);c.fillStyle='#d9d1a0';c.textAlign='center';c.font=`500 ${H*.14}px sans-serif`;c.fillText('TOWER PRO',W/2,H*.27);c.font=`${H*.12}px sans-serif`;c.fillText('MICRO SERVO 9g',W/2,H*.48);c.font=`600 ${H*.22}px serif`;c.fillText('SG90',W/2,H*.79);},{background:'#161b19'});badge.rotation.x=-Math.PI/2;
 b(g,90.4,37,101,2,4,3,C.rubber,.4);
}

function buildMicrophone(g){
 // The acoustic opening faces the viewer. The MEMS package is on the far side.
 const local=vertical(g,22.35,53,22.9),body=pcb(local,{width:16,depth:14,color:'#176d69',holes:[[0,0,1.25]],radius:.7});body.userData.acousticHole=true;
 box(local,4.72,1,3.76,[0,-1.35,0],M.silver,.12);
 for(let i=0;i<3;i++)for(const x of[-5.3,5.3]){const geo=new T.TorusGeometry(.65,.14,6,16);geo.rotateX(Math.PI/2);mesh(geo,M.gold,local,[x,.81,(i-1)*3.8]);}
 for(const x of[-4.4,4.4])passive(local,{x,z:-4.7,width:1.5,depth:.8});silk(local,'INMP441',0,-5,8.5,1.6);
 ring(g,22.35,54.8,22.9,1.2,2.4,2,C.rubber); // short open acoustic port
}

function buildAmplifier(g){
 const local=vertical(g,78,14,30);pcb(local,{width:20,depth:20,color:'#432b72',holes:[[-7.5,-7.5,2],[7.5,-7.5,2]],radius:.8});
 ic(local,{x:0,z:0,width:3,depth:3,height:.8,pins:16,pitch:.5,base:.8,label:'MAX'});
 for(const[x,z]of[[-4,-1],[-4,2],[4,-2],[5,2],[0,-5]])passive(local,{x,z,width:1.7,depth:1});
 box(local,10,5.5,5,[0,3.55,7],material('#34568d'),.3);for(const x of[-2.5,2.5]){mesh(new T.CylinderGeometry(1.5,1.5,.2,24),M.silver,local,[x,6.4,7]);box(local,2.1,.04,.25,[x,6.52,7],M.black,.02);}
 for(let i=0;i<7;i++){const x=(i-3)*2.54;box(local,2.4,2.4,2.4,[x,2,-7.6],M.black,.12);box(local,.64,6,.64,[x,3,-7.6],M.gold,.03);}
 silk(local,'MAX98357A',0,-3.9,13,2);
}

function buildSpeaker(g){
 cylinder(g,72,54,31,9,4,C.rubber,'d');cylinder(g,72,56.2,31,12,1,M.silver,'d');ring(g,72,58.2,31,15.8,20,2,C.rubber);
 // Tapered basket, cone and a rolled surround, all sharing the acoustic axis.
 const basket=mesh(new T.CylinderGeometry(19,11,4,64,1,true),M.silver,g,at(72,57,31));basket.rotation.x=Math.PI/2;
 C.cone.side=T.DoubleSide;
 const cone=mesh(new T.ConeGeometry(17.8,3.5,64,1,true),C.cone,g,at(72,58.8,31));cone.rotation.x=-Math.PI/2;
 const surround=mesh(new T.TorusGeometry(18,1.2,12,64),C.rubber,g,at(72,60,31));
 const dome=mesh(new T.SphereGeometry(5,32,16,0,Math.PI*2,0,Math.PI/2),C.cone,g,at(72,60.2,31));dome.rotation.x=Math.PI/2;dome.scale.y=.35;
 // Move only the diaphragm and dust cap along the acoustic axis. The rolled
 // surround hides the small edge travel; basket, magnet and terminals stay fixed.
 const diaphragm=new T.Group();diaphragm.name='Speaker diaphragm';diaphragm.position.set(...at(72,58,31));
 diaphragm.userData.motion={type:'speaker',axis:[0,0,1],amplitude:.45,frequency:3};g.add(diaphragm);
 for(const object of[cone,dome]){object.position.sub(diaphragm.position);diaphragm.add(object);}
 for(const x of[63,67])b(g,x,53.2,18,3,2,1,M.silver,.12);
}

// Reuse each component at its original scale; rigid mounts change its pose only.
function relocate(group,from,to,rx=0,ry=0){
 const mount=new T.Group();mount.rotation.set(rx,ry,0);mount.position.copy(new T.Vector3(...at(...to))).sub(new T.Vector3(...at(...from)).applyQuaternion(mount.quaternion));
 mount.add(...group.children);group.add(mount);return mount;
}
const COPPER=material('#b8894f',.76,.4),SOLDER=material('#b7b8af',.85,.31),INSULATOR=material('#e5dfc9',0,.73);
export const GROBOT_MOUNTS=[[4,4],[116,4],[4,94],[116,94]];
export const GROBOT_PERF_HOLES=[];
for(let col=0;col<44;col++)for(let row=0;row<36;row++){
 const x=5.64+col*2.54,d=4.51+row*2.54;
 if(GROBOT_MOUNTS.some(([mx,md])=>Math.hypot(x-mx,d-md)<3.3))continue;
 GROBOT_PERF_HOLES.push([x,d]);
}
function solder(g,x,d,h,r=.95){const m=mesh(new T.SphereGeometry(r,12,8),SOLDER,g,at(x,d,h));m.scale.set(1,.42,1);return m;}
function buildCarrier(groups){
 const {carrier,mounts,fasteners}=groups,board=new T.Group();board.position.set(...at(60,49,8));carrier.add(board);
 const shape=outline(-60,-49,120,98,2.2);
 const holes=[...GROBOT_PERF_HOLES.map(([x,d])=>[x-60,49-d,.5]),...GROBOT_MOUNTS.map(([x,d])=>[x-60,49-d,1.1])];
 for(const[x,y,r]of holes){const hole=new T.Path();hole.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(hole);}
 const geo=new T.ExtrudeGeometry(shape,{depth:1.6,bevelEnabled:false,curveSegments:5});geo.rotateX(-Math.PI/2);geo.translate(0,-.8,0);
 const body=mesh(geo,material('#856c36',0,.78),board);body.userData.pcb=true;body.userData.dimensions=[120,1.6,98];body.userData.holes=holes;
 const annulus=new T.RingGeometry(.52,.91,12);annulus.rotateX(-Math.PI/2);
 for(const[x,d]of GROBOT_PERF_HOLES){mesh(annulus.clone(),COPPER,board,[x-60,.805,d-49]);const underside=mesh(annulus.clone(),COPPER,board,[x-60,-.805,d-49]);underside.rotation.x=Math.PI;}
 for(const x of[79.3,104.7])pinHeader(board,{x:x-60,z:46.42-49,count:22,rows:1,female:true,base:.8,height:2.8});
 silk(board,'GROBOT / OPEN FRAME',-26,46,40,2.1,{color:'#e5d5a6'});silk(board,'2.54 mm / ISOLATED PADS',26,46,40,1.8,{color:'#e5d5a6'});
 for(let col=0;col<44;col+=5)silk(board,String(col+1),5.64+col*2.54-60,-47,2,1.3,{color:'#d4be84'});
 for(const[x,d]of GROBOT_MOUNTS){
  cylinder(mounts,x,d,.35,4.1,.7,C.rubber);cylinder(mounts,x,d,1.25,4.8,1.1,C.brass);cylinder(mounts,x,d,4.25,2.1,4.9,C.brass);ring(mounts,x,d,6.95,1.05,2.8,.5,INSULATOR,'h');
  const bolt=new T.Group();fasteners.add(bolt);screw(bolt,x,d,9,{length:4,r:1.6});relocate(bolt,[x,d,9],[x,d,9],-Math.PI/2);
 }
}
function buildFrame(groups){
 const g=groups.frame;
 // Two hand-bent rectangular hoops, with generous bend radii and four ties.
 for(const d of[3,97]){
  const points=outline(1.5,12,117,64.5,4.5).getPoints(12).map(p=>[p.x,d,p.y]);route(g,points,1.5,C.brass);
 }
 for(const x of[6,114])for(const h of[12,76.5])route(g,[[x,3,h],[x,97,h]],1.5,C.brass);
 for(const x of[6,114])for(const d of[3,97])for(const h of[12,76.5]){
  const bead=mesh(new T.SphereGeometry(1.7,16,10),SOLDER,g,at(x,d,h));bead.scale.set(1.15,.6,1);
 }
 // Feet meet the carrier fixings through insulating washers.
 for(const[x,d]of GROBOT_MOUNTS)route(g,[[x,d,2],[x,d,6],[x<60?6:114,d<50?3:97,12]],1.2,C.brass);
 // Open left-side crossbars support only the insulating filament clips.
 for(const h of[23,67])route(g,[[1.5,3,h],[1.5,97,h]],.9,C.brass);
}
function buildMounts(groups){
 const g=groups.mounts;
 // UPS board on four narrow standoffs beside, not through, the cell channels.
 for(const x of[10.5,59.5])for(const d of[28.5,86.5]){cylinder(g,x,d,21.5,1.3,25.4,C.brass);ring(g,x,d,34.8,1,2.4,1.2,INSULATOR,'h');const bolt=new T.Group();groups.fasteners.add(bolt);screw(bolt,x,d,37.1,{length:5,r:2.1});relocate(bolt,[x,d,37.1],[x,d,37.1],-Math.PI/2);}
 // LCD open tabs line up with the four manufacturer mounting axes.
 for(const x of[16.475,31.525])for(const h of[27.25,58.75]){
  b(g,x,88.1,h,4.3,1.5,4.3,C.brass,.35);ring(g,x,90,h,1.05,2.1,2.2,INSULATOR);screw(groups.fasteners,x,94,h,{length:5,r:1.4});
 }
 for(const x of[16.475,31.525])route(g,[[x,88,27.25],[x,88,13],[x,97,12]],.9,C.brass);
 route(g,[[6,97,76.5],[16.475,88,76.5],[16.475,88,58.75]],.9,C.brass);
 route(g,[[31.525,88,58.75],[31.525,88,76.5],[52,97,76.5]],.9,C.brass);
 // SG90 mounting ears are held by two small open L-tabs.
 for(const x of[51.3,79.7]){b(g,x,81,51,5,1.8,5,C.brass,.3);b(g,x,74,46.1,5,16,1.6,C.brass,.3);ring(g,x,82.4,51,1,1.9,.7,INSULATOR);}
 route(g,[[51.3,68,46.1],[51.3,68,68],[51.3,3,76.5]],.9,C.brass);
 route(g,[[79.7,68,46.1],[114,68,46.1],[114,97,76.5]],.9,C.brass);
 // Speaker hangs from side tabs, with a visible gap above the electronics.
 for(const d of[29,57]){route(g,[[114,d,76.5],[118,d,67],[110,d,64]],1,C.brass);b(g,107,d,63,8,4,1.4,C.brass,.3);b(g,104,d,64.2,5,4,1,INSULATOR,.3);}
 // Standalone audio and control boards get small insulating mounting blocks.
 for(const[x,d,h,w]of[[44,90,23,14],[96,73,29,18],[76,87,10,30]])b(g,x,d,h,w,4,3,INSULATOR,.4);
}
function buildPointer(g){
 const moving=new T.Group();moving.position.set(...at(60,94,51));moving.userData.motion={type:'servo',axis:[0,0,1],angle:30,rate:.6};g.add(moving);
 const shape=new T.Shape();shape.moveTo(-2.5,-2);shape.quadraticCurveTo(-3.8,1,-2.6,3);shape.lineTo(-1.35,13.5);shape.quadraticCurveTo(0,15,1.35,13.5);shape.lineTo(2.6,3);shape.quadraticCurveTo(3.8,1,2.5,-2);shape.quadraticCurveTo(0,-4,-2.5,-2);
 for(const y of[5.5,8.3,11.1]){const hole=new T.Path();hole.absarc(0,y,.58,0,Math.PI*2,true);shape.holes.push(hole);}
 const geo=new T.ExtrudeGeometry(shape,{depth:1.2,bevelEnabled:false,curveSegments:16});geo.translate(0,0,-.2);mesh(geo,INSULATOR,moving);
 const hub=mesh(new T.CylinderGeometry(2.3,2.3,2.2,32),INSULATOR,moving,[0,0,-.55]);hub.rotation.x=Math.PI/2;
 const head=mesh(new T.CylinderGeometry(1.2,1.2,.6,32),M.silver,moving,[0,0,1.3]);head.rotation.x=Math.PI/2;box(moving,1.6,.3,.05,[0,0,1.62],M.black,.02);mesh(new T.SphereGeometry(.7,16,10),C.brass,moving,[0,13.3,.9]);
}
function buildOpenFilaments(groups){
 for(let row=0;row<2;row++)for(const[channel,index]of[['red',0],['green',1]]){
  const d=(row?52:27)+index*6,mat=indicatorMaterial(channel==='green'?'#bccd95':'#d5b586','filament');mat.userData.indicator.channel=channel;mat.userData.indicator.row=row;
  cylinder(groups.filaments,4.7,d,45,.9,40,mat);
  for(const h of[24,66]){
   cylinder(groups.filaments,4.7,d,h,.3,2,M.silver,'h',12);
   b(groups.filamentmounts,4.7,d,h,3.4,3.4,1.8,INSULATOR,.4);ring(groups.filamentmounts,4.7,d,h+.94,.33,.8,.12,SOLDER,'h');
   b(groups.filamentmounts,2.8,d,h<45?23:67,3,2.2,1.1,C.brass,.2);
  }
 }
}
function buildOpenControls(groups){
 const driver=vertical(groups.drivers,30,53,23.5);pcb(driver,{width:40,depth:27,color:'#654d2a',holes:[[-17,-10,2],[17,-10,2],[-17,10,2],[17,10,2]],radius:1});
 for(let i=0;i<6;i++){const x=(i%3-1)*12,z=(Math.floor(i/3)-.5)*10;for(let p=0;p<3;p++)box(driver,1,.08,2,[x+(p-1)*2,.84,z],M.gold,.03);silk(driver,'CH'+(i+1),x,z+3.5,6,1.6);}silk(driver,'RESERVED',0,-10,18,2);
 relocate(groups.drivers,[30,53,23.5],[37,80,10.4],-Math.PI/2);
 const g=groups.controls,control=vertical(g,76,89,18);pcb(control,{width:36,depth:16,color:'#a08847',radius:.7});
 cylinder(g,63,93,18,4,7,C.rubber,'d');cylinder(g,63,97.2,18,3.5,1.4,M.silver,'d');
 for(const x of[77,89]){b(g,x,92.5,18,7.8,5.5,5,C.rubber,.3);b(g,x,96,18,4,2,3,C.edge,.3);for(const h of[16,18,20])b(g,x,88,h,.6,2.5,.5,M.silver,.03);}
 label(g,'TALK',63,89.84,23.5,8,1.5,'#ece2bd');label(g,'MUTE',77,89.84,23.5,8,1.5,'#ece2bd');label(g,'POWER',89,89.84,23.5,8,1.5,'#ece2bd');
}

function buildHarness(g){
 const colors=['#ad4e38','#292e31','#d6c8a0','#588479','#c4a64e','#766d9b','#b4bfc1','#577b9b'];
 const wire=colors.map(color=>material(color,0,.62));
 // All routes are a packaging proposal. No numbered GPIO or verified netlist is implied.
 const bundle=(points,n,{spacing=.8,r=.32,palette=wire}={})=>{
  for(let i=0;i<n;i++)route(g,points.map(([x,d,h])=>[x+(i-(n-1)/2)*spacing,d,h]),r,palette[i%palette.length]);
 };
 // Eight display contacts, rear connector to carrier signal terminals.
 b(g,19.75,87,43,7.4,3,2.2,C.rubber,.2);
 bundle([[19.75,86,43],[21,81,43],[43,79,28],[68,80,20],[71.68,83.25,9.2]],8);
 // Short power pair from the UPS output header down to the front carrier strip.
 b(g,11.77,71.47,48.3,3.6,3,2,C.rubber,.2);
 bundle([[11.77,71.47,49.2],[11.77,77,49.8],[9,85,30],[13.26,85.79,9.2]],2,{r:.42});
 // Servo lead exits the blue case; the three-wire plug stays accessible.
 bundle([[77.4,66.15,47.9],[79,65,41],[74,62,29],[73,70,19],[76.76,73.09,9.2]],3,{palette:[wire[1],wire[0],wire[4]]});
 b(g,73.2,70.8,19.4,3.5,4,3,C.rubber,.2);
 // I2S input to the amplifier and the microphone, ending at exposed header pads.
 bundle([[96,81.8,46.6],[101,83,50],[109,80,40],[110,73,22],[109.78,65.47,9.2]],5);
 bundle([[49.3,94,31],[53,91,30],[55,86,21],[59.3,83.25,9.2]],5);
 // The two speaker terminals are distinct from the signal header.
 for(const [i,x]of[84,88].entries())route(g,[[96+(i?2.5:-2.5),83.4,32],[104+i*2,87,34],[112+i*1.2,77,48],[111+i*1.2,61,59],[x,56,63.2]],.4,wire[i]);
 // Two wires per filament run along the open left side to the reserved carrier.
 for(let pair=0;pair<2;pair++)for(let channel=0;channel<2;channel++){
  const d=(pair?52:27)+channel*6,index=pair*2+channel;
  for(const [terminal,h]of[24,66].entries()){
   const depth=d+(terminal?1.2:-1.2),endX=22+index*8+terminal*2;
   route(g,[[4.7,d,h],[6.5,depth,h],[7+terminal*1.2,depth,18],[10+index*1.2,73,15],[endX,84.5,11.3]],.27,terminal?wire[1]:wire[channel?3:0]);
   solder(g,4.7,d,h,.55);solder(g,endX,84.5,11.3,.6);
  }
 }
 // Front switches terminate on the perfboard; their final circuit is not specified.
 for(const [index,x]of[63,77,89].entries())bundle([[x,87,18],[x,84,18],[x+3,81,13],[63.1+index*12.7,78.17,9.2]],2,{r:.3});
 // Pad-aligned soldered jumpers make the carrier connections visible.
 const jumper=(a,b,color,lift=2)=>{
  const [x,d]=a,[xx,dd]=b;route(g,[[x,d,7.8],[x,d,10.2],[x,d,11+lift],[xx,dd,11+lift],[xx,dd,10.2],[xx,dd,7.8]],.3,wire[color]);
  for(const [px,pd]of[a,b]){solder(g,px,pd,8.95,.8);cylinder(g,px,pd,8,.22,2.4,SOLDER);}
 };
 for(let i=0;i<5;i++)jumper([71.68+i*2.54,83.25],[79.3,73.09-i*2.54],i,1+i*.35);
 for(let i=0;i<4;i++)jumper([109.78,65.47-i*2.54],[104.7,65.47-i*2.54],i+2,1);
 jumper([13.26,85.79],[56.44,85.79],0,1);jumper([15.8,88.33],[58.98,88.33],1,1);
}
export async function readGrobotData(){
 let bytes;if(globalThis.__BREAKBOARD_ASSETS?.grobot)bytes=Uint8Array.from(atob(globalThis.__BREAKBOARD_ASSETS.grobot),c=>c.charCodeAt(0));
 else{const response=await fetch(new URL('models/grobot.json.gz',document.baseURI));if(!response.ok)throw Error('Could not load Grobot module CAD');bytes=new Uint8Array(await response.arrayBuffer());}
 let stream=new Blob([bytes]).stream();if(bytes[0]===31&&bytes[1]===139)stream=stream.pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(stream).text());
}
export async function buildGrobot(data){
 data ||= await readGrobotData();const{root,groups}=makeAssembly(GROBOT_PARTS),materials=new Map();
 for(const source of data.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(source.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(source.n,3));geo.setIndex(source.i);const key=source.material.join(',');if(!materials.has(key))materials.set(key,material(...source.material));mesh(geo,materials.get(key),groups[source.group]);}
 buildController(groups.controller);buildDisplay(groups.display);buildCells(groups);buildServo(groups.servo);buildMicrophone(groups.microphone);buildAmplifier(groups.amplifier);buildSpeaker(groups.speaker);
 label(groups.ups,'WAVESHARE',34,40.025,78,26,3,'#dce9e3');label(groups.ups,'UPS HAT (D)',34,40.025,74,25,3,'#dce9e3');
 for(const id of['ups','holder','cell1','cell2'])relocate(groups[id],[35,40,55.5],[35,47.5,37],-Math.PI/2);
 relocate(groups.controller,[78,17,86.25],[92,46,15],-Math.PI/2);
 relocate(groups.display,[30,64.603,104.25],[24,94.603,43]);
 relocate(groups.servo,[73,61.65,104.1],[60,90.8,51]);
 relocate(groups.microphone,[22.35,53,22.9],[44,93,31]);
 relocate(groups.amplifier,[78,14,30],[96,77,39]);
 relocate(groups.speaker,[72,58,31],[93,43,68],-Math.PI/2);
 buildCarrier(groups);buildFrame(groups);buildMounts(groups);buildPointer(groups.pointer);buildOpenFilaments(groups);buildOpenControls(groups);buildHarness(groups.harness);
 root.userData={board:'grobot',...data.metadata,dimensions:[122,80,100],spec:GROBOT_SPEC};return finishAssembly(root,groups,GROBOT_PARTS);
}
export const GROBOT_BOARD={id:'grobot',category:'motion',tab:'Grobot',title:'Grobot',edition:'017',model:'Open brass frame / hardware concept',menuDetail:'ESP32-S3 · brass frame · voice & display',basis:'Manufacturer CAD + custom open-frame concept',dimensions:'122 × 100 × 80 MM',parts:GROBOT_PARTS,build:buildGrobot,assembledHalf:86,minHalfWidth:92,explodedMinHalfWidth:168,assembledTarget:[10,38,15],half:159,target:[10,75,27],camera:[-180,175,280],views:{front:[10,75,320],top:[10,330,27.01]},floorY:-.2,groundRadius:79,start:0,operationNote:'Illustrative power & audio flow · sample activity',stats:[['16 / 8','MB','FLASH / PSRAM'],['172 × 320','','LCD RESOLUTION'],['2','','FILAMENT PAIRS'],['36','Wh','NOMINAL BATTERY ENERGY']],
sources:[['Waveshare · UPS HAT (D) and STEP','https://www.waveshare.com/wiki/UPS_HAT_%28D%29'],['Waveshare · 1.47-inch LCD and STEP','https://www.waveshare.com/wiki/1.47inch_LCD_Module'],['TowerPro · SG90','https://towerpro.com.tw/product/sg90-7/'],['BAK · N21700CG-50 datasheet','https://www.bakpower.com/uploads/cpxl_table1_en/N21700CG-50_en.pdf'],['TDK · INMP441 datasheet','https://invensense.tdk.com/wp-content/uploads/2015/02/INMP441.pdf'],['Analog Devices · MAX98357A','https://www.analog.com/en/products/max98357a.html']],accuracy:'The same revision B electronics are rearranged into a custom open brass frame on a 2.54 mm perfboard. The Waveshare UPS and LCD retain 325 original STEP solids; BAK cells and SG90 keep manufacturer envelopes. The AYWHP controller appearance, audio boards and speaker are reconstructed. Frame, carrier, mounts, pointer, controls and visible wiring are proposed and unvalidated. Four filaments form two red/green pairs; six driver positions remain unpopulated. The brass structure is electrically isolated. Sealed batteries, servo and IC interiors are not fabricated. This is an educational packaging concept, not manufacturing CAD or a verified circuit. Play shows sample content and an illustrative servo command without angle feedback.',hidden:[],connections:[['ups','controller'],['controller','display'],['controller','servo'],['controller','amplifier'],['amplifier','speaker']],license:'Waveshare reference STEP geometry remains subject to its source terms. Other Grobot geometry is an original reconstruction or custom hardware concept; vendor marks identify depicted hardware.'};
