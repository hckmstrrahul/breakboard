import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium,firefox,webkit} from 'playwright';
import {BOARD_LIST} from '../src/boards.js';

// Run after npm run build. Exercise the actual standalone file, without a server.
const artifact=fileURLToPath(new URL('../dist/breakboard.html',import.meta.url));
await fs.access(artifact);
const engine=process.argv.find(arg=>arg.startsWith('--browser='))?.slice(10)||'chrome';
assert(['chrome','chromium','firefox','webkit'].includes(engine),'supported browser');
const type={chrome:chromium,chromium,firefox,webkit}[engine];
const browser=await type.launch({headless:true,...(engine==='chrome'?{channel:'chrome'}:{}),...(['chrome','chromium'].includes(engine)&&process.platform==='darwin'?{args:['--enable-webgl','--use-angle=metal']}:{} )});
try{
 const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
 await page.route(/^https?:/,route=>route.abort());
 await page.goto(pathToFileURL(artifact).href+'#esp32');
 for(const def of BOARD_LIST){
  await page.evaluate(id=>{location.hash=id;},def.id);
  await page.waitForFunction(title=>document.querySelector('#board-title')?.textContent===title&&document.querySelector('#loading')?.classList.contains('done'),def.tab,{timeout:60000});
  await page.locator('#reset').click();
  assert.equal(await page.locator('#parts-list [data-part]').count(),def.parts.length,def.id+' complete offline inventory');
  assert.equal(await page.locator('#device-controls input').count(),def.controls?.length||0,def.id+' offline inputs');
  for(const control of def.controls||[]){
   const input=page.locator(`#device-input-${control.id}`);
   await input.fill(String(control.max));await input.dispatchEvent('input');
   assert.equal(await input.inputValue(),String(control.max));
   assert((await input.getAttribute('aria-valuetext'))?.length,def.id+' input accessible value');
  }
  await page.locator('#assembled').click();
  await page.locator('#play').click();
  await page.waitForFunction(()=>document.querySelector('#explode-value').textContent==='0%');
  await page.waitForTimeout(100);
  assert.equal((await page.locator('#play').textContent()).trim(),'Pause');
  await page.locator('#play').click();
  await page.locator('#xray').click();assert.equal(await page.locator('#xray').getAttribute('aria-pressed'),'true');
  await page.locator('#parts-list [data-part]').first().click();
  assert.equal(await page.locator('#parts-list [aria-pressed="true"]').count(),1);
  await page.locator('#reset').click();
  for(const control of def.controls||[])assert.equal(await page.locator(`#device-input-${control.id}`).inputValue(),String(control.value),def.id+' reset defaults');
  console.log(`PASS · offline ${def.tab}: inventory, operation, selection, anatomy and reset`);
 }
 for(const theme of ['light','dark']){
  await page.locator(`[data-theme-mode="${theme}"]`).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  const previewCount=await page.evaluate(async()=>{
  const sources=[...new Set([...document.querySelectorAll('img.device-preview')].map(img=>img.src))];
  for(const src of sources){const image=new Image();image.src=src;await image.decode();if(image.naturalWidth!==192||image.naturalHeight!==192)throw Error('Invalid offline preview');}
  return sources.length;
  });
  assert.equal(previewCount,BOARD_LIST.length,'every device has an offline preview in '+theme);
 }
 const downloadReady=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadReady;
 const png=await fs.readFile(await download.path());assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),2400,'offline image export width');
 assert.deepEqual(errors,[],'no offline page errors');assert.deepEqual(network,[],'no HTTP asset requests');
 console.log(`PASS · ${engine} ${await browser.version()}: ${BOARD_LIST.length} devices, theme previews and 2400px PNG export from a network-blocked local HTML file`);
}finally{await browser.close();}
