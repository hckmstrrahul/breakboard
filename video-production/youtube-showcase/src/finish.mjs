import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium} from 'playwright';
import {SHOTS,MONTAGE,DURATION} from './storyboard.mjs';
const run=promisify(execFile),base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(base,'../..'),cache=path.join(base,'cache'),out=path.join(base,'exports-youtube');
await fs.mkdir(out,{recursive:true});
const ff=async(args,label)=>{console.log('START',label);await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-y','-hide_banner','-loglevel','warning','-stats_period','10',...args],{stdio:['ignore','ignore','inherit']});p.on('exit',code=>code?reject(Error(label+' exit '+code)):resolve());p.on('error',reject);});console.log('DONE',label);};
const exists=async file=>{try{await fs.access(file);return true;}catch{return false;}};
const font=await fs.readFile(path.join(project,'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({colorScheme:'dark'});
 const overlay=await page.evaluate(async({font,names})=>{
  const face=new FontFace('Film',`url(data:font/woff2;base64,${font})`,{weight:'100 900'});await face.load();document.fonts.add(face);
  const c=document.createElement('canvas');c.width=3840;c.height=2160;const q=c.getContext('2d');
  q.fillStyle='#e5e8ed';q.font='550 40px Film';q.fillText('One collection. Many ways to look closer.',76,72);
  q.textAlign='right';q.fillStyle='#e9aa86';q.font='500 31px Film';q.fillText('breakboard',3765,72);q.textAlign='left';
  names.forEach((name,i)=>{const x=60+(i%4)*940,y=110+Math.floor(i/4)*500;q.fillStyle='#14171c';q.fillRect(x,y+459,888,41);q.fillStyle='#c7cdd5';q.font='400 26px Film';q.fillText(name,x+20,y+489);});
  return c.toDataURL('image/png').split(',')[1];
 },{font:font.toString('base64'),names:MONTAGE.map(m=>m.name)});
 await fs.writeFile(path.join(cache,'collage-overlay.png'),Buffer.from(overlay,'base64'));
}finally{await browser.close();}

const collage=path.join(cache,'23-collage.mp4');
if(!await exists(collage)){
 const inputs=SHOTS.filter(s=>s.kind==='montage').flatMap(s=>['-i',path.join(cache,s.key+'-tile.mp4')]);
 const scale=MONTAGE.map((_,i)=>`[${i}:v]scale=888:500:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[v${i}]`).join(';');
 const names=MONTAGE.map((_,i)=>`[v${i}]`).join(''),layout=MONTAGE.map((_,i)=>`${60+(i%4)*940}_${110+Math.floor(i/4)*500}`).join('|');
 const graph=scale+`;${names}xstack=inputs=16:layout=${layout}:fill=0x14171c, pad=3840:2160:0:0:color=0x14171c[grid];[grid][16:v]overlay=0:0:shortest=1,format=yuv420p[v]`;
 await ff([...inputs,'-loop','1','-i',path.join(cache,'collage-overlay.png'),'-filter_complex',graph,'-map','[v]','-t','5','-r','30','-c:v','libx264','-preset','medium','-crf','17','-profile:v','high','-level:v','5.1','-g','60','-color_primaries','bt709','-color_trc','iec61966-2-1','-colorspace','bt709','-color_range','tv',collage],'rotating collage');
}

// A measured two-pass loudness normalization, retaining the score's dynamics.
const music=path.join(cache,'closer-look-master.wav');
if(!await exists(music)){
 const analysis=await run('ffmpeg',['-hide_banner','-i',path.join(cache,'closer-look-original.wav'),'-af','loudnorm=I=-18:TP=-1.5:LRA=9:print_format=json','-f','null','-'],{maxBuffer:4*1024*1024});
 const json=analysis.stderr.slice(analysis.stderr.lastIndexOf('{'));const values=JSON.parse(json.slice(0,json.indexOf('}')+1));await fs.writeFile(path.join(base,'review','music-analysis.json'),JSON.stringify(values,null,2));
 const f=`loudnorm=I=-18:TP=-1.5:LRA=9:measured_I=${values.input_i}:measured_TP=${values.input_tp}:measured_LRA=${values.input_lra}:measured_thresh=${values.input_thresh}:offset=${values.target_offset}:linear=true:print_format=json`;
 await ff(['-i',path.join(cache,'closer-look-original.wav'),'-af',f,'-ar','48000','-c:a','pcm_s24le',music],'soundtrack master');
}

const concat=path.join(cache,'edit.ffconcat');
await fs.writeFile(concat,'ffconcat version 1.0\n'+SHOTS.map(s=>`file '${path.join(cache,s.key+'.mp4').replaceAll("'","'\\''")}'`).join('\n')+'\n');
const master=path.join(out,'breakboard-inside-the-hardware-4k.mp4');
// Canvas is already display-referred. Preserve those authored code values;
// applying a scene-linear sRGB-to-709 OETF here crushes the dark UI tones.
if(!await exists(master))await ff(['-f','concat','-safe','0','-i',concat,'-i',music,'-map','0:v:0','-map','1:a:0','-vf','setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709','-c:v','libx264','-preset','slow','-crf','18','-maxrate','40M','-bufsize','80M','-profile:v','high','-level:v','5.1','-g','60','-keyint_min','30','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-t',String(DURATION),'-movflags','+faststart','-metadata','title=Inside the Hardware — Breakboard','-metadata','comment=Actual Breakboard models. Explanatory operation and representative hidden structures; see project source notes.',master],'4K master');
const small=path.join(out,'breakboard-inside-the-hardware-1080p.mp4');
if(!await exists(small))await ff(['-i',master,'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','slow','-crf','19','-maxrate','8M','-bufsize','16M','-profile:v','high','-level:v','4.1','-g','60','-keyint_min','30','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',small],'1080p optimized export');
await ff(['-i',music,'-c:a','aac','-b:a','320k','-ar','48000','-metadata','title=Closer Look','-metadata','artist=Breakboard','-movflags','+faststart',path.join(out,'closer-look-original-score.m4a')],'standalone score');
await fs.copyFile(music,path.join(out,'closer-look-original-score.wav'));
await fs.copyFile(path.join(cache,'music-provenance.json'),path.join(out,'music-provenance.json'));
const title='Inside Electronics in 3D — ESP32, Raspberry Pi, HDD & More | 4K';
const description=`Take a closer look inside 22 electronic devices with Breakboard — an interactive collection of 3D hardware teardowns.

Explore six featured devices in assembled, exploded, X-ray and Play modes. Labels track their components; selection ghosts the surrounding assembly, and isolation brings a single part into focus. Then take a quick tour through sixteen more processors, memory packages, displays, sensors and power modules, ending with a rotating collage.

Featured: ESP32 DevKitC V4, Raspberry Pi 5 with Active Cooler, Seagate Barracuda 7200.12 hard drive, Canon EF 50mm f/1.8 STM, a representative hybrid stepper motor, and Adafruit NeoMatrix 8×8.

CHAPTERS
00:00 ESP32 & introduction
00:25 Raspberry Pi 5
00:45 Hard disk drive
01:05 50 mm prime lens
01:25 Hybrid stepper motor
01:45 NeoPixel matrix
02:05 Sixteen more designs & rotating collage

Explore the project and its model documentation:
https://github.com/hckmstrrahul/breakboard

MODEL ACCURACY
These educational models combine published CAD, manufacturer drawings, photographs and explicitly representative cutaways. Hidden structures are not claimed as measured silicon layouts. Motion, electrical paths, light effects and timing are explanatory visualizations. Model-specific revisions, limitations and source references are documented in the project.

Music: “Closer Look” — an original instrumental score synthesized for this video. No external audio samples or commercial recordings were used.

Native 4K · 16:9 · 30 fps · No narration

#Electronics #3DTeardown #RaspberryPi
`;
await fs.writeFile(path.join(out,'youtube-title.txt'),title+'\n');await fs.writeFile(path.join(out,'youtube-description.txt'),description);
await fs.writeFile(path.join(out,'README.md'),`# Finished YouTube exports\n\n- **breakboard-inside-the-hardware-4k.mp4** — native 3840 × 2160, 30 fps, 2:55.\n- **breakboard-inside-the-hardware-1080p.mp4** — optimized 1920 × 1080 version of the same edit.\n- **youtube-title.txt / youtube-description.txt** — upload-ready text and chapters. If uploading only the 1080p version, remove “| 4K” from the title and replace “Native 4K” in the description with “1080p”.\n- **closer-look-original-score.wav / .m4a** — the original standalone soundtrack.\n- **music-provenance.json** — sound source and composition record.\n\nThe production scripts, storyboard, source references and visual review are one folder above. Nothing has been uploaded or published.\n`);
console.log('FINISHED',out);
