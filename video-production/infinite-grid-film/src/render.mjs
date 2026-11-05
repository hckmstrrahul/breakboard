import {BOARD_LIST} from '/src/boards.js';
import {createCollectionRenderer} from '/src/collection-renderer.js';
import {collectionOrder,wrap} from '/src/collection-layout.js';
import jetsonCAD from '/public/models/jetson.json.gz?url&inline';
globalThis.__BREAKBOARD_ASSETS={...globalThis.__BREAKBOARD_ASSETS,jetson:jetsonCAD.split(',')[1]};
export const DURATION=30,FPS=30;
const order=collectionOrder(BOARD_LIST),W=1920,H=1080,COLS=5,CELL=384,ROW=350,SPEED=160;
const source=document.createElement('canvas'),canvas=document.createElement('canvas');canvas.width=W*2;canvas.height=H*2;document.body.append(canvas);canvas.style.width='100vw';
const ctx=canvas.getContext('2d',{alpha:false}),engine=createCollectionRenderer(source,{boards:order,pixelRatio:2,capacity:25});engine.resize(W,H,2);engine.setTheme('dark');
const font=new FontFace('FilmInter','url(/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2)',{weight:'100 900'});await font.load();document.fonts.add(font);
const brand=new Image();brand.src='/src/brand.svg';await brand.decode();
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const seen=new Set(),exploded=new Set();
function tilesAt(t){
 const scroll=t*SPEED,first=Math.floor(scroll/ROW)-1,last=Math.ceil((scroll+H)/ROW),tiles=[];
 for(let row=first;row<=last;row++)for(let col=0;col<COLS;col++){
  const index=row*COLS+col,id=order[wrap(index,order.length)].id,y=row*ROW-scroll;
  if(y+ROW<0||y>H)continue;
  // Stable pseudo-random choice, delayed until the tile is inside the frame.
  const seed=wrap(index*37+11,101),age=(scroll-row*ROW+H-ROW*.55)/SPEED;
  const selected=seed%5<3,start=1.0+(seed%7)*.09;
  const pose=selected?ease((age-start)/.95)*(1-ease((age-start-2.35)/.95)):0;
  tiles.push({id,index,name:order[wrap(index,order.length)].tab,rect:{x:col*CELL+16,y:y+8,w:CELL-32,h:ROW-44},explode:pose,angle:t*.29+seed*.025,labelY:y+ROW-19});
 }
 return tiles;
}
export async function draw(t){
 const tiles=tilesAt(t),ids=tiles.map(x=>x.id);engine.protect(ids);await Promise.all(ids.map(id=>engine.load(id)));engine.render(tiles);
 ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(source,0,0);ctx.scale(2,2);
 ctx.font='400 12px FilmInter';ctx.textAlign='center';ctx.textBaseline='alphabetic';
 for(const tile of tiles){ctx.fillStyle=tile.explode>.1?'#d7ab92':'#8c959f';ctx.fillText(tile.name,tile.rect.x+tile.rect.w/2,tile.labelY);if(tile.rect.y>0&&tile.rect.y+tile.rect.h<H){seen.add(tile.id);if(tile.explode>.9)exploded.add(tile.id);}}
 // Soft edge vignette keeps incoming/outgoing rows quiet, without cuts.
 for(const bottom of [false,true]){const g=ctx.createLinearGradient(0,bottom?H-72:0,0,bottom?H:72);g.addColorStop(0,bottom?'#14171c00':'#14171ccc');g.addColorStop(1,bottom?'#14171ccc':'#14171c00');ctx.fillStyle=g;ctx.fillRect(0,bottom?H-72:0,W,72);}
 ctx.fillStyle='#14171ce8';ctx.beginPath();ctx.roundRect(24,22,186,49,24);ctx.fill();ctx.drawImage(brand,39,32,28,28);ctx.font='600 18px FilmInter';ctx.textAlign='left';ctx.fillStyle='#e5e8ed';ctx.fillText('breakboard',77,53);
 const fade=1-ease(t/.45)+ease((t-(DURATION-1))/1);if(fade>0){ctx.fillStyle=`rgba(20,23,28,${clamp(fade)})`;ctx.fillRect(0,0,W,H);}
 return canvas;
}
export async function proof(t){await draw(t);return canvas.toDataURL('image/png').split(',')[1];}
export async function record(){
 const chunks=[],proofs={},encoder=new VideoEncoder({output:chunk=>{const bytes=new Uint8Array(chunk.byteLength);chunk.copyTo(bytes);chunks.push(bytes);},error:e=>{throw e;}});
 encoder.configure({codec:'avc1.640033',width:W*2,height:H*2,bitrate:40000000,framerate:FPS,hardwareAcceleration:'prefer-hardware',latencyMode:'quality',avc:{format:'annexb'}});
 for(let i=0;i<DURATION*FPS;i++){
  await draw(i/FPS);const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/FPS),duration:Math.round(1e6/FPS)});encoder.encode(frame,{keyFrame:i%60===0});frame.close();
  while(encoder.encodeQueueSize>4)await new Promise(r=>setTimeout(r,2));
  if([30,120,240,360,480,600,720,840].includes(i))proofs[i]=canvas.toDataURL('image/png').split(',')[1];
  if(i%90===0)await window.filmProgress?.({frame:i,total:DURATION*FPS});
 }
 await encoder.flush();encoder.close();
 const h264=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks));});
 return{h264,proofs,manifest:{duration:DURATION,fps:FPS,width:W*2,height:H*2,models:order.map(d=>({id:d.id,name:d.tab})),seenFully:[...seen],seenExploded:[...exploded],renderer:engine.diagnostics}};
}
