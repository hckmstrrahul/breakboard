import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {SHOTS,DURATION,FPS} from './storyboard.mjs';
const run=promisify(execFile),base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(base,'exports-youtube'),review=path.join(base,'review');
const checks={created:new Date().toISOString(),duration:DURATION,frames:DURATION*FPS,uniqueDevices:new Set(SHOTS.filter(s=>s.id).map(s=>s.id)).size,videos:[],reviewFrames:[]};
const jsonObject=s=>{const start=s.lastIndexOf('{'),j=s.slice(start);return JSON.parse(j.slice(0,j.indexOf('}')+1));};
for(const res of ['4k','1080p']){
 const file=path.join(out,`breakboard-inside-the-hardware-${res}.mp4`);
 const probe=JSON.parse((await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{maxBuffer:2**20})).stdout);
 const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
 const width=res==='4k'?3840:1920,height=res==='4k'?2160:1080;
 if(v.width!==width||v.height!==height||v.avg_frame_rate!=='30/1'||Number(v.nb_frames)!==DURATION*FPS||Math.abs(Number(v.duration)-DURATION)>.01)throw Error('Video shape/timing mismatch '+res);
 if(v.codec_name!=='h264'||v.pix_fmt!=='yuv420p'||v.field_order!=='progressive'||v.color_space!=='bt709'||v.color_primaries!=='bt709'||v.color_transfer!=='bt709')throw Error('Encoding mismatch '+res);
 if(a.codec_name!=='aac'||a.sample_rate!=='48000'||a.channels!==2||Math.abs(Number(a.duration)-DURATION)>.04)throw Error('Audio shape/timing mismatch '+res);
 const decode=await run('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-'],{maxBuffer:2**20});if(decode.stderr.trim())throw Error('Decode error '+decode.stderr);
 const audio=await run('ffmpeg',['-hide_banner','-i',file,'-vn','-af','loudnorm=I=-18:TP=-1.5:LRA=9:print_format=json','-f','null','-'],{maxBuffer:2**20});const loudness=jsonObject(audio.stderr);
 if(Number(loudness.input_tp)>-.8||Math.abs(Number(loudness.input_i)+18)>1)throw Error('Audio level outside target '+res);
 const bytes=await fs.readFile(file);let pos=0,moov=-1,mdat=-1;while(pos+8<bytes.length){const len=bytes.readUInt32BE(pos),kind=bytes.toString('ascii',pos+4,pos+8);if(kind==='moov')moov=pos;if(kind==='mdat')mdat=pos;if(len<8)break;pos+=len;}
 if(moov<0||mdat<0||moov>mdat)throw Error('MP4 fast start missing '+res);
 checks.videos.push({file:path.basename(file),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),video:v,audio:a,loudness,fullDecode:'passed',fastStart:true});
 console.log('VERIFIED',res,v.nb_frames+' frames',loudness.input_i+' LUFS');
}
const source=path.join(out,'breakboard-inside-the-hardware-4k.mp4');
for(const shot of SHOTS){
 const times=shot.kind==='hero'?[1,3,7,9,11.5,13.5,18.5]:shot.kind==='collage'?[.25,2.5,4.75]:[Math.min(2,shot.duration/2)];
 for(const t of times){const name=`final-${shot.key}-${t}.jpg`,target=path.join(review,name);await run('ffmpeg',['-y','-v','error','-ss',String(shot.start+t),'-i',source,'-frames:v','1','-vf','scale=1280:720:flags=lanczos','-q:v','2',target],{maxBuffer:2**20});checks.reviewFrames.push({shot:shot.key,kind:shot.kind,time:shot.start+t,file:name});}
}
// A native-resolution crop check and a convenient upload thumbnail.
await run('ffmpeg',['-y','-v','error','-ss','32','-i',source,'-frames:v','1',path.join(review,'4k-detail.png')]);
await run('ffmpeg',['-y','-v','error','-ss','2','-i',source,'-frames:v','1','-vf','scale=1280:720:flags=lanczos','-q:v','2',path.join(out,'youtube-thumbnail.jpg')]);

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await browser.newPage();
 const groups=[...SHOTS.filter(s=>s.kind==='hero').map(s=>({key:s.key,frames:checks.reviewFrames.filter(f=>f.shot===s.key)})),{key:'montage',frames:checks.reviewFrames.filter(f=>f.kind==='montage')},{key:'opening-collage-ending',frames:checks.reviewFrames.filter(f=>['opening','collage','ending'].includes(f.kind))}];
 for(const group of groups){
  const frames=await Promise.all(group.frames.map(async f=>({...f,data:(await fs.readFile(path.join(review,f.file))).toString('base64')})));
  const png=await p.evaluate(async frames=>{const cols=2,cellW=640,cellH=388,c=document.createElement('canvas');c.width=cols*cellW;c.height=Math.ceil(frames.length/cols)*cellH;const q=c.getContext('2d');q.fillStyle='#252b33';q.fillRect(0,0,c.width,c.height);for(let i=0;i<frames.length;i++){const f=frames[i],im=new Image();im.src='data:image/jpeg;base64,'+f.data;await im.decode();const x=i%cols*cellW,y=Math.floor(i/cols)*cellH;q.drawImage(im,x,y,640,360);q.fillStyle='#e2e5e9';q.font='14px monospace';q.fillText(f.shot+' / '+f.time.toFixed(2)+'s',x+12,y+379);}return c.toDataURL('image/png').split(',')[1];},frames);
  await fs.writeFile(path.join(review,'contact-'+group.key+'.png'),Buffer.from(png,'base64'));
 }
}finally{await browser.close();}
await fs.writeFile(path.join(review,'checks.json'),JSON.stringify(checks,null,2)+'\n');
await fs.writeFile(path.join(out,'checksums.sha256'),checks.videos.map(v=>v.sha256+'  '+v.file).join('\n')+'\n');
await fs.writeFile(path.join(out,'preview.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Breakboard — Inside the hardware</title><style>body{margin:0;background:#14171c;color:#e5e8ed;font:16px system-ui;padding:32px}main{max-width:1280px;margin:auto}h1{font-weight:550}p{color:#aeb6c1;line-height:1.6}video{width:100%;background:#14171c;border-radius:12px}nav{display:flex;gap:24px;flex-wrap:wrap;margin:24px 0}a{color:#e9aa86}button{font:inherit;background:#252b33;color:#e5e8ed;border:1px solid #414a56;border-radius:8px;padding:12px 18px;cursor:pointer}button[aria-pressed=true]{border-color:#e9aa86;color:#e9aa86}</style><main><h1>Inside the hardware</h1><p>Six deep dives. Sixteen quick cuts. Original music. 2:55.</p><video id="film" controls playsinline preload="metadata" poster="youtube-thumbnail.jpg" src="breakboard-inside-the-hardware-1080p.mp4"></video><nav><button data-size="1080p" aria-pressed="true">1080p</button><button data-size="4k" aria-pressed="false">4K</button><a href="youtube-title.txt">YouTube title</a><a href="youtube-description.txt">Description & chapters</a><a href="closer-look-original-score.m4a">Original score</a></nav><p>Native 4K capture; the 1080p version uses the same edit. Model-specific limitations and references are in the production folder.</p></main><script>const v=document.getElementById('film');document.querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=v.currentTime,playing=!v.paused;v.src='breakboard-inside-the-hardware-'+b.dataset.size+'.mp4';v.onloadedmetadata=()=>{v.currentTime=t;if(playing)v.play()};document.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});</script></html>`);
console.log('ALL CHECKS PASSED',checks.reviewFrames.length+' visual review frames',out);
