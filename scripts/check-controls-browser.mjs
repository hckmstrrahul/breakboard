// Run against the Vite development server; BREAKBOARD_URL overrides its URL.
import{chromium}from'playwright';import assert from'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.BREAKBOARD_URL||'http://127.0.0.1:4287');await page.waitForSelector('#loading.done',{state:'attached'});
const ids=await page.evaluate(async()=>{const{BOARD_LIST}=await import('/src/boards.js');return BOARD_LIST.filter(d=>d.controls?.length).map(d=>d.id);});
for(const width of[1440,1280,390,320]){
 await page.setViewportSize({width,height:1100});await page.waitForTimeout(150);
 for(const id of ids){await page.locator(`.device-menu [data-board="${id}"]`).evaluate(e=>e.click());await page.waitForTimeout(100);if(width<801){await page.locator('#mobile-controls').click();await page.waitForTimeout(100);}
  const inputs=page.locator('#device-controls input[type=range]');
  for(const limit of ['min','max']){await inputs.evaluateAll((els,limit)=>els.forEach(el=>{el.value=el[limit];el.dispatchEvent(new Event('input',{bubbles:true}));}),limit);const bad=await page.evaluate(()=>[...document.querySelectorAll('.device-control-meta')].filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.innerText));assert.deepEqual(bad,[],`${id} ${width} ${limit} input copy fits`);}
  assert(await page.locator('.device-readouts >div').count()<=3,id+' essential outputs');assert.equal(await page.locator('#device-controls label').first().evaluate(el=>getComputedStyle(el).fontFamily), '"JetBrains Mono", monospace');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' page overflow');await page.locator('#reset').evaluate(e=>e.click());
 }
}
await page.setViewportSize({width:1440,height:1100});await page.waitForTimeout(150);
for(const id of['labels-toggle','rotate']){const b=page.locator('#'+id);assert((await b.innerText()).trim().length>0);await b.focus();await page.keyboard.press('Space');assert.equal(await b.getAttribute('aria-pressed'),'true');await page.keyboard.press('Space');assert.equal(await b.getAttribute('aria-pressed'),'false');}
await browser.close();assert.deepEqual(errors,[]);console.log(`PASS ${ids.length} device control panels ×4 widths; min/max copy, ≤3 outputs, mono, no page overflow, keyboard text toggles`);
