import * as T from 'three';
import {mesh,box,material,texture,decal,textDecal,M} from './model.js';
import {pcb,passive,ic,silk} from './board-kit.js';
import {makeAssembly,finishAssembly} from './assembly.js';

// Geometry in millimetres, optical axis +Y. Source dimensions and estimated
// package details are separated in reference/hqcamera/evidence.md.
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const HQCAMERA_PARTS=[
 part('sensor','Sony IMX477 sensor','12.3 MP IMAGE SENSOR','The back-illuminated IMX477 converts light into RAW image samples. The visible sensor is kept at its documented 4056 × 3040 pixels and 1.55 µm pitch; individual pixels are too small to resolve at this package scale.',[0,2.15,0],[0,12,0],[['Pixels','4056 × 3040'],['Pixel pitch','1.55 µm'],['Active area','6.2868 × 4.712 mm']]),
 part('filter','IR-cut filter','OPTICAL FILTER','The integrated infrared filter sits ahead of the sensor inside the mount. It is separated here to explain the optical path. Its coating tint and thickness are representative; it is not a removable lens element.',[0,3.45,0],[0,24,0],[['Function','Reject infrared'],['Location','Ahead of sensor']]),
 part('housing','CS-mount housing','MACHINED ALUMINIUM BODY','The hollow black housing centers the optical path over the sensor. Its envelope follows the CS mechanical drawing; the sensor aperture and internal machining are reconstructed from product photographs.',[15.4,6,0],[0,40,0],[['Outer diameter','36 mm'],['Mount','CS'],['Finish','Black anodised aluminium']]),
 part('focus','Back-focus ring','THREADED FOCUS ADJUSTMENT','This knurled ring sets the distance between a fitted lens and the sensor. The radial lock screw fixes the adjustment. The thread is represented by a continuous fine helix rather than independent rings.',[13,11.65,0],[0,54,0],[['Adjustment','Back focus'],['Lock','Radial screw']]),
 part('adapter','C-to-CS adapter','LENS-MOUNT SPACER','The supplied C-to-CS adapter provides the extra register distance required by a C-mount lens. Its central opening remains hollow. No lens is fitted in this model.',[0,17.9,13.5],[0,70,0],[['Lens thread','1 inch · 32 TPI'],['C/CS register difference','5 mm'],['Accessory','Included adapter']]),
 part('tripod','Tripod mount','CAMERA SUPPORT','The removable bracket provides a standard tripod interface and attaches to the lens housing with two screws. The threaded opening, mounting ears and screws share the same axes.',[0,5.3,24.5],[0,12,22],[['Tripod thread','¼ inch–20'],['Bracket width','13.97 mm']]),
 part('fasteners','Housing fasteners','MECHANICAL FIXINGS','Two rear screws secure the optical housing to the PCB. Four corner holes are mounting holes for the complete camera; they are not filled with invented mounting screws.',[0,-1.5,-12.2],[12,8,0],[['Housing screws','2'],['PCB holes','4 × Ø2.5 mm']]),
 part('csi','15-pin CSI connector','CAMERA SERIAL INTERFACE','The rear FFC socket carries two MIPI CSI-2 data lanes, a clock pair, I²C control and power. Its metal contacts and locking bar are modeled separately. The detachable ribbon cable is omitted.',[0,-2.4,15.4],[0,3,22],[['Contacts','15'],['Data lanes','2 · MIPI CSI-2'],['Reference','J1']]),
 part('power','Sensor power supplies','THREE REGULATED RAILS','The AP7331 linear regulators and AP3417C buck regulator supply the sensor’s 1.8 V, 2.8 V and 1.05 V rails. Package positions are estimated from rear-side photographs; their functions follow the official schematic.',[12.6,-1.8,-12],[-32,8,0],[['Rails','1.05 / 1.8 / 2.8 V'],['References','U1 / U2 / U3']]),
 part('clock','24 MHz oscillator','SENSOR REFERENCE CLOCK','The 2.5 × 2 mm oscillator supplies the sensor input clock. It is a complete clock oscillator, not a bare quartz resonator.',[-6.1,-1.7,-8.7],[-22,16,-12],[['Frequency','24 MHz'],['Package','2.5 × 2 mm'],['Reference','U7']]),
 part('security','ATSHA204A','AUTHENTICATION DEVICE','The eight-pad authentication device is connected to the camera’s I²C control bus. Its electrical identity is documented in the released schematic.',[10.3,-1.5,8.4],[26,12,-5],[['Interface','I²C'],['Reference','U6']]),
 part('smd','Support components','PASSIVES & SIGNAL CONDITIONING','Rear-side capacitors, resistors, CSI common-mode filters and small control devices are grouped together. Locations and body heights are reconstructed from photographs; no hidden traces or transistor internals are invented.',[-3,-1.4,2],[29,6,9],[['Population','Rear side'],['Indicator LED','Not fitted on this revision']]),
 part('board','HQ Camera PCB','CAMERA CIRCUIT BOARD','The 38 mm square green PCB has four mounting holes on a 30 mm square. The optical sensor sits on the front and the power, control and CSI circuits on the rear.',[-15,.7,15],[0,0,0],[['Outline','38 × 38 mm'],['Thickness','1.4 mm'],['Hole spacing','30 × 30 mm'],['Revision','HQ Camera V1.0']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
const black=material('#303437',.35,.43),machined=material('#363a3b',.7,.31),screwMat=material('#a5abad',.88,.31);
function ring(parent,outer,inner,height,y,mat=black,x=0,z=0,knurl=0){
 const s=new T.Shape();
 for(let i=0;i<=256;i++){const a=i/256*Math.PI*2,r=outer+(knurl?Math.cos(a*48)*knurl:0);if(i)s.lineTo(Math.cos(a)*r,Math.sin(a)*r);else s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
 const h=new T.Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);
 const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:96});g.rotateX(-Math.PI/2);return mesh(g,mat,parent,[x,y,z]);
}
function helix(parent,r,y,turns,pitch,mat=machined){const pts=Array.from({length:turns*96+1},(_,i)=>{const a=i/96*Math.PI*2;return new T.Vector3(r*Math.cos(a),y+i/96*pitch,r*Math.sin(a));});return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),turns*96,.045,5,false),mat,parent);}
function screw(parent,x,y,z){mesh(new T.CylinderGeometry(1.7,1.7,.55,32),screwMat,parent,[x,y,z]);box(parent,2.1,.07,.35,[x,y-.29,z],M.black,.04);box(parent,.35,.07,2.1,[x,y-.29,z],M.black,.04);mesh(new T.CylinderGeometry(.82,.82,4,24),screwMat,parent,[x,y+2.25,z]);}
function underside(group){const g=new T.Group();g.rotation.z=Math.PI;group.add(g);return g;}
export function buildHQCamera(){
 const{root,groups}=makeAssembly(HQCAMERA_PARTS);
 const holes=[[-15,-15,2.5],[-15,15,2.5],[15,-15,2.5],[15,15,2.5],[0,-12.2,2.2],[0,12.2,2.2]];
 pcb(groups.board,{width:38,depth:38,thickness:1.4,color:'#207b49',holes,radius:1.1});
 for(const[x,z,d]of holes){const geo=new T.RingGeometry(d/2,d/2+.6,32);geo.rotateX(Math.PI/2);mesh(geo,M.gold,groups.board,[x,-.708,z]);}
 const rear=underside(groups.board);
 const art=texture(1520,1520,g=>{g.scale(40,40);g.translate(19,19);g.fillStyle='#e9eee5';g.textAlign='center';
  const tx=(t,x,z,size=.85)=>{g.font=`${size}px monospace`;g.fillText(t,x,z);};
  tx('Raspberry Pi 2018',0,-15.2,1.2);tx('HQ Camera V1.0',0,-13.7,1.05);tx('94V-0',1,10,.9);tx('MADE IN UK',-3,16.2,.75);
  ['GND','GPO','FST','XVS','SDA','3.3V','SCL','GPI','PP2'].forEach((t,i)=>tx(t,-14,-9+i*2.1,.65));
  for(const[t,x,z]of[['U1',-12.7,-12],['U2',-12.7,-7.4],['U3',10.8,15],['U7',6.5,-6],['U6',-10.5,12.1],['J1',-1,13.2]])tx(t,x,z,.65);
  g.strokeStyle='#c7d7c6';g.lineWidth=.09;g.strokeRect(-5,-4,10,8);
 });decal(rear,38,38,[0,.715,0],art);
 // Front sensor carrier. Package envelope reconstructed, active dimensions exact.
 box(groups.sensor,8.5,1.05,8.5,[0,1.3,0],material('#b8afa3',.2,.54),.12);
 box(groups.sensor,7.7,.22,6.25,[0,1.94,0],M.black,.05);
 box(groups.sensor,6.2868,.07,4.712,[0,2.095,0],new T.MeshStandardMaterial({color:'#333c69',metalness:.66,roughness:.14}),.015);
 const sensorEdge=new T.EdgesGeometry(new T.BoxGeometry(6.2868,.07,4.712));const outline=new T.LineSegments(sensorEdge,new T.LineBasicMaterial({color:'#766c9e'}));outline.position.set(0,2.095,0);groups.sensor.add(outline);
 // Underside LGA92 land arrangement is not published in the mechanical drawing;
 // do not substitute an invented perimeter-pin population.
 const glass=new T.MeshPhysicalMaterial({color:'#b8c8d4',metalness:0,roughness:.07,transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide});
 const filter=box(groups.filter,8.5,.36,8.5,[0,3.4,0],glass,.035);filter.userData.anatomyTransparent=true;
 // Thin retaining lip belongs with the filter; optical opening stays clear.
 const sf=new T.Shape();sf.moveTo(-4.75,-4.75);sf.lineTo(4.75,-4.75);sf.lineTo(4.75,4.75);sf.lineTo(-4.75,4.75);sf.closePath();const fh=new T.Path();fh.moveTo(-4.18,-4.18);fh.lineTo(-4.18,4.18);fh.lineTo(4.18,4.18);fh.lineTo(4.18,-4.18);fh.closePath();sf.holes.push(fh);const fg=new T.ExtrudeGeometry(sf,{depth:.3,bevelEnabled:false});fg.rotateX(-Math.PI/2);mesh(fg,black,groups.filter,[0,3.25,0]);
 // Machined housing: bore and lower optical aperture are genuine openings.
 ring(groups.housing,15.375,11.2,8.9,.7);ring(groups.housing,17.1,11.2,1.45,9.6);
 ring(groups.housing,15.375,6.4,1.1,.7);
 for(const z of [-12.2,12.2])ring(groups.housing,2.1,1.1,2.5,.7,black,0,z);
 ring(groups.focus,18,12.7,1.2,11.05,black,0,0,.23);helix(groups.focus,12.74,9.55,3,.5);
 // Radial back-focus lock screw at the right-hand side of the body.
 const lock=new T.Group();lock.position.set(16.2,10.35,0);lock.rotation.z=-Math.PI/2;groups.focus.add(lock);mesh(new T.CylinderGeometry(1,1,3,20),M.silver,lock,[0,0,0]);mesh(new T.CylinderGeometry(1.9,1.9,1.2,24),black,lock,[0,1.9,0]);box(lock,1.7,.1,.32,[0,2.53,0],M.silver,.02);
 ring(groups.adapter,15.375,12.2,5.8,12.25,black,0,0,.16);helix(groups.adapter,12.25,12.55,6,.794);ring(groups.adapter,13.1,12.2,.5,12.25,machined);
 // Tripod bracket with a real transverse 1/4-inch opening and mounting ears.
 const br=new T.Shape();br.moveTo(-6.985,-3.81);br.lineTo(6.985,-3.81);br.lineTo(6.985,3.81);br.lineTo(-6.985,3.81);br.closePath();const bh=new T.Path();bh.absarc(0,0,3.175,0,Math.PI*2,true);br.holes.push(bh);const bg=new T.ExtrudeGeometry(br,{depth:7,bevelEnabled:false,curveSegments:48});mesh(bg,black,groups.tripod,[0,4.7,18.2]);
 for(const s of [-1,1]){box(groups.tripod,5,2,8,[s*8,2.7,17.3],black,.2);mesh(new T.CylinderGeometry(1.55,1.55,.55,24),M.silver,groups.tripod,[s*8,3.98,16.8]);box(groups.tripod,1.7,.08,.35,[s*8,4.29,16.8],M.black,.03);}
 for(let i=0;i<6;i++){const tg=new T.TorusGeometry(3.17,.06,5,48);mesh(tg,machined,groups.tripod,[0,4.7,18.7+i*.95]);}
 for(const z of [-12.2,12.2])screw(groups.fasteners,0,-1.05,z);
 const csi=underside(groups.csi);box(csi,16.2,2,4.9,[0,1.72,15.2],material('#c4c6b7'),.16);box(csi,15.4,.7,.9,[0,2.7,17.4],M.black,.1);box(csi,14.7,.45,3.5,[0,2.69,15],material('#c9b186',.2,.4),.07);
 for(let i=0;i<15;i++){const x=(i-7)*1;box(csi,.42,.12,3.8,[x,.89,13.8],M.silver,.02);box(csi,.36,.08,1.7,[x,2.96,16],M.gold,.015);}
 for(const s of [-1,1])box(csi,.9,.3,5.4,[s*8.1,.91,15.2],M.silver,.04);
 const power=underside(groups.power);for(const[x,z,label]of[[-12.6,-12,'U1'],[-12.6,-7.5,'U2'],[10.8,13.6,'U3']]){ic(power,{x,z,width:2.9,depth:1.65,height:1,base:.7,label:''});for(let i=0;i<3;i++)for(const s of [-1,1])box(power,.4,.2,.8,[x+(i-1)*.95,.9,z+s*1.15],M.silver,.02);}
 box(power,2.5,1.3,2,[10.8,1.4,10],material('#555a58'),.15);
 const clock=underside(groups.clock);box(clock,2.5,.8,2,[6.1,1.1,-8.7],M.silver,.16);textDecal(clock,'24.0',2.3,1.7,[6.1,1.515,-8.7],{size:80,color:'#565f61'});
 const secure=underside(groups.security);ic(secure,{x:-10.3,z:8.4,width:2,depth:3,height:.6,base:.7});for(let i=0;i<4;i++)for(const s of [-1,1])box(secure,.5,.15,.3,[-10.3+s*1.05,.81,8.4+(i-1.5)*.5],M.silver,.012);
 const smd=underside(groups.smd);
 const passives=[[-9.7,-12,1,1.6],[-9.7,-8.5,1,1.6],[-15,-12,.6,1],[-15,-8,.6,1],[-11,-4,1,.5],[-8.5,-4.4,1,.5],[-7,-2,1.6,.8],[-5,-2,1.6,.8],[-2,-3,.6,1],[-2,0,.6,1],[-2,3,.6,1],[1,-3,.6,1],[1,0,.6,1],[1,3,.6,1],[4,-3,.6,1],[4,0,.6,1],[4,3,.6,1],[6,5,1.6,.8],[3,6,1.6,.8],[0,6,1.6,.8],[-4,6,1.6,.8],[-7,5,.6,1],[-9,3,.6,1],[-9,0,.6,1],[-10,-2,.6,1],[10,6,1,.6],[12,6,1,.6],[14,6,1,.6],[13,10,1.6,.8],[13,13,1.6,.8],[8,13,1,.6],[6,13,1,.6],[-9,11,1,.6],[-6,11,1,.6],[-3,11,1,.6],[-12,11,1,.6],[-13,4,1,.6],[-13,1,1,.6],[-13,-2,1,.6]];
 for(const[x,z,w,d]of passives)passive(smd,{x,z,width:w,depth:d,base:.7});
 for(let i=0;i<3;i++)ic(smd,{x:6-i*2.8,z:11,width:1.25,depth:1,height:.55,base:.7});
 for(const[x,z]of[[-4.7,-7],[-8.7,7],[-7.5,10.4]])ic(smd,{x,z,width:1.6,depth:1.2,height:.65,base:.7});
 for(let i=0;i<9;i++){const g=new T.CircleGeometry(.48,20);g.rotateX(-Math.PI/2);mesh(g,M.gold,rear,[15.8,.719,-9+i*2.1]);}
 root.userData={board:'hqcamera',dimensions:[38,1.4,38],sensorPixels:[4056,3040],sensorPixelPitch:.00155,sensorActiveArea:[6.2868,4.712],mountingHoles:holes.slice(0,4),csiPins:15,noIndicatorLED:true,opticalPath:{from:[0,30,0],to:[0,2.15,0]}};
 return finishAssembly(root,groups,HQCAMERA_PARTS,{skipGroups:new Set(['filter'])});
}
export const HQCAMERA_BOARD={id:'hqcamera',tab:'HQ Camera',title:'Raspberry Pi<br>HQ Camera',edition:'011',subtitle:'Light, captured one pixel at a time.',intro:'Follow the optical path through the mount and infrared filter to the Sony sensor.',model:'Raspberry Pi High Quality Camera / CS mount',basis:'Official dimensions & schematic; reconstructed packages',dimensions:'38 × 38 MM',parts:HQCAMERA_PARTS,build:buildHQCamera,assembledHalf:34,assembledTarget:[0,7,0],half:64,camera:[80,102,110],target:[0,31,0],start:0,operationNote:'Illustrative light path · no lens fitted',stats:[['12.3','MP','IMAGE RESOLUTION'],['1.55','µm','PIXEL PITCH'],['2','','CSI-2 DATA LANES'],['24','MHz','REFERENCE CLOCK']],sources:[['Raspberry Pi · CS mechanical drawing','https://pip-assets.raspberrypi.com/categories/659-raspberry-pi-high-quality-camera/documents/RP-008200-DS-1-hq-camera-cs-mechanical-drawing.pdf'],['Raspberry Pi · Camera schematic','https://pip-assets.raspberrypi.com/categories/659-raspberry-pi-high-quality-camera/documents/RP-008203-DS-1-hq-camera-schematics.pdf'],['Raspberry Pi · Mount assembly drawing','https://pip-assets.raspberrypi.com/categories/659-raspberry-pi-high-quality-camera/documents/RP-008199-DS-1-hq-camera-cs-lensmount-drawing.pdf'],['Raspberry Pi · Camera specifications','https://www.raspberrypi.com/products/raspberry-pi-high-quality-camera/']],accuracy:'The PCB, corner-hole centers, mount diameters and major machined envelopes follow Raspberry Pi’s CS mechanical drawing. Sensor resolution, pixel pitch, interfaces and circuit identities follow the product specifications and schematic. Rear package positions, internal machining, filter thickness, threads and finishes are reconstructed; no lens prescription, buried PCB routing or silicon cross-section is invented. The adapter is included; a photographic lens and ribbon cable are not fitted.',hidden:['sensor','filter','power','clock','security','smd']};
