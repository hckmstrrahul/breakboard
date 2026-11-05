import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {SHOTS,HEROES} from './storyboard.mjs';
const run=promisify(execFile),dir=path.dirname(fileURLToPath(import.meta.url)),base=path.resolve(dir,'..'),project=path.resolve(base,'../..');
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(','),proof=process.argv.includes('--proof'),force=process.argv.includes('--force');
await fs.mkdir(path.join(base,'cache'),{recursive:true});await fs.mkdir(path.join(base,'review'),{recursive:true});
const server=await createServer({root:project,server:{host:'127.0.0.1',port:0}});await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,colorScheme:'dark',reducedMotion:'no-preference'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>console.error('PAGE CRASH'));
 await page.exposeFunction('filmProgress',p=>console.log(`FRAME ${p.shot}${p.tile?' tile':''} ${p.frame}/${p.total}`));
 await page.route('**/__film',r=>r.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0;background:#14171c"><div id="host" style="width:1345px;height:835px"></div></body></html>'}));
 await page.goto(server.resolvedUrls.local[0]+'__film');
 await page.evaluate(async()=>{window.film=await import('/video-production/youtube-showcase/src/render.mjs');});
 const selected=SHOTS.filter(s=>s.kind!=='collage'&&(!only||only.includes(s.key)));
 for(const shot of selected){
  if(proof){
   for(const t of shot.kind==='hero'?[1,3,7,9,11.5,13.5,18.5]:[2]){
    const png=await page.evaluate(({shot,t})=>film.proof(shot,t),{shot,t});
    await fs.writeFile(path.join(base,'review',`${shot.key}-${t}.png`),Buffer.from(png,'base64'));
    console.log('PROOF',shot.key,t);
   }
   continue;
  }
  for(const tile of shot.kind==='montage'?[false,true]:[false]){
   const name=shot.key+(tile?'-tile':''),target=path.join(base,'cache',name+'.mp4');
   if(!force){try{await fs.access(target);console.log('SKIP',name);continue;}catch{}}
   const start=Date.now();console.log('START',name);
   const result=await page.evaluate(({shot,tile})=>film.record(shot,{tile}),{shot,tile});
   const raw=path.join(base,'cache',name+'.h264');await fs.writeFile(raw,Buffer.from(result.h264,'base64'));
   await run('ffmpeg',['-y','-hide_banner','-loglevel','error','-r','30','-i',raw,'-c:v','copy','-movflags','+faststart',target],{maxBuffer:2**20});await fs.unlink(raw);
   for(const [frame,png]of Object.entries(result.proofs))await fs.writeFile(path.join(base,'review',`${name}-${frame}.png`),Buffer.from(png,'base64'));
   console.log('DONE',name,((Date.now()-start)/1000).toFixed(1)+'s');
  }
  if(errors.length)throw Error(errors.join('\n'));
 }
}finally{await browser.close();await server.close();}
