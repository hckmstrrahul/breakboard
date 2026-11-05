import './infinite-grid.css';
import {createCollectionRenderer} from './collection-renderer.js';
import {collectionOrder,gridColumns,gridDeviceIndex,rebaseScroll,wrap} from './collection-layout.js';
import previews from './grid-previews/index.js';

const ORIGIN=10000,ROWS=20000;
export function createInfiniteGrid(host,boards,onOpen){
 const order=collectionOrder(boards),reduced=matchMedia('(prefers-reduced-motion: reduce)'),hover=matchMedia('(hover: hover) and (pointer: fine)');
 host.className='collection-view';host.hidden=true;host.setAttribute('aria-label','Infinite device collection');
 host.innerHTML=`<div class="collection-topline"><p>${order.length} objects</p><div class="collection-toolbar"><p class="collection-hint"></p><label class="collection-density" for="collection-density"><span>Density</span><input id="collection-density" type="range" min="2" max="8" step="1" value="5"/><output for="collection-density" aria-hidden="true">5</output></label></div></div><div class="collection-scroll" tabindex="0" role="region" aria-label="Device grid. Scroll to explore. Use arrow keys between models; Enter opens the full device view."><div class="collection-plane"></div></div>`;
 const scroll=host.querySelector('.collection-scroll'),plane=host.querySelector('.collection-plane'),hint=host.querySelector('.collection-hint'),densityInput=host.querySelector('#collection-density'),densityValue=host.querySelector('.collection-density output');
 let densityPreference=null,densityFrame=0,captionSpace=72;
 try{const saved=Number(localStorage.getItem('breakboard-grid-columns'));if(Number.isInteger(saved)&&saved>=1&&saved<=8)densityPreference=saved;}catch{}
 const cards=new Map(),failed=new Set(),pixelRatio=Math.min(devicePixelRatio,2);
 let engine,active=false,width=0,height=0,columns=0,rowHeight=0,cellWidth=0,offset=0,raf=0,previous=0,lastDraw=0,theme=document.documentElement.dataset.theme||'light';
 let pointerIndex=null,focusIndexValue=null,scrolling=false,scrollTimer=0,filling=false,revision=0,fillRequested=false,paintedFrames=0,visible=[];
 const updateHint=()=>{hint.textContent=hover.matches?'Hover to explore · Click to open':'Tap a model to open';};updateHint();hover.addEventListener('change',updateHint);
 function currentIndex(){return pointerIndex??focusIndexValue;}
 function schedule(){if(active&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
 function changePreview(){for(const [index,card]of cards)card.button.dataset.previewing=String(index===currentIndex());previous=0;schedule();fill();}
 function resetCard(card){card.pose=card.angle=0;card.live=false;card.button.dataset.live='false';card.canvas.width=0;}
 function resetPreviews(){pointerIndex=focusIndexValue=null;for(const card of cards.values()){resetCard(card);card.button.dataset.previewing='false';}}
 function setImage(card){
  const sources=previews[card.id][theme];card.ready=false;card.button.dataset.ready='false';
  card.image.sizes=`${Math.ceil(Math.min(cellWidth-24,rowHeight-captionSpace))}px`;
  card.image.srcset=`${sources.small} 768w, ${sources.large} 2048w`;card.image.src=sources.small;
  if(card.image.complete&&card.image.naturalWidth){card.ready=true;card.button.dataset.ready='true';}
 }
 function ensureEngine(){
  if(engine)return;
  engine=createCollectionRenderer(document.createElement('canvas'),{boards:order,pixelRatio,capacity:4,squareFraming:true});
  engine.setTheme(theme);engine.resize(cellWidth-24,rowHeight-captionSpace,pixelRatio);
 }
 function paint(card,source){
  if(!source||!cards.has(card.index))return;
  if(card.canvas.width!==source.width||card.canvas.height!==source.height){card.canvas.width=source.width;card.canvas.height=source.height;}
  card.context.drawImage(source,0,0);card.button.dataset.live='true';
 }
 function renderCard(card,pose=0,angle=0){
  engine.render([{id:card.id,rect:{x:0,y:0,w:cellWidth-24,h:rowHeight-captionSpace},explode:pose,angle}]);paint(card,engine.renderer.domElement);paintedFrames++;
 }
 function makeCard(index){
  const def=order[wrap(index,order.length)],button=document.createElement('button');button.type='button';button.className='collection-tile';button.dataset.index=index;button.dataset.device=def.id;button.setAttribute('aria-label',`Open ${def.tab}`);
  const preview=document.createElement('img');preview.loading='eager';preview.decoding='async';preview.alt='';preview.width=preview.height=2048;preview.className='collection-image';
  const canvas=document.createElement('canvas');canvas.width=0;canvas.className='collection-model';canvas.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='collection-tile-name';name.textContent=def.tab;button.append(preview,canvas,name);
  const card={id:def.id,index,button,image:preview,canvas,context:canvas.getContext('2d',{alpha:false}),ready:false,pose:0,angle:0,live:false};cards.set(index,card);plane.append(button);
  preview.onload=()=>{if(cards.has(index)){card.ready=true;button.dataset.ready='true';}};
  setImage(card);
  const enter=e=>{if(e.pointerType==='touch'||!hover.matches||scrolling||pointerIndex===index)return;pointerIndex=index;changePreview();};
  button.addEventListener('pointerenter',enter);button.addEventListener('pointermove',enter);
  button.addEventListener('pointerleave',()=>{if(pointerIndex===index){pointerIndex=null;changePreview();}});
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible')){focusIndexValue=index;changePreview();}});
  button.addEventListener('blur',()=>{if(focusIndexValue===index){focusIndexValue=null;changePreview();}});
  button.onclick=()=>onOpen(def.id);
  button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();focusTile(index+(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='ArrowUp'?-columns:columns));});
  return card;
 }
 function focusTile(index){const row=ORIGIN+Math.floor((index-offset)/columns),top=row*rowHeight;if(top<scroll.scrollTop||top+rowHeight>scroll.scrollTop+height)scroll.scrollTop=top-height/2+rowHeight/2;layout();cards.get(index)?.button.focus({preventScroll:true});}
 function removeCard(index,card){card.button.remove();card.canvas.width=0;cards.delete(index);if(pointerIndex===index)pointerIndex=null;if(focusIndexValue===index)focusIndexValue=null;}
 function layout(){
  if(!active||!rowHeight)return;
  const top=scroll.scrollTop,first=Math.floor(top/rowHeight)-2,last=Math.floor((top+height)/rowHeight)+2,needed=new Set();visible=[];
  for(let row=first;row<=last;row++)for(let col=0;col<columns;col++){
   const index=(row-ORIGIN)*columns+col+offset;needed.add(index);const card=cards.get(index)||makeCard(index);
   card.button.style.transform=`translate(${col*cellWidth}px,${row*rowHeight}px)`;card.button.style.width=cellWidth+'px';card.button.style.height=rowHeight+'px';
   const y=row*rowHeight-top;if(y+rowHeight>0&&y<height)visible.push(card);
  }
  for(const [index,card]of cards)if(!needed.has(index))removeCard(index,card);
  fill();
 }
 async function fill(){
  fillRequested=true;if(filling||!active||scrolling||document.hidden||currentIndex()===null)return;filling=true;
  try{
   while(active&&!scrolling&&!document.hidden){
    fillRequested=false;
    const card=cards.get(currentIndex());
    if(!card||failed.has(card.id))break;
    const generation=revision,id=card.id;
    try{
     ensureEngine();engine.protect([id,...visible.filter(c=>c.live&&c.id!==id).slice(-3).map(c=>c.id)]);
     if(engine.has(id)){schedule();break;}
     await engine.load(id);
     if(!active||generation!==revision||!engine.has(id))continue;
     // Keep the final assembled image visible until the hover model is ready.
     // Static scrolling never queues a model build or replaces an idle image.
     if(currentIndex()!==null)schedule();
    }catch{failed.add(id);}
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }finally{filling=false;if(fillRequested&&active&&!scrolling&&!document.hidden&&currentIndex()!==null)queueMicrotask(fill);}
 }
 function frame(now){
  raf=0;if(!active||document.hidden||scrolling||!engine)return;
  if(now-lastDraw<1000/30){schedule();return;}
  const dt=previous?Math.min(.06,(now-previous)/1000):1/60;previous=now;lastDraw=now;
  let moving=false;const selected=currentIndex();
  for(const card of visible){
   const targeted=card.index===selected,target=targeted?1:0;
   if(!engine.has(card.id)){if(targeted)fill();else if(card.live)resetCard(card);continue;}
   if(!targeted&&!card.live)continue;
   card.pose=reduced.matches?target:card.pose+(target-card.pose)*(1-Math.exp(-dt*8));
   if(targeted&&!reduced.matches)card.angle+=dt*.45;else if(!targeted)card.angle*=Math.exp(-dt*10);
   if(!targeted&&card.pose<.001&&Math.abs(card.angle)<.001){resetCard(card);continue;}
   if(targeted&&Math.abs(card.pose-1)<.001)card.pose=1;
   card.live=true;renderCard(card,card.pose,card.angle);
   if(!reduced.matches||card.pose!==target)moving=true;
  }
  if(moving)schedule();
 }
 function resize(){
  if(!active)return;const w=scroll.clientWidth,h=scroll.clientHeight;if(!w||!h)return;
  const minimum=w<600?1:2,maximum=Math.min(8,Math.max(2,Math.floor(w/118))),nextColumns=Math.max(minimum,Math.min(maximum,densityPreference??gridColumns(w))),oldTop=columns?Math.floor(scroll.scrollTop/rowHeight):ORIGIN,first=columns?gridDeviceIndex(oldTop,0,columns,order.length,ORIGIN,offset):0;
  width=w;height=h;densityInput.min=minimum;densityInput.max=maximum;densityInput.value=nextColumns;densityValue.value=nextColumns;densityInput.setAttribute('aria-valuetext',`${nextColumns} columns`);densityInput.style.setProperty('--progress',`${(nextColumns-minimum)/(maximum-minimum)*100}%`);
  if(columns!==nextColumns||cellWidth!==width/nextColumns){
   revision++;resetPreviews();columns=nextColumns;cellWidth=width/columns;rowHeight=Math.round(Math.max(180,cellWidth*(width<600?1.14:1.03)));captionSpace=cellWidth<200?88:72;host.style.setProperty('--collection-caption-space',captionSpace+'px');host.style.setProperty('--collection-caption-size',cellWidth<160?'9px':'11px');offset=first;
   for(const[index,card]of cards)removeCard(index,card);
   engine?.resize(cellWidth-24,rowHeight-captionSpace,pixelRatio);plane.style.height=ROWS*rowHeight+'px';scroll.scrollTop=ORIGIN*rowHeight;
  }
  layout();
 }
 densityInput.addEventListener('input',()=>{densityPreference=Number(densityInput.value);try{localStorage.setItem('breakboard-grid-columns',String(densityPreference));}catch{}if(!densityFrame)densityFrame=requestAnimationFrame(()=>{densityFrame=0;resize();});});
 new ResizeObserver(resize).observe(scroll);
 scroll.addEventListener('scroll',()=>{
  scrolling=true;cancelAnimationFrame(raf);raf=0;resetPreviews();engine?.protect([]);
  if(scroll.scrollTop<rowHeight*100||scroll.scrollTop>rowHeight*(ROWS-100)){scroll.scrollTop=rebaseScroll(scroll.scrollTop,rowHeight,order.length,ORIGIN);for(const[index,card]of cards)removeCard(index,card);}
  layout();clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;fill();},120);
 },{passive:true});
 reduced.addEventListener('change',()=>{if(currentIndex()!==null)schedule();});
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;previous=0;if(active&&!document.hidden){fill();if(currentIndex()!==null)schedule();}});
 return{
  open(){if(active)return;active=true;host.hidden=false;resize();scroll.focus({preventScroll:true});},
  close(){active=false;cancelAnimationFrame(raf);raf=0;clearTimeout(scrollTimer);scrolling=false;resetPreviews();engine?.protect([]);host.hidden=true;},
  setTheme(value){if(theme===value)return;theme=value;revision++;engine?.setTheme(value);resetPreviews();for(const card of cards.values())setImage(card);},
  get active(){return active;},
  get diagnostics(){return{active,columns,densityPreference,rowHeight,mounted:cards.size,offset,scrollTop:scroll.scrollTop,scrolling,filling,preview:cards.get(currentIndex())?.id||null,visible:visible.map(c=>c.id),paintedFrames,states:Object.fromEntries([...cards.values()].map(c=>[c.id,{pose:c.pose,angle:c.angle,ready:c.ready,live:c.live}])),frames:0,loaded:[],pending:0,contextLost:false,...engine?.diagnostics};}
 };
}
