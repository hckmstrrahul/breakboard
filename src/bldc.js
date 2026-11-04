import {T,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,rod,wire,ring,cylinder,TAU} from './module-kit.js';

// Reference lock: T-MOTOR MN2212 V2.0 KV920, manufacturer drawing
// MN2212-draw-0604-v1 and the KV920 table. 9 stator slots / 12 rotor poles.
const D={diameter:27.5,bodyLength:26.5,overallLength:32.6,shaftDiameter:4,statorDiameter:22,statorHeight:13,slots:9,poles:12};
export const BLDC_PARTS=[
 part('bell','Rotor bell','Rotating outer housing',[11,18,0],[0,65,0],'The dark cylindrical bell and six open top windows follow the MN2212 V2.0 drawing and product photograph. It rotates around the stationary stator and carries the magnet ring.',[['Outer diameter','27.5 mm'],['Top openings','6'],['Evidence','Drawing/photo reconstruction']]),
 part('magnets','Twelve rotor magnets','Permanent magnetic poles',[11.8,14,0],[0,42,0],'Twelve alternating magnetic poles line the inside of the rotating bell. The manufacturer specifies 9N12P; individual magnet profiles and adhesive gaps are representative.',[['Rotor poles','12 · 6 pole pairs'],['Role','Rotating magnetic field'],['Internal dimensions','Representative']]),
 part('stator','Nine-tooth laminated stator','Stationary magnetic circuit',[9,16,0],[0,20,0],'Nine radial teeth and their laminated back iron support the three-phase windings. The manufacturer documents a 22 mm stator diameter and 13 mm height; tooth shape and visible lamination count are reconstructed.',[['Slots','9'],['Stator','Ø22 × 13 mm'],['Tooth profile','Representative']]),
 part('phaseu','Phase U winding','Electrical phase',[8,20,0],[23,14,0],'Three copper coils belong to phase U. The reduced visible turn count exposes the winding structure clearly. Phase colors in Play are explanatory current highlights, not glowing physical copper.',[['Coils shown','3'],['Turns','Reduced representative count']]),
 part('phasev','Phase V winding','Electrical phase',[-5,20,8],[-18,18,20],'Phase V occupies the next tooth in each repeated group. Its electrical phase is displaced by 120 degrees from U in the illustrative drive.',[['Coils shown','3'],['Phase displacement','120° electrical']]),
 part('phasew','Phase W winding','Electrical phase',[-5,20,-8],[-18,22,-20],'Phase W completes the three-phase winding set. Smooth phase currents explain the rotating field rather than reproducing an actual ESC switching waveform.',[['Coils shown','3'],['Phase displacement','240° electrical']]),
 part('shaft','Rotor shaft','Mechanical output',[0,28.5,0],[0,31,23],'The 4 mm steel shaft joins the rotating bell and passes through the two bearings. The drawing gives 3.5 mm projection at the output and 2.6 mm at the rear.',[['Diameter','4 mm'],['Overall shaft span','32.6 mm'],['Body length','26.5 mm']]),
 part('bearings','Shaft bearings','Rotating support',[3.5,21,0],[19,10,19],'Two bearings support the rotor shaft in the stationary carrier. Raceway diameters, cage and eight balls per bearing are representative rather than an identified bearing series.',[['Bearings shown','2'],['Internal detail','Representative']]),
 part('base','Vented mounting base','Stationary support',[10,2,0],[0,0,0],'The silver base supports the stator and bearing carrier. Four mounting-hole locations and the open base silhouette follow the published drawing.',[['Mounting','4 × M2.5'],['Opposing hole spans','16 mm / 19 mm'],['Vent openings','4']]),
 part('leads','Three phase leads','ESC connection',[-19,3,0],[-21,0,0],'Three insulated phase leads leave the stationary winding assembly. Their 400 mm production length is shortened and identified here to keep the model inspectable; swapping two phases reverses rotation.',[['Production cable length','400 mm'],['Wire','20 AWG'],['Model cable','Shortened for display']]),
 part('retainer','Shaft retaining clip','Axial retention',[0,-2,0],[0,1,20],'A representative spring retaining clip and washer locate the shaft below the rear bearing. They remain attached to the shaft during the rotation demonstration.',[['Detail','Representative retaining hardware']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
function moveGroup(parent,name){const g=new T.Group();g.name=name;g.userData.dynamic=true;parent.add(g);return g;}
function wedge(r0,r1,a0,a1,depth){const s=new T.Shape();s.absarc(0,0,r1,a0,a1,false);s.absarc(0,0,r0,a1,a0,true);s.closePath();const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);return g;}
function perforatedPlate(parent,outer,inner,y,h,windows,phase,mat,holes=[]){const s=new T.Shape();s.absarc(0,0,outer,0,TAU);const center=new T.Path();center.absarc(0,0,inner,0,TAU,true);s.holes.push(center);for(let i=0;i<windows;i++){const a=phase+i*TAU/windows,spread=TAU/windows*.24,r0=5.2,r1=outer-2.0;const hole=new T.Path();hole.absarc(0,0,r0,a-spread,a+spread,false);hole.absarc(0,0,r1,a+spread,a-spread,true);hole.closePath();s.holes.push(hole);}for(const[x,z,r]of holes){const hole=new T.Path();hole.absarc(x,-z,r,0,TAU,true);s.holes.push(hole);}const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:32});g.rotateX(-Math.PI/2);return mesh(g,mat,parent,[0,y,0]);}
function winding(parent,angle,mat){const group=new T.Group();group.rotation.y=angle;parent.add(group);const pts=[],turns=12,samples=48;for(let i=0;i<=turns*samples;i++){const t=i/(turns*samples),a=t*turns*TAU,cy=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.28)*7.15,cz=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.45)*1.55;pts.push(new T.Vector3(6.35+3.7*t,12.5+cy,cz));}const curve=new T.CatmullRomCurve3(pts);mesh(new T.TubeGeometry(curve,turns*samples,.13,5,false),mat,group);return group;}
function bearing(parent,y,steel,brass){ring(parent,4.6,3.85,2.6,[0,y,0],steel,48);ring(parent,2.8,2.02,2.6,[0,y,0],steel,48);for(let i=0;i<8;i++){const a=i*TAU/8;mesh(new T.SphereGeometry(.52,12,8),steel,parent,[Math.cos(a)*3.32,y,Math.sin(a)*3.32]);}for(const s of[-1,1])ring(parent,3.9,2.75,.12,[0,y+s*.9,0],brass,48);}
export function buildBLDC(){
 const {root,groups}=makeAssembly(BLDC_PARTS),steel=material('#91999e',.88,.3),lamination=material('#737b80',.8,.4),alloy=material('#b8c0c3',.88,.27),black=material('#202329',.65,.36),magnet=material('#7c8589',.75,.24),insulation=material('#9b8762',.05,.7),brass=material('#b09b6a',.75,.4);
 const phaseMaterials=['#b36d38','#bd7941','#aa6133'].map(color=>{const m=material(color,.78,.29);m.emissive=new T.Color('#df7128');return m;});
 const bell=moveGroup(groups.bell,'Rotating bell'),magnets=moveGroup(groups.magnets,'Magnet ring'),shaft=moveGroup(groups.shaft,'Rotor shaft'),retainer=moveGroup(groups.retainer,'Shaft retainer');
 ring(bell,13.75,12.9,18.6,[0,14.2,0],black,96);ring(bell,13.75,12.75,.5,[0,4.65,0],alloy,96);
 // Open top is real geometry, with six windows and two adapter holes.
 perforatedPlate(bell,13.75,2.02,23.5,2.0,6,0,alloy,[[0,6,1.45],[0,-6,1.45]]);
 ring(bell,4.3,2.02,1,[0,26,0],alloy,64);
 for(let i=0;i<12;i++){const a=i*TAU/12;mesh(wedge(11.7,12.8,a+.025,a+TAU/12-.025,14.2),magnet,magnets,[0,6.2,0]);}
 cylinder(shaft,2,32.6,[0,13.7,0],steel,64);
 ring(retainer,3,2.02,.35,[0,-1.9,0],steel,48);mesh(wedge(2.05,2.9,.4,TAU-.4,.4),black,retainer,[0,-2.4,0]);
 // The nine-tooth stator has an actual open center and individual pole shoes.
 ring(groups.stator,6.3,4.8,13,[0,12.5,0],lamination,72);
 for(let i=0;i<9;i++){
  const a=i*TAU/9,g=new T.Group();g.rotation.y=-a;groups.stator.add(g);
  box(g,4.7,13,1.9,[7.5,12.5,0],lamination,.05);
  mesh(wedge(9.7,11,-.235,.235,13),lamination,g,[0,6,0]);
  for(let yy=6.45;yy<19;yy+=.75)mesh(wedge(9.74,11.025,-.235,.235,.055),steel,g,[0,yy,0]);
  // Thin insulating shoulders surround the winding, without filling its bore.
  for(const y of[5.85,19.15])box(g,4.6,.28,3.2,[8,y,0],insulation,.1);
  winding(groups[['phaseu','phasev','phasew'][i%3]],-a,phaseMaterials[i%3]);
 }
 // Base drawing has a cross-shaped mounting pattern: 16 by 19 mm opposing spans.
 perforatedPlate(groups.base,13.5,2.1,0,2.4,4,Math.PI/4,alloy,[[8,0,1.05],[-8,0,1.05],[0,9.5,1.05],[0,-9.5,1.05]]);
 ring(groups.base,13.65,12.55,1,[0,3,0],alloy,96);ring(groups.base,4.9,4.65,4.9,[0,2.45,0],alloy,64);ring(groups.base,4.75,2.1,13.5,[0,12,0],alloy,64);ring(groups.base,4.9,4.65,3,[0,20.7,0],alloy,64);
 bearing(groups.bearings,3.7,steel,brass);bearing(groups.bearings,20.8,steel,brass);
 for(let i=0;i<3;i++){
  const z=(i-1)*1.25;wire(groups.leads,[[-8,5,z],[-12,3.2,z],[-16,2.4,z],[-21,2.4,z],[-26,2.4,z-.7]],.52,black);
  rod(groups.leads,[-26,2.4,z-.7],[-29,2.4,z-.7],.36,phaseMaterials[i],12);
  wire(groups.leads,[[-8,5,z],[-6,5.1,z],[-6,6,z-1]],.18,phaseMaterials[i]);
 }
 // The barrel inscription is wrapped tangentially in short lines; it is never
 // stretched across the complete cylinder or clipped at a decal boundary.
 const name=textDecal(bell,'MN2212-13',16,3,[0,14,13.79],{size:64,color:'#d0c9b8',sub:'KV920  V2.0'});name.geometry.dispose();name.geometry=new T.CylinderGeometry(13.79,13.79,3,64,1,true,-.6,1.2);name.position.set(0,14,0);name.rotation.x=0;
 root.userData={device:'bldc',lockedReference:'T-MOTOR MN2212 V2.0 KV920 · MN2212-draw-0604-v1',dimensions:[27.5,32.6,27.5],bodyDimensions:[27.5,26.5,27.5],statorSlots:9,rotorPoles:12,polePairs:6,statorDiameter:22,statorHeight:13,shaftDiameter:4,topWindows:6,baseWindows:4,mountingCenters:[[8,0],[-8,0],[0,9.5],[0,-9.5]],effects:{cutaway:['bell']},construction:'Documented envelope/counts; reconstructed representative hidden geometry'};
 const model=finishAssembly(root,groups,BLDC_PARTS,{skipGroups:new Set(['bell','magnets','shaft','retainer'])});
 // Schematic air-gap field directions are an overlay, outside the part inventory.
 const field=new T.Group();field.name='Illustrative rotor field';field.userData.dynamic=true;field.userData.illustrative=true;field.visible=false;root.add(field);
 for(let i=0;i<12;i++){const a=(i+.5)*TAU/12,north=i%2===0,radial=new T.Vector3(Math.cos(a),0,-Math.sin(a)),origin=radial.clone().multiplyScalar(north?12:9.7);origin.y=21.6;const arrow=new T.ArrowHelper(radial.clone().multiplyScalar(north?-1:1),origin,2.3,north?'#d6a177':'#8da9b8',.55,.32);arrow.line.material.transparent=true;arrow.line.material.opacity=.65;arrow.cone.material.transparent=true;arrow.cone.material.opacity=.65;field.add(arrow);}
 model.fieldOverlay=field;root.userData.fieldOverlay={kind:'Illustrative radial magnetic-field direction',poles:12};
 let speed=1200,direction=1,angle=0,active=false;
 const rotors=[bell,magnets,shaft,retainer];
 function apply(){for(const rotor of rotors)rotor.rotation.y=angle;field.rotation.y=angle;}
 model.behavior={
  setControl(id,value){if(id==='speed')speed=T.MathUtils.clamp(Number(value)||0,0,4800);if(id==='direction')direction=Number(value)<0?-1:1;},
  update(state,context){active=context.assembled&&context.playing;field.visible=active&&!context.selected&&!context.isolate;if(!context.assembled){angle=0;apply();phaseMaterials.forEach(m=>m.emissiveIntensity=0);return;}if(active&&!context.reduced){angle=(angle-direction*(speed/60)*TAU*Math.min(.05,Math.max(0,context.dt||0))/60)%TAU;apply();}phaseMaterials.forEach((m,i)=>m.emissiveIntensity=active?.12+.3*(.5+.5*Math.sin(angle*6-i*TAU/3)):0);},
  reset(){speed=1200;direction=1;angle=0;active=false;field.visible=false;apply();phaseMaterials.forEach(m=>m.emissiveIntensity=0);},
  getReadouts(){return[{label:'Speed command',value:String(speed),unit:'rpm'},{label:'Electrical frequency',value:(speed/60*6).toFixed(0),unit:'Hz'},{label:'Direction',value:direction>0?'Clockwise':'Counterclockwise'},{label:'Display rate',value:'1/60 of commanded rotation'},{label:'Field overlay',value:'Illustrative pole directions'}];}
 };
 return model;
}
export const BLDC_BOARD=definition({id:'bldc',tab:'BLDC motor',category:'motion',parts:BLDC_PARTS,build:buildBLDC,dimensions:'Ø27.5 × 26.5 mm body',half:64,assembledHalf:30,assembledTarget:[-3,13,0],target:[0,43,0],camera:[76,125,106],start:0,floorY:-3,groundRadius:25,model:'T-MOTOR MN2212 V2.0 / KV920 / 9N12P',intro:'Nine copper-wound teeth drive a twelve-pole rotor around a stationary core.',description:'Nine copper-wound teeth drive twelve magnets in an open, brushless rotor.',subtitle:'A rotating field, a moving rotor.',operationNote:'Three phases · schematic field arrows · 1/60 speed',basis:'Manufacturer drawing and pole count · reconstructed interior',controls:[{id:'speed',label:'Speed command',min:0,max:4800,step:100,value:1200,unit:'rpm'},{id:'direction',label:'Direction',min:-1,max:1,step:2,value:1,format:value=>value>0?'Clockwise':'Counterclockwise'}],sources:[['T-MOTOR / LIGPOWER · MN2212 V2.0 KV920 specifications','https://www.ligpower.com/product/mn2212-v2-motor-navigator-type.html'],['T-MOTOR · MN2212-draw-0604-v1 dimension drawing','https://www.ligpower.com/images/202606/MN2212-draw-0604-v1.jpg'],['Portescap · Brushless motor operation','https://www.portescap.com/en/products/brushless-dc-motors/bldc-motor-design']],accuracy:'Locked to the T-MOTOR MN2212 V2.0 KV920 table and MN2212-draw-0604-v1 drawing. The 27.5 mm body diameter, 26.5 mm body length, 4 mm shaft, 22 × 13 mm stator, nine slots, twelve poles and mounting-hole centers are documented. Bell finish and openings follow the photograph/drawing. Tooth shapes, magnet sections, winding turns, bearing internals and shaft retainer are representative. Phase leads are shortened from the documented 400 mm. Radial arrows illustrate rotor-pole field direction, not a solved magnetic-field map. Play is a three-phase explanation at 1/60 speed, not a torque, ESC or load simulation.',hidden:['magnets','stator','phaseu','phasev','phasew','bearings']});
