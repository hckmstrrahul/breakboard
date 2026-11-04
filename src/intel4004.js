import {T,mesh,box,material,makeAssembly,finishAssembly,part,definition,palette,rod,wire,frame,plate,inscription,dieRegions} from './module-kit.js';
const parts=[part('lid','Gold-plated lid','Hermetic seal',[0,2.9,0],[0,12,0],'The gold lid seals the ceramic cavity. The original white ceramic package is documented in Intel’s 1971 product photographs.'),part('ceramic','Ceramic package','16-pin DIP',[0,1,6],[0,0,0],'A recessed ceramic body holds the die and inner lead fingers.',[['Package','16-pin ceramic DIP'],['Lead pitch','2.54 mm']]),part('die','4004 silicon die','4-bit processor',[0,1.15,0],[0,5,0],'The PMOS die contains about 2,300 transistors. Visible regions are a simplified functional illustration, not a reproduction of the masks.',[['Architecture','4-bit'],['Transistors','≈2,300'],['Introduced','1971']]),part('bonds','Gold bond wires','Die interconnect',[1.5,1.5,1],[0,8,0],'Sixteen fine arched wires connect die pads to package lead fingers. Routes are representative.'),part('leads','Sixteen formed leads','Electrical interface',[3.81,0,0],[0,-2,0],'Two rows of eight side-brazed leads bend down to the mounting plane.',[['Contacts','16']]),part('seal','Lid sealing ring','Hermetic joint',[2.6,2.5,0],[0,10,0],'A thin metallic rim forms the lid joint around the open ceramic cavity.')];
function ceramicMaterial(){
 const ceramic=material('#f5f5f0',.02,.72);
 // Object-space porcelain mottling stays continuous around the cavity and
 // shoulders, without UV seams or a low-resolution texture at close range.
 ceramic.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vCeramicPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCeramicPosition = position;');
  shader.fragmentShader=`varying vec3 vCeramicPosition;
   float ceramicHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
   float ceramicNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(ceramicHash(i),ceramicHash(i+vec3(1,0,0)),f.x),mix(ceramicHash(i+vec3(0,1,0)),ceramicHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(ceramicHash(i+vec3(0,0,1)),ceramicHash(i+vec3(1,0,1)),f.x),mix(ceramicHash(i+vec3(0,1,1)),ceramicHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float cloud=.75*ceramicNoise(vCeramicPosition*1.2)+.25*ceramicNoise(vCeramicPosition*4.7);
   diffuseColor.rgb *= mix(vec3(.62,.65,.67),vec3(1.),smoothstep(.2,.78,cloud));`);
 };
 ceramic.customProgramCacheKey=()=> '4004-ceramic-mottle-v1';return ceramic;
}
function build(){const{root,groups:g}=makeAssembly(parts),m=palette(),ceramic=ceramicMaterial();
 // The short lid leaves both ceramic shoulders exposed, as on the gold-top DIP.
 plate(g.ceramic,6.6,19.6,.8,[0,.4,0],ceramic);
 const body=new T.Shape();body.moveTo(-2.85,-9.8);body.lineTo(2.85,-9.8);body.quadraticCurveTo(3.3,-9.8,3.3,-9.35);body.lineTo(3.3,9.35);body.quadraticCurveTo(3.3,9.8,2.85,9.8);body.lineTo(-2.85,9.8);body.quadraticCurveTo(-3.3,9.8,-3.3,9.35);body.lineTo(-3.3,-9.35);body.quadraticCurveTo(-3.3,-9.8,-2.85,-9.8);
 const cavity=new T.Path();cavity.moveTo(-2.3,-5.2);cavity.lineTo(-2.3,5.2);cavity.lineTo(2.3,5.2);cavity.lineTo(2.3,-5.2);cavity.closePath();body.holes.push(cavity);
 const shell=new T.ExtrudeGeometry(body,{depth:1.7,bevelEnabled:false,curveSegments:12});shell.rotateX(-Math.PI/2);mesh(shell,ceramic,g.ceramic,[0,.8,0]);
 frame(g.seal,6.05,12.2,.15,.25,[0,2.55,0],m.gold);
 const lid=material('#c6a052',.83,.37);box(g.lid,6.05,.3,12.2,[0,2.78,0],lid,.13);
 inscription(g.ceramic,'C4004',4.4,1.4,[0,2.52,7.7],'#6c716e');
 box(g.die,3,.28,4,[0,1,0],m.silicon,.02);
 // Functional regions, not a transistor-mask reproduction.
 dieRegions(g.die,1.2,3.5,[-.7,1.16,0],{columns:2,rows:8,color:'#9a754c'});dieRegions(g.die,1.2,3.4,[.7,1.16,0],{columns:1,rows:4,color:'#84956e'});
 for(const side of[-1,1])for(let i=0;i<8;i++){
  const z=(i-3.5)*2.54,innerZ=(i-3.5)*1.3,dz=(i-3.5)*.43;
  box(g.leads,.7,.18,.75,[side*3.5,.85,z],m.gold,.025);
  const lead=new T.Shape();lead.moveTo(-.38,1);lead.lineTo(.38,1);lead.lineTo(.38,-.45);lead.lineTo(.2,-.8);lead.lineTo(.2,-2.65);lead.lineTo(-.2,-2.65);lead.lineTo(-.2,-.8);lead.lineTo(-.38,-.45);lead.closePath();
  const geo=new T.ExtrudeGeometry(lead,{depth:.23,bevelEnabled:false});geo.rotateY(Math.PI/2);mesh(geo,m.gold,g.leads,[side*3.81-.115,0,z]);
  // The buried fan-out meets short fingers on the inner ceramic shelf.
  rod(g.leads,[side*3.15,1.03,z],[side*2.6,1.03,innerZ],.06,m.gold);
  box(g.leads,.55,.08,.2,[side*2.35,1.03,innerZ],m.gold,.01);
  box(g.die,.13,.025,.16,[side*1.36,1.16,dz],m.gold,0);
  wire(g.bonds,[[side*1.36,1.18,dz],[side*1.9,1.95,dz*1.8],[side*2.35,1.1,innerZ]],.028,m.gold);
 }
 root.userData.effects={cutaway:['lid'],paths:[{points:[[-1,1.3,-1.2],[1,1.3,-1.2],[1,1.3,1.2],[-1,1.3,1.2]],color:'#e3b862',count:4,radius:.055}]};return finishAssembly(root,g,parts);
}
export const INTEL4004_BOARD=definition({id:'intel4004',tab:'Intel 4004',category:'chips',parts,build,dimensions:'16-pin DIP · 2.54 mm pitch',half:19,target:[0,7,0],assembledHalf:14,assembledTarget:[0,0,0],floorY:-5,groundRadius:13,model:'Intel C4004 / ceramic gold-top package',description:'A pioneering 4-bit processor inside a gold-topped ceramic package.',operationNote:'Illustrative functional activity · lid fades during Play',stats:[['4','bit','WORD SIZE'],['16','','PACKAGE LEADS'],['2,300','','TRANSISTORS']],sources:[['Intel · 4004 history','https://download.intel.com/newsroom/2021/data-center/4004-infographic.pdf'],['Computer History Museum · Intel package photograph','https://www.computerhistory.org/revolution/digital-logic/12/285/1532'],['4004 reconstruction project · schematics','https://www.4004.com/assets/redrawn-4004-schematics-2006-11-12.pdf']],accuracy:'The gold-top ceramic DIP, sixteen leads and historical architecture are documented by Intel and CHM. Package height, cavity, wire routes and lead bends are reconstructed. Silicon surface regions are explicitly explanatory, not actual lithographic masks or verified die imagery. No copyrighted die photograph is redistributed. Play is conceptual functional activity.'});
