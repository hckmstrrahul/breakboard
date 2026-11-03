import * as T from 'three';
import {makeAssembly,finishAssembly} from './assembly.js';
import {batchAssembly} from './batching.js';
import {textDecal,box,mesh,material,M} from './model.js';
import {usbPort,ethernet} from './board-kit.js';
import {makeRotor} from './hardware-motion.js';
const part=(id,name,kind,description,specs,anchor,offset,detail=false)=>({id,name,short:name.toUpperCase(),kind,description,specs,anchor,offset,detail});
export const JETSON_PARTS=[
 part('module','Orin Nano compute module','8 GB SYSTEM-ON-MODULE','The removable Orin Nano module combines the Arm CPU, Ampere GPU and LPDDR5 memory. NVIDIA supplies its package envelope in this CAD assembly; the shapes beneath the cooler show clearance volumes rather than individual silicon packages.',[['CPU','6-core Cortex-A78AE'],['GPU','1,024 CUDA cores'],['Memory','8 GB LPDDR5']],[-2,10,-18],[0,25,0]),
 part('heatsink','Aluminium heatsink','OFFICIAL COOLING ASSEMBLY','The finned heatsink transfers heat from the compute module into the fan airflow. Its cavity, fins and mounting features retain the official NVIDIA CAD geometry.',[['Material','Aluminium'],['CAD envelope','57.8 × 39 mm'],['Source','Official STEP']],[-2,21,-19.5],[0,45,0]),
 part('fan','Cooling fan','35 MM ACTIVE COOLING','The impeller and motor lift from the heatsink. The blade geometry and motor supports are taken directly from the developer-kit CAD.',[['Impeller','≈35 mm'],['Control','PWM / tachometer'],['Supply','5 V']],[-2,27,-19.5],[0,66,0]),
 part('board','P3768 carrier board','100 × 79 MM PCB','The carrier connects the compute module to USB, Ethernet, DisplayPort, camera and expansion interfaces. Its outline, mounting holes and component positions come from NVIDIA’s official mechanical assembly.',[['Envelope','100 × 79 mm'],['Thickness','1.57 mm'],['Revision','P3768 A04']],[-25,.8,8],[0,0,0]),
 part('ports','External connectors','USB, DISPLAYPORT, ETHERNET & POWER','Two stacked USB-A connectors provide four USB ports. The front edge also carries DisplayPort, Gigabit Ethernet, USB-C for data and a DC power jack. USB-C is not the kit’s display output.',[['USB-A','4 × USB 3.2'],['Display','DisplayPort'],['Power','DC barrel input']],[-6,9,35],[0,12,10]),
 part('headers','40-pin expansion header','2 × 20 GPIO HEADER','The 40-position female header exposes GPIO and peripheral buses. It retains the 2.54 mm pitch and source location along the side of the carrier.',[['Contacts','40'],['Pitch','2.54 mm'],['Functions','GPIO / I²C / SPI / UART']],[46,7,-6],[11,16,0]),
 part('socket','Compute-module socket','260-CONTACT SO-DIMM CONNECTOR','The keyed socket accepts the compute module’s edge contacts. Its retention arms and openings retain the official CAD shapes.',[['Contacts','260'],['Module','Orin Nano / Orin NX'],['Mount','SO-DIMM socket']],[-2,6,7],[0,12,0],true),
 part('mounts','Cooler & module fasteners','SCREWS, STANDOFFS & SPRING CLIP','The mounting hardware holds the module and thermal assembly together. The spring clip, screws and standoffs use their original CAD geometry and axes.',[['Source','Official CAD'],['Role','Thermal / module retention']],[-23,11,-34],[-9,34,-4],true),
 part('fanwire','Fan cable & connector','FOUR-WIRE FAN CONNECTION','The four-conductor fan cable routes to the dedicated header on the carrier. The cable and plug move as one group.',[['Contacts','4'],['Signals','Power / ground / PWM / tach']], [38,7,-30],[10,26,-5],true),
 part('camera','Camera connectors','TWO MIPI CSI CONNECTORS','The two 22-position flexible-cable connectors expose the camera interfaces on the opposite edge from the GPIO bank.',[['Connectors','2'],['Contacts','22 each'],['Pitch','0.5 mm']],[-47,2,-7],[-12,15,0],true),
 part('expansion','M.2 expansion sockets','TWO KEY-M & ONE KEY-E','Two underside Key-M sockets support NVMe storage, and the Key-E socket holds the wireless module. The optional SSD included as an example in NVIDIA’s CAD is omitted from this stock-kit view.',[['Key-M','PCIe 3.0 ×4 / ×2'],['Key-E','Wireless module'],['Location','Underside']],[-40,-3,-15],[-4,-8,0],true),
 part('wireless','Wireless module & antennas','WI-FI / BLUETOOTH HARDWARE','The underside wireless module, coaxial leads and two antenna boards are grouped together. Their source geometry follows the vendor CAD assembly.',[['Connection','M.2 Key-E'],['Antennas','2'],['Location','Underside / rear edge']], [12,-4,-28],[0,-11,-7],true),
 part('control','Control header','BUTTON & DEBUG SIGNALS','The low-profile control header provides power, reset, recovery and debug connections. It remains a separate assembly from the main 40-pin GPIO bank.',[['Positions','12'],['Function','Control / debug']],[-14,3,-35],[0,16,-8],true),
 part('smd','SMD components','CARRIER SUPPORT CIRCUITRY','The carrier’s small packages, power components and their terminals form one selectable group. Their original locations and geometry are preserved; electrical values are not inferred from the STEP file.',[['Location','Top and underside'],['Source','Official CAD'],['Grouping','One assembly']], [28,3,-4],[0,8,0],true),
 part('base','Carrier support base','MOULDED SUPPORT & FASTENERS','The support base and its carrier mounting screws sit below the PCB. This part retains the supplied CAD silhouette and openings.',[['Source','Official CAD'],['Position','Below carrier']], [0,-4,0],[0,-10,0],true)
];
JETSON_PARTS.forEach((p,i)=>p.n=String(i+1).padStart(2,'0'));
// Vendor CAD uses closed envelopes for these receptacles. Their exterior sizes and
// centres below follow that CAD; the recessed tongues and contacts are illustrative.
function externalPorts(parent){
 const blue=material('#1e5787',0,.58);
 for(const x of [-7.40,9.60]){
  const g=new T.Group();g.position.set(x,.785,31.8);parent.add(g);
  const w=16.98,h=16.92,d=18.7;
  for(const y of [.15,h-.15,8.45])box(g,w,.3,d,[0,y,0],M.silver,.04);
  for(const side of [-1,1]){
   box(g,.3,h,d,[side*(w/2-.15),h/2,0],M.silver,.04);
   box(g,1.55,h-.6,d-.5,[side*7.4,h/2,-.15],M.black,.035);
  }
  box(g,w-.6,h-.6,.45,[0,h/2,-d/2+.25],M.black,.04);
  for(const y of [3.5,11.9]){
   box(g,11.85,1.6,11.5,[0,y,1.35],blue,.055);
   for(let i=0;i<4;i++)box(g,.8,.08,5.3,[(i-1.5)*2.5,y+.84,3],M.gold,.015);
   for(let i=0;i<5;i++)box(g,.42,.08,2.6,[(i-2)*1.65,y+.84,-1.7],M.gold,.015);
  }
  for(const side of [-1,1]){box(g,1.8,.06,4.4,[side*3.4,h+.02,2.3],M.black,.04);const spring=box(g,1.3,.18,3.6,[side*3.4,h+.1,2.3],M.silver,.04);spring.rotation.x=-.05;}
  g.userData.connector={type:'stacked-usb-a',sockets:2,contacts:18,opening:'+z'};
 }
 const lan=ethernet(parent,{x:26.95,z:30.45,base:.785});lan.scale.set(1.029,1.019,1.041);
 const dp=usbPort(parent,'displayport',{x:-27.24,z:33.84,base:.785});dp.scale.set(1.134,1.378,1.253);dp.position.y=.785+3.445;
 const usbc=usbPort(parent,'c',{x:41.98,z:35.705,base:1.08});usbc.scale.set(1.121,1,1.469);
 const dc=new T.Group();dc.position.set(-43.535,.785,33.76);parent.add(dc);
 const shape=new T.Shape();shape.moveTo(-4.9,0);shape.lineTo(4.9,0);shape.lineTo(4.9,9.4);shape.quadraticCurveTo(4.9,11,3.3,11);shape.lineTo(-3.3,11);shape.quadraticCurveTo(-4.9,11,-4.9,9.4);shape.closePath();
 const bore=new T.Path();bore.absarc(0,5.8,2.8,0,Math.PI*2,true);shape.holes.push(bore);
 mesh(new T.ExtrudeGeometry(shape,{depth:14.78,bevelEnabled:false,curveSegments:24}),M.black,dc,[0,0,-7.39]);
 const pin=mesh(new T.CylinderGeometry(.95,.95,7,20),M.silver,dc,[0,5.8,2.8]);pin.rotation.x=Math.PI/2;
 box(dc,9.6,10.8,.4,[0,5.5,-7.3],M.black,.08);
}
export async function readJetsonData(){
 let bytes;
 if(globalThis.__BREAKBOARD_ASSETS?.jetson)bytes=Uint8Array.from(atob(globalThis.__BREAKBOARD_ASSETS.jetson),c=>c.charCodeAt(0));
 else{const response=await fetch(new URL('models/jetson.json.gz',document.baseURI));if(!response.ok)throw Error('Could not load NVIDIA CAD');bytes=new Uint8Array(await response.arrayBuffer());}
 let stream=new Blob([bytes]).stream();if(bytes[0]===0x1f&&bytes[1]===0x8b)stream=stream.pipeThrough(new DecompressionStream('gzip'));
 return JSON.parse(await new Response(stream).text());
}
export async function buildJetson(data){
 data ||= await readJetsonData();
 const{root,groups}=makeAssembly(JETSON_PARTS),materials=new Map();
 for(const source of data.meshes){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(source.p,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(source.n,3));geometry.setIndex(source.i);geometry.computeBoundingSphere();const key=source.material.join(',');if(!materials.has(key)){const[color,metalness,roughness]=source.material;materials.set(key,new T.MeshStandardMaterial({color,metalness,roughness}));}const mesh=new T.Mesh(geometry,materials.get(key));groups[source.group].add(mesh);if(source.rotorPivot)makeRotor(groups[source.group],[mesh],source.rotorPivot);}
 externalPorts(groups.ports);
 textDecal(groups.heatsink,'NVIDIA',12,4,[19.8,29.1,-19],{color:'#b7bbb5',size:60});
 textDecal(groups.board,'NVIDIA',16,4,[22,.81,-33],{color:'#e7ebe1',size:70});
 textDecal(groups.module,'ORIN NANO',27,7,[-2,11.58,-17],{color:'#7d8e80',size:66});
 root.userData={board:'jetson',...data.metadata};
 return batchAssembly(finishAssembly(root,groups,JETSON_PARTS,{merge:true,skipGroups:new Set(data.meshes.map(m=>m.group))}));
}
export const JETSON_BOARD={id:'jetson',tab:'Jetson Orin Nano',title:'Jetson Orin<br>Nano Super',edition:'004',subtitle:'An AI computer, layer by layer.',intro:'Explore the compute module, cooling and carrier behind NVIDIA’s compact developer kit.',model:'NVIDIA Jetson Orin Nano Super / P3766',basis:'Official 3D CAD',dimensions:'100 × 79 MM CARRIER',parts:JETSON_PARTS,build:buildJetson,half:90,camera:[125,140,160],target:[0,22,0],start:0,stats:[['8','GB','LPDDR5 MEMORY'],['1,024','','CUDA CORES'],['40','PINS','GPIO HEADER'],['4','PORTS','USB TYPE-A']],sources:[['NVIDIA · Official 3D STEP model','https://developer.nvidia.com/downloads/assets/embedded/secure/jetson/orin_nano/docs/jetson_orin_nano_devkit_3d_step_model.zip/'],['NVIDIA · Carrier board specification','https://developer.nvidia.com/downloads/assets/embedded/secure/jetson/orin_nano/docs/jetson_orin_nano_devkit_carrier_board_specification_sp.pdf'],['NVIDIA · Hardware layout','https://docs.nvidia.com/jetson/orin-nano-devkit/user-guide/latest/hardware_layout.html']],accuracy:'Carrier, heatsink, fan, support base, internal sockets and mounting hardware are tessellated from NVIDIA’s official P3766 STEP model in millimetres. External receptacles are reconstructed with open shells at the CAD positions and envelope sizes; their recessed contacts are illustrative. The module is the vendor’s mechanical envelope, not a reconstruction of individual chips. Materials and printed markings are reconstructed. The optional example SSD in the source CAD is omitted. The Super software upgrade uses the same physical developer-kit hardware.',hidden:['module'],license:'NVIDIA reference mechanical model. Source geometry remains subject to NVIDIA’s download terms.'};
