import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {chromium} from 'playwright';
import {createServer} from 'vite';
const run=promisify(execFile),base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=path.resolve(base,'../..');
await fs.mkdir(path.join(base,'cache'),{recursive:true});await fs.mkdir(path.join(base,'review'),{recursive:true});
const server=await createServer({root:project,server:{host:'127.0.0.1',port:0}});await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080},colorScheme:'dark'}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack)});await page.exposeFunction('filmProgress',p=>console.log('FRAME',p.frame,'/',p.total));
 await page.route('**/__gridfilm',r=>r.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0;background:#14171c"></body></html>'}));await page.goto(server.resolvedUrls.local[0]+'__gridfilm');
 await page.evaluate(async()=>{window.film=await import('/video-production/infinite-grid-film/src/render.mjs')});
 if(process.argv.includes('--proof')){
  for(const t of [1,4,12,24]){const png=await page.evaluate(t=>film.proof(t),t);await fs.writeFile(path.join(base,'review',`proof-${t}.png`),Buffer.from(png,'base64'));console.log('PROOF',t);}
 }else{
  const result=await page.evaluate(()=>film.record());if(result.manifest.seenFully.length!==65)throw Error('Not all models appeared fully: '+result.manifest.seenFully.length);
  const raw=path.join(base,'cache','grid-native.h264');await fs.writeFile(raw,Buffer.from(result.h264,'base64'));
  await run('ffmpeg',['-y','-hide_banner','-loglevel','error','-r','30','-i',raw,'-c:v','copy','-movflags','+faststart',path.join(base,'cache','grid-native.mp4')]);await fs.unlink(raw);
  for(const [frame,png]of Object.entries(result.proofs))await fs.writeFile(path.join(base,'review',`frame-${frame}.png`),Buffer.from(png,'base64'));
  await fs.writeFile(path.join(base,'capture-manifest.json'),JSON.stringify(result.manifest,null,2)+'\n');console.log('CAPTURE COMPLETE',result.manifest.seenFully.length,'models,',result.manifest.seenExploded.length,'exploded');
 }
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();await server.close()}
