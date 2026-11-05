import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1120},deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(base,'exports-youtube','preview.html')).href);
 for(const resolution of ['1080p','4k']){
  if(resolution==='4k')await page.getByRole('button',{name:'4K',exact:true}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('video');return v.readyState>=2&&v.duration===175;});
  const data=await page.evaluate(async resolution=>{
   const v=document.querySelector('video');v.muted=true;v.pause();v.currentTime=7.4;
   await new Promise(r=>v.addEventListener('seeked',r,{once:true}));
   await v.play();await new Promise(resolve=>{let frames=0;function frame(){if(++frames===45)resolve();else v.requestVideoFrameCallback(frame);}v.requestVideoFrameCallback(frame);});
   v.pause();const quality=v.getVideoPlaybackQuality();return{resolution,width:v.videoWidth,height:v.videoHeight,duration:v.duration,time:v.currentTime,error:v.error,totalVideoFrames:quality.totalVideoFrames,droppedVideoFrames:quality.droppedVideoFrames};
  },resolution);
  if(data.error||data.time<8.3||data.width!==(resolution==='4k'?3840:1920))throw Error('Browser playback failed '+JSON.stringify(data));
  report.push(data);
 }
 // Inspect the video through the browser's color-managed compositor. A native
 // element screenshot also works for local file URLs, whose canvas is tainted.
 await page.evaluate(async()=>{const v=document.querySelector('video');v.currentTime=32;await new Promise(r=>v.addEventListener('seeked',r,{once:true}));await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
 await page.locator('video').screenshot({path:path.join(base,'review','browser-color-check.png')});
 await page.screenshot({path:path.join(base,'review','preview-browser.png'),fullPage:true});
 await fs.writeFile(path.join(base,'review','playback-check.json'),JSON.stringify(report,null,2));
 console.log('BROWSER PLAYBACK PASSED',JSON.stringify(report));
}finally{await browser.close();}
