import * as T from 'three';
import {mesh,box,material,textDecal,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';

// R-tube envelope and contact pattern from Dalibor Farny's technical data and
// footprint DXF. Electrode shapes, wall thickness and assembly depths are a
// photographic reconstruction, not production tooling or a pinout schematic.
const tau=Math.PI*2, metal=material('#73777a',.8,.36), ceramic=material('#c9bfa8',0,.7);
const black=material('#27282c',.65,.37), mica=material('#afa795',.15,.66);
const pinAngles=[50,30,-10,-30,-50,-110,-130,-150,150,130,110];
const positions=pinAngles.map(a=>[17.5*Math.cos(a*Math.PI/180),17.5*Math.sin(a*Math.PI/180)]);
const p=(id,name,short,kind,description,anchor,offset,specs)=>({id,name,short,kind,description,anchor,offset,specs});
const digitOrder=[1,0,2,3,4,5,6,7,8,9];
export const NIXIE_PARTS=[
 p('envelope','Glass envelope','GLASS ENVELOPE','SEALED GAS ENCLOSURE','The blown glass envelope seals the electrode assembly inside a low-pressure discharge gas. Its outline follows the R-tube proportions; glass thickness and the drawn shoulder are reconstructed.',[19,87,16],[113,65,-24],[['Tube height','125 mm · including pins'],['Envelope','Blown glass'],['Construction','Sealed · shown separated for explanation']]),
 p('anode','Hexagonal anode grid','ANODE GRID','COMMON POSITIVE ELECTRODE','The fine perforated grid folds around the numeral stack and joins the rear plate. It is the common anode, while one numeral cathode is driven at a time. The hexagon size is reconstructed from manufacturer photographs.',[0,89,10],[-133,8,18],[['Role','Common anode'],['Grid','Hexagonal perforations'],['Detail','Reconstructed pitch']]),
 ...digitOrder.map((digit,i)=>p('digit'+digit,`Numeral ${digit} cathode`,`${digit} · CATHODE`,'GLOW-DISCHARGE ELECTRODE',`This metal numeral is one of ten separately driven cathodes. Selecting it electrically creates the orange glow around its surface. The 50 mm numeral height is documented; letterform, stack order and lead routing are reconstructed.`,[digit===1?2:11,62,6.75-i*1.5],[(i%5-2)*35,18+Math.floor(i/5)*71,29+i*1.5],[['Symbol',String(digit)],['Numeral height','50 mm'],['Operation','One cathode at a time']])),
 p('backplate','Anode backplate','REAR ANODE','ELECTRODE RETURN','The rear metal plate closes the grid behind the ten cathodes. The manufacturer joins it to the grid by spot welding; the surface and tabs here are reconstructed.',[0,65,-10],[104,5,45],[['Connection','Common anode'],['Join','Spot-welded tabs']]),
 p('spacers','Ceramic spacers','CERAMIC SPACERS','ELECTRICAL ISOLATION','Small ceramic rings separate adjacent cathodes along the electrode supports. Their presence is documented; the individual dimensions are illustrative.',[15,89,0],[-121,13,-28],[['Material','Ceramic'],['Role','Separate numeral electrodes']]),
 p('mica','Mica supports','MICA SUPPORTS','ELECTRODE LOCATION','Two mica holders locate the electrode stack inside the glass. Their notched edges seat against the envelope. These are structural insulators, not additional electrical electrodes.',[19,94,4],[-139,61,-32],[['Material','Mica'],['Count shown','2 support plates']]),
 p('getter','Getter assembly','GETTER','RESIDUAL-GAS CONTROL','A getter is installed before the tube is sealed, helping control residual gas contamination. The small ring, support and position are representative of the manufacturing photographs.',[-11,97,-8],[-139,84,-16],[['Role','Capture residual gases'],['Geometry','Illustrative ring and support']]),
 p('stem','Pinched glass stem','GLASS STEM','HERMETIC FEEDTHROUGH','The flattened glass stem holds the feedthrough conductors. Their glass-to-metal seals preserve the gas atmosphere while bringing each cathode and the common anode to the base.',[0,25,0],[-47,0,16],[['Feedthroughs','11 conductors'],['Seal','Glass to metal']]),
 p('base','Anodized base','BASE','MECHANICAL SUPPORT','The cylindrical anodized base protects the stem and locates the electrical contact plate. Its 53 mm outer diameter comes from the published footprint envelope.',[21,10,16],[0,0,0],[['Outer diameter','53 mm'],['Finish','Dark anodized metal']]),
 p('pins','Contact plate and pins','11 CONTACTS','TUBE INTERFACE','Eleven external contacts use the manufacturer’s asymmetric 35 mm pitch-circle pattern. The empty angular positions key the tube. Socket drill size is not the diameter of these modeled pins.',[15,-6,9],[0,0,0],[['Contacts','11'],['Pitch circle','Ø35 mm'],['Pattern','Official footprint DXF']])
].map((part,i)=>({...part,n:String(i+1).padStart(2,'0')}));
function ring(parent,ro,ri,h,y,mat){const s=new T.Shape();s.absarc(0,0,ro,0,tau);const hole=new T.Path();hole.absarc(0,0,ri,0,tau,true);s.holes.push(hole);const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:64});g.rotateX(-Math.PI/2);return mesh(g,mat,parent,[0,y,0]);}
function rod(parent,a,b,r,mat){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),o=mesh(new T.CylinderGeometry(r,r,v.length(),8),mat,parent,A.add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function line(parent,a,b,width,mat){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A);const o=mesh(new T.BoxGeometry(v.length(),width,.09),mat,parent,A.add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),v.normalize());return o;}
function glyph(n){
 const q=new T.Path();
 if(n===0){q.absellipse(0,0,13.5,25,0,tau,false,0);}
 if(n===1){q.moveTo(-6,18);q.lineTo(3,25);q.lineTo(3,-25);}
 if(n===2){q.moveTo(-13,17);q.bezierCurveTo(-10,29,14,29,14,14);q.bezierCurveTo(14,6,-11,-12,-14,-25);q.lineTo(14,-25);}
 if(n===3){q.moveTo(-13,25);q.lineTo(13,25);q.lineTo(-2,5);q.bezierCurveTo(20,4,19,-25,0,-25);q.bezierCurveTo(-6,-25,-10,-23,-14,-19);}
 if(n===4){q.moveTo(9,25);q.lineTo(-14,-9);q.lineTo(15,-9);q.moveTo(9,14);q.lineTo(9,-25);}
 if(n===5){q.moveTo(14,25);q.lineTo(-11,25);q.lineTo(-14,2);q.bezierCurveTo(12,13,22,-20,5,-25);q.bezierCurveTo(-3,-27,-11,-23,-14,-17);}
 if(n===6){q.moveTo(10,25);q.bezierCurveTo(-12,14,-15,-5,-13,-17);q.bezierCurveTo(-9,-31,15,-27,14,-10);q.bezierCurveTo(13,5,-10,7,-13,-10);}
 if(n===7){q.moveTo(-14,25);q.lineTo(14,25);q.lineTo(-8,-25);}
 if(n===8){q.moveTo(0,1);q.bezierCurveTo(-21,14,-10,25,0,25);q.bezierCurveTo(20,25,17,8,0,1);q.bezierCurveTo(-22,-8,-16,-25,0,-25);q.bezierCurveTo(21,-25,20,-7,0,1);}
 if(n===9){q.moveTo(-10,-25);q.bezierCurveTo(13,-12,15,3,13,16);q.bezierCurveTo(10,29,-14,28,-14,12);q.bezierCurveTo(-14,-5,10,-5,13,12);}
 return q;
}
function cathode(parent,digit,z){
 const mat=new T.MeshStandardMaterial({color:'#555552',metalness:.62,roughness:.4,emissive:'#ff5a08',emissiveIntensity:0});mat.userData.indicator={kind:'nixie',digit};
 const shape=glyph(digit);
 // Each connected subpath becomes a thin rounded cathode stroke. Rounded curves
 // retain the R tube's wire-like numerals without using a raster font texture.
 const curves=shape.curves;
 const samples=curves.flatMap(c=>c.getPoints(80)),lo=Math.min(...samples.map(v=>v.y)),hi=Math.max(...samples.map(v=>v.y));
 for(const curve of curves){const pts=curve.getPoints(curve.isLineCurve?1:40).map(v=>new T.Vector3(v.x,37.5+(v.y-lo)*50/(hi-lo),z));const path=new T.CatmullRomCurve3(pts);if(pts.length===2){rod(parent,pts[0].toArray(),pts[1].toArray(),.28,mat);}else mesh(new T.TubeGeometry(path,Math.max(12,pts.length*2),.28,8,false),mat,parent);}
 // Mechanical tabs terminate on the insulating support rods; feedthrough lead
 // routes are schematic, deliberately not presented as the electrical pinout.
 for(const x of[-15,15]){
  rod(parent,[x,89,z],[x,36,z],.22,metal);
  for(const y of[35,90]){const tab=ring(parent,1.2,.86,.22,0,metal);tab.rotation.x=Math.PI/2;tab.position.set(x,y,z-.11);}
 }
 rod(parent,[-15,37.5,z],[15,37.5,z],.18,metal);
 const a=positions[digit];rod(parent,[15,35,z],[a[0]*.45,29,a[1]*.18],.17,metal);
 return mat;
}
function anodeGrid(parent){
 const edges=new Map(),R=1.02,h=Math.sqrt(3)*R;
 // True openings, not a dark texture. Trim wire geometry to the rectangular
 // front face and let the perimeter flanges cover the trimmed ends.
 for(let row=-18;row<=18;row++)for(let col=-13;col<=13;col++){
  const cx=col*1.5*R,cy=63+row*h+(col%2?h/2:0);
  const verts=Array.from({length:6},(_,i)=>[cx+R*Math.cos(i*tau/6),cy+R*Math.sin(i*tau/6)]);
  for(let k=0;k<6;k++){
   let a=verts[k],b=verts[(k+1)%6];if(a[0]<-16||a[0]>16||b[0]<-16||b[0]>16||a[1]<35||a[1]>91||b[1]<35||b[1]>91)continue;
   const key=[a,b].map(v=>v.map(x=>x.toFixed(3)).join(',')).sort().join('|');if(edges.has(key))continue;edges.set(key,[a,b]);
  }
 }
 for(const[a,b]of edges.values())line(parent,[a[0],a[1],10],[b[0],b[1],10],.065,metal);
 for(const side of [-1,1]){
  box(parent,1,58,.25,[side*16.5,63,10],metal,.04);
  // The folded side panels are perforated, too, rather than solid dark walls.
  for(const[a,b]of edges.values())if(Math.abs(a[0])<9&&Math.abs(b[0])<9)line(parent,[side*17,a[1],a[0]],[side*17,b[1],b[0]],.065,metal);
  for(const z of[-9.8,9.8])box(parent,.25,58,.7,[side*17,63,z],metal,.04);
  for(const y of[34,92])box(parent,.25,2,20,[side*17,y,0],metal,.04);
  for(let i=0;i<6;i++)box(parent,.8,2.2,2,[side*17,38+i*10,-9.3],metal,.04);
 }
 for(const y of[34,92])box(parent,34,2,.25,[0,y,10],metal,.04);
}
export function buildNixie(){
 const{root,groups}=makeAssembly(NIXIE_PARTS);
 ring(groups.base,26.5,24.55,20,0,black);
 ring(groups.base,26.48,25.8,.35,19.65,M.silver);
 ring(groups.base,26.4,24.55,.4,0,black);
 // Dark contact carrier: positions derived directly from the official DXF.
 const plate=new T.Shape();plate.absarc(0,0,24.5,0,tau);
 for(const[x,z]of positions){const h=new T.Path();h.absarc(x,-z,.85,0,tau,true);plate.holes.push(h);}
 const g=new T.ExtrudeGeometry(plate,{depth:2.2,bevelEnabled:false,curveSegments:64});g.rotateX(-Math.PI/2);mesh(g,material('#191a1c'),groups.pins,[0,0,0]);
 positions.forEach(([x,z],i)=>{
  mesh(new T.CylinderGeometry(.64,.64,12.2,16),M.gold,groups.pins,[x,-3.9,z]);
  const collar=mesh(new T.CylinderGeometry(1.05,1.05,.8,20),M.silver,groups.pins,[x,2.4,z]);
 });
 const glassMat=new T.MeshPhysicalMaterial({color:'#dbe9ee',metalness:0,roughness:.1,transparent:true,opacity:.12,ior:1.47,side:T.DoubleSide,depthWrite:false});
 const outer=[[24.5,18],[25,21],[25.35,30],[25.35,91],[25,96],[23,100],[18,103],[9,106],[5.3,107],[3.2,111],[2.1,114],[.5,115]];
 const inner=outer.slice().reverse().map(([r,y])=>[Math.max(.15,r-.8),y-.65]);
 const profile=[...outer,...inner,outer[0]].map(v=>new T.Vector2(...v));
 const envelope=mesh(new T.LatheGeometry(profile,96),glassMat,groups.envelope);envelope.castShadow=false;envelope.userData.anatomyTransparent=true;
 // Neck is a closed wall profile; the glass skin is not a solid opaque cylinder.
 const stem=box(groups.stem,17,9,6,[0,24,0],glassMat,.9);stem.userData.anatomyTransparent=true;
 mesh(new T.CylinderGeometry(8,12,4,48),glassMat,groups.stem,[0,17.5,0]).userData.anatomyTransparent=true;
 for(let i=0;i<11;i++){const[x,z]=positions[i];rod(groups.stem,[x,2.8,z],[x*.45,20,z*.18],.23,metal);rod(groups.stem,[x*.45,20,z*.18],[x*.45,29,z*.18],.23,metal);}
 digitOrder.forEach((digit,i)=>cathode(groups['digit'+digit],digit,6.75-i*1.5));
 anodeGrid(groups.anode);
 box(groups.backplate,34,58,.22,[0,63,-10],metal,.12);
 rod(groups.backplate,[-16,34,-10],[positions[10][0]*.45,29,positions[10][1]*.18],.23,metal);
 for(const side of[-1,1])for(let i=0;i<6;i++)box(groups.backplate,1.2,1.2,.4,[side*16,38+i*10,-10],M.silver,.14);
 // Ring spacers are real hollow rings on the two electrode support rods.
 for(const x of[-15,15]){
  rod(groups.spacers,[x,90,-9],[x,90,9],.35,metal);rod(groups.spacers,[x,35,-9],[x,35,9],.35,metal);
  for(const y of[35,90])for(let i=0;i<10;i++){
   const r=ring(groups.spacers,.85,.38,1.5,0,ceramic);r.rotation.x=Math.PI/2;r.position.set(x,y,6-i*1.5);
  }
 }
 for(const y of[32,94]){
  const s=new T.Shape();s.absellipse(0,0,23,17.3,0,tau);
  for(const x of[-15,15])for(const z of[-8,8]){const h=new T.Path();h.absarc(x,-z,1.2,0,tau,true);s.holes.push(h);}
  const geo=new T.ExtrudeGeometry(s,{depth:.55,bevelEnabled:false,curveSegments:48});geo.rotateX(-Math.PI/2);mesh(geo,mica,groups.mica,[0,y,0]);
  for(const x of[-15,15])for(const z of[-8,8])mesh(new T.SphereGeometry(.7,12,8),ceramic,groups.mica,[x,y+.6,z]);
 }
 const getter=mesh(new T.TorusGeometry(3.5,.65,8,32),metal,groups.getter,[-10,97,-8]);getter.rotation.x=-Math.PI/2;
 rod(groups.getter,[-10,96.5,-8],[-16,91,-9.5],.32,metal);
 // Restrained product identification on the underside; no invented serial code.
 textDecal(groups.pins,'R',14,14,[0,2.22,0],{color:'#afb2ae',size:90});
 root.userData={device:'nixie',dimensions:[53,125,53],numeralHeight:50,cathodes:10,contactCount:11,pinCircle:35,pinCenters:positions,source:'Dalibor Farny R tube data and footprint',reconstruction:'Electrode dimensions, order and lead routing are illustrative'};
 return finishAssembly(root,groups,NIXIE_PARTS,{skipGroups:new Set(['envelope','stem'])});
}
export const NIXIE_BOARD={id:'nixie',tab:'Nixie tube',title:'Nixie tube',edition:'010',subtitle:'Ten metal numerals, one orange glow.',intro:'Separate the glass, common anode and ten cathodes of a gas-discharge display.',model:'Dalibor Farny R tube / reconstructed internals',basis:'Official envelope & contact pattern',dimensions:'Ø53 × 125 MM',parts:NIXIE_PARTS,build:buildNixie,assembledHalf:82,assembledTarget:[0,54,0],half:164,camera:[110,180,260],target:[0,93,0],start:0,operationNote:'One cathode at a time · illustrative glow',stats:[['10','','NUMERAL CATHODES'],['50','mm','SYMBOL HEIGHT'],['11','','BASE CONTACTS'],['35','mm','CONTACT PITCH CIRCLE']],sources:[['Dalibor Farny · R tube technical data','https://docs.daliborfarny.com/v2/en/nixie-tubes/technical-data'],['Dalibor Farny · Tube socket and footprint DXF','https://docs.daliborfarny.com/v2/en/nixie-tubes/tube-socket'],['Dalibor Farny · Manufacturing process','https://www.daliborfarny.com/manufacture/'],['Dalibor Farny · R tube photographs','https://www.daliborfarny.com/project/rz568m-nixie-tube/']],accuracy:'The 125 mm total height, 50 mm symbols and eleven contacts follow the manufacturer’s technical data. The Ø53 mm envelope and asymmetric Ø35 mm contact circle are taken from the official DXF. Electrode letterforms, ordering, leads, glass thickness, hexagonal grid pitch, mica and getter geometry are reconstructed from photographs and manufacturing descriptions. Separation is explanatory: the glass is sealed, not a removable cover. The glow in Play illustrates cathode selection; it is not a gas-discharge simulation.',hidden:[]};
