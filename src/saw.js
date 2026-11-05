import {T,TAU,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,palette,wire,cylinder} from './module-kit.js';
const sheet='https://www.mouser.com/datasheet/2/281/sf2124e-1359164.pdf';
const principle='https://corporate.murata.com/en-us/technology/technology-applications/saw';
const manual='https://dicasdozebio.com/wp-content/uploads/2022/03/murata-pztapplicationmanuala.pdf';
const FC=2441.8;
export const SAW_PARTS=[
 part('ceramic','Alumina package','SM3030-6 ceramic',[1.3,.5,1.1],[0,0,0],'The documented alumina case encloses the acoustic die. Its exterior and terminal recesses follow the package drawing; the cavity and internal wall thickness are representative.',[['Envelope','3 × 3 × 1.25 mm nominal'],['Material','Al₂O₃ ceramic']]),
 part('terminals','Six plated terminals','RF input, output and ground',[-1.2,.01,.9],[0,-.3,0],'Pin 2 is the input and pin 5 is the output in the illustrated orientation. Pins 1, 3, 4 and 6 are grounded. The larger pin-1 land and asymmetric bottom pattern follow the drawing.',[['Signal ports','2 input · 5 output'],['Impedance','50 Ω nominal'],['Finish','Gold over nickel']]),
 part('substrate','Piezoelectric substrate','Representative acoustic die',[0,.47,0],[0,.75,0],'A piezoelectric surface carries the acoustic wave between electrodes. This die size, crystal material and cut are not disclosed for SF2124E; the drawn slab is representative.',[['Geometry','Representative die dimensions'],['Crystal material','Not specified in the selected datasheet']]),
 part('input','Input transducer','Interleaved electrodes',[-.48,.55,0],[-.55,1.65,0],'Alternating electrode fingers convert an electrical input into a surface wave. This enlarged comb illustrates Murata’s published general operating principle, not the proprietary SF2124E electrode layout.',[['Role','Electrical → acoustic'],['Geometry','Representative, enlarged finger pitch']]),
 part('output','Output transducer','Interleaved electrodes',[.48,.55,0],[.55,1.65,0],'The second transducer converts the arriving acoustic motion back to voltage. Frequency-selective coupling is illustrated; exact electrode count, metallization and topology are undisclosed.',[['Role','Acoustic → electrical'],['Geometry','Representative, enlarged finger pitch']]),
 part('absorbers','Edge absorbers','Representative boundary treatment',[0,.56,.57],[0,2.2,.8],'Absorbing regions at the edges illustrate the transversal-filter construction in Murata’s application manual. Their presence and material in the selected SF2124E are unverified.',[['Basis','General Murata SAW construction diagram']]),
 part('bonds','Bond wires and fanout','Representative interconnect',[-.9,.68,-.4],[-.65,2.7,-.4],'The connection diagram preserves the published terminal roles. Internal bond count, material and routes are a reconstruction, not a disclosed assembly drawing.',[['Geometry','Representative bonds and fanout']]),
 part('seal','Lid seal','Hermetic joint',[1.25,.92,1],[0,3.3,0],'A narrow metallic seam separates the ceramic body and metal lid. Its internal sealing stack is representative.',[['Construction','Representative seam']]),
 part('lid','Nickel-plated lid','Package cover',[0,1.25,0],[0,4.1,-.3],'The metal lid carries the documented 646 identifier and pin-1 dot. Date/shift placeholders are retained rather than inventing a serialised specimen.',[['Lid finish','2–3 µm nickel'],['Marking','646 · YWWS']])
];
function outline(w=3,d=3,notches=true){
 const x=w/2,z=d/2,r=.08,n=.13,s=new T.Shape();s.moveTo(-x+r,-z);
 if(notches){s.lineTo(-n,-z);s.absarc(0,-z,n,Math.PI,0,true);}s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);
 if(notches){s.lineTo(x,-n);s.absarc(x,0,n,-Math.PI/2,-Math.PI*1.5,true);}s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);
 if(notches){s.lineTo(n,z);s.absarc(0,z,n,0,-Math.PI,true);}s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);
 if(notches){s.lineTo(-x,n);s.absarc(-x,0,n,Math.PI/2,-Math.PI/2,true);}s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);s.closePath();return s;
}
function slab(parent,shape,y,h,mat){const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:20}).rotateX(-Math.PI/2);return mesh(geo,mat,parent,[0,y,0]);}
function hole(shape,w,d){const p=new T.Path();p.moveTo(-w/2,-d/2);p.lineTo(-w/2,d/2);p.lineTo(w/2,d/2);p.lineTo(w/2,-d/2);p.closePath();shape.holes.push(p);return shape;}
function terminalShape(side,z,width){
 const x=side<0?-1.5:1.5-width,s=new T.Shape();s.moveTo(x,z-.3);s.lineTo(x+width,z-.3);s.lineTo(x+width,z+.3);s.lineTo(x,z+.3);s.closePath();
 // The circular edge recess is an open notch, not a drawn dark dot.
 if(z===0){s.holes=[];const n=.13;s.curves=[];s.moveTo(x,z-.3);s.lineTo(x+width,z-.3);if(side>0){s.lineTo(1.5,-n);s.absarc(1.5,0,n,-Math.PI/2,-Math.PI*1.5,true);}s.lineTo(x+width,z+.3);s.lineTo(x,z+.3);if(side<0){s.lineTo(-1.5,n);s.absarc(-1.5,0,n,Math.PI/2,-Math.PI/2,true);}s.closePath();}
 return s;
}
export function buildSAW(){
 const {root,groups:g}=makeAssembly(SAW_PARTS),m=palette(),ceramic=material('#e1ded1',.03,.65),nickel=material('#aeb6bb',.88,.25),aluminium=material('#d7c9a4',.78,.31),piezo=material('#717b92',.48,.3);
 slab(g.ceramic,outline(),.025,.225,ceramic);slab(g.ceramic,hole(outline(),2.35,2.15),.25,.65,ceramic);
 const pins=[];for(let side of[-1,1])for(let i=0;i<3;i++){const pin=side<0?i+1:6-i,z=(i-1)*1.1,w=pin===1?1.5:.85;const o=slab(g.terminals,terminalShape(side,-z,w),0,.025,m.gold);o.userData.pin=pin;pins.push({pin,role:pin===2?'Input':pin===5?'Output':'Ground',center:[side*(1.5-w/2),0,z]});}
 // Metal wraps on each pad's outer edge; gaps between contacts remain ceramic.
 for(const p of pins){const x=Math.sign(p.center[0])*1.502,z=p.center[2];if(z===0){for(const sign of[-1,1])box(g.terminals,.006,.9,.14,[x,.45,sign*.23],m.gold,0);}else box(g.terminals,.006,.9,.6,[x,.45,z],m.gold,0);}
 box(g.substrate,1.82,.06,1.48,[0,.28,0],m.gold,.025);box(g.substrate,1.8,.17,1.46,[0,.395,0],piezo,.025);
 const electrodeY=.486,centers=[-.48,.48];
 for(let k=0;k<2;k++){const group=g[k?'output':'input'],cx=centers[k];for(const z of[-.48,.48])box(group,.58,.012,.07,[cx,electrodeY,z],aluminium,0);
  for(let j=0;j<40;j++){const x=cx-.273+j*.014,sign=j%2?1:-1;box(group,.006,.012,.85,[x,electrodeY,sign*.035],aluminium,0);}
  for(const sign of[-1,1])box(group,.16,.013,.13,[cx,electrodeY,sign*.56],m.gold,.01);
 }
 for(const z of[-.68,.68])box(g.absorbers,1.68,.025,.075,[0,.493,z],m.black,0);
 const routes=[[-1.08,0,-.48,.59],[1.08,0,.48,.59],[-1.08,-.9,-.48,-.59],[1.08,-.9,.48,-.59]];
 for(const[x,z,dx,dz]of routes){box(g.bonds,.13,.025,.18,[x,.72,z],m.gold,.01);wire(g.bonds,[[x,.73,z],[x*.8,.82,z*.7+dz*.3],[dx,.7,dz],[dx,.495,dz]],.012,m.gold);wire(g.bonds,[[x,.71,z],[x*1.1,.62,z],[Math.sign(x)*(z===0?1.27:1.45),.1,z]],.018,m.gold);}
 slab(g.seal,hole(outline(2.9,2.9,false),2.35,2.15),.9,.04,nickel);slab(g.lid,outline(2.8,2.8,false),.94,.31,nickel);
 const lidText=textDecal(g.lid,'646',1.55,.85,[0,1.254,-.25],{size:180,color:'#3d4648'});lidText.material.userData.playbackOpacity=0;
 const date=textDecal(g.lid,'YWWS',1.9,.6,[0,1.254,.47],{size:130,color:'#3d4648'});date.material.userData.playbackOpacity=0;cylinder(g.lid,.085,.005,[-1.05,1.253,-1.05],m.black,32);
 const overlay=new T.Group();overlay.userData.explanatoryEffect=true;overlay.userData.dynamic=true;root.add(overlay);
 const waves=[];for(let row=0;row<9;row++){const points=new Float32Array(129*3),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(points,3));const line=new T.Line(geo,new T.LineBasicMaterial({color:row%2?'#d6a36d':'#9cb6ca',transparent:true,opacity:.7,depthWrite:false}));overlay.add(line);waves.push(line);}
 const output=mesh(new T.SphereGeometry(.055,12,8),new T.MeshBasicMaterial({color:'#d7af77',toneMapped:false}),overlay,[.8,.6,0]);
 root.userData={device:'saw',effects:{cutaway:['lid','seal']},reference:{part:'Murata SF2124E',revision:'8/29/19',case:'SM3030-6',dimensions:[3,1.25,3],centerMHz:FC,pins:pins.sort((a,b)=>a.pin-b.pin)},construction:'Documented exterior; representative transversal SAW interior, enlarged electrodes and wave displacement'};
 const model=finishAssembly(root,g,SAW_PARTS);let frequency=FC,level=.7,sweep=0,time=0,last={assembled:true,playing:false,reduced:false,selected:null};
 const current=()=>sweep?2450+250*Math.sin(time*TAU/8):frequency;
 const loss=()=>Math.min(60,2.1+10*Math.log10(1+((current()-FC)/55)**8));
 const gain=()=>10**(-loss()/20);
 function apply(){overlay.visible=last.assembled&&last.playing&&!last.selected&&!last.isolate;const phase=last.reduced?0:time*TAU*1.2,f=current()/FC;
  waves.forEach((line,row)=>{const pos=line.geometry.attributes.position;for(let i=0;i<129;i++){const x=-.78+i/128*1.56,attenuation=T.MathUtils.lerp(1,gain(),i/128);pos.setXYZ(i,x,.54+.055*level*attenuation*Math.sin((x+.78)*TAU*7*f-phase),-.38+row*.095);}pos.needsUpdate=true;line.geometry.computeBoundingSphere();});output.scale.setScalar(.3+.7*level*gain());}
 model.behavior={setControl(id,value){if(!Number.isFinite(value))return;if(id==='frequency')frequency=T.MathUtils.clamp(value,2200,2700);if(id==='level')level=T.MathUtils.clamp(value,0,1);if(id==='sweep')sweep=Math.round(T.MathUtils.clamp(value,0,1));apply();},update(state,context){last=context;if(context.playing&&context.assembled&&!context.reduced)time+=Math.max(0,context.dt||0);apply();},reset(){frequency=FC;level=.7;sweep=0;time=0;last={assembled:true,playing:false,reduced:false,selected:null};apply();},getReadouts(){return[{label:'Frequency',value:Number(current().toFixed(1)),unit:'MHz'},{label:'Illustrative loss',value:Number(loss().toFixed(2)),unit:'dB'},{label:'Output level',value:Number((level*gain()).toFixed(3)),unit:'relative'},{label:'Geometry',value:'Representative SAW cutaway'}];},getWaveform(){return{label:'Relative output',samples:Array.from({length:96},(_,i)=>level*gain()*Math.sin(i/95*TAU*3-time*TAU*1.2)),caption:'Illustrative response · not measured S-parameters'};}};model.behavior.reset();return model;
}
export const SAW_BOARD=definition({id:'saw',tab:'SAW RF filter',category:'radio',fitShadows:true,parts:SAW_PARTS,build:buildSAW,dimensions:'3 × 3 × 1.25 mm nominal',half:4.5,assembledHalf:2.55,minHalfWidth:2.2,explodedMinHalfWidth:4.3,target:[0,2.4,0],assembledTarget:[0,.55,0],camera:[7,8,9],floorY:-.4,groundRadius:2.5,start:0,model:'Murata SF2124E / SM3030-6 / 29 August 2019',description:'Fine interleaved electrodes turn radio signals into frequency-selective surface waves.',basis:'Documented package · representative acoustic cutaway',operationNote:'Illustrative SAW response · enlarged wave displacement',controls:[{id:'frequency',label:'Frequency',min:2200,max:2700,step:.1,value:FC,unit:'MHz'},{id:'level',label:'Input level',min:0,max:1,step:.05,value:.7,unit:'relative'},{id:'sweep',label:'Sweep',min:0,max:1,step:1,value:0,format:v=>v?'Auto':'Hold'}],sources:[['Murata · SF2124E, 29 August 2019',sheet],['Murata · SAW operating principle',principle],['Murata · PZT application manual, Figure 88',manual]],accuracy:'Locked to Murata SF2124E datasheet revision 8/29/19, with the six-terminal SM3030-6 ceramic package, 2441.8 MHz center and 50 Ω ports. The model uses nominal package and pad dimensions, alumina body, nickel lid and gold-over-nickel terminals. Internal die size, crystal cut, bond map, absorber placement and two combs are representative, following the general transversal-filter principle in Murata’s PZT application manual, Figure 88. The SF2124E proprietary electrode topology and pitch are not published; the visible 40-finger combs are enlarged teaching geometry, not a decapsulation. This legacy ceramic part is not assigned the later I.H.P. SAW resin package or layered substrate. A synthetic symmetric bandpass curve is anchored to the documented 2.1 dB typical insertion loss at its center, but is not measured S-parameters or a specification prediction. No literal acoustic speed or nanometre displacement is asserted. Colored lines illustrate an enlarged surface wave; physical electrodes remain stationary. Automatic sweep is an eight-second visualization, not RF timing.',hidden:['substrate','input','output','absorbers','bonds']});
