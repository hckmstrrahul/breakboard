import * as T from 'three';
import {mesh,box,material,texture,M} from './model.js';
import {pcb,usbPort,ic,passive,silk} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';
import {indicatorMaterial} from './hardware-motion.js';

// Project coordinates: x = left→right, d = back→front, h = bottom→top, in mm.
export const GROBOT_SPEC=Object.freeze({width:100,depth:68,height:132,cellDiameter:21.25,cellLength:70.5,cellCount:2,filamentLength:40,filamentCount:4,installedBars:2,railDiameter:3,railLength:89,anchorDiameter:1.5,controllerPins:44,screen:[17.39,32.35],pixels:[172,320]});
const at=(x,d,h)=>[x-50,h,d-34];
const part=(id,name,short,kind,description,specs,p,offset)=>({id,name,short,kind,description,specs,anchor:at(...p),offset});
export const GROBOT_PARTS=[
 part('fascia','Front fascia & grille','FRONT FASCIA','CUSTOM POLYMER FRONT PANEL','A removable front panel with real openings for the LCD, anchor, filament bars, microphone and controls. The speaker grille has open slots. This is proposed enclosure geometry, not a measured manufactured shell.',[['Material','Proposed polymer'],['Wall','2 mm'],['Fixing','4 front screws']],[12,65,92],[-8,0,108]),
 part('lid','Top cover','TOP COVER','REMOVABLE ANTENNA-SAFE COVER','The upper cover stays polymer above the ESP32 antenna. Its lip seats inside the enclosure; fasteners and locating tabs are custom design details.',[['Material','Proposed polymer'],['Thickness','2 mm']],[50,35,132],[0,68,-12]),
 part('shell','Rear & side shell','REAR SHELL','CUSTOM U-SHAPED ENCLOSURE','The back and side walls surround the selected modules. Side openings expose the UPS charging/output ports and switch. Vent slots and cable clearance are proposed; fabrication still requires a fit check.',[['Envelope','100 W × 68 D × 132 H mm'],['Wall','2 mm']],[94,30,75],[0,10,-62]),
 part('frame','Base, rails & mounts','BRASS RAILS','INSULATED BRASS HARNESS','Four 3 mm brass rails rise from insulating end blocks and stop below the controller antenna. The base, feet and brackets support the modules; none of the metal rails is used as an electrical conductor.',[['Rails','4 × Ø3 × 89 mm'],['Mounts','Custom insulated brackets']],[98,66,55],[0,0,0]),
 part('controller','ESP32-S3 N16R8','ESP32-S3','AYWHP DEVKITC CONTROLLER','The controller is reconstructed from the matching AYWHP photographs: two USB-C sockets, two 22-pin headers, shielded module, USB bridge, regulator and BOOT/RESET buttons. The clone’s exact outline and package coordinates remain unmeasured.',[['Flash / PSRAM','16 MB / 8 MB'],['Header contacts','44'],['Reserved envelope','28 × 69 mm']],[78,21,109],[67,42,-24]),
 part('display','1.47-inch IPS LCD','1.47-INCH LCD','WAVESHARE · ST7789V3','The original PCB, connector, mounting hardware and LCD body come from Waveshare’s STEP model. The portrait active area retains its physical dimensions and pixel aspect ratio. Play displays a labelled sample screen.',[['Resolution','172 × 320 pixels'],['Active area','17.39 × 32.35 mm'],['PCB','22 × 38.5 mm']],[30,64.6,107],[-34,52,64]),
 part('servo','TowerPro SG90','SG90 SERVO','THREE-WIRE POSITION SERVO','The SG90 supplies the anchor’s motion through a custom horn adapter. Its blue case, output boss, mounting ears and lead are reconstructed from TowerPro’s dimensions and photographs. Internal gears and feedback parts remain inside the sealed package.',[['Body envelope','23 × 12.2 × 29 mm'],['Interface','Power · ground · command'],['Feedback to ESP32','None']],[80,57,104.1],[58,38,24]),
 part('anchor','Brass anchor & horn','BRASS ANCHOR','CUSTOM 1.5 MM ROD INDICATOR','A bent brass anchor and horn adapter share the servo output axis. Play shows a slow illustrative ±30° command. This is not a measured servo response or live market reading.',[['Rod','Ø1.5 mm brass'],['Demo command','±30°'],['Construction','Custom bend / hub']],[73,66,109],[43,54,107]),
 part('guard','Dial guard & backplate','DIAL GUARD','ANCHOR CLEARANCE & SCALE','The protective brass rim surrounds the anchor’s swept envelope. Five reference dots identify the project’s proposed commands; the backing plate and rim stay fixed while the anchor moves.',[['Outer diameter','34 mm'],['Reference positions','−55 / −30 / 0 / +30 / +55°']],[86,66,104.1],[40,48,67]),
 part('filaments','Four LED filaments','LED FILAMENTS','TWO RED / GREEN PAIRS','Each of the two fitted bars contains one red and one green continuous 40 mm filament. Their small terminals sit in the tray end clips. The third tray is empty; no extra pair is represented as installed.',[['Installed','2 red + 2 green'],['Length','40 mm each'],['Driver requirement','Independent current limiting']],[45,61.4,76.3],[-35,19,53]),
 part('diffusers','Bar trays & diffusers','BAR DIFFUSERS','THREE CUSTOM LIGHT-BAR SEATS','The translucent covers sit on separate trays. Two trays contain filaments and the third remains unpopulated. Cover shape and material are proposed enclosure parts.',[['Trays','3'],['Populated','2'],['Cover','Custom translucent polymer']],[47,66,69],[-34,17,84]),
 part('ups','Waveshare UPS HAT (D)','UPS HAT (D)','CHARGER, BOOST & POWER PATH','The manufacturer’s 281 circuit-board solids preserve the real PCB, components and connectors. The board uses a parallel two-cell holder. Vendor stacking studs and the acrylic plate are omitted in favour of Grobot’s custom mounts.',[['PCB','56 × 85 mm'],['Output','5 V · rated up to 2.5 A'],['Geometry','Official Waveshare STEP']],[28,43,60],[-112,18,-42]),
 part('holder','Dual 21700 holder','CELL HOLDER','PARALLEL BATTERY CONTACTS','The holder body and four spring/contact pieces retain Waveshare’s STEP geometry. Both cells share the same polarity in the parallel arrangement; no series link is added.',[['Arrangement','1S2P'],['Contacts','Original manufacturer geometry']],[32,17,57],[-54,22,-10]),
 part('cell1','BAK 21700 · cell 1','21700 · CELL 1','SEALED N21700CG-50 CELL','This sealed cell follows BAK’s nominal CG-50 envelope, replacing the generic cell body in the HAT CAD. Wrapper and printed identification are reconstructed. Internal jelly-roll layers are not invented.',[['Capacity','5,000 mAh'],['Nominal voltage','3.6 V'],['Cell size','Ø21.25 × 70.50 mm']],[24.3,37.4,56],[-89,72,38]),
 part('cell2','BAK 21700 · cell 2','21700 · CELL 2','SECOND PARALLEL CELL','The second CG-50 fits the other holder channel. Together the two nominal 18 Wh cells provide 36 Wh before conversion losses; runtime is not inferred.',[['Capacity','5,000 mAh'],['Nominal energy','18 Wh'],['Cell size','Ø21.25 × 70.50 mm']],[45.7,37.4,56],[-53,99,39]),
 part('microphone','INMP441 microphone','INMP441','BOTTOM-PORT I²S MICROPHONE','The TDK package is 4.72 × 3.76 × 1 mm. Its acoustic port faces through the breakout PCB into the front gasket. The 16 × 14 mm breakout is a reserved kit envelope, not verified board CAD.',[['Interface','I²S'],['Acoustic port','Through PCB / front gasket'],['Breakout size','16 × 14 mm · provisional']],[22.35,63,22.9],[-42,0,43]),
 part('amplifier','MAX98357A amplifier','MAX98357A','I²S CLASS-D AUDIO','The reserved amplifier module has an input header, power decoupling and two speaker-output terminals. Exact kit board dimensions and component placement remain unverified. The loudspeaker is driven from this module, not a GPIO pin.',[['Input','I²S'],['Output','Class-D speaker drive'],['Board reservation','20 × 20 mm']],[78,18,30],[70,5,-10]),
 part('speaker','Voice speaker','SPEAKER','PROVISIONAL KIT SPEAKER ENVELOPE','The cone, surround, basket, magnet and terminals fit the project’s reserved Ø40 × 10 mm space. The actual kit speaker’s diameter, impedance and power rating still require inspection; no exact model is claimed.',[['Reserved size','Ø40 × 10 mm'],['Impedance / rating','Unverified kit part']],[72,60,31],[67,1,95]),
 part('drivers','Reserved driver carrier','DRIVER CARRIER','SIX UNPOPULATED CHANNEL POSITIONS','The six positions reserve independently current-limited filament drivers. They remain empty because driver, resistor and protection parts have not been selected. This carrier is a required addition, not a finished circuit.',[['Channels reserved','6'],['Populated','0'],['Status','Component selection required']],[30,53.9,23],[-52,0,12]),
 part('controls','Power, talk & mute','FRONT CONTROLS','PROVISIONAL SWITCH PACKAGES','The three required controls are represented as provisional packages: master power, push-to-talk and hardware microphone mute. Their ratings, final footprints and mute circuit have not been selected.',[['Controls','Power · push-to-talk · mute'],['Status','Packages provisional']],[18,65.5,44],[-11,10,65]),
 part('harness','Wiring & connectors','CABLE LOOM','REPRESENTATIVE ASSEMBLY ROUTES','Short cable bundles link the controller, display, servo and audio modules. Connector shells move with the unplugged loom during teardown. Routing is illustrative and does not assert a verified netlist or fabrication-ready harness.',[['Routes','Power · display · servo · audio'],['Construction','Proposed insulated loom']],[48,46,88],[5,38,20]),
 part('fasteners','Panel fasteners','PANEL SCREWS','REMOVABLE FRONT FIXINGS','Four screws share the fascia’s mounting-hole centres. In the exploded view they follow the front panel and sit just clear of their seats.',[['Quantity','4'],['Geometry','Proposed M2 fixing envelopes']],[10,65.6,126],[-8,0,116])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));

const C={shell:material('#d8d9d3',0,.66),edge:material('#b7bdb7',.1,.6),brass:material('#c0a164',.78,.32),rubber:material('#22272b',0,.84),blue:material('#234b9f',.14,.31),blueCap:material('#2d59b6',.12,.3),yellow:material('#cfba3f',0,.67),cell:material('#819d86',.08,.46),cone:material('#343a3d',0,.83),connector:material('#deded3',0,.65)};
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

function buildHousing(groups){
 const {frame,shell,lid,fascia,fasteners}=groups;
 b(frame,50,34.5,4,90,57,2);for(const x of[12,88])for(const d of[12,54])cylinder(frame,x,d,1.5,3,3,C.rubber);
 for(const x of[2,98])for(const d of[8,66]){b(frame,x,d,7,4,4,4,C.rubber,.4);b(frame,x<50?5:95,d,7,2,4,3,C.shell,.15);cylinder(frame,x,d,53.5,1.5,89,C.brass);cylinder(frame,x,d,99,1.5,2,C.brass);}
 // Back and side walls, with open vents and aligned UPS access windows.
 const vents=[];for(let i=0;i<7;i++)vents.push([-35+i*7,43,2.5,14,1]);
 plate(shell,{x:50,d:5,h:67.5,w:90,height:125,holes:vents});
 plate(shell,{x:6,d:34.5,h:67.5,w:57,height:125,side:true});
 plate(shell,{x:94,d:34.5,h:67.5,w:57,height:125,side:true,holes:[[4,-46,13,13,1],[3,-29,14,18,1],[4,14,9,10,1]]});
 b(lid,50,34.5,131,90,57,2,C.shell,.7);for(const x of[9,91])b(lid,x,34.5,128.8,2,50,2.4,C.edge,.25);
 b(frame,50,64.5,7,86,7,4);for(const x of[10,90]){b(frame,x,60.5,67,4,4,120,C.shell,.3);for(const h of[13,126])ring(frame,x,62,h,1.05,2.5,2,C.shell);}
 // Printed brackets remain with the base harness.
 b(frame,35,47,7,50,4,4);for(const x of[10.5,59.5])for(const h of[16.5,74.5])cylinder(frame,x,22.2,h,1.45,32.4,C.edge,'d');
 b(frame,78,9.5,52,28,7,5,C.rubber,.5);b(frame,78,9.5,118,28,7,4,C.rubber,.5);
 b(frame,78.5,36,96.5,25,36,3);b(frame,45,36,96.5,66,3,3);
 for(const h of[88.5,120])for(const x of[22.5,37.5])cylinder(frame,x,54.5,h,1.5,5,C.edge,'d');
 b(frame,72,44,8,6,20,6,C.edge);b(frame,19,48,14,9,8,4,C.edge);
 const holes=[[-32,14,24,40.5,.6],[23,34.1,17.9],[22,-39,19.8],[-27.65,-47.1,3.1],[-32,-26,4.5],[-19,-36,11.5,5.5,.4],[-19,-26,11.5,5.5,.4]];
 for(const h of[75,66,57])holes.push([-25,h-70-.1,44,6.2,.9]);
 const screws=[[10,13],[90,125],[10,126],[89,54]];for(const[x,h]of screws)holes.push([x-50,h-70,1.05]);
 plate(fascia,{x:50,d:64,h:70,w:86,height:120,holes});
 ring(fascia,72,64.2,31,19,20.6,1.6,C.edge);
 for(let i=-5;i<=5;i++){const y=i*3.5,span=2*Math.sqrt(19.2**2-y*y);b(fascia,72,64.7,31+y,span,1.2,1.05,C.shell,.35);}
 label(fascia,'GROBOT',48,65.025,127,26,3.4,'#6a756c');label(fascia,'ANCHOR / REV B',29,65.025,13.5,27,2,'#879087');
 for(const[x,h]of screws)screw(fasteners,x,65,h,{length:5,r:1.4});
}

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
  c.fillStyle='#e0ebe3';c.font=`500 ${H*.075}px monospace`;c.fillText('ANCHOR',W*.09,H*.31);c.fillStyle='#7bc7a2';c.font=`${H*.046}px monospace`;c.fillText('SYSTEM READY',W*.09,H*.43);
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
function buildAnchor(groups){
 const {guard,anchor}=groups;
 ring(guard,73,63.65,104.1,2.7,17,1.3,C.shell);ring(guard,73,65.2,104.1,15,17,2.8,C.brass);b(guard,91.5,58.5,104.1,3,9,4,C.edge,.25);
 for(const degrees of[-55,-30,0,30,55]){const a=degrees*Math.PI/180;cylinder(guard,73+Math.sin(a)*13.5,64.32,104.1+Math.cos(a)*13.5,.4,.04,C.rubber,'d',12);}
 const moving=new T.Group();moving.position.set(...at(73,65.4,104.1));moving.userData.motion={type:'servo',axis:[0,0,1],angle:30,rate:.6};anchor.add(moving);
 const tube=points=>{const c=new T.CatmullRomCurve3(points.map(([x,y])=>new T.Vector3(x,y,0)),false,'centripetal');mesh(new T.TubeGeometry(c,48,.75,10,false),C.brass,moving);};
 tube([[0,7],[0,-8]]);tube([[-4,3],[4,3]]);tube([[-8,-1],[-6.5,-5],[-3,-7.5],[0,-8],[3,-7.5],[6.5,-5],[8,-1]]);tube([[-9.5,-3],[-8,-1],[-5.5,-2]]);tube([[9.5,-3],[8,-1],[5.5,-2]]);
 mesh(new T.TorusGeometry(1.5,.55,10,40),C.brass,moving,[0,8.8,0]);const hub=mesh(new T.CylinderGeometry(2.3,2.3,2.4,32),M.silk,moving,[0,0,-1]);hub.rotation.x=Math.PI/2;const head=mesh(new T.CylinderGeometry(1,1,.5,24),M.silver,moving,[0,0,.5]);head.rotation.x=Math.PI/2;
}
function buildLightBars(groups){
 for(let row=0;row<3;row++){
  const h=75-row*9;b(groups.diffusers,47,59.75,h+3,44,1.5,6,C.rubber,.5);
  for(const x of[26,68])b(groups.diffusers,x,62,h+3,2,3,6,C.edge,.4);
  const diffuse=material('#d1ded0',0,.43);diffuse.transparent=true;diffuse.opacity=.38;diffuse.depthWrite=false;
  const cover=b(groups.diffusers,47,65,h+3,40,2.7,5.8,diffuse,1);cover.userData.anatomyTransparent=true;
  if(row===2)continue;
  for(const[color,index]of[['red',0],['green',1]]){
   const filament=indicatorMaterial(color==='green'?'#bbce9e':'#d1b392','filament');filament.userData.indicator.channel=color;filament.userData.indicator.row=row;
   const emitter=cylinder(groups.filaments,47,61.4,h+1.3+index*2.7,.9,40,filament,'x');emitter.userData.filament={length:40,color};
   for(const x of[26.5,67.5])cylinder(groups.filaments,x,61.4,h+1.3+index*2.7,.3,1,M.silver,'x',12);
  }
 }
}
function buildMicrophone(g){
 // The acoustic opening faces the viewer. The MEMS package is on the far side.
 const local=vertical(g,22.35,53,22.9),body=pcb(local,{width:16,depth:14,color:'#176d69',holes:[[0,0,1.25]],radius:.7});body.userData.acousticHole=true;
 box(local,4.72,1,3.76,[0,-1.35,0],M.silver,.12);
 for(let i=0;i<3;i++)for(const x of[-5.3,5.3]){const geo=new T.TorusGeometry(.65,.14,6,16);geo.rotateX(Math.PI/2);mesh(geo,M.gold,local,[x,.81,(i-1)*3.8]);}
 for(const x of[-4.4,4.4])passive(local,{x,z:-4.7,width:1.5,depth:.8});silk(local,'INMP441',0,-5,8.5,1.6);
 ring(g,22.35,59,22.9,1.2,3,10.3,C.rubber); // seals the PCB port to the fascia opening
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
 const cone=mesh(new T.ConeGeometry(17.8,3.5,64,1,true),C.cone,g,at(72,58.8,31));cone.rotation.x=-Math.PI/2;
 const surround=mesh(new T.TorusGeometry(18,1.2,12,64),C.rubber,g,at(72,60,31));
 const dome=mesh(new T.SphereGeometry(5,32,16,0,Math.PI*2,0,Math.PI/2),C.cone,g,at(72,60.2,31));dome.rotation.x=Math.PI/2;dome.scale.y=.35;
 for(const x of[63,67])b(g,x,53.2,18,3,2,1,M.silver,.12);
}
function buildRequiredParts(groups){
 const drivers=vertical(groups.drivers,30,53,23.5);pcb(drivers,{width:40,depth:27,color:'#654d2a',holes:[[-17,-10,2],[17,-10,2],[-17,10,2],[17,10,2]],radius:1});
 for(let i=0;i<6;i++){const x=(i%3-1)*12,z=(Math.floor(i/3)-.5)*10;for(let p=0;p<3;p++)box(drivers,1,.08,2,[x+(p-1)*2,.84,z],M.gold,.03);silk(drivers,'CH'+(i+1),x,z+3.5,6,1.6);}
 silk(drivers,'RESERVED',0,-10,18,2);
 const g=groups.controls,control=vertical(g,28,55,41);pcb(control,{width:32,depth:18,color:'#4a5353',radius:.6});
 cylinder(g,18,59.5,44,4,7.4,C.rubber,'d');cylinder(g,18,64,44,3.5,2.5,M.silver,'d');
 for(const h of[36.5,46.5]){b(g,36.5,59.3,h,11,7.4,5,C.rubber,.25);b(g,36.5,64.5,h,5,3,3,C.edge,.35);for(const x of[33,36.5,40])b(g,x,54,h,1,3,.5,M.silver,.04);}
 label(g,'PTT',18,65.6,49.7,7,1.5);label(g,'MUTE',36.5,66.03,50.5,10,1.4);label(g,'POWER',36.5,66.03,40.5,10,1.4);
}
function buildHarness(g){
 const copper=material('#a06b40',.45,.55),wireColors=['#9c493c','#2a3035','#cba05d','#4d7e74'];
 const routes=[
  {n:3,points:[[90,37,101],[91,31,96],[86,28,89],[87,20,83]]},
  {n:4,points:[[30,56,103],[43,54,105],[51,43,112],[65,25,109],[68,20,106]]},
  {n:3,points:[[64,46,28],[65,52,32],[51,54,40],[18,54,42]]},
  {n:3,points:[[40,53,42],[53,48,44],[64,28,48],[68,20,64]]},
  {n:3,points:[[78,18,38],[86,23,39],[89,26,51],[88,20,66]]},
  {n:2,points:[[76,19,23],[78,34,19],[67,43,15],[65,53,18]]},
  {n:3,points:[[25,50,23],[35,45,24],[56,45,38],[65,28,48],[68,20,70]]},
  {n:4,points:[[47,55,29],[49,55,44],[59,55,51],[67,58,67]]}
 ];
 routes.forEach(({n,points},index)=>{
  for(let strand=0;strand<n;strand++)route(g,points.map(([x,d,h])=>[x+(strand-(n-1)/2)*.85,d,h]),.36,material(wireColors[strand%4],0,.62));
  for(const p of[points[0],points.at(-1)]){b(g,p[0],p[1],p[2],n*.85+1,2.5,3,C.connector,.2);for(let pin=0;pin<n;pin++)b(g,p[0]+(pin-(n-1)/2)*.85,p[1]-.1,p[2]-.9,.35,2,.4,copper,.02);}
 });
}
export async function readGrobotData(){
 let bytes;if(globalThis.__BREAKBOARD_ASSETS?.grobot)bytes=Uint8Array.from(atob(globalThis.__BREAKBOARD_ASSETS.grobot),c=>c.charCodeAt(0));
 else{const response=await fetch(new URL('models/grobot.json.gz',document.baseURI));if(!response.ok)throw Error('Could not load Grobot module CAD');bytes=new Uint8Array(await response.arrayBuffer());}
 let stream=new Blob([bytes]).stream();if(bytes[0]===31&&bytes[1]===139)stream=stream.pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(stream).text());
}
export async function buildGrobot(data){
 data ||= await readGrobotData();const{root,groups}=makeAssembly(GROBOT_PARTS),materials=new Map();
 for(const source of data.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(source.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(source.n,3));geo.setIndex(source.i);const key=source.material.join(',');if(!materials.has(key))materials.set(key,material(...source.material));mesh(geo,materials.get(key),groups[source.group]);}
 buildHousing(groups);buildController(groups.controller);buildDisplay(groups.display);buildCells(groups);buildServo(groups.servo);buildAnchor(groups);buildLightBars(groups);buildMicrophone(groups.microphone);buildAmplifier(groups.amplifier);buildSpeaker(groups.speaker);buildRequiredParts(groups);buildHarness(groups.harness);
 label(groups.ups,'WAVESHARE',34,40.025,78,26,3,'#dce9e3');label(groups.ups,'UPS HAT (D)',34,40.025,74,25,3,'#dce9e3');
 root.userData={board:'grobot',...data.metadata,dimensions:[100,132,68],spec:GROBOT_SPEC};return finishAssembly(root,groups,GROBOT_PARTS);
}
export const GROBOT_BOARD={id:'grobot',category:'motion',tab:'Grobot',title:'Grobot',edition:'017',model:'Anchor / revision B hardware concept',menuDetail:'ESP32-S3 · brass anchor · voice & display',basis:'Manufacturer CAD + reference reconstruction',dimensions:'100 × 68 × 132 MM',parts:GROBOT_PARTS,build:buildGrobot,assembledHalf:91,assembledTarget:[0,66,0],half:166,target:[0,87,27],camera:[-180,173,280],views:{front:[0,87,300],top:[0,330,27.01]},floorY:-.2,groundRadius:65,start:0,operationNote:'Sample display & ±30° servo command',stats:[['16 / 8','MB','FLASH / PSRAM'],['172 × 320','','LCD RESOLUTION'],['2','','PAIRED LIGHT BARS'],['36','Wh','NOMINAL BATTERY ENERGY']],sources:[['Waveshare · UPS HAT (D) and STEP','https://www.waveshare.com/wiki/UPS_HAT_%28D%29'],['Waveshare · 1.47-inch LCD and STEP','https://www.waveshare.com/wiki/1.47inch_LCD_Module'],['TowerPro · SG90','https://towerpro.com.tw/product/sg90-7/'],['BAK · N21700CG-50 datasheet','https://www.bakpower.com/uploads/cpxl_table1_en/N21700CG-50_en.pdf'],['TDK · INMP441 datasheet','https://invensense.tdk.com/wp-content/uploads/2015/02/INMP441.pdf'],['Analog Devices · MAX98357A','https://www.analog.com/en/products/max98357a.html']],accuracy:'Grobot follows the supplied Anchor revision B hardware concept. The Waveshare UPS and LCD use 325 original STEP solids. BAK cell and SG90 envelopes follow manufacturer dimensions. AYWHP controller appearance, audio modules, speaker, wiring, shell, mounts, horn, controls and diffusers are reconstructed or proposed; unmeasured envelopes and unselected parts are identified in the inspector. Only two filament pairs are installed, with the third tray empty and six driver positions unpopulated. The sealed batteries, servo and IC interiors are not fabricated. The model is educational packaging geometry, not manufacturing CAD, an electrically validated circuit, or a working voice/portfolio service. Play uses sample content and an illustrative servo command without angle feedback.',hidden:['controller','servo','ups','holder','cell1','cell2','microphone','amplifier','speaker','drivers','harness'],connections:[],license:'Waveshare reference STEP geometry remains subject to its source terms. Other Grobot geometry is an original reconstruction of the supplied project concept; vendor marks identify depicted hardware.'};
