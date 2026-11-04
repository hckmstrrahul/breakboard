import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';

const project=fileURLToPath(new URL('../',import.meta.url));
const argument=name=>process.argv.find(arg=>arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const requested=argument('ids')?.split(','),gallery=process.argv.includes('--gallery');
const out=path.resolve(argument('out')||(gallery?path.join(project,'docs/images'):path.join(os.tmpdir(),'breakboard-proof/collection')));
const server=await createServer({root:project,server:{host:'127.0.0.1',port:0}});await server.listen();
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:process.platform==='darwin'?['--enable-webgl','--use-angle=metal']:[]});
 const page=await browser.newPage({viewport:{width:1000,height:924},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/__device_proof',route=>route.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0"><div id="host" style="width:1000px;height:924px"></div></body></html>'}));
 await page.goto(server.resolvedUrls.local[0]+'__device_proof');
 const ids=await page.evaluate(async()=>{const{createScene}=await import('/src/scene.js'),{BOARD_LIST}=await import('/src/boards.js');window.proof={stage:createScene(document.getElementById('host'),()=>{}),boards:BOARD_LIST};return BOARD_LIST.map(d=>d.id);});
 if(requested?.some(id=>!ids.includes(id)))throw Error('Unknown proof ID');
 await fs.mkdir(out,{recursive:true});
 for(const id of requested||ids){
  const variants=gallery?[['light','teardown',false,1],['light','anatomy',true,1]]:['light','dark'].flatMap(theme=>[[theme,'assembled',false,0],[theme,'exploded',false,1]]);
  for(const[theme,view,xray,pose]of variants){
   const data=await page.evaluate(async({id,theme,xray,pose,gallery})=>{
    const{stage,boards}=proof,definition=boards.find(b=>b.id===id),explode=gallery&&id==='esp32'?.78:pose;
    await stage.setBoard({...definition,start:explode});stage.setTheme(theme);
    const state={explode,selected:null,isolate:false,xray,guides:!xray,rotate:false,playing:false};
    stage.render(state,0,0);stage.view('perspective',true);stage.render(state,0,0);
    return stage.snapshot().split(',')[1];
   },{id,theme,xray,pose,gallery});
   await fs.writeFile(path.join(out,`${id}-${view}-${theme}.png`),Buffer.from(data,'base64'));
  }
  console.log(`Captured ${id}: ${variants.length} actual-renderer images`);
 }
 if(errors.length)throw Error(errors.join('\n'));
 console.log(`Proofs saved to ${out}; open and inspect the images before marking visual review complete.`);
}finally{await browser?.close();await server.close();}
