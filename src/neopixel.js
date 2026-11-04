// Adapted from Adafruit NeoMatrix 8x8 v2 EAGLE, CC BY-SA 3.0.
import * as T from 'three';
import layout from './neopixel-layout.json' with {type:'json'};
import {mesh,box,material,texture,M} from './model.js';
import {makeAssembly,finishAssembly} from './assembly.js';
import {indicatorMaterial} from './hardware-motion.js';
const W=71.12,TH=1.6,angle=r=>+(r||'R0').match(/-?[\d.]+/)[0]*Math.PI/180;
const part=(id,name,kind,description,specs,anchor,offset)=>({id,name,short:name.toUpperCase(),kind,description,specs,anchor,offset});
export const NEOPIXEL_PARTS=[
 part('pixels','64 RGB NeoPixels','8 × 8 ADDRESSABLE LED ARRAY','Each WS2812B package combines red, green and blue emitters with a serial driver. The 64 packages follow the official v2 board layout at 8.89 mm pitch. Play shows an illustrative travelling color pattern.',[['Pixels','64 · 8 × 8'],['Package','WS2812B · 5050'],['Color','24 bits per pixel']],[4.445,2.4,-4.445],[0,19,0]),
 part('smd','Decoupling & data resistor','LOCAL POWER FILTERING','The capacitors sit beside the LED packages and reduce local supply disturbance. R1 is the series data-input resistor. Their coordinates and orientations follow the official EAGLE layout.',[['Placement','Official v2 layout'],['Function','Decoupling / input protection']],[-17.78,1.3,4.445],[0,8,0]),
 part('input','Power & data input','5 V · GND · DIN','The three input pads accept power and the single-wire pixel data stream. These are plated PCB pads; the bare product does not have a connector installed.',[['Reference','JP1'],['Contacts','3 · 2.54 mm pitch'],['Supply','5 V nominal']],[-31.115,.82,-26.67],[0,0,0]),
 part('output','Chained data output','5 V · GND · DOUT','The output pads pass pixel data to another NeoPixel device. Copper contacts stay attached to the PCB while the LED packages and support components separate.',[['Reference','JP2'],['Contacts','3 · 2.54 mm pitch'],['Function','Daisy-chain output']],[30.861,.82,26.67],[0,0,0]),
 part('board','NeoMatrix PCB','ADAFRUIT 8 × 8 · V2','The black PCB retains the exact 71.12 mm square outline, twelve mounting holes and original visible artwork from the published v2 EAGLE file. This is the WS2812B RGB revision, not the later SK6812 RGBW variant.',[['CAD outline','71.12 × 71.12 mm'],['Mounting holes','12 × Ø2.8 mm'],['Pixel pitch','8.89 mm']],[22,.8,30],[0,0,0])
].map((p,i)=>({...p,n:String(i+1).padStart(2,'0')}));
const padWorld=(e,p)=>{const a=angle(e.rot),x=+p.x,y=+p.y;return[+e.x+x*Math.cos(a)-y*Math.sin(a),+e.y+x*Math.sin(a)+y*Math.cos(a)];};
function shapeBoard(){const s=new T.Shape();s.moveTo(-W/2,-W/2);s.lineTo(W/2,-W/2);s.lineTo(W/2,W/2);s.lineTo(-W/2,W/2);s.closePath();
 const holes=layout.holes.map(p=>[+p.x,+p.y,+p.drill/2]);for(const e of layout.components.filter(e=>e.package==='1X03'))for(const p of layout.packages[e.library+'/'+e.package].filter(p=>p.type==='pad'))holes.push([...padWorld(e,p),+p.drill/2]);
 for(const[x,y,r]of holes){const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}return s;}
function artwork(shape,bottom){const tx=texture(2048,2048,g=>{g.scale(2048/W,2048/W);g.translate(W/2,W/2);g.scale(1,-1);g.lineCap='round';
 const draw=(p,color)=>{g.strokeStyle=g.fillStyle=color;g.lineWidth=Math.max(.05,+p.width||.1);if(p.type==='wire'){g.beginPath();g.moveTo(+p.x1,+p.y1);g.lineTo(+p.x2,+p.y2);g.stroke();}if(p.type==='rectangle')g.fillRect(+p.x1,+p.y1,p.x2-p.x1,p.y2-p.y1);if(p.type==='circle'){g.beginPath();g.arc(+p.x,+p.y,+p.radius,0,Math.PI*2);g.stroke();}if(p.type==='text'&&p.text&&!p.text.startsWith('>')){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));if((p.rot||'').includes('M'))g.scale(-1,1);g.scale(1,-1);g.font=`${+p.size||.7}px monospace`;g.fillText(p.text,0,0);g.restore();}};
 for(const p of layout.copper)if(p.type==='wire'&&p.layer===(bottom?'16':'1'))draw(p,'#26343a');
 for(const p of layout.art)if((bottom?['22','26','28']:['21','25','27']).includes(p.layer))draw(p,'#dce2df');
 for(const e of layout.components){const mirror=(e.rot||'').includes('M');g.save();g.translate(+e.x,+e.y);g.rotate(angle(e.rot));if(mirror)g.scale(-1,1);
 for(const p of layout.packages[e.library+'/'+e.package]){if(p.layer==='21'&&mirror===bottom)draw(p,'#d7dfda');if(p.type==='smd'&&mirror===bottom){g.save();g.translate(+p.x,+p.y);g.rotate(angle(p.rot));g.fillStyle='#a9a68d';g.fillRect(-p.dx/2,-p.dy/2,+p.dx,+p.dy);g.restore();}}g.restore();}
 });tx.userData.anatomyCopperColor='#26343a';const geo=new T.ShapeGeometry(shape,16),p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+W/2)/W,(p.getY(i)+W/2)/W);geo.rotateX(-Math.PI/2);return{geo,mat:new T.MeshStandardMaterial({map:tx,transparent:true,side:T.DoubleSide,roughness:.7,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})};}
export function buildNeoPixel(){const{root,groups}=makeAssembly(NEOPIXEL_PARTS),shape=shapeBoard();const geo=new T.ExtrudeGeometry(shape,{depth:TH,bevelEnabled:false,curveSegments:16});geo.rotateX(-Math.PI/2);geo.translate(0,-TH/2,0);const board=mesh(geo,material('#141c21',0,.7),groups.board);board.userData.pcb=true;board.userData.dimensions=[W,TH,W];
 for(const bottom of [false,true]){const a=artwork(shape,bottom);mesh(a.geo,a.mat,groups.board,[0,bottom?-.815:.815,0]);}
 const ring=(group,x,z,inside,outside)=>{for(const y of [-.82,.82]){const g=new T.RingGeometry(inside,outside,24);g.rotateX(-Math.PI/2);mesh(g,M.gold,group,[x,y,z]);}mesh(new T.CylinderGeometry(inside,inside,TH,20,1,true),M.silver,group,[x,0,z]);};
 const ceramic=material('#e8e9e0',0,.5),cup=material('#d8d0a8',.15,.5);
 for(const e of layout.components){const group=e.name==='JP1'?groups.input:e.name==='JP2'?groups.output:e.name.startsWith('LED')?groups.pixels:groups.smd;
 if(e.package==='1X03'){for(const p of layout.packages[e.library+'/'+e.package].filter(p=>p.type==='pad')){const[x,y]=padWorld(e,p);ring(group,x,-y,+p.drill/2,+p.diameter/2);}continue;}
 if(!e.name.startsWith('LED')&&!/^C\d|^R\d/.test(e.name))continue;
 const g=new T.Group();g.name=e.name;g.userData.reference=e.name;g.position.set(+e.x,0,-e.y);g.rotation.y=angle(e.rot);group.add(g);
 const pads=layout.packages[e.library+'/'+e.package].filter(p=>p.type==='smd');for(const p of pads){const m=box(g,+p.dx,.15,+p.dy,[+p.x,.9,-p.y],M.silver,.025);m.rotation.y=angle(p.rot);}
 if(e.name.startsWith('LED')){
  // Open reflector cup; the encased die structure is deliberately not fabricated.
  const s=new T.Shape();s.moveTo(-2.5,-2.5);s.lineTo(2.5,-2.5);s.lineTo(2.5,2.5);s.lineTo(-1.6,2.5);s.lineTo(-2.5,1.6);s.closePath();const hole=new T.Path();hole.absarc(0,0,1.8,0,Math.PI*2,true);s.holes.push(hole);
  const shell=new T.ExtrudeGeometry(s,{depth:1.45,bevelEnabled:false,curveSegments:28});shell.rotateX(-Math.PI/2);mesh(shell,ceramic,g,[0,1,0]);
  mesh(new T.CylinderGeometry(1.8,1.55,.3,32),cup,g,[0,1.2,0]);
  const index=+e.name.slice(3)-1,glow=indicatorMaterial('#e6d5ae','matrix',index/64*Math.PI*2);glow.userData.indicator.index=index;glow.userData.indicator.row=Math.round((31.115-e.y)/8.89);glow.userData.indicator.column=Math.round((+e.x+31.115)/8.89);
  glow.userData.indicator.glowPosition=[+e.x,2.48,-e.y];
  mesh(new T.CylinderGeometry(1.68,1.68,.12,32),glow,g,[0,1.68,0]);
  box(g,.45,.02,.45,[-1.95,2.46,-1.95],M.black,.01);
 }else{box(g,2,.6,1.25,[0,1.15,0],e.name.startsWith('C')?M.ceramic:M.black,.045);}
 }
 root.userData={board:'neopixel',dimensions:[W,TH,W],ledCount:64,pixelPitch:8.89,mountingHoles:12,source:layout.source};return finishAssembly(root,groups,NEOPIXEL_PARTS);}
export const NEOPIXEL_BOARD={id:'neopixel',tab:'NeoPixel 8×8',title:'NeoPixel 8×8',edition:'014',model:'Adafruit NeoMatrix 8×8 / WS2812B v2',basis:'Official PCB coordinates',dimensions:'71.12 × 71.12 MM',parts:NEOPIXEL_PARTS,build:buildNeoPixel,half:62,camera:[90,115,120],target:[0,8,0],start:0,operationNote:'Illustrative pixel pattern',stats:[['64','','RGB PIXELS'],['24','BIT','COLOR PER PIXEL'],['5','V','NOMINAL SUPPLY'],['8.89','mm','PIXEL PITCH']],sources:[['Adafruit · NeoMatrix 8×8 product','https://www.adafruit.com/product/1487'],['Adafruit · Official EAGLE files','https://github.com/adafruit/Adafruit-NeoPixel-8x8-Matrix'],['Adafruit · NeoPixel matrices guide','https://learn.adafruit.com/adafruit-neopixel-uberguide/neopixel-matrices']],accuracy:'The outline, 64 LED centers, 8.89 mm pitch, twelve mounting holes, pads, passives, visible routing and silkscreen are extracted from Adafruit_NeoMatrix_8x8 v2.brd. LED shells and optical cups are reconstructed 5050 package envelopes; encapsulated dies and bond wires are not claimed to be visible or exact. PCB thickness is assumed to be 1.6 mm. Play is an illustrative pattern, not a timing or power simulation.',hidden:[],connections:[['input','pixels']],license:'Adafruit Industries NeoMatrix board and adapted geometry: CC BY-SA 3.0. https://creativecommons.org/licenses/by-sa/3.0/'};
