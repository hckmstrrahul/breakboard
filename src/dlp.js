import * as T from 'three';
import {mesh,box,material,texture,decal,textDecal,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';

// TI drawing 2511543, revision E (four sheets). Actual package is at x=-24.
// A separate 600× explanatory mechanism sits at x=25; it is NOT part of the
// package geometry. The full package never substitutes 16 mirrors for its array.
const X=-24,D=25,PITCH=.00756,SCALE=600,MP=PITCH*SCALE;
const part=(id,name,kind,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind,description,anchor,offset,specs});
export const DLP_PARTS=[
 part('array','DLP6500 mirror array','2,073,600 MICROMIRRORS','The actual package contains a 1920 × 1080 array on 7.56 µm centers. At this view scale its individual mirrors are subpixel-sized, so the array is shown as a continuous reflective surface. The separate 600× detail explains a small representative patch.',[X+1.1996,1.91,.8996],[0,9,0],[['Array','1920 × 1080'],['Pitch','7.56 µm'],['Active area','14.5152 × 8.1648 mm']]),
 part('window','Optical window','S600 COVER GLASS','The protective optical window seals the micromirror cavity. Its size, thickness and offset follow TI’s package drawing. The clear glass and its black aperture coating are distinct surfaces, leaving the active array visible.',[X+.624,3.653,.2017],[0,34,0],[['Window','21.276 × 14.063 mm'],['Thickness','1.05 mm'],['Material','Corning Eagle XG']]),
 part('seal','Window seal','HERMETIC ENCLOSURE','A perimeter seal joins the window to the ceramic package. The maximum encapsulant envelope is taken from the package drawing; the exact adhesive meniscus is a simplified reconstruction.',[X-11.4,2.97,.2017],[0,21,0],[['Function','Seal the optical cavity'],['Model','Envelope reconstruction']]),
 part('package','Ceramic package','350-PIN CPGA BODY','The ceramic housing carries the optical cavity, two locating holes and a chamfered corner. Its envelope, cavity position, locating features and substrate thickness follow TI drawing 2511543.',[X-14,2.95,10.4],[0,0,0],[['Outline','35 × 32.2 mm'],['Ceramic thickness','2.95 mm'],['Package','FYE · CPGA']]),
 part('pins','350 package pins','ELECTRICAL INTERFACE','The 350 short cylindrical pins lie on a 1.27 mm grid with the omitted locations shown in TI’s mechanical drawing. They carry LVDS data, control signals, bias rails and ground.',[X-15.875,-1.4,7.62],[0,-6,0],[['Pins','350'],['Pitch','1.27 mm'],['Pin diameter','0.305 mm']]),
 part('thermal','Underside pad','THERMAL & MARKING SURFACE','The 15 × 10 mm underside metallised area is the package’s symbolisation pad. It is electrically connected to the substrate ground plane. Its position follows the package drawing.',[X,-.06,0],[0,-3,0],[['Pad','15 × 10 mm'],['Connection','VSS plane']]),
 part('mirrors','Mirrors · 600× detail','ILLUSTRATIVE MICROMIRROR PATCH','Sixteen enlarged aluminium mirrors illustrate switching between the documented −12° and +12° positions about diagonal hinges. This patch is 600× the package’s scale. Its mirror pitch is scaled exactly; support geometry is illustrative and is not a fabrication drawing.',[D+MP/2,3.65,MP/2],[0,31,0],[['Detail scale','600× package geometry'],['Patch','4 × 4 mirrors'],['Tilt','−12° / +12°']]),
 part('hinges','Hinges · 600× detail','ILLUSTRATIVE TORSION SUPPORT','Thin diagonal hinges suspend the mirrors above their electrostatic electrodes. Posts, hinge beams and spring tips explain the DMD mechanism, but their dimensions are illustrative because TI does not publish the DLP6500 fabrication stack.',[D-MP/2,2.48,-MP/2],[0,19,0],[['Mechanism','Torsion suspension'],['Geometry','Illustrative · 600× context']]),
 part('electrodes','Electrodes · 600× detail','ILLUSTRATIVE ELECTROSTATIC ACTUATION','Address electrodes beneath the mirror attract the suspended structure toward either tilt state. The geometric patch explains the mechanism rather than reproducing proprietary silicon routing.',[D+MP/2,1.5,-MP/2],[0,8,0],[['Actuation','Electrostatic'],['Geometry','Representative electrodes']]),
 part('logic','CMOS · 600× detail','ILLUSTRATIVE MEMORY PLANE','The DMD combines mechanical mirrors with CMOS memory and control circuitry below. This supporting plane identifies the relative stack order; no internal transistor layout or netlist is claimed.',[D,1.1,10],[0,0,0],[['Detail','4 × 4 representative cells'],['Scope','Mechanism illustration']])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
function rectShape(w,d){const s=new T.Shape();s.moveTo(-w/2,-d/2);s.lineTo(w/2,-d/2);s.lineTo(w/2,d/2);s.lineTo(-w/2,d/2);s.closePath();return s;}
function rectHole(s,x,z,w,d){const h=new T.Path();h.moveTo(x-w/2,-z-d/2);h.lineTo(x-w/2,-z+d/2);h.lineTo(x+w/2,-z+d/2);h.lineTo(x+w/2,-z-d/2);h.closePath();s.holes.push(h);}
function plate(parent,shape,height,x,y,z,mat){const geo=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:48});geo.rotateX(-Math.PI/2);return mesh(geo,mat,parent,[x,y,z]);}
function frame(parent,w,d,iw,id,height,x,y,z,mat){const s=rectShape(w,d);rectHole(s,0,0,iw,id);return plate(parent,s,height,x,y,z,mat);}
const ceramic=material('#312e2b',.12,.6),dark=material('#121817',.25,.5),nickel=material('#b9bcb7',.86,.27),aluminium=material('#d5dbdc',.94,.19),gold=material('#b8a16d',.7,.35);
export const DLP_PIN_ROWS=['A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','T','U','V','W','X','Y','Z','AA'];
export const DLP_OMITTED_PINS=['A1','A2','A12','A13','A14','A15','A26','B1','AA1','AA12','AA13','AA14','AA15','AA26'];
export const DLP_PINS=DLP_PIN_ROWS.flatMap((row,r)=>Array.from({length:26},(_,c)=>({name:row+(c+1),x:(c-12.5)*1.27,z:(r-11)*1.27,r,c}))).filter(p=>!(p.r>=5&&p.r<=17&&p.c>=4&&p.c<=21)&&!DLP_OMITTED_PINS.includes(p.name));
export function buildDLP(){
 const {root,groups}=makeAssembly(DLP_PARTS);
 const outline=new T.Shape();outline.moveTo(-14.5,16.1);outline.lineTo(17.5,16.1);outline.lineTo(17.5,-16.1);outline.lineTo(-17.5,-16.1);outline.lineTo(-17.5,13.1);outline.closePath();
 // Drawing shows one circular and one slotted datum bore.
 const circular=new T.Path();circular.absarc(-14.9,-13.5,3.065/2,0,Math.PI*2,true);outline.holes.push(circular);
 const slot=new T.Path();const cx=14.9,cz=13.5,r=2.565/2;slot.absarc(cx-.2475,cz,r,Math.PI/2,Math.PI*1.5,false);slot.absarc(cx+.2475,cz,r,Math.PI*1.5,Math.PI/2,false);outline.holes.push(slot);
 rectHole(outline,.999,.8422,17.038,10.36);
 plate(groups.package,outline,2.95,X,0,0,ceramic);
 // Datum bores are blind: sections C–C and D–D specify 1.865 mm depth.
 mesh(new T.CylinderGeometry(1.5325,1.5325,1.085,48),ceramic,groups.package,[X-14.9,.5425,13.5]);
 plate(groups.package,new T.Shape(slot.getPoints(64)),1.085,X,0,0,ceramic);
 box(groups.package,17.038,1.55,10.36,[X+.999,.775,.8422],ceramic,0);
 // Datum rims are plating rather than inserted screw heads.
 for(const[x,z,r]of[[-14.9,13.5,1.5325],[14.9,-13.5,1.2825]]){const geo=new T.RingGeometry(r,r+.14,48);geo.rotateX(-Math.PI/2);mesh(geo,nickel,groups.package,[X+x,2.958,z]);}
 textDecal(groups.package,'DLP6500FYE',15,2.3,[X,2.966,13.1],{size:68,color:'#a3a298'});
 textDecal(groups.package,'TEXAS INSTRUMENTS',17,1.8,[X,2.966,-13.2],{size:39,color:'#a3a298'});
 // Active array sits below the ceramic top, as section A–A specifies.
 box(groups.array,14.7268,.32,8.3764,[X+1.1996,1.73,.8996],dark,.02);
 box(groups.array,14.5152,.02,8.1648,[X+1.1996,1.9,.8996],new T.MeshStandardMaterial({color:'#7e969b',metalness:.96,roughness:.23}),0);
 // Fine boundary mirrors are not exaggerated into a fictitious coarse pixel grid.
 frame(groups.array,14.7268,8.3764,14.5152,8.1648,.025,X+1.1996,1.901,.8996,nickel);
 const glassMat=new T.MeshPhysicalMaterial({color:'#d7e1dc',transparent:true,opacity:.19,metalness:0,roughness:.045,depthWrite:false,side:T.DoubleSide});
 const glass=box(groups.window,21.276,1.05,14.063,[X+.624,3.128,.2017],glassMat,.025);glass.userData.anatomyTransparent=true;
 // Opaque aperture coating on the underside of the window.
 const coating=rectShape(21.276,14.063);rectHole(coating,.375,.6405,17.038,10.36);plate(groups.window,coating,.018,X+.624,2.596,.2017,dark);
 frame(groups.seal,25.037,20,21.276,14.063,.36,X+.624,2.95,.2017,material('#4d4c47',.1,.65));
 // 350 physical contacts, including the omitted edge locations.
 const pinGeo=new T.CylinderGeometry(.1525,.1525,1.4,12),brazeGeo=new T.CylinderGeometry(.425,.1525,.28,12);
 for(const p of DLP_PINS){mesh(pinGeo,nickel,groups.pins,[X+p.x,-.7,p.z]);mesh(brazeGeo,nickel,groups.pins,[X+p.x,-.14,p.z]);}
 box(groups.thermal,15,.075,10,[X,-.0375,0],nickel,0);
 const padArt=textDecal(groups.thermal,'DLP6500',12,3,[X,-.08,0],{size:64,color:'#555b58'});padArt.rotation.x=Math.PI/2;
 // Separate didactic inset. Large permanent legend prevents a scale ambiguity
 // even when overlay tags are switched off or the PNG is exported.
 box(groups.logic,28,1.1,40,[D,.55,9],dark,.2);
 const tech=texture(1024,1024,g=>{g.clearRect(0,0,1024,1024);g.strokeStyle='#526158';g.lineWidth=2;for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=130+c*210,y=100+r*210;g.strokeRect(x,y,180,180);g.beginPath();g.moveTo(x+35,y);g.lineTo(x+35,y+45);g.lineTo(x+145,y+45);g.lineTo(x+145,y+180);g.stroke();}});
 decal(groups.logic,MP*4,MP*4,[D,1.108,0],tech);
 textDecal(groups.logic,'600× DETAIL',27,11,[D,1.12,20.5],{size:76,color:'#c5ccc4',sub:'ILLUSTRATIVE MECHANISM'});
 // Presentation plaque, outside the actual package envelope. It is not hardware.
 box(groups.package,35,.5,13,[X,-3.75,26],dark,.16);
 textDecal(groups.package,'PACKAGE · 1×',34,12,[X,-3.48,26],{size:68,color:'#c5ccc4'});
 // Each enlarged cell has memory plane, address electrodes, landing features,
 // torsion posts/beam and one moving mirror. Undisclosed dimensions are schematic.
 for(let r=0;r<4;r++)for(let c=0;c<4;c++){
  const x=D+(c-1.5)*MP,z=(r-1.5)*MP;
  for(const s of [-1,1]){
   box(groups.electrodes,1.55,.22,2.05,[x+s*1.14,1.4,z-s*.4],gold,.06);
   box(groups.electrodes,.5,.42,.5,[x+s*1.5,1.62,z+s*1.5],nickel,.03);
  }
  const axisGroup=new T.Group();axisGroup.position.set(x,0,z);axisGroup.rotation.y=-Math.PI/4;groups.hinges.add(axisGroup);
  for(const s of [-1,1]){
   box(axisGroup,.45,1.08,.52,[s*2.22,2,0],nickel,.04);
   const foot=box(axisGroup,.75,.12,.75,[s*2.22,1.5,0],nickel,.025);
   const tip=box(axisGroup,.7,.09,.2,[s*1.46,2.52,s*1.03],nickel,.02);tip.rotation.z=s*.16;
  }
  box(axisGroup,4.5,.075,.12,[0,2.53,0],nickel,.014);
  box(axisGroup,1.5,.14,1.1,[0,2.57,0],nickel,.03);
  mesh(new T.CylinderGeometry(.25,.25,.95,16),nickel,groups.hinges,[x,3.075,z]);
  const pivot=new T.Group();pivot.position.set(x,3.55,z);pivot.name=`Micromirror ${r*4+c+1}`;pivot.userData.rotor=true;pivot.userData.motion={type:'mirror',axis:[Math.SQRT1_2,0,Math.SQRT1_2],angle:12,phase:(r+c)%2,index:r*4+c};groups.mirrors.add(pivot);
  box(pivot,MP*Math.sqrt(.92),.09,MP*Math.sqrt(.92),[0,.045,0],aluminium,.022);
 }
 root.userData={board:'dlp',dimensions:[35,5.053,32.2],packagePinCount:DLP_PINS.length,packagePinPitch:1.27,arrayPixels:[1920,1080],arrayPitch:PITCH,arrayActiveArea:[14.5152,8.1648],detailScale:SCALE,detailMirrors:16,detailIllustrative:true,mirrorTiltDegrees:12};
 return finishAssembly(root,groups,DLP_PARTS,{skipGroups:new Set(['window'])});
}
export const DLP_BOARD={id:'dlp',tab:'DLP micromirrors',title:'DLP6500<br>micromirrors',edition:'013',subtitle:'Two million mirrors. One spatial light modulator.',intro:'Explore the sealed DMD package alongside a magnified explanation of its switching mechanism.',model:'TI DLP6500FYE / package + 600× mechanism detail',basis:'Official package dimensions; illustrative enlarged mechanism',dimensions:'35 × 32.2 MM',parts:DLP_PARTS,build:buildDLP,half:52,camera:[83,99,120],target:[0,10,5],start:0,operationNote:'600× mechanism · slowed switching',stats:[['1920 × 1080','','MIRROR ARRAY'],['7.56','µm','MIRROR PITCH'],['±12','°','MIRROR TILT'],['350','','PACKAGE PINS']],sources:[['TI · DLP6500FYE datasheet and package drawing 2511543','https://www.ti.com/lit/gpn/dlp6500fye'],['TI · DMD101 technology introduction','https://www.ti.com/lit/an/dlpa008b/dlpa008b.pdf'],['TI · DLP6500FYE product specifications','https://www.ti.com/product/DLP6500FYE']],accuracy:'Package dimensions, 350-pin population, 1.27 mm pitch, locating holes, optical-window envelope and active-array size follow TI drawing 2511543. The full 1920 × 1080 array is a continuous reflective face at package scale. A permanently labelled 600× 4 × 4 detail uses the specified 7.56 µm pitch and ±12° tilt; its hinge, support, electrode and CMOS shapes are illustrative, not a disclosed DLP6500 fabrication stack. Presentation plaques sit outside the specified hardware envelope. Play slows switching for inspection; no optical-engine or semiconductor simulation is claimed.',hidden:[]};
