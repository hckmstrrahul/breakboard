import {T,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,palette,rod,wire,plate,frame,smdField,dieRegions} from './module-kit.js';

const source='https://content.u-blox.com/sites/default/files/ZED-F9P-04B_DataSheet_UBX-21044850.pdf';
export const GNSS_PARTS=[
 part('shield','RF shield','Electromagnetic enclosure',[0,2.4,0],[0,23,0],'A hollow metal shield covers the receiver. The package envelope follows the drawing; wall thickness and the reconstructed identification print are representative.',[['Reference','ZED-F9P-04B-01'],['Envelope','22 × 17 × 2.4 mm']]),
 part('substrate','Module substrate','LGA foundation',[8,.6,6],[0,0,0],'The module carries the receiver and its supporting parts. Its outline is documented; hidden layer stack and trace routing are representative.',[['Outline','22 × 17 mm'],['Construction','Representative internal routing']]),
 part('lands','LGA contacts','Signals & ground',[7,.025,7.45],[0,-2,0],'Fifty-four perimeter contacts surround forty-eight central ground lands. Their sizes and spacing follow the package drawing. The module has no header or built-in antenna.',[['Contacts','54 perimeter + 48 central ground'],['Pitch','1.10 mm perimeter · 2.10 mm center']]),
 part('package','Receiver package','Integrated radio & navigation',[1,1.4,0],[2,5,0],'The central receiver combines RF reception, digital processing and power management. Its footprint and opened package are representative; a functional block diagram does not disclose its production geometry.',[['Architecture','Dual-band RF + navigation'],['Geometry','Representative package cutaway']]),
 part('die','Receiver die','Illustrated functional regions',[1,1.25,0],[3,12,0],'Colored regions explain RF processing, correlation, navigation and ambiguity resolution. Their pattern is an illustration, not a transistor map or verified die photograph.',[['Layout','Representative functional regions'],['Motion','No moving hardware']]),
 part('filters','Dual RF filter paths','L1 & L2 conditioning',[-6,1.25,0],[-7,4,0],'The documented signal path splits the antenna feed into two filtered bands. The two miniature filter packages and their internal electrode pattern are representative.',[['Paths','L1 and L2'],['Input','External active antenna required']]),
 part('tcxo','Reference oscillator','Temperature-compensated timing',[-4,1.25,-5],[-5,6,-9],'A TCXO supplies the receiver reference. Its metal package, four pads and reconstructed footprint illustrate the documented timing block.',[['Function','Stable receiver reference'],['Footprint','Representative']]),
 part('rtc','RTC crystal','Backup timebase',[.1,1.2,-5],[0,5,-8],'A separate crystal supports the real-time clock. The small two-terminal package is representative; no exact internal crystal specification is asserted.',[['Function','Backup timekeeping'],['Footprint','Representative']]),
 part('flash','Flash memory','Firmware & configuration',[5.5,1.15,-4.7],[6,4,-4],'External flash supports the receiver. Package dimensions and terminal count here are illustrative; the manufacturer block diagram establishes its role.',[['Function','Firmware/configuration'],['Package','Representative']]),
 part('passives','Supporting passives','Decoupling & matching',[-5,1,5.3],[-6,2,5],'Small resistors, capacitors and matching parts support the RF and power circuits. Count and placement are reconstructed rather than extracted from a published PCB.',[['Placement','Representative'],['Detail','Ceramic bodies and metal terminations']]),
 part('bonds','Die interconnect','Representative fine connections',[3,1.35,2],[7,9,4],'Fine bonds connect the illustrative receiver die to its package lands. Bond count, metallurgy and routing are representative.',[['Geometry','Representative wire bonds']])
];

export function buildGNSS(){
 const {root,groups:g}=makeAssembly(GNSS_PARTS),m=palette();
 const pcb=material('#254b3d',.13,.58),steel=material('#b7bdbe',.87,.31),black=material('#1a2028',.17,.52),ink=material('#738a70',.35,.5);
 plate(g.substrate,22,17,.67,[0,.375,0],pcb);
 // Nominal dimensions from figure 6. The 48 center lands are ground, not I/O.
 for(const z of[-7.45,7.45])for(let i=0;i<14;i++)box(g.lands,.8,.04,1.5,[-7.15+i*1.1,.02,z],m.gold,0);
 for(const x of[-9.95,9.95])for(let i=0;i<13;i++)box(g.lands,1.5,.04,.8,[x,.02,-6.6+i*1.1],m.gold,0);
 for(let row=0;row<6;row++)for(let col=0;col<8;col++)box(g.lands,1.1,.04,1.1,[-7.35+col*2.1,.02,-5.25+row*2.1],m.gold,0);
 // A real cavity instead of a solid cuboid hiding the internal components.
 box(g.shield,21,.16,16,[0,2.32,0],steel,.12);
 for(const z of[-7.9,7.9])box(g.shield,20.6,1.53,.2,[0,1.475,z],steel,.08);
 for(const x of[-10.4,10.4])box(g.shield,.2,1.53,16,[x,1.475,0],steel,.08);
 for(const z of[-7.88,7.88])for(let i=0;i<6;i++)box(g.shield,1.2,.27,.25,[-8+i*3.2,.79,z],steel,.025);
 for(const x of[-10.38,10.38])for(let i=0;i<5;i++)box(g.shield,.25,.27,1.1,[x,.79,-6+i*3],steel,.025);
 textDecal(g.shield,'u-blox',17,5,[0,2.41,-3],{size:84,color:'#35413f'});
 textDecal(g.shield,'ZED-F9P-04B',18,3,[0,2.412,1.2],{size:60,color:'#35413f'});
 textDecal(g.shield,'GNSS · L1 / L2',15,1.7,[0,2.414,4.1],{size:44,color:'#35413f'});
 box(g.substrate,.55,.018,.55,[-8.25,.721,7.5],m.gold,.015);
 // The chip body is a rim around a separately selectable die; dimensions are
 // representative. No invented production part number is printed on its top.
 box(g.package,7.5,.16,6.3,[1,.8,0],black,.05);
 frame(g.package,7.5,6.3,.58,.62,[1,1.17,0],black);
 for(const side of[-1,1])for(let i=0;i<14;i++){
  box(g.package,.22,.09,.45,[-2+i*.46,.77,side*3.03],m.nickel,.01);
  box(g.package,.45,.09,.22,[1+side*3.63,.77,-2.6+i*.4],m.nickel,.01);
 }
 box(g.die,5.6,.22,4.4,[1,1.01,0],m.silicon,.025);
 dieRegions(g.die,5.05,3.85,[1,1.13,0],{columns:4,rows:3,color:'#a99a65'});
 for(let i=0;i<18;i++)for(const z of[-1.98,1.98])box(g.die,.14,.015,.18,[-1.52+i*.295,1.145,z],m.gold,0);
 for(let i=0;i<12;i++)for(const x of[-1.58,3.58])box(g.die,.18,.015,.14,[x,1.145,-1.7+i*.31],m.gold,0);
 for(let i=0;i<18;i++)for(const side of[-1,1]){const x=-1.52+i*.295;box(g.package,.16,.018,.24,[x,1.47,side*2.78],m.gold,0);wire(g.bonds,[[x,1.16,side*1.98],[x,1.72,side*2.32],[x,1.48,side*2.78]],.016,m.gold);}
 for(let i=0;i<12;i++)for(const side of[-1,1]){const z=-1.7+i*.31;box(g.package,.24,.018,.16,[1+side*3.32,1.47,z],m.gold,0);wire(g.bonds,[[1+side*2.58,1.16,z],[1+side*3,1.72,z],[1+side*3.32,1.48,z]],.016,m.gold);}
 for(const z of[-2.7,2.7]){
  box(g.filters,2.5,.22,3,[-6.6,.84,z],m.ceramic,.08);
  frame(g.filters,2.4,2.9,.48,.17,[-6.6,1.19,z],steel);
  box(g.filters,2,.035,2.5,[-6.6,1.045,z],m.silicon,.02);
  for(let i=0;i<20;i++)box(g.filters,1.55,.012,.035,[-6.6,1.071,z-.9+i*.09],m.gold,0);
  for(const side of[-1,1])for(let i=0;i<3;i++)box(g.filters,.45,.08,.35,[-6.6+side*1.25,.77,z-.85+i*.85],m.gold,.01);
 }
 box(g.tcxo,3.2,.6,2.5,[-4.4,1.04,-5.5],steel,.18);textDecal(g.tcxo,'TCXO',2.7,1.7,[-4.4,1.352,-5.5],{size:60,color:'#44514e'});
 for(const x of[-5.4,-3.4])for(const z of[-6.2,-4.8])box(g.tcxo,.65,.12,.7,[x,.77,z],m.gold,.025);
 box(g.rtc,2,.38,1.2,[-.4,.95,-5.3],steel,.14);for(const x of[-1.2,.4])box(g.rtc,.4,.12,1.05,[x,.77,-5.3],m.gold,.025);
 box(g.flash,3.7,.65,3.1,[5.4,1.065,-4.7],black,.08);textDecal(g.flash,'FLASH',3.2,2,[5.4,1.4,-4.7],{size:58});
 for(const side of[-1,1])for(let i=0;i<4;i++)box(g.flash,.7,.17,.35,[5.4+side*1.95,.84,-5.85+i*.77],m.nickel,.02);
 const positions=[];for(let i=0;i<8;i++)positions.push([-7.7+i*1.05,.94,5.8]);for(let i=0;i<5;i++)positions.push([7.6,.94,-1.3+i*1.25]);for(let i=0;i<4;i++)positions.push([-9,.94,-3.7+i*2.4]);
 smdField(g.passives,positions,m.ceramic,.65);
 // Newly drawn exposed routes link the illustrated footprints; they do not
 // claim to reproduce buried copper or a disclosed board layout.
 const routes=[[[-6.05,.73,7.45],[-8.2,.73,6.6],[-8.2,.73,2.7],[-7.8,.73,2.7]], [[-8.2,.73,2.7],[-8.2,.73,-2.7],[-7.8,.73,-2.7]], [[-5.35,.73,-2.7],[-4,.73,-2.7],[-3,.73,-1.4]], [[-5.35,.73,2.7],[-4,.73,2.7],[-3,.73,1.4]], [[-2.9,.73,-5.5],[-2.4,.73,-5.5],[-2.4,.73,-3.1]], [[4.3,.73,-4.7],[3.5,.73,-4.7],[3.5,.73,-3.1]], [[7.5,.73,5.8],[6,.73,5.8],[6,.73,2.3],[4.75,.73,2.3]]];
 for(const route of routes)for(let i=1;i<route.length;i++)rod(g.substrate,route[i-1],route[i],.035,ink,6);
 for(const side of[-1,1])for(let i=0;i<21;i++){const x=-9.5+i*.95;mesh(new T.TorusGeometry(.085,.024,5,12).rotateX(Math.PI/2),m.gold,g.substrate,[x,.735,side*6.9]);}
 // Colored signal particles and a tightening ring are process annotations.
 const effects=new T.Group();effects.userData.dynamic=true;effects.userData.explanatoryEffect=true;g.substrate.add(effects);
 const paths=[],dots=[];for(const route of routes.slice(0,6)){
  const points=route.map(p=>new T.Vector3(p[0],p[1]+1.1,p[2])),curve=new T.CatmullRomCurve3(points),line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(32)),new T.LineBasicMaterial({color:'#eeab79',transparent:true,opacity:.45,depthWrite:false}));effects.add(line);paths.push(curve);dots.push(mesh(new T.SphereGeometry(.1,10,8),new T.MeshBasicMaterial({color:'#f2be8b'}),effects));
 }
 const solution=mesh(new T.TorusGeometry(1.8,.035,6,64),new T.MeshBasicMaterial({color:'#7ccdb1',transparent:true,opacity:.8,depthWrite:false}),effects,[1,1.8,0]);solution.rotation.x=-Math.PI/2;
 root.userData={device:'gnss',effects:{cutaway:['shield']},reference:{part:'ZED-F9P-04B-01',firmware:'HPG 1.32',revision:'UBX-21044850 R05 / 2024-03-21',width:22,depth:17,height:2.4,perimeterContacts:54,groundPads:48},construction:'Documented package; representative internal assembly'};
 const model=finishAssembly(root,g,GNSS_PARTS,{skipGroups:new Set(['substrate'])});let satellites=10,corrections=1,obstruction=0,elapsed=0,phase=0;
 const count=()=>Math.max(0,Math.round(satellites*(1-obstruction/100)));
 const progress=()=>count()<4?0:Math.min(1,elapsed/(corrections?10:4));
 const fix=()=>count()<4?'No 3D fix':elapsed<2?'Acquiring':!corrections?'Standalone':progress()<1?'RTK float':'RTK fixed';
 function apply(assembled=true,reduced=false,active=false,selected=null){
  effects.visible=assembled&&active&&!selected&&count()>=4;
  dots.forEach((dot,i)=>dot.position.copy(paths[i].getPoint(reduced?.5:(phase*.22+i*.16)%1)));
  const scale=.3+(1-progress())*.7;solution.scale.setScalar(scale);solution.material.color.set(fix()==='RTK fixed'?'#7ccdb1':'#e2a77d');solution.visible=elapsed>=2||reduced;
 }
 model.behavior={setControl(id,value){if(!Number.isFinite(value))return;if(id==='satellites')satellites=Math.round(T.MathUtils.clamp(value,0,16));if(id==='corrections')corrections=value>=.5?1:0;if(id==='obstruction')obstruction=T.MathUtils.clamp(value,0,100);elapsed=0;apply();},
  update(state,{assembled,reduced,playing,selected,dt=0}){if(assembled&&playing&&!reduced){phase+=dt;if(count()>=4)elapsed+=dt;else elapsed=0;}if(!assembled){elapsed=0;phase=0;}apply(assembled,reduced,playing||state.power>.01,selected);},
  reset(){satellites=10;corrections=1;obstruction=0;elapsed=0;phase=0;apply();},
  getReadouts(){return[{label:'Synthetic fix',value:fix()},{label:'Usable satellites',value:count()},{label:'Correction feed',value:corrections?'RTCM available':'Absent'},{label:'Illustrated convergence',value:Math.round(progress()*100),unit:'%'},{label:'Timing',value:'Illustrative · not a GNSS solver'}];}
 };model.behavior.reset();return model;
}

export const GNSS_BOARD=definition({id:'gnss',tab:'GNSS receiver',category:'radio',parts:GNSS_PARTS,build:buildGNSS,dimensions:'22 × 17 × 2.4 mm',half:29,target:[0,10,0],assembledHalf:16,assembledTarget:[0,.9,0],minHalfWidth:17,explodedMinHalfWidth:26,camera:[38,38,46],floorY:-2.7,groundRadius:15,start:0,model:'u-blox ZED-F9P-04B-01 / HPG 1.32',description:'Dual-band satellite signals and correction data converge into a precise position.',basis:'Documented package · representative internal cutaway',operationNote:'Synthetic acquisition & RTK sequence · illustrative timing',controls:[{id:'satellites',label:'Satellites in scenario',min:0,max:16,step:1,value:10},{id:'corrections',label:'Correction feed',min:0,max:1,step:1,value:1,format:v=>v?'Available':'Absent'},{id:'obstruction',label:'Obstructed sky',min:0,max:100,step:5,value:0,unit:'%'}],sources:[['u-blox · ZED-F9P-04B datasheet R05',source],['u-blox · ZED-F9P integration manual R16','https://content.u-blox.com/sites/default/files/ZED-F9P_IntegrationManual_UBX-18010802.pdf']],accuracy:'The ZED-F9P-04B-01 package, 54 perimeter contacts and 48 central ground pads follow the published drawing. Internal footprints, shielding thickness, die regions, passives and routing are representative. The documented architecture includes two RF bands, integrated receiver and power management, SAW paths, TCXO, RTC crystal and flash; block regions are not a disclosed die floorplan. An external active antenna is required and is not included here. Satellite count, sky obstruction, correction feed and all fix/convergence timing form an authored synthetic scenario, not a GNSS solver or an accuracy prediction. Colored paths and the tightening ring are explanatory annotations; physical components remain stationary.',hidden:['package','die','filters','tcxo','rtc','flash','passives','bonds']});
