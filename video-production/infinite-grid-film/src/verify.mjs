import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const run=promisify(execFile),base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(base,'exports-infinite-grid'),review=path.join(base,'review');
const capture=JSON.parse(await fs.readFile(path.join(base,'capture-manifest.json'),'utf8'));
assert.equal(capture.seenFully.length,65);assert.ok(capture.seenExploded.length>20);
const report={models:capture.seenFully.length,fullyExploded:capture.seenExploded.length,files:[],errors:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));await page.goto(pathToFileURL(path.join(out,'preview.html')).href);
 for(const resolution of ['4k','1080p']){
  const file=path.join(out,`breakboard-infinite-grid-${resolution}.mp4`),metadata=JSON.parse((await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file])).stdout),v=metadata.streams.find(s=>s.codec_type==='video'),a=metadata.streams.find(s=>s.codec_type==='audio');
  assert.equal(v.width,resolution==='4k'?3840:1920);assert.equal(v.height,resolution==='4k'?2160:1080);assert.equal(v.avg_frame_rate,'30/1');assert.equal(Number(v.nb_frames),900);assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_transfer,'bt709');assert.equal(a.sample_rate,'48000');assert.equal(a.channels,2);assert.ok(Math.abs(Number(metadata.format.duration)-30)<.05);
  const decoded=await run('ffmpeg',['-v','error','-i',file,'-f','null','-'],{maxBuffer:1024*1024});assert.equal(decoded.stderr,'');
  const loud=await run('ffmpeg',['-hide_banner','-i',file,'-af','loudnorm=I=-18:TP=-1.5:LRA=7:print_format=json','-f','null','-'],{maxBuffer:1024*1024});const audio=JSON.parse(loud.stderr.slice(loud.stderr.lastIndexOf('{'),loud.stderr.lastIndexOf('}')+1));assert.ok(Number(audio.input_i)>-19&&Number(audio.input_i)<-17);assert.ok(Number(audio.input_tp)<-1);
  await page.getByRole('button',{name:resolution==='4k'?'4K':'1080p',exact:true}).click();await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
  const playback=await page.evaluate(async()=>{const v=document.querySelector('video');v.muted=true;v.currentTime=6;await new Promise(r=>v.addEventListener('seeked',r,{once:true}));await v.play();await new Promise(resolve=>{let count=0;function frame(){if(++count===45)resolve();else v.requestVideoFrameCallback(frame)}v.requestVideoFrameCallback(frame)});v.pause();const q=v.getVideoPlaybackQuality();return{time:v.currentTime,dropped:q.droppedVideoFrames,total:q.totalVideoFrames,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null}});
  assert.equal(playback.error,null);assert.ok(playback.time>7);await page.locator('video').screenshot({path:path.join(review,`playback-${resolution}.png`)});
  report.files.push({file:path.basename(file),bytes:(await fs.stat(file)).size,width:v.width,height:v.height,frames:Number(v.nb_frames),duration:Number(metadata.format.duration),videoBitrate:v.bit_rate,audio,playback,sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex')});
 }
 assert.deepEqual(report.errors,[]);report.passed=true;
 await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await fs.writeFile(path.join(out,'SHA256SUMS'),report.files.map(f=>`${f.sha256}  ${f.file}`).join('\n')+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}
