import {T,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,palette,rod,wire,plate,glass} from './module-kit.js';

const source='https://www.samsungsem.com/global/product/module/camera-module/mobile-camera-modules.do';
const lensZ=[-4.6,-2.6,-.5,1.6,3.7,5.9];
export const PERISCOPE_PARTS=[
 part('shell','Shield and entrance','Folded camera enclosure',[5,8.5,-2],[0,42,6],'The selected prism-lead module admits light through a rectangular window. Its overall envelope follows the manufacturer specification; the finish, seams and window dimensions are reconstructed from the left-hand specimen photograph.',[['Configuration','50M · 5× · prism lead'],['Envelope','31.76 × 15.4 × 8.55 mm']]),
 part('base','Carrier and fixed guides','Mechanical foundation',[6,.5,8],[0,0,0],'The base supports the prism and autofocus carriage. Hidden rails, mounting features and dimensions are representative; the published design specifies a ball-guide actuator.',[['Geometry','Representative interior'],['Construction','Fixed carrier']]),
 part('prism','Folding prism','Two-axis optical stabilizer',[0,4.2,-10],[0,12,-9],'A prism turns incoming light through 90 degrees toward the horizontal lens train. The documented OIS tilts this prism about two axes; glass prescription, pivot construction and travel are representative.',[['Optical path','Prism first · one fold'],['OIS','Two-axis prism tilt']]),
 part('gimbal','Prism cradle','Tilt mechanism',[3.4,3.8,-10],[7,7,-9],'A reconstructed cradle illustrates the prism actuator. Its fine pivots and supports move coherently with the optical element; their exact production arrangement is unpublished.',[['Construction','Representative mechanism']]),
 part('carriage','Autofocus carriage','Ball-guided lens shift',[4.1,4.1,1],[10,7,0],'The six-element lens train translates together along the folded optical axis for autofocus. The real product specifies focus from 30 cm to infinity; this model uses an illustrative travel without an optical calibration.',[['Motion','Axial lens shift'],['Focus range','30 cm–∞, documented']]),
 ...lensZ.map((z,i)=>part('lens'+(i+1),'Lens element '+(i+1),'Molded polymer optic',[0,4.3,z],[(i%2?-1:1)*7,14+i*1.2,(i-2.5)*4.5],'One of six documented polymer elements. Curvature, thickness, coatings and spacing are representative; no complete optical prescription is published.',[['Element',`${i+1} of 6P`],['Prescription','Representative']])) ,
 part('ois','Prism actuator coils','Optical stabilization',[4.6,3.8,-10],[-9,5,-9],'Coils and magnets illustrate two independent prism-tilt axes. Exact winding count, magnetic geometry and control response are representative.',[['Function','Two-axis prism tilt'],['Model','Illustrative closed-loop response']]),
 part('af','Focus actuator','Lens translation',[5.4,4.1,1],[-10,5,3],'The actuator moves the lens carriage along the optical axis while the sensor remains fixed. Coils and magnets are reconstructed to explain the published ball-guide autofocus mechanism.',[['Function','Lens shift AF']]),
 part('balls','Guide balls','Low-friction support',[4.1,1.5,2],[9,1,5],'A representative set of guide balls supports axial travel. Their number, diameter and placement explain the mechanism rather than reproduce a disclosed bearing drawing.',[['Geometry','Representative ball count']]),
 part('filter','Infrared filter','Sensor-side coating',[0,4.3,9.3],[0,10,9],'A representative sensor-side filter blocks unwanted infrared. Its thickness and coating stack are not specified for this module.',[['Placement','Representative optical filter']]),
 part('sensor','Image sensor','50-megapixel receiver',[0,4.3,11.8],[0,5,13],'The fixed sensor receives the focused image after the folded lens train. The documented format is 1/2.5 inch with 0.7 µm pixels; the visible mosaic is an enlarged pattern, not fifty million individually modeled cells.',[['Resolution','50M'],['Pixel pitch','0.7 µm'],['Optical format','1/2.5 inch']]),
 part('flex','Flex and interface','Electrical connection',[4,.7,12],[-10,0,11],'A reconstructed flexible circuit carries the sensor connection. Routing, connector and contact count are representative; no production pinout is asserted.',[['Construction','Photo-estimated external routing']])
];

function rectangleHole(w,d,x,z){const p=new T.Path();p.moveTo(x-w/2,z-d/2);p.lineTo(x-w/2,z+d/2);p.lineTo(x+w/2,z+d/2);p.lineTo(x+w/2,z-d/2);p.closePath();return p;}
function aperturedTop(parent,mat){const shape=new T.Shape();shape.moveTo(-7.7,-15.88);shape.lineTo(7.7,-15.88);shape.lineTo(7.7,15.88);shape.lineTo(-7.7,15.88);shape.closePath();shape.holes.push(rectangleHole(6.6,6.7,0,10.2));const geo=new T.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:false});geo.rotateX(-Math.PI/2);mesh(geo,mat,parent,[0,8.25,0]);}
function prismGeometry(){const shape=new T.Shape();shape.moveTo(-2.8,-2.8);shape.lineTo(-2.8,2.8);shape.lineTo(2.8,2.8);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:5.6,bevelEnabled:false,steps:1});geo.rotateY(Math.PI/2);geo.translate(-2.8,0,0);return geo;}
function opticalElement(r,t,bend){const points=[];for(let i=0;i<=24;i++){const radius=r*i/24;points.push(new T.Vector2(radius,-t/2-bend*(1-(radius/r)**2)));}for(let i=24;i>=0;i--){const radius=r*i/24;points.push(new T.Vector2(radius,t/2+bend*.65*(1-(radius/r)**2)));}return new T.LatheGeometry(points,64).rotateX(Math.PI/2);}
function coil(parent,x,y,z,w,h,mat){for(let turn=0;turn<9;turn++){const inset=turn*.09;wire(parent,[[x,y-h/2+inset,z-w/2+inset],[x,y+h/2-inset,z-w/2+inset],[x,y+h/2-inset,z+w/2-inset],[x,y-h/2+inset,z+w/2-inset],[x,y-h/2+inset,z-w/2+inset]],.035,mat);}}

export function buildPeriscope(){
 const {root,groups:g}=makeAssembly(PERISCOPE_PARTS),m=palette();
 const shell=material('#a99a72',.8,.43),black=material('#1d2529',.18,.48),flex=material('#a56c2e',.5,.45),nickel=material('#b8c3c4',.88,.23);
 plate(g.base,15.4,31.76,.5,[0,.25,0],black);
 aperturedTop(g.shell,shell);
 for(const x of[-7.59,7.59])box(g.shell,.22,7.75,31.76,[x,4.375,0],shell,.04);
 for(const z of[-15.77,15.77])box(g.shell,15.18,7.75,.22,[0,4.375,z],shell,.04);
 for(const x of[-7.72,7.72])for(const z of[-12,0,12])box(g.shell,.018,.65,1.1,[x,1.5,z],black,.01);
 // Entrance bezel remains open, with no opaque plane across the prism.
 for(const x of[-3.45,3.45])box(g.shell,.3,.18,7.3,[x,8.46,-10.2],black,.06);
 for(const z of[-13.7,-6.7])box(g.shell,6.6,.18,.3,[0,8.46,z],black,.06);
 for(const x of[-5,5])rod(g.base,[x,1.25,-5.7],[x,1.25,8.1],.25,nickel,20);
 for(const x of[-5.7,5.7])for(const z of[-6,8.3])box(g.base,1.2,1.5,1.2,[x,1.1,z],black,.12);
 const prism=new T.Group();prism.position.set(0,4.3,-10.2);prism.userData.dynamic=true;g.prism.add(prism);
 const optic=glass(prism,prismGeometry(),[0,0,0],.38);optic.material.color.set('#9fbfc5');optic.material.roughness=.08;
 // Reflective hypotenuse is a separate physical coating, aligned to the prism.
 const mirror=mesh(new T.PlaneGeometry(5.58,7.9),material('#91a9ac',.95,.12),prism,[0,0,0]);mirror.rotation.x=-Math.PI/4;
 const cradle=new T.Group();cradle.position.copy(prism.position);cradle.userData.dynamic=true;g.gimbal.add(cradle);
 for(const x of[-3.05,3.05])box(cradle,.42,6.1,6.1,[x,0,0],black,.1);
 box(cradle,6.1,.35,6.1,[0,-3.05,0],black,.1);
 for(const side of[-1,1]){rod(g.base,[side*3.05,4.3,-10.2],[side*3.85,4.3,-10.2],.22,nickel,20);box(g.base,.65,3.7,.9,[side*3.8,2.35,-10.2],black,.08);}
 const carriage=new T.Group();carriage.userData.dynamic=true;g.carriage.add(carriage);
 for(const x of[-4.05,4.05])box(carriage,.5,7,12.8,[x,4.3,.65],black,.1);
 for(const y of[1,7.6])box(carriage,8.1,.4,12.8,[0,y,.65],black,.1);
 const lenses=[];lensZ.forEach((z,i)=>{const moving=new T.Group();moving.position.set(0,4.3,z);moving.userData.dynamic=true;g['lens'+(i+1)].add(moving);const obj=glass(moving,opticalElement(3.02-i*.055,.35+i%2*.1,i%2?.16:.3),[0,0,0],.37);obj.material.color.set(i%2?'#a3c0bc':'#b0acd2');obj.material.roughness=.08;lenses.push(moving);});
 for(const x of[-4.8,4.8]){coil(g.ois,x,4.3,-10.2,4.8,4.8,m.copper);box(g.ois,.38,4.1,4.2,[x+Math.sign(x)*.45,4.3,-10.2],m.black,.12);}
 for(const x of[-5.55,5.55]){coil(g.af,x,4.3,.6,8.4,4.5,m.copper);box(g.af,.38,4,8.1,[x+Math.sign(x)*.45,4.3,.6],m.black,.1);}
 const balls=[];for(const x of[-4.64,4.64])for(const z of[-3.2,4.6]){const o=mesh(new T.SphereGeometry(.34,20,14),nickel,g.balls,[x,1.25+Math.sqrt(.59**2-.36**2),z]);o.userData.dynamic=true;balls.push({o,z});}
 const filter=glass(g.filter,new T.BoxGeometry(6.4,5,.16),[0,4.3,9.3],.47);filter.material.color.set('#9583b3');
 box(g.sensor,7.6,6.6,.55,[0,4.3,11.8],m.ceramic,.12);box(g.sensor,6.3,4.8,.18,[0,4.3,11.39],m.silicon,.025);
 for(let row=0;row<18;row++)for(let col=0;col<24;col++)box(g.sensor,.215,.215,.015,[(col-11.5)*.25,4.3+(row-8.5)*.25,11.286],(row+col)%2?m.silicon:m.gold,0);
 for(const x of[-3.4,3.4])for(let i=0;i<12;i++)box(g.sensor,.26,.24,.08,[x,1.6+i*.49,11.47],m.gold,0);
 box(g.flex,12,.1,3,[0,.65,13.7],flex,.06);box(g.flex,3,.1,6,[5.7,.65,15.9],flex,.06);box(g.flex,4.7,.55,2.7,[5.7,1,18.6],black,.12);
 for(let i=0;i<12;i++){const x=4+i*.3;box(g.flex,.15,.06,2.4,[x,1.31,18.6],m.gold,0);rod(g.flex,[x,.72,13],[x,.72,17.1],.028,m.gold,6);}
 textDecal(g.base,'5× · 50M',6.5,1.7,[0,.52,-15],{size:54,color:'#b0b7ac'});
 const effects=new T.Group();effects.userData.dynamic=true;effects.userData.explanatoryEffect=true;root.add(effects);effects.visible=false;
 const rayPositions=new Float32Array(12),rayGeo=new T.BufferGeometry();rayGeo.setAttribute('position',new T.BufferAttribute(rayPositions,3));const ray=new T.LineSegments(rayGeo,new T.LineBasicMaterial({color:'#e9ba8a',transparent:true,opacity:.85,depthWrite:false}));effects.add(ray);
 const imagePoint=mesh(new T.SphereGeometry(.16,12,8),new T.MeshBasicMaterial({color:'#efb58b'}),effects);
 root.userData={device:'periscope',effects:{cutaway:['shell','carriage']},reference:{configuration:'Samsung SEM 50M 5x Prism Lead Type',envelope:[31.76,15.4,8.55],lensElements:6,pixelMicrons:.7,fNumber:2.53},construction:'Documented configuration · representative optical prescription and mechanics'};
 const model=finishAssembly(root,g,PERISCOPE_PARTS);let focus=0,shakeX=1,shakeY=.6,stabilize=1,time=0,beamOffset=0;
 function pose(active=false,reduced=false,assembled=true,selected=null){
  const shift=-(1-focus/100)*.65;carriage.position.z=shift;lenses.forEach((o,i)=>o.position.z=lensZ[i]+shift);for(const{ o,z }of balls)o.position.z=z+shift/2;
  const pitch=assembled&&!reduced?shakeX*Math.sin(time*2.5)*Math.PI/180:0,yaw=assembled&&!reduced?shakeY*Math.sin(time*1.9)*Math.PI/180:0;
  const incoming=new T.Vector3(-Math.tan(yaw),-1,-Math.tan(pitch)).normalize(),restNormal=new T.Vector3(0,Math.SQRT1_2,Math.SQRT1_2),normal=stabilize?new T.Vector3(0,0,1).sub(incoming).normalize():restNormal;
  prism.quaternion.setFromUnitVectors(restNormal,normal);cradle.quaternion.copy(prism.quaternion);
  effects.visible=active&&assembled&&!selected;
  const outgoing=incoming.clone().reflect(normal),distance=21.47/outgoing.z,dx=outgoing.x*distance,dy=outgoing.y*distance;beamOffset=Math.hypot(dx,dy);
  const points=[[Math.tan(yaw)*13.7,18,-10.2+Math.tan(pitch)*13.7],[0,4.3,-10.2],[0,4.3,-10.2],[dx,4.3+dy,11.27]];
  points.forEach((p,i)=>rayPositions.set(p,i*3));rayGeo.attributes.position.needsUpdate=true;rayGeo.computeBoundingSphere();imagePoint.position.set(dx,4.3+dy,11.25);
 }
 model.behavior={setControl(id,value){if(!Number.isFinite(value))return;if(id==='focus')focus=T.MathUtils.clamp(value,0,100);if(id==='shakeX')shakeX=T.MathUtils.clamp(value,0,2);if(id==='shakeY')shakeY=T.MathUtils.clamp(value,0,2);if(id==='stabilize')stabilize=value>=.5?1:0;pose();},update(state,c){if(c.assembled&&c.playing&&!c.reduced)time+=c.dt||0;if(!c.assembled){time=0;prism.rotation.set(0,0,0);cradle.rotation.set(0,0,0);}pose(c.playing||state.power>.01,c.reduced,c.assembled,c.selected);},reset(){focus=0;shakeX=1;shakeY=.6;stabilize=1;time=0;pose();},getReadouts(){return[{label:'Reference optics',value:'6P · F/2.53 · 5×'},{label:'Focus scenario',value:focus===100?'∞':`${Math.round(30/(1-focus/100))} cm`},{label:'Lens travel',value:((1-focus/100)*.65).toFixed(2),unit:'mm illustrative'},{label:'Stabilization',value:stabilize?'Ideal prism compensation':'Disabled'},{label:'Illustrative beam offset',value:beamOffset.toFixed(3),unit:'mm'},{label:'Geometry',value:'Representative prescription & actuator'}];}};
 model.behavior.reset();return model;
}
export const PERISCOPE_BOARD=definition({id:'periscope',tab:'Folded telephoto',category:'optics',parts:PERISCOPE_PARTS,build:buildPeriscope,dimensions:'31.76 × 15.4 × 8.55 mm body',half:46,target:[0,18,2],assembledHalf:24,assembledTarget:[0,4,1],minHalfWidth:22,explodedMinHalfWidth:34,camera:[45,52,-64],floorY:-.7,groundRadius:22,start:0,model:'Samsung SEM / 50M 5× prism-lead configuration',description:'Six polymer lenses focus a folded light path behind a stabilizing prism.',basis:'Documented prism-lead configuration · representative interior',operationNote:'Illustrative focus travel and ideal stabilization · rays are not an optical trace',controls:[{id:'focus',label:'Focus toward infinity',min:0,max:100,step:1,value:0,unit:'%'},{id:'shakeX',label:'Pitch disturbance',min:0,max:2,step:.1,value:1,unit:'°'},{id:'shakeY',label:'Yaw disturbance',min:0,max:2,step:.1,value:.6,unit:'°'},{id:'stabilize',label:'Prism stabilization',min:0,max:1,step:1,value:1,format:v=>v?'On':'Off'}],sources:[['Samsung SEM · folded camera specifications',source],['Samsung SEM · actuator principles','https://www.samsungsem.com/global/product/module/camera-module/main-core-technology.do']],accuracy:'The reference is the documented 50M 5× prism-lead configuration, with 31.76 × 15.4 × 8.55 mm body, 1/2.5-inch format, 0.7 µm pixels, six polymer elements, F/2.53, 20.74° field and 18.45 mm track length. No public ordering code or hardware revision is supplied; the manufacturer page snapshot identifies the selected configuration. The external finish is photo-estimated. All internal element profiles, spacing, coatings, pivots, balls, coils and flex contacts are representative. Lens-shift autofocus and two-axis prism-tilt OIS follow the published roles. Travel, disturbance frequency, perfect compensation and the focus interpolation are illustrative, not calibrated lens performance. Rays show the folded path only; no optical prescription or image-quality simulation is claimed. The sensor mosaic is enlarged, not the actual pixel count.',hidden:['prism','gimbal','carriage',...lensZ.map((_,i)=>'lens'+(i+1)),'ois','af','balls','filter','sensor']});
