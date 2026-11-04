import * as T from 'three';
import {mesh,box,material,textDecal,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';

// Representative NEMA-17-size two-phase hybrid construction. The mechanical
// internals are explanatory, not the unpublished internals of a named motor.
const tau=Math.PI*2, steel=material('#666c70',.78,.42), cutSteel=material('#93999b',.76,.33), alloy=material('#bec1c0',.8,.32), black=material('#202528',.12,.62), copper=material('#a86638',.75,.38), bobbin=material('#b19d72',0,.72);
const p=(id,name,short,kind,description,anchor,offset,specs)=>({id,name,short,kind,description,anchor,offset,specs});
export const STEPPER_PARTS=[
 p('front','Front end bell','FRONT END BELL','SHAFT SUPPORT & MOUNT','The front aluminum end bell carries the shaft bearing, locating boss and four mounting holes. A representative 42 mm square flange and 31 mm hole spacing are shown; this is not the CAD of a particular motor.',[15,40,15],[0,56,0],[['Frame','42 mm square'],['Hole centers','31 × 31 mm'],['Construction','Representative NEMA-17-size frame']]),
 p('rear','Rear end bell','REAR END BELL','REAR BEARING SUPPORT','The rear end bell closes the stator stack and locates the second bearing. The connector notch and bearing recess are real openings in the model.',[-16,3,12],[0,0,0],[['Material','Aluminum'],['Role','Rear shaft support']]),
 p('stator','Laminated stator','8-POLE STATOR','MAGNETIC CIRCUIT','Eight inward-facing poles carry two interleaved electrical phases, with four poles per phase. The laminated core closes the magnetic path. Five small teeth on each pole face are representative; no manufacturer-specific tooth dimensions are claimed.',[18,24,6],[-40,18,0],[['Stator poles','8 · 4 per phase'],['Core','Laminated steel'],['Tooth profile','Illustrative']]),
 p('phasea','Phase A windings','PHASE A','FIRST ELECTRICAL PHASE','Four copper windings surround alternating stator poles. The motor driver changes current direction and alternates the phases to advance the rotor. Coil turns are reduced for legibility, rather than an exact winding specification.',[17,20,0],[40,16,0],[['Coils shown','4'],['Winding count','Illustrative'],['Control','Bipolar current']]),
 p('phaseb','Phase B windings','PHASE B','SECOND ELECTRICAL PHASE','The second four coils occupy the poles between the phase-A poles. Their excitation sequence is shifted from phase A. Play advances the rotor in 1.8° increments at a slowed explanatory rate.',[12,20,12],[34,28,32],[['Coils shown','4'],['Phases','2'],['Motion','Illustrative full steps']]),
 p('rotorNorth','North rotor cup','NORTH ROTOR CUP','TOOTHED POLE PIECE','One 50-tooth steel cup directs one pole of the axial permanent magnet toward the stator. Its angular tooth pitch is 7.2°. The opposite cup is shifted by half a tooth pitch.',[10,29,0],[0,29,0],[['Teeth','50'],['Tooth pitch','7.2°'],['Pair offset','3.6°']]),
 p('magnet','Axial permanent magnet','PERMANENT MAGNET','ROTOR MAGNETIZATION','The annular magnet sits between the two rotor cups and is magnetized along the shaft. It gives the two cups opposite magnetic polarity. Its exact alloy and dimensions vary by motor and are represented here.',[8,21,0],[0,19,0],[['Magnetization','Axial'],['Geometry','Representative annular magnet']]),
 p('rotorSouth','South rotor cup','SOUTH ROTOR CUP','TOOTHED POLE PIECE','The second 50-tooth cup faces the opposite magnetic polarity. Its teeth sit midway between those of the first cup when viewed along the shaft.',[10,14,0],[0,10,0],[['Teeth','50'],['Mechanical offset','3.6°'],['Role','Opposite rotor pole']]),
 p('shaft','Output shaft','OUTPUT SHAFT','MECHANICAL OUTPUT','A steel shaft passes through both rotor cups and both bearings. The exposed D-flat provides a positive clamping surface for a pulley or coupler. The shaft and both pole cups rotate together.',[0,58,0],[0,36,0],[['Diameter','5 mm · representative'],['Output','D-flat'],['Full-step angle','1.8°']]),
 p('bearings','Ball bearings','2 BALL BEARINGS','LOW-FRICTION SUPPORT','Two ball bearings center the shaft in the end bells. Inner and outer races and eight balls per bearing are drawn to explain the mechanism; bearing series and ball count are illustrative.',[5,37,0],[0,43,27],[['Bearings','2'],['Construction','Races, balls and cage'],['Internal detail','Illustrative']]),
 p('fasteners','Through fasteners','THROUGH SCREWS','ASSEMBLY RETENTION','Four long fasteners pass through the rear end bell and clamp the stator to the front bell. Their axes line up with the matching holes in both bells and the lamination stack.',[17.6,3,17.6],[22,38,22],[['Fasteners','4'],['Join','Clamps end bells and stator']]),
 p('connector','Winding connector','4-WIRE CONNECTOR','DRIVER CONNECTION','A four-contact connector brings out the two bipolar winding circuits. It is a representative interface; exact connector type and pin ordering depend on the motor.',[0,6,-23],[0,10,-28],[['Contacts','4'],['Circuits','Phase A / phase B'],['Pinout','Not manufacturer-specific']])
].map((part,i)=>({...part,n:String(i+1).padStart(2,'0')}));
function roundedShape(w,r){const s=new T.Shape(),a=w/2;s.moveTo(-a+r,-a);s.lineTo(a-r,-a);s.quadraticCurveTo(a,-a,a,-a+r);s.lineTo(a,a-r);s.quadraticCurveTo(a,a,a-r,a);s.lineTo(-a+r,a);s.quadraticCurveTo(-a,a,-a,a-r);s.lineTo(-a,-a+r);s.quadraticCurveTo(-a,-a,-a+r,-a);return s;}
function hole(s,x,z,r){const h=new T.Path();h.absarc(x,-z,r,0,tau,true);s.holes.push(h);}
function extrude(parent,s,h,y,mat){const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);return mesh(g,mat,parent,[0,y,0]);}
function ring(parent,ro,ri,h,y,mat){const s=new T.Shape();s.absarc(0,0,ro,0,tau);hole(s,0,0,ri);return extrude(parent,s,h,y,mat);}
function rod(parent,a,b,r,mat){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A);const o=mesh(new T.CylinderGeometry(r,r,v.length(),10),mat,parent,A.add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
const corners=[[-17.6,-17.6],[-17.6,17.6],[17.6,-17.6],[17.6,17.6]];
function endBell(parent,y,front){
 const s=roundedShape(42,3.4);hole(s,0,0,front?6.5:6.5);if(!front)for(const[x,z]of corners)hole(s,x,z,1.5);
 if(front)for(const x of[-15.5,15.5])for(const z of[-15.5,15.5])hole(s,x,z,1.5);
 extrude(parent,s,2.3,y,alloy);
 const wall=roundedShape(42,3.4);const h=roundedShape(37.8,2.4);wall.holes.push(new T.Path(h.getPoints(24).reverse()));
 extrude(parent,wall,3.7,front?y-3.7:y+2.3,alloy);
 // A machined bearing pocket is open to the internal face.
 ring(parent,8.4,6.5,3.7,front?y-3.7:y+2.3,alloy);
 if(front)ring(parent,11,2.55,2,y+2.3,alloy);
 for(const[x,z]of corners){const boss=new T.Shape();boss.absarc(x,-z,2.4,0,tau);hole(boss,x,z,1.5);extrude(parent,boss,3.7,front?y-3.7:y+2.3,alloy);}
}
function rotorProfile(teeth=50){const s=new T.Shape(),ri=11.45,ro=12.25;for(let i=0;i<teeth;i++)for(const[f,r]of [[0,ri],[.16,ri],[.19,ro],[.66,ro],[.69,ri],[1,ri]]){const a=(i+f)/teeth*tau;if(i===0&&f===0)s.moveTo(Math.cos(a)*r,Math.sin(a)*r);else s.lineTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();hole(s,0,0,2.5);return s;}
function moving(parent,name){const g=new T.Group();g.name=name;g.userData.rotor=true;g.userData.motion={type:'stepper',stepAngle:1.8};parent.add(g);return g;}
function coil(parent,angle,phase){
 const g=new T.Group();g.rotation.y=angle;parent.add(g);
 // The y/z rectangular loop surrounds one radial iron pole. Adjacent poles are
 // 45 degrees apart, so these coils remain clear of one another and the rotor.
 const mat=copper.clone();mat.emissive=new T.Color('#ad5b24');mat.emissiveIntensity=0;mat.userData.indicator={kind:'coil',phase};
 for(const x of[14.1,18.7]){
  for(const z of[-2.65,2.65])box(g,.45,30,1.05,[x,20,z],bobbin,.1);
  for(const y of[5.25,34.75])box(g,.45,1.5,6.35,[x,y,0],bobbin,.1);
 }
 for(let i=0;i<14;i++){
  const x=14.5+i*.28,r=1.5,wy=15.25,wz=2.65;
  const path=new T.CurvePath();
  const pts=[];
  for(const[cy,cz,st]of [[wy-r,wz-r,0],[-wy+r,wz-r,Math.PI/2],[-wy+r,-wz+r,Math.PI],[wy-r,-wz+r,Math.PI*1.5]]){
   for(let j=0;j<=8;j++){const a=st+j/8*Math.PI/2;pts.push(new T.Vector3(x,20+cy+r*Math.cos(a),cz+r*Math.sin(a)));}
  }
  // Rounded rectangle sampled explicitly in its plane; closure meets exactly.
  pts.push(pts[0].clone());
  const curve=new T.CatmullRomCurve3(pts,false,'centripetal');mesh(new T.TubeGeometry(curve,100,.16,6,false),mat,g);
 }
 return mat;
}
function bearing(parent,y){
 ring(parent,6.5,5.55,3.6,y,cutSteel);ring(parent,3.5,2.5,3.6,y,cutSteel);
 for(let i=0;i<8;i++){const a=i*tau/8;mesh(new T.SphereGeometry(1.05,14,10),M.silver,parent,[Math.cos(a)*4.55,y+1.8,Math.sin(a)*4.55]);}
 for(const yy of[y+.5,y+3.1])ring(parent,5.6,3.5,.18,yy,material('#9f8553',.7,.4));
}
export function buildStepper(){
 const{root,groups}=makeAssembly(STEPPER_PARTS);
 endBell(groups.rear,0,false);endBell(groups.front,37.7,true);
 // A hollow laminated stack, open around the rotor. Alternating shallow bands
 // describe physical sheets without making dozens of disconnected solid slabs.
 const s=roundedShape(42,3.4);hole(s,0,0,19.3);for(const[x,z]of corners)hole(s,x,z,1.5);extrude(groups.stator,s,28,6,black);
 for(let y=6.2;y<34;y+=.7){const band=roundedShape(42.04,3.4);hole(band,0,0,19.3);for(const[x,z]of corners)hole(band,x,z,1.5);extrude(groups.stator,band,.1,y,steel);}
 for(let i=0;i<8;i++){
  const a=i*tau/8,g=new T.Group();g.rotation.y=a;groups.stator.add(g);
  box(g,5.9,28,3.8,[16.35,20,0],steel,.08);
  // Pole shoe with five small inward teeth at the rotor's 7.2 degree pitch.
  const shoe=new T.Shape();for(let k=0;k<=16;k++){const t=(-18+k*36/16)*Math.PI/180;const x=Math.cos(t)*14.3,z=Math.sin(t)*14.3;k===0?shoe.moveTo(x,z):shoe.lineTo(x,z);}
  for(let k=16;k>=0;k--){const t=(-18+k*36/16)*Math.PI/180;shoe.lineTo(Math.cos(t)*13.2,Math.sin(t)*13.2);}shoe.closePath();extrude(g,shoe,28,6,steel);
  for(let k=-2;k<=2;k++){
   const b=k*7.2*Math.PI/180,teeth=new T.Group();teeth.rotation.y=-b;g.add(teeth);box(teeth,.7,28,.65,[12.85,20,0],cutSteel,.015);
  }
  coil(groups[i%2?'phaseb':'phasea'],a,i%2);
 }
 const lower=moving(groups.rotorSouth,'South rotor pole cup');const upper=moving(groups.rotorNorth,'North rotor pole cup');
 const south=extrude(lower,rotorProfile(),10.5,8.5,cutSteel);south.rotation.y=Math.PI/50;
 extrude(upper,rotorProfile(),10.5,21,cutSteel);
 const mg=moving(groups.magnet,'Axial rotor magnet');ring(mg,10.9,2.5,2,19,material('#41474b',.5,.54));
 // Tiny pressed pole faces and hubs support the visual reading of two cups.
 for(const[g,y]of [[lower,8.1],[upper,31.5]])ring(g,9.6,2.5,.4,y,steel);
 const shaft=moving(groups.shaft,'D-flat output shaft');
 mesh(new T.CylinderGeometry(2.5,2.5,40,48),M.silver,shaft,[0,20,0]);
 const flat=new T.Shape(),R=2.5,zCut=1.9,a=Math.acos(zCut/R);flat.absarc(0,0,R,a,Math.PI*2-a,false);flat.closePath();const dg=new T.ExtrudeGeometry(flat,{depth:24,bevelEnabled:false,curveSegments:40});dg.rotateX(-Math.PI/2);mesh(dg,M.silver,shaft,[0,40,0]);
 bearing(groups.bearings,2.3);bearing(groups.bearings,34.1);
 for(const[x,z]of corners){
  mesh(new T.CylinderGeometry(1.2,1.2,36,16),M.silver,groups.fasteners,[x,19,z]);
  mesh(new T.CylinderGeometry(2.25,2.25,1.5,24),cutSteel,groups.fasteners,[x,.75,z]);
  for(const angle of[0,Math.PI/2]){const slot=box(groups.fasteners,2.7,.12,.45,[x,.01,z],black,.025);slot.rotation.y=angle;}
 }
 // Connection socket is open at its rear; pins start at a physical back wall.
 box(groups.connector,10,5,.6,[0,4.8,-20.7],bobbin,.1);
 for(const side of[-1,1])box(groups.connector,.7,5,5,[side*5.05,4.8,-23.5],bobbin,.1);
 box(groups.connector,10.8,.6,5.6,[0,2.6,-23.25],bobbin,.1);box(groups.connector,10.8,.6,5.6,[0,7,-23.25],bobbin,.1);
 for(let i=0;i<4;i++)box(groups.connector,.6,.6,4.2,[(i-1.5)*2.2,4.8,-23],M.silver,.04);
 // Short leads terminate on the rear of the coil assembly, not mid-air.
 for(let i=0;i<4;i++)rod(groups.connector,[(i-1.5)*2.2,4.8,-20.5],[(i-1.5)*2.2,8,-17.5],.24,material(['#343c3d','#a74537','#347357','#446c9c'][i]));
 textDecal(groups.front,'HYBRID',19,4,[0,40.02,15],{size:70,color:'#596160'});
 root.userData={device:'stepper',dimensions:[42,64,42],frameSize:42,bodyLength:40,mountSpacing:31,shaftDiameter:5,statorPoles:8,phases:2,rotorTeethPerCup:50,cupOffsetDegrees:3.6,stepDegrees:1.8,construction:'Representative hybrid motor; not a named manufacturer replica'};
 return finishAssembly(root,groups,STEPPER_PARTS);
}
export const STEPPER_BOARD={id:'stepper',tab:'Stepper motor',title:'Stepper motor',edition:'011',subtitle:'A precise step, made from magnetic teeth.',intro:'Explore the two-phase windings, toothed rotor and axial magnet inside a hybrid stepper.',model:'42 mm hybrid stepper / representative construction',basis:'Documented mechanism · illustrative dimensions',dimensions:'42 × 42 × 40 MM',parts:STEPPER_PARTS,build:buildStepper,assembledHalf:44,assembledTarget:[0,26,0],half:82,camera:[113,123,-150],target:[0,37,0],start:0,operationNote:'1.8° steps · illustrative winding highlight',stats:[['1.8','°','FULL STEP'],['200','','STEPS PER TURN'],['8','','STATOR POLES'],['50','','TEETH PER ROTOR CUP']],sources:[['Oriental Motor · Hybrid stepper structure and operation','https://www.orientalmotor.com/stepper-motors/technology/stepper-motor-basics.html'],['Oriental Motor · 42 mm PKP family reference','https://www.orientalmotor.com/stepper-motors/2-phase-stepper-motors.html']],accuracy:'This is a representative 42 mm two-phase hybrid motor, not an exact replica of a named product. The eight stator poles, four poles per phase, 50 teeth per rotor cup, 3.6° cup offset and 1.8° full step follow Oriental Motor’s mechanism explanation. The 40 mm body length, shaft, bearing and winding geometry, lamination count, connector and pole-shoe tooth dimensions are illustrative. Coil turns are reduced for legibility. Play shows slowed stepping, not electrical or torque simulation.',hidden:['stator','phasea','phaseb','rotorNorth','rotorSouth','magnet','bearings']};
