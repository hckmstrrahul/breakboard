import './style.css';
import {PARTS as ESP_PARTS,clamp} from './data.js';
import {BOARDS,BOARD_LIST} from './boards.js';
let current=BOARDS.esp32,PARTS=ESP_PARTS;
import {createScene} from './scene.js';
import {createCalloutLayout,calloutVisible,calloutHeight} from './selection.js';
import {mergedSpecifications} from './specifications.js';
import {formatLabel} from './label-text.js';
import {createMobilePanels} from './mobile-panels.js';
import {createDeviceMenu,adjacentDevice} from './device-menu.js';
import {createDeviceOption,setDevicePreviewTheme} from './device-option.js';
import {createThemeController} from './theme.js';
import jetsonCAD from '../public/models/jetson.json.gz?url&inline';
// Ship this CAD with the app so a late fetch cannot strand the Jetson selector.
globalThis.__BREAKBOARD_ASSETS={...globalThis.__BREAKBOARD_ASSETS,jetson:jetsonCAD.split(',')[1]};
import {icons} from './ui-icons.js';
import {socialIcons} from './social-icons.js';
const svg=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||socialIcons[name]||icons.chip}</svg>`;
const app=document.querySelector('#app');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
app.innerHTML=`<div class="shell">
<a class="skip-link" href="#board-title">Skip to device</a>
<header class="topbar"><div class="brand-cluster"><div class="brand"><span class="brandmark" aria-hidden="true"><span class="brand-symbol"></span></span><span>breakboard</span></div><div class="brand-subline"><p>Teardown collection of electronic devices &amp; parts.</p><nav class="brand-links" aria-label="Project links"><a href="https://github.com/hckmstrrahul/breakboard" target="_blank" rel="noopener noreferrer" aria-label="breakboard on GitHub (opens in a new tab)" title="GitHub repository">${svg('github')}</a><a href="https://x.com/hckmstrrahul" target="_blank" rel="noopener noreferrer" aria-label="hckmstrrahul on X (opens in a new tab)" title="@hckmstrrahul on X">${svg('x')}</a></nav></div></div><nav class="board-segments segmented" id="board-segments" aria-label="Devices"></nav><div class="header-actions"><div class="theme-segments segmented" id="theme-segments" role="radiogroup" aria-label="Appearance">${[['light','sun','Light'],['dark','moon','Dark'],['system','system','System']].map(([value,icon,label])=>`<button role="radio" data-theme-mode="${value}" aria-label="${label}" title="${label}" aria-checked="false" tabindex="-1">${svg(icon)}</button>`).join('')}</div><button class="export" id="export" aria-label="Save image" title="Save image">${svg('download')}<span>Save image</span></button></div></header>
<main id="board-panel" aria-labelledby="board-title">
<div class="sidebar"><section class="intro"><h1 id="board-title" tabindex="-1">ESP32</h1><p class="model-name" id="model-name"></p></section>
<details class="parts" id="component-browser" open><summary>Components <span id="parts-count"></span></summary><div class="parts-content"><label class="sr-only" for="parts-search">Find a component</label><div class="search-field">${svg('search')}<input id="parts-search" type="search" placeholder="Find a component…" autocomplete="off"/></div><nav class="parts-list" id="parts-list" aria-label="Components"></nav><div class="empty-search" id="empty-search" hidden><p>No matching components.</p><button id="clear-search">Clear search</button></div></div></details>
</div>
<section class="workspace" aria-label="3D viewer"><div class="assembly-controls" aria-label="Assembly controls"><div class="assembly-options"><div class="assembly-tabs segmented" role="group" aria-label="Assembly view"><button id="assembled" aria-pressed="false">Assembled</button><button id="exploded" aria-pressed="true">Exploded</button></div><div class="inspect-actions"><button id="isolate" aria-pressed="false">${svg('isolate')}<span>Isolate</span></button><button id="xray" aria-pressed="false" title="Anatomy drawing of the modeled structure">${svg('xray')}X-ray</button></div></div><div class="spacing"><div class="spacing-meta"><label for="explode">Separation</label><output for="explode" id="explode-value">78%</output></div><input id="explode" type="range" min="0" max="100" value="78"/></div></div><div class="viewport" id="viewport"><div class="labels" id="labels"></div><div class="loading" id="loading" role="status"><span id="loading-text">Loading model…</span><button id="retry-load" hidden>Retry</button></div><div class="operation-note" id="operation-note" hidden>Illustrative signal flow</div></div>
<div class="tools" aria-label="View controls"><button id="previous-device" class="device-step" aria-label="Previous model" title="Previous model">${svg('arrow')}</button><div class="tool-actions"><button id="play" class="play-button" title="Play device activity (P)">${svg('play')}<span>Play</span></button><button class="cooler-toggle" id="cooler-toggle" aria-pressed="true" hidden>Cooler</button><div class="camera-views segmented" role="group" aria-label="Camera view"><button data-view="perspective" aria-pressed="true">3D</button><button data-view="top" aria-pressed="false">Top</button><button data-view="front" aria-pressed="false">Front</button></div><div class="icon-tools"><button id="labels-toggle" title="Component labels (L)" aria-label="Show component labels" aria-pressed="false">${svg('labels')}</button><button id="rotate" title="Auto rotate" aria-label="Auto rotate" aria-pressed="false">${svg('rotate')}</button><button id="zoom-out" title="Zoom out" aria-label="Zoom out">${svg('minus')}</button><button id="zoom-in" title="Zoom in" aria-label="Zoom in">${svg('plus')}</button><button id="reset" aria-label="Reset view and settings" title="Reset (R)">${svg('reset')}</button><button id="clean" aria-label="Hide interface" title="Hide interface (H)">${svg('expand')}</button></div></div><button id="next-device" class="device-step" aria-label="Next model" title="Next model">${svg('arrow')}</button></div>
</section>
<aside class="inspector" aria-label="Component details"><div class="component-kind" id="component-kind"></div><h2 id="component-name" aria-live="polite"></h2><p class="component-desc" id="component-desc"></p><dl class="specs" id="specs"></dl></aside>
</main><button class="show-ui" id="show-ui">Show interface · H</button><div class="toast" id="toast" role="status"></div>
</div>`;
const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobilePanels=createMobilePanels(BOARD_LIST,id=>switchBoard(id),createDeviceOption);
const deviceMenu=createDeviceMenu($('board-segments'),BOARD_LIST,id=>switchBoard(id),createDeviceOption);
const state={explode:.78,targetExplode:.78,selected:null,isolate:false,xray:false,labels:false,selectionLabel:false,guides:true,rotate:false,view:'perspective',playing:false,clean:false,cooler:true};
let stage,ready=false,labels=[],labelWidth=-1,switchId=0,playbackArmed=false,toastTimer;
const calloutLayout=createCalloutLayout();
document.fonts.ready.then(()=>{labelWidth=-1;});
document.fonts.addEventListener('loadingdone',()=>{labelWidth=-1;});
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
function renderLabels(){
 const shown=PARTS.filter(p=>(state.selected===null||p.id===state.selected)&&(!p.accessory||state.cooler));
 $('labels').classList.toggle('all',state.selected===null);
 $('labels').innerHTML=shown.map(p=>`<svg class="label-leader" aria-hidden="true" style="display:none"><path/><circle r="3.5"/></svg><div class="label" data-label="${p.id}" role="tooltip" style="visibility:hidden" aria-label="${esc(p.name)}"><span class="label-text">${esc(formatLabel(state.selected===null?(p.tag||p.short):p.short))}</span></div>`).join('');
 labels=[...document.querySelectorAll('[data-label]')].map(label=>{const leader=label.previousElementSibling;return{id:label.dataset.label,label,leader,path:leader.querySelector('path'),circle:leader.querySelector('circle'),visible:false,w:0,h:0,minLeader:state.selected!==null||current.id==='uno'?24:8};});
 labelWidth=-1;calloutLayout.reset();
}
function filterParts(){
 const q=$('parts-search').value.trim().toLowerCase();let matches=0;
 for(const b of document.querySelectorAll('[data-part]')){const p=PARTS.find(p=>p.id===b.dataset.part);b.hidden=!!q&&!`${p.name} ${p.kind} ${p.category||''} ${p.specs.flat().join(' ')}`.toLowerCase().includes(q);b.disabled=!!p.accessory&&!state.cooler;if(!b.hidden)matches++;}
 $('empty-search').hidden=matches>0;
}
function detail(id){
 const p=PARTS.find(p=>p.id===id);renderLabels();
 $('component-name').textContent=p?.name||current.tab;$('component-kind').textContent=p?.kind||current.model;$('component-desc').textContent=p?.description||current.description||'';$('component-desc').hidden=!$('component-desc').textContent;
 $('specs').innerHTML=mergedSpecifications(current,p).map(([k,v])=>`<div class="spec"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
 document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===id)));
}
function select(id,anchor=null){if(!ready)return;state.selected=id;state.selectionLabel=id!==null;if(id===null){state.isolate=false;playbackArmed=false;}stage.select(id,state.isolate,state.xray,state.explode,anchor);detail(id);sync();}
try{stage=createScene($('viewport'),(id,anchor)=>select(id,anchor));}catch(error){$('loading-text').textContent='WebGL is unavailable. Enable hardware acceleration and reload.';console.error(error);throw error;}
let preferenceStorage;try{preferenceStorage=localStorage;}catch{}
const appearance=createThemeController({root:document.documentElement,media:matchMedia('(prefers-color-scheme: dark)'),storage:preferenceStorage,onChange:(preference,resolved)=>{
 stage.setTheme(resolved);setDevicePreviewTheme(resolved);document.querySelector('meta[name="theme-color"]').content=resolved==='dark'?'#14171c':'#efeee9';
 for(const button of document.querySelectorAll('[data-theme-mode]')){const active=button.dataset.themeMode===preference;button.setAttribute('aria-checked',String(active));button.tabIndex=active?0:-1;}
}});
$('theme-segments').addEventListener('click',e=>{const button=e.target.closest('[data-theme-mode]');if(button)appearance.set(button.dataset.themeMode);});
$('theme-segments').addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...document.querySelectorAll('[data-theme-mode]')],index=buttons.indexOf(e.target);if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();appearance.set(buttons[next].dataset.themeMode);});
function pressed(id,val){$(id).setAttribute('aria-pressed',String(val));}
function sync(){
 const value=Math.round(state.targetExplode*100);$('explode').value=value;$('explode').style.setProperty('--progress',`${value}%`);$('explode-value').textContent=`${value}%`;
 pressed('assembled',value===0);pressed('exploded',value>0);pressed('isolate',state.isolate);$('isolate').querySelector('span').textContent=state.isolate?'Show all':'Isolate';pressed('xray',state.xray);pressed('labels-toggle',state.labels);pressed('rotate',state.rotate);pressed('cooler-toggle',state.cooler);
 $('isolate').disabled=!ready||!state.selected;
 for(const [id,direction] of [['previous-device',-1],['next-device',1]]){
  const device=adjacentDevice(BOARD_LIST,current.id,direction),button=$(id),label=`${direction<0?'Previous':'Next'} model${device?`: ${device.tab}`:''}`;
  button.disabled=!ready||!device;button.title=label;button.setAttribute('aria-label',label);
 }
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
}
function setExplode(e){if(!ready)return;if(e>0)stopPlayback();if(state.isolate){state.isolate=false;applySelection();}state.targetExplode=clamp(e);sync();}
function setView(view){if(!ready)return;state.view=view;stage.view(view);sync();}
function toggleLabels(){state.labels=!state.labels;state.selectionLabel=false;sync();}
function applySelection(){if(!ready)return;stage.select(state.selected,state.isolate,state.xray,state.explode);sync();}
function toggleXray(){if(!ready)return;state.xray=!state.xray;if(state.xray&&!state.isolate)select(null);else applySelection();}
function reset(){if(!ready)return;stopPlayback();stage.model.operation.reset();Object.assign(state,{targetExplode:current.start,selected:null,isolate:false,xray:false,labels:false,selectionLabel:false,guides:true,rotate:false,view:'perspective',cooler:true});stage.setCooler(true);$('parts-search').value='';filterParts();setClean(false);stage.select(state.selected,false,false,state.explode,null);stage.view('perspective');detail(state.selected);sync();}
function stopPlayback(){
 state.playing=false;playbackArmed=false;$('play').innerHTML=svg('play')+'<span>Play</span>';$('play').title='Play device activity (P)';$('operation-note').hidden=true;
}
function startPlayback(){
 if(!ready)return;state.playing=true;state.targetExplode=0;playbackArmed=state.isolate&&state.explode>.002;
 $('play').innerHTML=svg('pause')+'<span>Pause</span>';$('play').title='Pause device activity (P)';sync();
}
function togglePlayback(){state.playing?stopPlayback():startPlayback();}
function enableModelControls(enabled){for(const el of document.querySelectorAll('.tools button,.assembly-controls button,.assembly-controls input,#export'))el.disabled=!enabled;}
async function switchBoard(id){
 if(!BOARDS[id])return;const token=++switchId;playbackArmed=false;$('operation-note').hidden=true;ready=false;enableModelControls(false);const def=BOARDS[id];
 $('loading-text').textContent=`Loading ${def.tab}…`;$('loading').classList.remove('done');$('retry-load').hidden=true;$('labels').hidden=true;setBoardSegment(id);
 try{
  if(!await stage.setBoard(def)||token!==switchId)return;current=def;PARTS=def.parts;
  // Viewer modes belong to the session; component selection and separation
  // belong to this board. Active playback always starts the new board assembled.
  const explode=state.playing?0:def.start;
  Object.assign(state,{explode,targetExplode:explode,selected:null,isolate:false,selectionLabel:false,guides:true,rotate:false,cooler:true});
  stage.setCooler(true);stage.select(state.selected,false,state.xray,state.explode,null);stage.view(state.view,true);
  $('cooler-toggle').hidden=!def.parts.some(p=>p.accessory);$('parts-search').value='';
  $('operation-note').textContent=def.operationNote||'Illustrative signal flow';
  $('board-title').textContent=def.tab;$('model-name').textContent=def.model;$('parts-count').textContent=PARTS.length;
  $('parts-list').innerHTML=PARTS.map(p=>`<button class="part" data-part="${p.id}" aria-pressed="${p.id===state.selected}"><span>${esc(p.name)}</span>${svg('arrow','arrow')}</button>`).join('');
  renderLabels();filterParts();$('labels').hidden=false;
  document.title='breakboard';history.replaceState(null,'',`#${id}`);ready=true;enableModelControls(true);detail(state.selected);sync();stage.render(state,0);$('loading').classList.add('done');
 }catch(error){if(token!==switchId)return;console.error(error);$('loading-text').textContent=`Could not load ${def.tab}. Retry or choose another device.`;$('retry-load').hidden=false;}
}
function setBoardSegment(id){mobilePanels.setBoard(id);deviceMenu.setDevice(id);}
for(const [id,direction] of [['previous-device',-1],['next-device',1]])$(id).onclick=()=>{if(!ready)return;const device=adjacentDevice(BOARD_LIST,current.id,direction);if(device)switchBoard(device.id);};
$('retry-load').onclick=()=>switchBoard(deviceMenu.selected);
$('parts-search').addEventListener('input',filterParts);$('clear-search').onclick=()=>{$('parts-search').value='';filterParts();$('parts-search').focus();};
$('cooler-toggle').onclick=()=>{if(!ready)return;state.cooler=!state.cooler;stage.setCooler(state.cooler);if(PARTS.find(p=>p.id===state.selected)?.accessory&&!state.cooler)state.selected=null;filterParts();detail(state.selected);applySelection();};
$('parts-list').addEventListener('click',e=>{const b=e.target.closest('[data-part]');if(b&&!b.disabled){select(b.dataset.part);mobilePanels.closeComponents();}});
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>setView(b.dataset.view));
$('explode').addEventListener('input',e=>{setExplode(Number(e.target.value)/100);});$('assembled').onclick=()=>setExplode(0);$('exploded').onclick=()=>setExplode(1);
$('isolate').onclick=()=>{if(!state.selected)return;state.isolate=!state.isolate;applySelection();};$('xray').onclick=toggleXray;$('labels-toggle').onclick=()=>{toggleLabels();};$('rotate').onclick=()=>{state.rotate=!state.rotate;sync();};$('zoom-in').onclick=()=>stage.zoom(1.18);$('zoom-out').onclick=()=>stage.zoom(1/1.18);$('reset').onclick=reset;$('play').onclick=togglePlayback;
$('export').onclick=()=>{if(!ready)return;stage.render(state,0);const link=document.createElement('a');link.download=`${current.id}-${state.isolate?state.selected:state.targetExplode>.01?'exploded':'assembled'}.png`;link.href=stage.snapshot();link.click();toast('Image saved · 2400 px wide');};
function setClean(value){deviceMenu.close();mobilePanels.close();const wasClean=state.clean;state.clean=value;app.querySelector('.shell').classList.toggle('clean',value);for(const el of document.querySelectorAll('.topbar,.sidebar,.inspector,.assembly-controls,.tools,.mobile-panel'))el.inert=value;if(value)$('show-ui').focus();else if(wasClean&&!mobilePanels.focusControls())$('clean').focus();}
$('clean').onclick=()=>setClean(true);$('show-ui').onclick=()=>setClean(false);

addEventListener('keydown',e=>{
 if(e.target.matches('input,select,textarea')||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==='Escape'){stopPlayback();state.isolate=false;state.xray=false;applySelection();if(state.clean)setClean(false);return;}
 if(!['e','l','r','h','p'].includes(e.key.toLowerCase())||e.repeat)return;
 if(e.key.toLowerCase()==='p')togglePlayback();
 if(e.key.toLowerCase()==='e')setExplode(state.targetExplode>0?0:1);if(e.key.toLowerCase()==='l'){toggleLabels();}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='h')setClean(!state.clean);
});
addEventListener('hashchange',()=>{if(BOARDS[location.hash.slice(1)])switchBoard(location.hash.slice(1));});
let previous=performance.now(),frameNo=0,slowFrames=0,lowQuality=false;
function frame(now){
 requestAnimationFrame(frame);const dt=Math.min(.08,(now-previous)/1000);previous=now;if(!ready||document.hidden||!stage.inView)return;

 state.explode=reduced.matches?state.targetExplode:state.explode+(state.targetExplode-state.explode)*(1-Math.exp(-dt*5.4));if(Math.abs(state.explode-state.targetExplode)<.0001)state.explode=state.targetExplode;if(playbackArmed&&state.explode<.002){playbackArmed=false;stage.select(state.selected,true,state.xray,state.explode);}
 stage.render(state,now/1000,dt);$('operation-note').hidden=!state.playing||state.explode>.002||state.isolate||state.xray;
 frameNo++;const size=stage.getSize(),overview=state.selected===null,shown=[];
 // Measure together, only when content, fonts or width change. Hidden labels
 // retain their dimensions, so orbiting cannot resize the viewer beneath them.
 if(labelWidth!==size.w){for(const item of labels){item.w=item.label.offsetWidth;item.h=item.label.offsetHeight;}labelWidth=size.w;calloutLayout.reset();}
 for(const item of labels){
  const {id,label,leader}=item,p=stage.project(id);
  const enabled=(state.labels||(state.selectionLabel&&id===state.selected))&&!(state.isolate&&id!==state.selected)&&!(!overview&&!state.selectionLabel&&!p.picked&&!state.isolate&&state.explode<.18&&((current.hidden||[]).includes(id)||(state.cooler&&(current.hiddenWithAccessories||[]).includes(id))));
  const visible=enabled&&calloutVisible(p,size,item.visible);
  if(item.visible!==visible){label.style.visibility=visible?'visible':'hidden';leader.style.display=visible?'':'none';item.visible=visible;}
  if(visible)shown.push({...item,point:p});
 }
 const labelSpace=overview&&state.labels?calloutHeight(labels,size):0;
 if($('board-panel').style.getPropertyValue('--label-space')!==`${labelSpace}px`)$('board-panel').style.setProperty('--label-space',`${labelSpace}px`);
 const placements=calloutLayout.update(shown,size,dt,{reduced:reduced.matches});
 for(const {id,point:p,label,path,circle}of shown){
  const placement=placements.get(id);
  label.style.transform=`translate(${placement.x}px,${placement.y}px)`;
  path.setAttribute('d',`M ${p.x} ${p.y} L ${placement.endX} ${placement.endY}`);
  circle.setAttribute('cx',p.x);circle.setAttribute('cy',p.y);
 }
 if(!lowQuality&&frameNo>100){slowFrames=dt>.035?slowFrames+1:Math.max(0,slowFrames-1);if(slowFrames>90){stage.renderer.setPixelRatio(1);stage.renderer.shadowMap.enabled=false;lowQuality=true;}}
}
switchBoard(BOARDS[location.hash.slice(1)]?location.hash.slice(1):'esp32');requestAnimationFrame(frame);
