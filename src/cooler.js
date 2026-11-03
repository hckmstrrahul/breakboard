import * as T from 'three';
import {mesh,box,material,textDecal} from './model.js';
import {makeRotor} from './hardware-motion.js';
// Official reference envelope 63.5 × 42.5 × 13.7 mm. Board coordinates
// for the two dedicated push-pin holes: (3.5,9.5), (61.5,46.5).
export const COOLER_MOUNTS=[[3.5,9.5],[61.5,46.5]];
export const COOLER_PARTS=[
 {id:'heatsink',name:'Active Cooler · heatsink',short:'ALUMINIUM HEATSINK',kind:'OFFICIAL RASPBERRY PI ACTIVE COOLER',description:'The official cooler uses a single aluminium heatsink with a segmented fin field and a blower landing. The envelope and mounting positions follow Raspberry Pi’s mechanical drawings; fin details are reconstructed from the reference.',specs:[['Envelope','63.5 × 42.5 mm'],['Material','Anodised aluminium'],['Mounts','2 spring-loaded pins']],anchor:[-22,10,-2],offset:[0,39,0],category:'Cooling kit'},
 {id:'blower',name:'Active Cooler · blower',short:'30 MM BLOWER',kind:'PWM BLOWER ASSEMBLY',description:'A 30 mm blower draws air through its circular inlet and sends it sideways through the fins. The open inlet reveals the black impeller beneath the metal shroud. Fan details are reconstructed from product photography.',specs:[['Footprint','30 × 30 mm'],['Supply','5 V'],['Control','PWM + tachometer']],anchor:[0,12,-5.5],offset:[0,56,0],category:'Cooling kit'},
 {id:'coolerPins',name:'Cooler push pins & springs',short:'SPRING-LOADED PINS',kind:'TWO DEDICATED MOUNTING HOLES',description:'Two white push pins and steel compression springs hold the cooler against its thermal interfaces. Their axes align with the dedicated Pi 5 cooler holes. The exploded view is explanatory.',specs:[['Count','2'],['Pin spacing','58 × 37 mm'],['Retention','Barbed push pin']],anchor:[19,12,-18.5],offset:[0,61,0],category:'Cooling kit'},
 {id:'thermalPads',name:'Thermal contact pads',short:'THERMAL INTERFACES',kind:'CPU, MEMORY & POWER MANAGEMENT',description:'Three compliant thermal interfaces bridge the cooler to the CPU, memory and power-management package. Contact positions follow the board CAD; pad thicknesses and underside lands are reconstructed.',specs:[['Contacts','3'],['Material','Thermal silicone'],['Purpose','Heat transfer']],anchor:[-9.35,3.3,5.25],offset:[0,31,0],category:'Cooling kit'},
 {id:'fanCable',name:'Fan cable & plug',short:'4-WIRE FAN LEAD',kind:'POWER / GROUND / PWM / TACHOMETER',description:'Four insulated wires connect the blower to the dedicated four-pin FAN connector near the USB stack. The routed cable shape is illustrative; it disconnects with the blower in the exploded view.',specs:[['Conductors','4'],['Connection','FAN header'],['Lead route','Reconstructed']],anchor:[20,12,-18],offset:[0,56,0],category:'Cooling kit'},
 {id:'fanScrews',name:'Blower mounting screws',short:'3 BLOWER SCREWS',kind:'HEATSINK-MOUNTED BLOWER',description:'Three small screws secure the blower to the heatsink. They lift along their mounting axes above the detached blower.',specs:[['Count','3'],['Material','Steel'],['Geometry','Photo reconstruction']],anchor:[12.7,12,-18],offset:[0,65,0],category:'Cooling kit'}
];
COOLER_PARTS.forEach(p=>p.accessory=true);
const point=(x,y,h)=>[x-42.5,h,28-y];
function flatShape(points,holes=[],depth=1){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x-42.5,y-28):s.moveTo(x-42.5,y-28));s.closePath();for(const[x,y,r]of holes){const p=new T.Path();p.absarc(x-42.5,y-28,r,0,Math.PI*2,true);s.holes.push(p);}const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:48});g.rotateX(-Math.PI/2);return g;}
export function addCooler(groups){
 const alu=material('#bfc3c6',.9,.34),steel=material('#969c9f',.88,.28),nylon=material('#f1eee4',0,.57),black=material('#17191c',0,.63),pad=material('#9babb1',0,.88);
 const base=groups.heatsink;
 const outline=[[.5,9.5],[2.25,6.5],[5.8,6.5],[7,9],[35.5,9],[44.5,18],[61,18],[64,20],[64,46.5],[62.25,49],[7,49],[7,18]];
 mesh(flatShape(outline,COOLER_MOUNTS.map(([x,y])=>[x,y,1.5]),1.3),alu,base,[0,3.55,0]);
 for(let col=0;col<6;col++)for(let row=0;row<9;row++){
  const x=8.4+col*3.45,y=10.2+row*4.65;
  box(base,1.8,7.25,2.9,point(x,y,8.475),alu,.08);
  // Paired grooves in each cut fin follow the visible extrusion pattern.
  for(const dx of [-.5,.5])box(base,.2,7.3,3.05,point(x+dx,y,8.5),alu,.025);
 }
 const contacts=[[33.15,22.75,14,14,3.0437],[33.15,39.2,11,8,1.668],[11.2,15.2,4.5,4.5,1.222]];
 for(const[x,y,w,d,top]of contacts){const t=.5;box(groups.thermalPads,w,t,d,point(x,y,top+t/2),pad,.08);const land=3.55-(top+t);if(land>0)box(base,w,land,d,point(x,y,top+t+land/2),alu,.05);}
 // 30 mm metal blower shroud with a real circular inlet and side outlet.
 const fan=groups.blower,fx=42.5,fy=33.5;
 mesh(flatShape([[27.5,18.5],[57.5,18.5],[57.5,48.5],[27.5,48.5]],[[fx,fy,10.7]],.45),alu,fan,[0,11.45,0]);
 box(fan,30,.35,30,point(fx,fy,5.15),alu,.12);
 for(const[x,y,w,d]of[[57.25,fy,.5,30],[fx,18.75,30,.5],[fx,48.25,30,.5]])box(fan,w,6.2,d,point(x,y,8.3),alu,.1);
 const rotorParts=[mesh(new T.CylinderGeometry(10.3,10.3,.6,64),black,fan,point(fx,fy,5.8)),mesh(new T.CylinderGeometry(6.2,6.6,4.6,48),black,fan,point(fx,fy,8.2))];
 for(let i=0;i<28;i++){const a=i*Math.PI*2/28;const b=box(fan,.45,4.4,3.5,point(fx+8.2*Math.cos(a),fy+8.2*Math.sin(a),8.3),black,.12);b.rotation.y=a+.5;rotorParts.push(b);}
 rotorParts.push(textDecal(fan,'5 V PWM',9,4,point(fx,fy,10.53),{size:78,color:'#596169'}));
 makeRotor(fan,rotorParts,point(fx,fy,0));
 for(const[x,y]of[[31.5,46],[54.5,46],[54.5,21]]){
  mesh(new T.CylinderGeometry(.8,.8,6,16),steel,groups.fanScrews,point(x,y,8.5));mesh(new T.CylinderGeometry(1.55,1.55,.9,24),steel,groups.fanScrews,point(x,y,12.05));
  for(const a of [0,Math.PI/2]){const slot=box(groups.fanScrews,1.9,.05,.26,point(x,y,12.52),black,.02);slot.rotation.y=a;}
 }
 for(const[x,y]of COOLER_MOUNTS){
  mesh(new T.CylinderGeometry(1.05,1.05,12,24),nylon,groups.coolerPins,point(x,y,5.7));
  mesh(new T.CylinderGeometry(2.8,2.8,1.1,6),nylon,groups.coolerPins,point(x,y,12.25));
  const barb=mesh(new T.ConeGeometry(1.4,.8,12),nylon,groups.coolerPins,point(x,y,-.5));barb.rotation.z=Math.PI;
  const pts=[];for(let i=0;i<=200;i++){const t=i/200,a=t*12*Math.PI;pts.push(new T.Vector3(...point(x+1.8*Math.cos(a),y+1.8*Math.sin(a),5.1+t*6.2)));}
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),200,.22,6,false),steel,groups.coolerPins);
 }
 for(const[i,color]of['#24272c','#b42e29','#d2b63a','#2467af'].entries()){
  const pts=[[54+i*.45,45,9.5],[59+i*.4,47,14.5],[63+i*.35,50,13],[66.4+i*.6,52,5.7]].map(([x,y,h])=>new T.Vector3(...point(x,y,h)));
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),36,.24,7,false),material(color,0,.62),groups.fanCable);
 }
 box(groups.fanCable,2.6,2.2,4.5,point(66.75,52,5.7),nylon,.15);
 base.userData.coolerEnvelope=[63.5,42.5];groups.coolerPins.userData.mounts=COOLER_MOUNTS;
}
