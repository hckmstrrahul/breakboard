import {T,mesh,box,material,textDecal,makeAssembly,finishAssembly,part,definition,palette,wire,cylinder,ring} from './module-kit.js';

const datasheet='https://www.st.com/resource/en/datasheet/cd00004936.pdf';
const pinNames=['VPP','A12','A7','A6','A5','A4','A3','A2','A1','A0','Q0','Q1','Q2','VSS','Q3','Q4','Q5','Q6','Q7','/E','A10','/G','A11','A9','A8','A13','A14','VCC'];
const hex=(n,digits=2)=>'0x'+Math.round(n).toString(16).toUpperCase().padStart(digits,'0');
export const EPROM_PARTS=[
 part('base','Ceramic base','Frit-sealed package',[4,.7,12],[0,0,0],'The FDIP28W package encloses a UV-erasable memory die. The published outline constrains the exterior; the recessed cavity, ceramic grain and internal layer thicknesses are representative.',[['Body','36.92 × 13.21 mm · within drawing limits'],['Package','FDIP28WB · 28 pins']]),
 part('leads','28 formed leads','Parallel memory interface',[7.8,-1,12],[0,0,5],'Fifteen address pins select one of 32,768 bytes. Eight data pins carry a byte; the remaining pins provide power, programming voltage and enable signals. Pin numbering follows the top-view drawing.',[['Lead pitch','2.54 mm'],['Address / data','15 / 8 pins'],['Pin 1','VPP · notched end']]),
 part('fanout','Internal lead fingers','Connections to the die',[4.7,1.2,8],[0,3,0],'Representative metal fingers join the external leads to wire-bond sites. Their routes are not a disclosed production leadframe.',[['Geometry','Representative internal routing']]),
 part('die','Memory die','32K × 8 storage',[0,1.54,0],[6,6,2],'One silicon die stores 256 Kbit. Its eight illustrated banks, decoder stripe and conductor pattern are a functional diagram, not a recovered M27W256 mask layout.',[['Capacity','32,768 bytes · 256 Kbit'],['Geometry','Representative die and functional regions']]),
 part('bonds','Bond wires','Die-to-package interconnect',[3,2.2,4],[7,10,2],'Twenty-eight fine wire loops explain the connection from package leads to die pads. The exact bond material, count and pad positions are representative, while external pin roles follow the datasheet.',[['Geometry','Representative wire loops'],['Connections','External pin roles retained']]),
 part('seal','Frit seal','Ceramic joint',[5.7,3.3,8],[-4,13,-2],'The ceramic halves use a frit seal. Its gray seam and wall construction are representative because no sectioned production specimen is published in the source.',[['Package','Window ceramic frit-seal']]),
 part('lid','Windowed ceramic lid','Protective enclosure',[4.5,4,9],[-6,19,-4],'A circular opening admits UV to the memory die. The opening follows the published 7.11 mm nominal window; printed identification is representative.',[['Window diameter','7.11 mm nominal'],['Body height','4.24 mm · within drawing limits']]),
 part('window','UV window','Optical erase path',[0,4.1,0],[-6,25,-4],'The transparent window lets ultraviolet light erase the entire memory array. Read and programming use the electrical pins; UV erasure is not a byte-selective electrical command.',[['Erase wavelength','253.7 nm recommended'],['Erase scope','Whole chip'],['Window material','Not specified by the cited datasheet']])
];

function ceramicTexture(){
 const size=128,data=new Uint8Array(size*size*4);let seed=31;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){seed=(seed*1664525+1013904223)>>>0;const i=(y*size+x)*4,grain=(seed>>>27)*.25,cloud=5*Math.sin(x*.13+Math.sin(y*.05)*2)*Math.cos(y*.09);data[i]=222+cloud-grain;data[i+1]=222+cloud-grain;data[i+2]=217+cloud-grain;data[i+3]=255;}
 const texture=new T.DataTexture(data,size,size);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(.1,.1);texture.needsUpdate=true;return texture;
}
function outline(){
 const x=13.21/2,z=36.92/2,r=.3,s=new T.Shape();
 s.moveTo(-x+r,-z);s.lineTo(-1.8,-z);s.absarc(0,-z,1.8,Math.PI,0,true);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);s.closePath();return s;
}
function slab(parent,y,thickness,mat,hole){
 const shape=outline();if(hole==='window'){const p=new T.Path();p.absarc(0,0,3.555,0,Math.PI*2,true);shape.holes.push(p);}else if(hole==='cavity'){const p=new T.Path();p.moveTo(-5.2,-15.7);p.lineTo(-5.2,15.7);p.lineTo(5.2,15.7);p.lineTo(5.2,-15.7);p.closePath();shape.holes.push(p);}
 const geo=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:24}).rotateX(-Math.PI/2).rotateY(Math.PI);return mesh(geo,mat,parent,[0,y,0]);
}
export function buildEPROM(){
 const{root,groups:g}=makeAssembly(EPROM_PARTS),m=palette(),ceramic=material('#dadad4',.03,.73),frit=material('#8b8d85',.05,.64),lead=material('#babbb6',.8,.28);ceramic.roughnessMap=ceramicTexture();
 slab(g.base,0,1.1,ceramic);slab(g.base,1.1,2.12,ceramic,'cavity');slab(g.seal,3.22,.08,frit,'cavity');slab(g.lid,3.3,.94,ceramic,'window');
 const window=mesh(new T.CylinderGeometry(3.53,3.53,.34,96),new T.MeshPhysicalMaterial({color:'#c1d6db',metalness:0,roughness:.03,transparent:true,opacity:.2,depthWrite:false,side:T.DoubleSide}),g.window,[0,4.03,0]);window.userData.anatomyTransparent=true;
 ring(g.window,3.555,3.53,.08,[0,4.14,0],frit,96);
 const padCenters=[],paths=[];
 for(let side=0;side<2;side++)for(let i=0;i<14;i++){
  const sign=side?1:-1,z=-16.51+i*2.54,pin=side?28-i:i+1;
  const shoulder=box(g.leads,1.05,.27,1.45,[sign*7.07,1.45,z],lead,.035);
  const neck=box(g.leads,.27,.7,1.45,[sign*7.62,1.1,z],lead,.025);
  const leg=box(g.leads,.27,4.18,.485,[sign*7.95,-1.28,z],lead,.025);leg.rotation.z=sign*.14;
  shoulder.userData.pin=neck.userData.pin=leg.userData.pin=pin;
  box(g.fanout,1.5,.12,.7,[sign*5.9,1.2,z],m.gold,.015);
  const dieZ=(i-6.5)*.38,diePad=[sign*2.18,1.56,dieZ],finger=[sign*5.1,1.26,z*.92];
  wire(g.fanout,[[sign*5.9,1.2,z],[sign*5.1,1.2,z*.92]],.065,m.gold);
  box(g.die,.16,.02,.19,diePad,m.gold,.01);padCenters.push({pin,name:pinNames[pin-1],point:diePad});
  // Each side fans monotonically from tightly spaced pads to package pitch.
  const points=[diePad,[sign*2.8,2.35,dieZ*.8+z*.2],[sign*4.35,2.12,z*.8+dieZ*.2],finger];wire(g.bonds,points,.021,m.gold);paths[pin-1]=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 }
 box(g.die,4.7,.1,5.75,[0,1.15,0],m.gold,.025);box(g.die,4.7,.32,5.75,[0,1.36,0],m.silicon,.025);
 const bank=material('#687f88',.65,.32),line=material('#c4a46b',.7,.3);
 for(let row=0;row<4;row++)for(let col=0;col<2;col++){
  const x=col?1:-1,z=(row-1.5)*1.17;box(g.die,1.55,.035,1.03,[x,1.54,z],bank,0);
  for(let j=0;j<18;j++)box(g.die,.009,.008,.92,[x-.68+j*.08,1.563,z],line,0);
  for(let j=0;j<12;j++)box(g.die,1.42,.006,.006,[x,1.569,z-.45+j*.08],m.nickel,0);
 }
 box(g.die,.25,.035,4.8,[0,1.54,0],m.gold,0);for(let i=0;i<32;i++)box(g.die,.17,.008,.03,[0,1.564,-2.3+i*.147],m.black,0);
 textDecal(g.lid,'ST',4.2,3.5,[0,4.255,-12.7],{size:160,color:'#565952'});
 textDecal(g.lid,'M27W256',10,4,[0,4.255,-9.5],{size:105,color:'#565952'});
 textDecal(g.lid,'-80F6',7,3.2,[0,4.255,8.8],{size:105,color:'#565952'});
 textDecal(g.lid,'UV EPROM',8,2.8,[0,4.255,11.5],{size:85,color:'#72756d'});
 cylinder(g.lid,.4,.012,[-4.7,4.253,-14.3],m.black,32);
 const effect=new T.Group();effect.userData.dynamic=true;effect.userData.explanatoryEffect=true;root.add(effect);
 const particles=Array.from({length:8},()=>mesh(new T.SphereGeometry(.09,10,8),new T.MeshBasicMaterial({color:'#e1a375',toneMapped:false}),effect));
 const bitLights=Array.from({length:8},(_,i)=>box(effect,.21,.035,.21,[(i%2?1:-1),1.61,(Math.floor(i/2)-1.5)*1.17],new T.MeshBasicMaterial({color:'#dcb87e',transparent:true,opacity:.8,depthWrite:false}),0));
 const uv=mesh(new T.CylinderGeometry(3.4,2.7,9,48,1,true),new T.MeshBasicMaterial({color:'#9f86d5',transparent:true,opacity:.07,depthWrite:false,side:T.DoubleSide}),effect,[0,8.8,0]);uv.castShadow=false;
 root.userData={device:'eprom',reference:{part:'M27W256-80F6',datasheet:'April 2006 Rev 3',package:'FDIP28WB',pins:28,pitch:2.54,windowDiameter:7.11,capacityBytes:32768},pinout:padCenters.sort((a,b)=>a.pin-b.pin)};
 const model=finishAssembly(root,g,EPROM_PARTS);let mode=0,address=0,data=165,time=0,done=false,status='Ready';const memory=new Uint8Array(32768);memory.fill(255);
 function apply(active=false,assembled=true,selected=null,reduced=false){
  effect.visible=active&&assembled&&!selected;uv.visible=mode===2;
  const value=memory[address];bitLights.forEach((o,i)=>{o.material.color.set(value&(1<<i)?'#dfb96c':'#63798a');});
  particles.forEach((o,i)=>{const p=reduced?.5:(time/2+i/8)%1;if(mode===2){const a=i*Math.PI/4;o.position.set(Math.cos(a)*1.9,12-p*10.45,Math.sin(a)*1.9);o.material.color.set('#b79be7');}else{const pin=[11,12,13,15,16,17,18,19][i];o.position.copy(paths[pin-1].getPoint(mode===1?1-p:p));o.material.color.set('#e1a375');}});
 }
 model.behavior={
  setControl(id,value){if(!Number.isFinite(value))return;const v=Math.round(value);if(id==='mode')mode=T.MathUtils.clamp(v,0,2);if(id==='address')address=T.MathUtils.clamp(v,0,32767);if(id==='data')data=T.MathUtils.clamp(v,0,255);time=0;done=false;status='Ready';apply();},
  update(state,{assembled,reduced,playing,selected,dt=0}){if(assembled&&playing&&!reduced&&!done){time=Math.min(2,time+dt);status=mode===0?'Reading':mode===1?'Programming':'UV exposure';if(time>=2-1e-8){done=true;if(mode===1){const impossible=(data&~memory[address])!==0;memory[address]&=data;status=impossible?'Erase required':'Programmed';}else if(mode===2){memory.fill(255);status='Erased';}else status='Read complete';}}apply(playing||state.power>.01,assembled,selected,reduced);},
  reset(){mode=0;address=0;data=165;time=0;done=false;status='Ready';memory.fill(255);apply();},
  getReadouts(){return[{label:'Operation',value:status},{label:'Stored byte',value:hex(memory[address])},{label:'Binary output',value:memory[address].toString(2).padStart(8,'0')},{label:'Address',value:hex(address,4)},{label:'Programming byte',value:hex(data)},{label:'Timing',value:'Illustrative 2 s sequence'}];}
 };model.behavior.reset();return model;
}
export const EPROM_BOARD=definition({id:'eprom',tab:'Windowed EPROM',category:'chips',parts:EPROM_PARTS,build:buildEPROM,dimensions:'36.92 × 13.21 × 4.24 mm ceramic body',half:31,target:[0,9,0],assembledHalf:23,assembledTarget:[0,1,0],minHalfWidth:21,explodedMinHalfWidth:28,camera:[40,55,57],floorY:-3.7,groundRadius:22,start:0,model:'ST M27W256-80F6 / FDIP28W / Rev 3',description:'A window exposes the memory die to ultraviolet light, clearing every stored byte.',basis:'Documented ceramic package · representative die and bonding',operationNote:'Read, program and UV erase · illustrative timing',controls:[{id:'mode',label:'Operation',min:0,max:2,step:1,value:0,format:v=>['Read','Program','UV erase'][v]},{id:'address',label:'Address',min:0,max:32767,step:1,value:0,format:v=>hex(v,4)},{id:'data',label:'Write byte',min:0,max:255,step:1,value:165,format:v=>hex(v)}],sources:[['ST · M27W256 datasheet, April 2006 Rev 3',datasheet],['Frohman-Bentchkowsky · floating-gate principle, US3660819A','https://patents.google.com/patent/US3660819A/en']],accuracy:'Locked to the M27W256-80F6 windowed ceramic ordering configuration in ST datasheet April 2006 Rev 3, not the opaque OTP packages. External body dimensions use midpoints within the documented ranges; the 28 leads, 2.54 mm pitch, nominal 7.11 mm window, pin roles and 32K × 8 organization are documented. The notch, bent leads and window follow the package drawing. Hidden cavity, die size, eight visible banks, circuit markings, wire count/material and all internal routing are representative, not published mask or bond maps. The historical patent supports only the isolated charge-storage and optical-erasure principle; its PMOS structure, voltages and dimensions are not attributed to this later CMOS part. The simulator holds all 32,768 bytes. Programming changes only 1 bits to 0 at one address; a request needing 0-to-1 reports Erase required. UV erase restores the entire array to 0xFF. Reset clears the demo. Readout voltages, PRESTO II retries, 100 µs pulse timing, retention and physical UV-dose dependence are not simulated. The two-second animated sequence and optical particles are explanatory; the actual recommended erase wavelength is 253.7 nm with at least 15 W·s/cm² integrated dose, not a two-second erase. Silicon stays stationary. The UV beam and colored bit markers are explanatory overlays; the displayed pattern is not a measured die image.',hidden:[]});
