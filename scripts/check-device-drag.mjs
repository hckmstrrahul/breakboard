import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),server:{host:'127.0.0.1',port:0}});await server.listen();
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=metal']});
 const page=await browser.newPage({viewport:{width:1000,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/__drag_gate',route=>route.fulfill({contentType:'text/html',body:'<html data-theme="dark"><body style="margin:0"><div id="host" style="width:1000px;height:800px"></div><div id="fields"></div></body></html>'}));
 await page.goto(server.resolvedUrls.local[0]+'__drag_gate');
 await page.evaluate(async()=>{
  const T=await import('/node_modules/three/build/three.module.js'),{createScene}=await import('/src/scene.js'),{createDeviceControls}=await import('/src/device-controls.js'),{QI2_BOARD}=await import('/src/qi2.js');
  const state={explode:0,selected:null,isolate:false,xray:false,guides:false,rotate:false,playing:false};
  const stage=createScene(document.getElementById('host'),(id,anchor)=>{state.selected=id;stage.select(id,false,false,0,anchor);});await stage.setBoard(QI2_BOARD);
  const ui=createDeviceControls(document.getElementById('fields'),()=>stage.model);ui.bind(QI2_BOARD);
  window.gate={T,stage,state,ui,screen(x,y,z){const p=new T.Vector3(x,y,z).project(stage.camera);return{x:(p.x*.5+.5)*1000,y:(.5-p.y*.5)*800};},values:()=>stage.model.behavior.drag.getValues(),camera:()=>[...stage.camera.position.toArray(),...stage.controls.target.toArray()],receivers:()=>Object.fromEntries(stage.model.behavior.drag.partIds.map(id=>[id,stage.model.groups[id].children.find(c=>c.userData.dynamic).position.toArray()]))};
  function tick(){stage.render(state,0,0);ui.refresh();requestAnimationFrame(tick);}tick();
 });
 const start=await page.evaluate(()=>({point:gate.screen(16,5.85,43),camera:gate.camera(),receivers:gate.receivers()}));
 const end=await page.evaluate(()=>gate.screen(26,5.85,51));
 await page.mouse.move(start.point.x,start.point.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.waitForTimeout(120);
 const dragged=await page.evaluate(()=>({values:gate.values(),camera:gate.camera(),receivers:gate.receivers(),enabled:gate.stage.controls.enabled,inputs:[...document.querySelectorAll('input')].map(e=>[e.dataset.control,+e.value])}));
 assert.equal(dragged.enabled,false,'receiver drag owns the gesture');assert.deepEqual(dragged.camera,start.camera,'dragging receiver does not orbit');
 assert(Math.abs(dragged.values.offsetX-10)<.7&&Math.abs(dragged.values.offsetZ-8)<.7,'planar drag follows pointer without a grab-position jump');
 for(const id of Object.keys(dragged.receivers)){const [x,y,z]=dragged.receivers[id];assert(Math.abs(x-dragged.values.offsetX)<1e-6&&Math.abs(z-dragged.values.offsetZ)<1e-6&&y===0,id+' translates with the receiver');}
 const inputs=Object.fromEntries(dragged.inputs);assert(Math.abs(inputs.offsetX-dragged.values.offsetX)<=.26&&Math.abs(inputs.offsetZ-dragged.values.offsetZ)<=.26,'keyboard sliders follow dragged values');
 await page.mouse.up();assert(await page.evaluate(()=>gate.stage.controls.enabled),'orbit restored after release');
 // A tap still selects a component and does not alter its displacement.
 let tap=await page.evaluate(()=>gate.screen(16+gate.values().offsetX,5.85,43+gate.values().offsetZ));await page.mouse.click(tap.x,tap.y);
 assert(await page.evaluate(()=>gate.stage.model.behavior.drag.partIds.includes(gate.state.selected)),'tap preserves component selection');
 const beforeCancel=await page.evaluate(()=>gate.values());await page.mouse.move(tap.x,tap.y);await page.mouse.down();await page.keyboard.press('Escape');await page.mouse.up();
 assert(await page.evaluate(()=>gate.stage.controls.enabled),'Escape restores orbit');assert.deepEqual(await page.evaluate(()=>gate.values()),beforeCancel,'Escape does not snap the receiver');
 // Reset and explicit camera changes end the gesture before remapping pixels.
 await page.mouse.move(tap.x,tap.y);await page.mouse.down();
 await page.evaluate(()=>{gate.stage.model.behavior.reset();gate.stage.view('perspective',true);});
 await page.mouse.move(tap.x+8,tap.y+8);await page.mouse.up();
 assert(await page.evaluate(()=>gate.stage.controls.enabled),'view reset restores orbit');
 assert.deepEqual(await page.evaluate(()=>gate.values()),{offsetX:0,offsetZ:0,gap:0},'reset cannot be undone by the old grab');
 tap=await page.evaluate(()=>gate.screen(16,5.85,43));
 await page.mouse.move(tap.x,tap.y);await page.mouse.down();await page.keyboard.press('ArrowRight');
 await page.mouse.move(tap.x+8,tap.y+8);await page.mouse.up();
 assert(await page.evaluate(()=>gate.stage.controls.enabled),'keyboard orbit cancels dragging');
 assert.deepEqual(await page.evaluate(()=>gate.values()),{offsetX:0,offsetZ:0,gap:0},'keyboard orbit cannot remap the old grab');
 await page.evaluate(()=>gate.stage.view('perspective',true));tap=await page.evaluate(()=>gate.screen(16,5.85,43));
 // Separation cancels an active drag and restores the receiver assembly pose.
 await page.mouse.move(tap.x,tap.y);await page.mouse.down();await page.evaluate(()=>gate.state.explode=.5);await page.waitForTimeout(100);await page.mouse.up();
 assert(await page.evaluate(()=>gate.stage.controls.enabled),'separation cancels dragging');
 assert.deepEqual(await page.evaluate(()=>Object.values(gate.receivers())),Array(5).fill([0,0,0]),'explosion keeps source assembly coordinates');
 // Empty canvas dragging must still orbit normally.
 const beforeOrbit=await page.evaluate(()=>gate.camera());await page.mouse.move(60,60);await page.mouse.down();await page.mouse.move(160,110,{steps:8});await page.mouse.up();
 assert.notDeepEqual(await page.evaluate(()=>gate.camera()),beforeOrbit,'empty space still orbits');
 assert.deepEqual(errors,[]);console.log('PASS Qi2 planar drag, coupled receiver layers, slider synchronization, tap selection, Escape, reset, keyboard camera changes, separation and normal orbit');
}finally{await browser?.close();await server.close();}
