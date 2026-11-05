import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {gridDeviceIndex,rebaseScroll} from '../src/collection-layout.js';
const total=65,origin=10000;
for(const cols of [2,3,4,5])for(const row of [0,1,19999,10000,-4]){const top=row*350+25,next=rebaseScroll(top,350,total,origin),newRow=Math.floor(next/350);assert.equal(gridDeviceIndex(row,0,cols,total,origin),gridDeviceIndex(newRow,0,cols,total,origin));assert.equal(next%350,25);}
const server=await createServer({server:{host:'127.0.0.1',port:0}});await server.listen();
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
const review=new URL('../video-production/infinite-grid-film/review/',import.meta.url);await fs.mkdir(review,{recursive:true});
const report={viewports:[],coverage:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000},colorScheme:'dark'});page.on('pageerror',e=>report.errors.push(e.message));await page.goto(server.resolvedUrls.local[0]+'#grid');await page.evaluate(async()=>{window.gridForCheck=(await import('/src/main.js')).grid});
 const diag=()=>page.evaluate(()=>window.gridForCheck.diagnostics);
 const ready=async()=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForFunction(()=>{const d=window.gridForCheck.diagnostics;return d.visible.length>0&&!d.scrolling&&!d.filling&&d.pending===0&&d.visible.every(id=>d.states[id]?.ready);},null,{timeout:90000});};
 const jump=async row=>{await page.mouse.move(5,5);await page.evaluate(row=>{const el=document.querySelector('.collection-scroll'),tile=document.querySelector('.collection-tile');el.scrollTop=(10000+row)*parseFloat(tile.style.height)},row);await ready();};
 await ready();assert.equal((await diag()).columns,5);const idle=await diag();await page.waitForTimeout(450);assert.equal((await diag()).frames,0);assert.deepEqual(idle.loaded,[],'Idle images do not build any grid models');assert.ok(Object.values(idle.states).every(s=>s.pose===0&&s.angle===0));
 // Reproduce the reported GaN hover: the tile must stay transparent and its
 // own painted canvas must change while adjacent models remain stationary.
 await jump(3);const gan=page.locator('.collection-tile[data-device="gan"]'),model=gan.locator('canvas'),staticImage=gan.locator('img');const before=await staticImage.evaluate(c=>c.currentSrc);assert.equal(await model.evaluate(c=>getComputedStyle(c).visibility),'hidden');await gan.hover();
 await page.waitForFunction(()=>{const d=window.gridForCheck.diagnostics;return d.states.gan.pose>.98&&d.states.gan.angle>.05});
 assert.equal(await gan.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');assert.equal(await model.evaluate(c=>getComputedStyle(c).visibility),'visible');assert.ok(await model.evaluate(c=>c.width>0));assert.ok(Object.entries((await diag()).states).every(([id,s])=>id==='gan'||(s.pose===0&&s.angle===0)));
 await page.screenshot({path:new URL('grid-hover-gan.png',review).pathname});
 await page.mouse.move(5,5);await page.waitForFunction(()=>{const s=window.gridForCheck.diagnostics.states.gan;return s.pose===0&&s.angle===0});assert.equal(await staticImage.evaluate(c=>c.currentSrc),before);assert.equal(await staticImage.evaluate(c=>getComputedStyle(c).visibility),'visible');assert.equal(await model.evaluate(c=>getComputedStyle(c).visibility),'hidden');
 await gan.click();await page.waitForFunction(()=>document.querySelector('#board-title').textContent==='GaN charger'&&document.querySelector('#loading.done'));assert.equal((await diag()).active,false);assert.equal(await page.locator('#board-panel').isVisible(),true);
 await page.locator('#collection-toggle').click();await page.mouse.move(5,5);await ready();
 await jump(0);const tile=page.locator('.collection-tile[data-device="esp32"]');await tile.focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator(':focus').getAttribute('data-device'),'hdd');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#board-title').textContent==='Barracuda HDD'&&document.querySelector('#loading.done'));assert.equal((await diag()).active,false);
 await page.locator('#collection-toggle').click();await page.mouse.move(5,5);await ready();
 const seen=new Set(),idleFrames=(await diag()).frames;for(let row=0;row<15;row+=2){await jump(row);const d=await diag();d.visible.forEach(id=>seen.add(id));assert.ok(d.loaded.length<=4);assert.equal(d.frames,idleFrames,'Scrolling does not render idle models');assert.equal(d.contextLost,false);}assert.equal(seen.size,65);report.coverage=[...seen];
 // During native wheel scrolling, the final image and caption travel together.
 // No thumbnail-to-canvas swap or 3D work occurs after scrolling settles.
 await jump(3);await page.mouse.move(1550,700);
 for(const delta of [190,310,470,-240,-510,-220]){
  await page.mouse.wheel(0,delta);
  const checks=await page.evaluate(async()=>{const samples=[];for(let i=0;i<3;i++){await new Promise(requestAnimationFrame);samples.push([...document.querySelectorAll('.collection-tile[data-ready="true"]')].every(t=>{const image=t.querySelector('img'),a=t.getBoundingClientRect(),b=image.getBoundingClientRect();return image.complete&&image.naturalWidth>0&&Math.abs(b.top-a.top-13)<.1&&getComputedStyle(image).visibility==='visible'&&getComputedStyle(t.querySelector('canvas')).visibility==='hidden'}));}return samples});assert.ok(checks.every(Boolean));
 }
 await page.mouse.move(5,5);await ready();assert.equal((await diag()).preview,null);assert.ok(Object.values((await diag()).states).every(s=>s.pose===0&&s.angle===0));
 await page.screenshot({path:new URL('grid-scroll-settled.png',review).pathname});
 await page.evaluate(()=>{document.querySelector('.collection-scroll').scrollTop=0});await ready();assert.ok((await diag()).scrollTop>1000000);
 for(const [width,height]of [[1200,900],[900,900],[390,844],[768,1024]]){await page.setViewportSize({width,height});await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);report.viewports.push({width,height,columns:(await diag()).columns});if(width===390)await page.screenshot({path:new URL('grid-static-mobile.png',review).pathname});}
 await page.getByRole('radio',{name:'Light',exact:true}).click();await ready();await page.screenshot({path:new URL('grid-static-light.png',review).pathname});
 await page.emulateMedia({reducedMotion:'reduce'});const id=(await diag()).visible[2],reducedTile=page.locator(`.collection-tile[data-device="${id}"]`);await reducedTile.hover();await page.waitForFunction(id=>window.gridForCheck.diagnostics.states[id].pose===1,id);const still=(await diag()).states[id].angle;await page.waitForTimeout(300);assert.equal((await diag()).states[id].angle,still);await page.mouse.move(5,5);
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});touch.on('pageerror',e=>report.errors.push(e.message));await touch.goto(server.resolvedUrls.local[0]+'#grid');await touch.locator('.collection-tile[data-device="esp32"]').tap();await touch.waitForFunction(()=>!document.body.classList.contains('collection-active')&&document.querySelector('#board-title').textContent==='ESP32');await touch.close();
 assert.deepEqual(report.errors,[]);report.passed=true;await fs.writeFile(new URL('grid-hover-check.json',review),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await server.close()}
