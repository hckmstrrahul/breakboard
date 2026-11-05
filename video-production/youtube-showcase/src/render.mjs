import {createScene} from '/src/scene.js';
import {BOARD_LIST} from '/src/boards.js';
import {formatLabel} from '/src/label-text.js';
import * as T from 'three';
import {FPS,HEROES} from './storyboard.mjs';

const BG='#14171c',WHITE='#e5e8ed',MUTED='#9ba4af',PEACH='#e9aa86';
const canvas=document.createElement('canvas');
const ctx=canvas.getContext('2d',{alpha:false});
const host=document.getElementById('host');
const stage=createScene(host,()=>{});
stage.controls.enableDamping=false;
stage.controls.minZoom=.00001;stage.controls.maxZoom=10000;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const mix=(a,b,t)=>a+(b-a)*t;
const Y=new T.Vector3(0,1,0);
let def,state,region,scale,box0,box1,focusBox,baseDirection,lastSelection='',lastIsolation=false;
const font1=new FontFace('FilmInter','url(/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2)',{weight:'100 900'});
const font2=new FontFace('FilmMono','url(/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2)');
await Promise.all([font1.load(),font2.load()]);document.fonts.add(font1);document.fonts.add(font2);
const brand=new Image();brand.src='/src/brand.svg';await brand.decode();

function text(value,x,y,size=20,color=WHITE,weight=400,mono=false){ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${mono?'FilmMono':'FilmInter'}`;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(value,x,y);}
function rule(x,y,w,color='#30363f'){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();}
function round(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function brandAt(x=80,y=60){ctx.drawImage(brand,x,y-24,32,32);text('breakboard',x+46,y+1,24,WHITE,600);}
function allBounds(roots=Object.values(stage.model.groups)){
 const result=new T.Box3();
 for(const root of roots){root.updateWorldMatrix(true,true);root.traverse(o=>{
  if(!o.isMesh&&!o.isLine&&!o.isPoints)return;
  if(o.isInstancedMesh){o.computeBoundingBox();result.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld));}
  else if(o.geometry?.attributes.position){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();result.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}
 });}
 return result;
}
function lerpBox(a,b,u){return new T.Box3(a.min.clone().lerp(b.min,u),a.max.clone().lerp(b.max,u));}
function framing(box){
 const half=box.getSize(new T.Vector3()).multiplyScalar(.5),r=Math.hypot(half.x,half.z),s=baseDirection.y;
 const vertical=half.y*Math.sqrt(1-s*s)+r*Math.abs(s);
 const halfHeight=Math.max(vertical/.78,r/(region.w/region.h)/.82,.01);
 return {target:box.getCenter(new T.Vector3()),half:halfHeight,distance:Math.max(100,box.getSize(new T.Vector3()).length()*3)};
}
function applyCamera(a,b,u,angle){
 const target=a.target.clone().lerp(b.target,u),half=mix(a.half,b.half,u),distance=mix(a.distance,b.distance,u),aspect=region.w/region.h;
 stage.camera.left=-half*aspect;stage.camera.right=half*aspect;stage.camera.top=half;stage.camera.bottom=-half;stage.camera.zoom=1;
 stage.camera.near=Math.max(.01,distance-half*4);stage.camera.far=distance+half*6+200;
 stage.camera.position.copy(baseDirection).multiplyScalar(distance).applyAxisAngle(Y,angle).add(target);
 stage.controls.target.copy(target);stage.camera.updateProjectionMatrix();stage.controls.update();
}
async function prepare(shot,{width=3840,height=2160,tile=false}={}){
 canvas.width=width;canvas.height=height;scale=width/1920;
 region=tile?{x:0,y:0,w:1920,h:1080}:shot.kind==='montage'?{x:180,y:155,w:1560,h:800}:{x:515,y:105,w:1345,h:835};
 host.style.width=region.w+'px';host.style.height=region.h+'px';window.dispatchEvent(new Event('resize'));
 await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
 stage.renderer.setPixelRatio(scale);
 if(!shot.id)return;
 def=BOARD_LIST.find(d=>d.id===shot.id);if(!def)throw Error('Unknown device '+shot.id);
 await stage.setBoard({...def,start:0});stage.setTheme('dark');
 stage.controls.dispatchEvent({type:'start'});
 stage.renderer.setClearColor(BG,1);stage.renderer.shadowMap.autoUpdate=true;
 state={explode:0,selected:null,isolate:false,xray:false,guides:false,rotate:false,playing:false};
 stage.model.setPose(0);box0=allBounds();stage.model.setPose(1);box1=allBounds();
 baseDirection=new T.Vector3(...def.camera).sub(new T.Vector3(...def.target)).normalize();
 if(shot.focus){focusBox=allBounds([stage.model.groups[shot.focus]]);}
 stage.model.setPose(0);stage.model.operation.reset();
 lastSelection='';lastIsolation=false;
}
function select(id,isolate){
 if(id!==lastSelection||isolate!==lastIsolation){
  stage.select(id,false,state.xray,state.explode,null);
  stage.model.setSelection(id,isolate,!!id);
  lastSelection=id;lastIsolation=isolate;
 }
}
function modeAt(t){return t<2.5?'Assembled':t<3.75?'Labels':t<7.5?'Exploded':t<10?'Select':t<12.5?'Isolate':t<15?'X-ray':t<16.25?'Assembled':'Play';}
function phases(shot,t){
 const e=ease((t-3.75)/2);state.explode=t<15?e:1-ease((t-15)/1.25);
 state.selected=t>=7.5&&t<13.75?shot.focus:null;
 state.isolate=t>=10&&t<12.5;
 state.xray=t>=12.5&&t<15;
 state.playing=t>=16.25;
 state.guides=state.explode>.1&&t<7.5;
 select(state.selected,state.isolate);
 // Preserve the application's ghost material, with a short opacity entrance.
 if(state.selected&&!state.isolate&&!state.xray){
  const opacity=mix(1,.1,ease((t-7.5)/.35));
  for(const [id,g]of Object.entries(stage.model.groups))if(id!==state.selected)g.traverse(o=>{if(o.userData.ghost&&o.material===o.userData.ghost)o.material.opacity=opacity;});
 }
 const full=framing(lerpBox(box0,box1,state.explode)),focus=framing(focusBox);
 const isolation=t>=10&&t<12.5?ease((t-10)/.8):t>=12.5&&t<13.3?1-ease((t-12.5)/.8):0;
 const angle=t<6.5?-.07*t:t<15?-.455:-.455-(t-15)*.16;
 stage.render(state,t,1/FPS);applyCamera(full,focus,isolation,angle);stage.render(state,t,0);
 return modeAt(t);
}
function point(id){const p=stage.project(id);return{x:region.x+p.x,y:region.y+p.y};}
function softenFloor(){const y=region.y+region.h-65,g=ctx.createLinearGradient(0,y,0,y+65);g.addColorStop(0,'#14171c00');g.addColorStop(1,BG);ctx.fillStyle=g;ctx.fillRect(region.x,y,region.w,65);}
function labels(ids,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;const used=[];
 ids=[...ids].sort((a,b)=>point(a).y-point(b).y);
 for(let k=0;k<ids.length;k++){
  const id=ids[k],part=def.parts.find(p=>p.id===id);if(!part)continue;
  const p=point(id),value=formatLabel(part.short),font=17;ctx.font=`400 ${font}px FilmMono`;
  let words=value.split(' '),lines=[''];for(const word of words){const n=lines.length-1,candidate=lines[n]?lines[n]+' '+word:word;if(ctx.measureText(candidate).width>235&&lines[n])lines.push(word);else lines[n]=candidate;}
  const w=Math.max(...lines.map(l=>ctx.measureText(l).width))+28,h=lines.length*22+18;
  const left=p.x<region.x+region.w*.54;
  let x=clamp(left?p.x-w-55:p.x+55,region.x+8,1865-w),y=clamp(p.y-72+k*20,170,885-h);
  for(let attempt=0;attempt<8;attempt++){const b=used.find(b=>x<b.x+b.w+15&&x+w+15>b.x&&y<b.y+b.h+12&&y+h+12>b.y);if(!b)break;y=clamp(b.y+b.h+16,170,890-h);}
  used.push({x,y,w,h});const endX=clamp(p.x,x,x+w),endY=clamp(p.y,y,y+h);
  ctx.strokeStyle=PEACH;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(endX,endY);ctx.stroke();
  round(x,y,w,h,8,'#1d2229','#39414d');lines.forEach((l,i)=>text(l,x+14,y+26+i*22,font,PEACH,400,true));
  ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);ctx.fillStyle=PEACH;ctx.fill();ctx.strokeStyle=BG;ctx.lineWidth=1.5;ctx.stroke();
 }
 ctx.restore();
}
function cursor(p,t){
 if(t<7.05||t>8.65)return;
 const u=ease((t-7.05)/.45),x=mix(p.x+110,p.x,u),y=mix(p.y+90,p.y,u);
 ctx.save();ctx.globalAlpha=1-ease((t-8.25)/.4);
 if(t>=7.5){ctx.beginPath();ctx.arc(p.x,p.y,8+26*ease((t-7.5)/.55),0,2*Math.PI);ctx.strokeStyle=PEACH;ctx.lineWidth=2;ctx.globalAlpha*=1-clamp((t-7.5)/.6);ctx.stroke();ctx.globalAlpha=1-ease((t-8.25)/.4);}
 ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1,23);ctx.lineTo(7,17);ctx.lineTo(12,27);ctx.lineTo(17,24);ctx.lineTo(12,15);ctx.lineTo(21,14);ctx.closePath();ctx.fillStyle=WHITE;ctx.fill();ctx.strokeStyle='#14171c';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
}
function heroOverlay(shot,t,mode){
 brandAt();text(`${String(shot.index+1).padStart(2,'0')} / 06`,1740,61,16,MUTED,400,true);
 text(shot.family,80,215,14,PEACH,400,true);
 shot.title.forEach((l,i)=>text(l,77,283+i*64,58,WHITE,550));
 const y=shot.title.length>1?395:331;
 shot.version.forEach((l,i)=>text(l,80,y+i*25,16,MUTED,400,true));
 rule(80,490,310);
 const hints={Assembled:['Meet the hardware.','Turn it. Look closer.'],Labels:['Name the parts.','Labels follow real component anchors.'],Exploded:['See how it fits.','Separate the physical layers.'],Select:['One part in focus.','The rest becomes a ghost.'],Isolate:['Every detail, visible.','Inspect the selected component.'],'X-ray':['Look through it.','Reveal the modeled structure.'],Play:[shot.play,shot.detail]};
 text(mode.toUpperCase(),80,536,13,PEACH,400,true);
 text(hints[mode][0],80,578,25,WHITE,500);
 // Keep the secondary line short enough for the calm left column.
 const words=hints[mode][1].split(' ');let line='',lineY=612;
 ctx.font='400 17px FilmInter';for(const word of words){if(ctx.measureText(line+' '+word).width>365&&line){text(line,80,lineY,17,MUTED);line=word;lineY+=25;}else line+=(line?' ':'')+word;}text(line,80,lineY,17,MUTED);
 text('MODEL BASIS',80,797,11,MUTED,400,true);
 const basis=shot.note.split(' · ');basis.forEach((l,i)=>text(l,80,826+i*21,14,MUTED));
 const modes=['Assembled','Labels','Exploded','Select','Isolate','X-ray','Play'];let x=80;
 rule(80,963,1760);
 modes.forEach(m=>{const w=m==='Assembled'?142:110;const active=m===mode;round(x,987,w,41,20,active?'#2a2b2b':null,active?'#625047':null);text(m,x+18,1014,15,active?PEACH:MUTED,active?500:400);x+=w+8;});
 text('ILLUSTRATIVE OPERATION',1530,1014,12,MUTED,400,true);
 const progress=clamp(t/20);ctx.fillStyle=PEACH;ctx.fillRect(80,963,1760*progress,1.5);
 if(t>=2.5&&t<3.75)labels(shot.labels,ease((t-2.5)/.3));
 if(t>=5.6&&t<7.5)labels(shot.explodedLabels,ease((t-5.6)/.35));
 if(t>=7.5&&t<13.75)labels([shot.focus]);
 cursor(point(shot.focus),t);
}
function intro(t){
 state.explode=.35+.45*ease(t/5);state.guides=true;stage.model.setSelection(null,false,false);
 stage.render(state,t,1/FPS);const f=framing(lerpBox(box0,box1,state.explode));applyCamera(f,f,0,-t*.075);stage.render(state,t,0);
 ctx.drawImage(stage.renderer.domElement,region.x,region.y,region.w,region.h);softenFloor();
 brandAt();text('HARDWARE, REVEALED',80,256,14,PEACH,400,true);
 ['Inside the','hardware.'].forEach((l,i)=>text(l,76,342+i*82,74,WHITE,550));
 text('A closer look at the things',80,504,23,MUTED);text('that make things work.',80,537,23,MUTED);
 rule(80,647,330);text('6 DEEP DIVES / 16 QUICK CUTS',80,683,14,PEACH,400,true);
 text('Assemble. Explore. Play.',80,998,19,MUTED);
}
function ending(t){
 const a=ease(t/.7)*(1-ease((t-4.1)/.85));ctx.save();ctx.globalAlpha=a;
 ctx.drawImage(brand,909,220,102,102);ctx.textAlign='center';
 function centered(value,y,size,color=WHITE,weight=400,mono=false){ctx.font=`${weight} ${size}px ${mono?'FilmMono':'FilmInter'}`;ctx.fillStyle=color;ctx.fillText(value,960,y);}
 centered('breakboard',410,68,WHITE,550);centered('Keep looking closer.',480,25,MUTED);
 centered('github.com/hckmstrrahul/breakboard',652,22,PEACH,400,true);
 centered('Interactive teardowns of electronic devices & parts',730,18,MUTED);
 ctx.restore();
}
function draw(shot,t,{tile=false}={}){
 ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;ctx.fillStyle=BG;ctx.fillRect(0,0,1920,1080);
 if(shot.kind==='ending'){ending(t);return;}
 if(shot.kind==='opening'){intro(t);if(t<.5){ctx.globalAlpha=1-ease(t/.5);ctx.fillStyle=BG;ctx.fillRect(0,0,1920,1080);ctx.globalAlpha=1;}return;}
 if(shot.kind==='hero'){
  const mode=phases(shot,t);ctx.drawImage(stage.renderer.domElement,region.x,region.y,region.w,region.h);softenFloor();heroOverlay(shot,t,mode);
 }else{
  state.explode=shot.pose||0;state.playing=!!shot.play;state.guides=false;state.xray=false;state.selected=null;state.isolate=false;select(null,false);
  stage.render(state,t,1/FPS);const f=framing(lerpBox(box0,box1,state.explode));applyCamera(f,f,0,-(t+(tile?2.5:0))*.28);stage.render(state,t,0);
  ctx.drawImage(stage.renderer.domElement,region.x,region.y,region.w,region.h);softenFloor();
  if(!tile){text(shot.name,80,91,43,WHITE,500);text(shot.sub,82,132,13,PEACH,400,true);brandAt(1600,79);text(`${String(shot.index+1).padStart(2,'0')} / 16`,1765,1002,16,MUTED,400,true);text('THE WIDER COLLECTION',80,1002,13,MUTED,400,true);}
 }
}
export async function proof(shot,time){await prepare(shot,{width:1920,height:1080});for(let i=0;i<=Math.round(time*FPS);i++)draw(shot,i/FPS);return canvas.toDataURL('image/png').split(',')[1];}
export async function record(shot,{tile=false}={}){
 const width=tile?960:3840,height=tile?540:2160,duration=tile?5:shot.duration;
 await prepare(shot,{width,height,tile});
 const config={codec:tile?'avc1.640028':'avc1.640033',width,height,bitrate:tile?5000000:40000000,framerate:FPS,hardwareAcceleration:'prefer-hardware',latencyMode:'quality',avc:{format:'annexb'}};
 const support=await VideoEncoder.isConfigSupported(config);if(!support.supported)throw Error('Encoder configuration unsupported');
 let error;const chunks=[],encoder=new VideoEncoder({output(chunk){const bytes=new Uint8Array(chunk.byteLength);chunk.copyTo(bytes);chunks.push(bytes);},error(e){error=e;}});encoder.configure(config);
 const proofs={},count=Math.round(duration*FPS),proofFrames=shot.kind==='hero'?[30,90,210,270,345,405,555]:[Math.round(count/2)];
 for(let i=0;i<count;i++){
  draw(shot,i/FPS,{tile});
  if(!tile&&proofFrames.includes(i)){const small=document.createElement('canvas');small.width=1920;small.height=1080;small.getContext('2d').drawImage(canvas,0,0,1920,1080);proofs[i]=small.toDataURL('image/png').split(',')[1];}
  const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/FPS),duration:Math.round(1e6/FPS)});encoder.encode(frame,{keyFrame:i%60===0});frame.close();
  while(encoder.encodeQueueSize>4){await new Promise(r=>setTimeout(r,2));if(error)throw error;}
  if(i%120===0)await window.filmProgress?.({shot:shot.key,tile,frame:i,total:count});
 }
 await encoder.flush();encoder.close();if(error)throw error;
 const base64=await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks));});
 return{h264:base64,proofs,width,height,frames:count};
}
