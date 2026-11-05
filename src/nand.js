import {T,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,palette,rod,wire,plate,cylinder,dieRegions} from './module-kit.js';
const generation='https://www.kioxia.com/en-jp/rd/technology/topics/topics-66.html';
const layers=218,strings=8,pitch=.2,first=7,top=first+(layers-1)*pitch;
const centers=[[-6,-3],[-2,-3],[2,-3],[6,-3],[-6,3],[-2,3],[2,3],[6,3]];
export const NAND_PARTS=[
 part('cmos','CMOS control wafer','Array control and sensing',[0,.8,1],[0,0,0],'BiCS8 fabricates the control CMOS separately before bonding it to the memory array. This enlarged floorplan illustrates row drivers, page buffers and control; it is not a production transistor map.',[['Reference','BiCS FLASH generation 8 · 1 Tb TLC'],['Geometry','Magnified representative section']]),
 part('lowerwiring','CMOS interconnect','Control-side metal layers',[7,2.4,-3],[-9,2,-8],'Several illustrative metal levels route signals toward the bonding interface. Neither their number nor individual routes are a disclosed netlist.',[['Geometry','Representative wiring layers']]),
 part('bond','CBA bonding interface','Direct copper connections',[0,3.5,0],[0,5,-8],'The CMOS and memory-array wafers are processed separately and directly bonded. The displayed contacts are enlarged and do not reproduce production pitch or count.',[['Technology','CMOS directly bonded to array'],['Geometry','Representative copper contacts']]),
 part('bitlines','Bit lines and array routing','Drain-side conductors',[2,5,-3],[10,7,-10],'The bonded orientation places the bit-line side near CMOS and the common source above the array. Eight visible strings are a sample, not the complete 1 Tb array.',[['Displayed strings','8 · representative sample'],['Orientation','Drain below · source above']]),
 part('sgd','Drain select gates','String selection',[0,6.3,-1],[0,9,-8],'Two illustrative select-gate strips each address four rows of strings. The insulating slit falls between active strings, following the OPS principle; exact pitch and geometry are representative.',[['Architecture','On-pitch select-gate drain'],['Geometry','Representative enlarged strips']]),
 part('wordlines','218 word lines','Memory control gates',[8,29,2],[-19,12,0],'Each metal layer intersects the vertical channels to form memory cells. The 218-word-line count is documented; this is one enlarged array section, not 218 separate silicon dies.',[['Word lines','218'],['Cells','TLC · 3 bits per cell'],['Display','Cutaway · not to scale']]),
 part('dielectric','Interlayer insulation','Electrical separation',[8,28,-4],[19,12,0],'Thin insulating layers separate adjacent word lines. The color and relative thickness are illustrative. The open front is a diagrammatic cut, not a production edge.',[['Construction','Alternating gate and insulation layers']]),
 part('blocking','Blocking insulation','Gate-side dielectric',[6.7,28,3],[15,5,5],'The outer insulating film separates the charge-storage layer from the control gate. Radial order follows the manufacturer cell diagram; dimensions are enlarged.',[['Radial order','Gate → blocking layer → storage film']]),
 part('trap','Charge-storage film','Nonvolatile state',[6.6,28,3],[8,7,9],'Stored charge changes the cell threshold. TLC distinguishes eight threshold states; displayed colors and particle counts are explanatory rather than a literal electron population.',[['States','8 ordered thresholds'],['Storage','Charge trap film']]),
 part('tunnel','Tunnel insulation','Channel-side barrier',[6.55,28,3],[-8,7,9],'A thin insulating barrier separates the channel from stored charge. Program and erase change stored state through a field-driven process; the animated route is only an explanation.',[['Radial order','Storage film → tunnel layer → channel']]),
 part('channels','Silicon channels','Vertical conduction',[6.4,28,3],[-15,5,5],'Vertical silicon channels pass through the gate stack. The front four strings are cut in half to expose the concentric cell layers. Channel count, diameter and thickness here are illustrative.',[['Displayed strings','4 whole + 4 cut away'],['Geometry','Magnified representative section']]),
 part('sgs','Source select gate','Source-side selection',[0,51.2,0],[0,15,0],'A representative source select gate joins the channel stack to the source side. Select gates are not included in the 218 memory-word-line count.',[['Role','Source-side switching']]),
 part('source','Common source','Shared upper contact',[0,52.2,0],[0,22,0],'The common source closes the top of this bonded-array section. This model uses the conventional BiCS8 architecture; no later experimental Schottky source is claimed.',[['Orientation','Array flipped above CBA interface']]),
 part('stairs','Word-line contacts','Stepped access',[12,28,0],[20,7,-6],'The stepped gate edges expose contacts. Eight visible plugs illustrate access to selected levels; the undisclosed full routing and staircase pitch are representative.',[['Displayed contact plugs','8 illustrative examples']])
];
function gateGeometry(height){
 const s=new T.Shape();s.moveTo(-9,-3);s.lineTo(-9,5);s.lineTo(9,5);s.lineTo(9,-3);
 for(const x of [6,2,-2,-6]){s.lineTo(x+.75,-3);s.absarc(x,-3,.75,0,Math.PI,false);}s.lineTo(-9,-3);s.closePath();
 for(const x of[-6,-2,2,6]){const h=new T.Path();h.absarc(x,3,.75,0,Math.PI*2,true);s.holes.push(h);}
 return new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:8}).rotateX(-Math.PI/2);
}
function band(parent,outer,inner,bottom,height,x,z,mat,cut){
 const points=[new T.Vector2(inner,-height/2),new T.Vector2(outer,-height/2),new T.Vector2(outer,height/2),new T.Vector2(inner,height/2),new T.Vector2(inner,-height/2)];
 const geo=new T.LatheGeometry(points,cut?20:40,cut?Math.PI/2:0,cut?Math.PI:Math.PI*2);mesh(geo,mat,parent,[x,bottom+height/2,z]);
 if(cut)for(const side of[-1,1])box(parent,outer-inner,height,.008,[x+side*(outer+inner)/2,bottom+height/2,z],mat,0);
}
export function buildNAND(){
 const{root,groups:g}=makeAssembly(NAND_PARTS),m=palette(),gate=material('#a5b2b2',.78,.3),oxide=material('#6c7888',.05,.56),blocking=material('#61978f',.18,.46),trap=material('#ae8196',.15,.48),tunnel=material('#9dbbb6',.04,.6),silicon=material('#596577',.62,.33),copper=material('#bc805b',.85,.28);
 box(g.cmos,36,1.2,18,[3,.6,-.5],m.silicon,.13);dieRegions(g.cmos,32,14,[3,1.22,-.5],{columns:8,rows:6,color:'#929271'});
 for(let row=0;row<5;row++)for(let col=0;col<8;col++){const x=-12+col*4.2,z=-6+row*2.8;for(let i=0;i<7;i++)box(g.cmos,2.6,.012,.08,[x,1.242,z+i*.19],m.gold,0);}
 textDecal(g.cmos,'BiCS8 · magnified section',27,1.2,[3,1.255,7.4],{size:55,color:'#c5bca1'});
 for(let level=0;level<3;level++){
  const y=1.6+level*.45;
  for(let row=0;row<9;row++)rod(g.lowerwiring,[-12,y,-6+row*1.4],[16,y,-6+row*1.4],.045,copper,6);
  for(let col=0;col<9;col++)rod(g.lowerwiring,[-11+col*3.2,y+.13,-6.5],[-11+col*3.2,y+.13,5.5],.035,m.nickel,6);
 }
 box(g.bond,30,.13,12,[2,3.5,-1],oxide,0);for(let row=0;row<12;row++)for(let col=0;col<24;col++)cylinder(g.bond,.11,.12,[-12+col*1.2,3.625,-6+row*.9],copper,10);
 for(let i=0;i<strings;i++){const[x,z]=centers[i];rod(g.bitlines,[x,3.7,z],[x,6,z],.28,copper,16);rod(g.bitlines,[x,4.25,z],[x,4.25,-6.5],.14,copper,12);wire(g.bitlines,[[x,4.25,-6.5],[x+.6,4.25,-7.4],[x+.6,3.7,-7.4]],.1,copper);}
 // Each row receives a separate select strip; the slit lies between live rows.
 for(const z of[-3,3])plate(g.sgd,18,2.6,.24,[0,6.3,z],gate,[-6,-2,2,6].map(x=>[x,0,.75]));
 const gateGeo=gateGeometry(.09),insulatorGeo=gateGeometry(.11);
 for(let i=0;i<layers;i++){
  const y=first+i*pitch;mesh(gateGeo,gate,g.wordlines,[0,y,0]);mesh(insulatorGeo,oxide,g.dielectric,[0,y+.09,0]);
  const length=.35+(layers-1-i)*.035;
  box(g.wordlines,length,.09,7,[9+length/2,y+.045,-.5],gate,0);box(g.dielectric,length,.11,7,[9+length/2,y+.145,-.5],oxide,0);
 }
 const bottom=6.05,height=45.45;
 for(let i=0;i<strings;i++){
  const[x,z]=centers[i],cut=i>=4;
  band(g.blocking,.75,.66,bottom,height,x,z,blocking,cut);band(g.trap,.66,.58,bottom,height,x,z,trap,cut);band(g.tunnel,.58,.5,bottom,height,x,z,tunnel,cut);band(g.channels,.5,.28,bottom,height,x,z,silicon,cut);
 }
 plate(g.sgs,18,10,.24,[0,51.55,-1],gate,centers.map(([x,z])=>[x,z+1,.75]));
 plate(g.source,18,10,.45,[0,52.2,-1],copper);for(const[x,z]of centers)cylinder(g.source,.5,.6,[x,51.8,z],silicon,24);
 for(let i=0;i<8;i++){const index=i*31,y=first+index*pitch,length=.35+(layers-1-index)*.035,x=9+length-.17;rod(g.stairs,[x,y+.09,0],[x,53.25,0],.075,copper,12);rod(g.stairs,[x,53.25,0],[x,53.25,-7],.075,copper,12);rod(g.stairs,[x,53.25,-7],[x,3.7,-7],.075,copper,12);}
 const effects=new T.Group();effects.userData.dynamic=true;effects.userData.explanatoryEffect=true;root.add(effects);
 const highlight=mesh(gateGeometry(.09),new T.MeshBasicMaterial({color:'#eebd78',transparent:true,opacity:.74,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),effects);highlight.renderOrder=2;
 const circle=mesh(new T.TorusGeometry(.615,.04,8,40),new T.MeshBasicMaterial({color:'#efb17c'}),effects);circle.rotation.x=-Math.PI/2;
 const particles=Array.from({length:7},()=>mesh(new T.SphereGeometry(.11,10,8),new T.MeshBasicMaterial({color:'#eab980'}),effects));
 root.userData={device:'nand',reference:{generation:8,wordLines:218,capacityBits:'1 Tb',bitsPerCell:3,displayedStrings:8,revision:'VLSI/IEDM 2023 · 2024-03-28 manufacturer overview'},construction:'Magnified representative CBA array section · not to scale'};
 const model=finishAssembly(root,g,NAND_PARTS);let mode=0,wordline=109,string=6,target=5,reference=3,time=0,completed=false,status='Ready';const memory=new Uint8Array(layers*strings);
 function threshold(){return memory[wordline*strings+string];}
 function conducting(){return threshold()<=reference;}
 function apply(active=false,assembled=true,selected=null,reduced=false){
  effects.visible=active&&assembled&&!selected;
  const y=first+wordline*pitch;highlight.position.set(0,y,0);const[x,z]=centers[string];circle.position.set(x,y+.045,z);
  circle.material.color.setHSL(.12+(threshold()/7)*.7,.5,.62);
  const phase=Math.min(1,time/2.4);particles.forEach((dot,i)=>{
   const p=reduced?.5:((phase+i/particles.length)%1);dot.visible=mode!==0||conducting();
   dot.material.color.set(mode===2?'#79cbb3':'#eab980');
   if(mode===0)dot.position.set(x,52-p*46,z);
   else if(mode===1){const approach=Math.min(1,p/.75);dot.position.set(x+(p>.75?(p-.75)/.25*.615:0),6+approach*(y-6),z);}
   else dot.position.set(x,52-p*(52-y),z);
  });
 }
 model.behavior={setControl(id,value){if(!Number.isFinite(value))return;const v=Math.round(value);if(id==='mode')mode=T.MathUtils.clamp(v,0,2);if(id==='wordline')wordline=T.MathUtils.clamp(v,0,217);if(id==='string')string=T.MathUtils.clamp(v,0,7);if(id==='target')target=T.MathUtils.clamp(v,0,7);if(id==='reference')reference=T.MathUtils.clamp(v,0,7);time=0;completed=false;status='Ready';apply();},
  update(state,{assembled,reduced,playing,selected,dt=0}){
   if(assembled&&playing&&!reduced&&!completed){time=Math.min(2.4,time+dt);status=mode===0?'Sensing':mode===1?'Program pulse':'Block erase';if(time>=2.4-1e-8){completed=true;if(mode===1){const old=Array.from(memory.slice(wordline*strings,(wordline+1)*strings));if(old.some(v=>v>target))status='Erase required';else{memory.fill(target,wordline*strings,(wordline+1)*strings);status='Page programmed';}}else if(mode===2){memory.fill(0);status='Block erased';}else status='Read complete';}}
   apply(playing||state.power>.01,assembled,selected,reduced);
  },reset(){mode=0;wordline=109;string=6;target=5;reference=3;time=0;completed=false;status='Ready';memory.fill(0);apply();},
  getReadouts(){return[{label:'Operation',value:status},{label:'Selected cell',value:`WL ${wordline} · string ${string}`},{label:'Stored threshold',value:threshold(),unit:'of 7 · relative'},{label:'Read comparison',value:conducting()?'Conducting':'Blocked'},{label:'Program / erase scope',value:'8-cell sample page / 218 × 8 sample block'},{label:'Scale',value:'Magnified cutaway · not to scale'}];},
  getWaveform(){const level=threshold()/7;return{label:'Illustrative threshold comparison',samples:Array.from({length:64},(_,i)=>(i<32?level:reference/7)*1.5-.75),caption:'Stored threshold first · read reference second · relative values, not volts'};}
 };model.behavior.reset();return model;
}
export const NAND_BOARD=definition({id:'nand',tab:'BiCS8 3D NAND',category:'chips',parts:NAND_PARTS,build:buildNAND,dimensions:'218 word lines · magnified section, not to scale',half:67,target:[3,35,-1],assembledHalf:45,assembledTarget:[3,26,-1],minHalfWidth:37,explodedMinHalfWidth:62,camera:[65,76,95],floorY:-.7,groundRadius:28,start:0,model:'Kioxia BiCS FLASH generation 8 / 1 Tb TLC',description:'Vertical channels intersect 218 gate layers above a directly bonded control wafer.',basis:'Documented CBA architecture · magnified representative cutaway',operationNote:'Program, read and block erase · illustrative threshold states and timing',sources:[['Kioxia · generation 8, 28 March 2024',generation],['Kioxia · cell structure','https://www.kioxia.com/en-jp/rd/technology/bics-flash.html'],['Kioxia · NAND operating principles','https://www.kioxia.com/en-jp/rd/technology/topics/topics-88.html']],controls:[{id:'mode',label:'Operation',min:0,max:2,step:1,value:0,format:v=>['Read','Program page','Erase block'][v]},{id:'wordline',label:'Word line',min:0,max:217,step:1,value:109},{id:'string',label:'Sample string',min:0,max:7,step:1,value:6},{id:'target',label:'Program threshold',min:0,max:7,step:1,value:5},{id:'reference',label:'Read reference',min:0,max:7,step:1,value:3}],accuracy:'Locked to the 1 Tb TLC BiCS FLASH generation 8 described by Kioxia on 28 March 2024 and in the cited 2023 VLSI/IEDM work. The 218 word lines, three bits per cell, directly bonded CMOS/array architecture and OPS selection principle are documented. This is an enlarged eight-string section, not a retail package or a complete die. All sizes, layer thicknesses, staircase geometry, routing, displayed contact count and CMOS floorplan are representative; no actual device millimetres or production pinout is asserted. Two fabrication wafers are bonded; the 218 memory levels are not 218 stacked dies. The radial layer order follows the manufacturer cell diagram. The later source explaining general operation is used only for that principle, not to attribute its experimental Schottky-source or 96-layer device to BiCS8. Visual separation is diagrammatic. The synthetic page has eight cells and the block has 218 such pages. Programming only raises the ordered threshold state; lowering it requires a block erase. The eight thresholds, comparison result, particles and 2.4-second sequence are explanatory, not actual voltages, pulse programming, charge counts, TLC bit coding or measured performance. Physical silicon stays stationary during operation.',hidden:[]});
