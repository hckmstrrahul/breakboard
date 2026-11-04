import {deviceFamilies} from './device-menu.js';
const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
// Native modal dialogs provide focus containment and an inert background. The
// existing controls move between layouts, preserving their IDs and state.
export function createMobilePanels(boards,onBoardChange){
 const media=matchMedia('(max-width: 800px), (max-width: 1000px) and (max-height: 500px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const header=document.querySelector('.topbar'),workspace=document.querySelector('.workspace');
 let active=null,compact=false;
 function close(immediate=false){
  if(!active)return;const sheet=active;if(sheet.timer){if(!immediate)return;clearTimeout(sheet.timer);sheet.timer=null;}sheet.element.dataset.visible='false';
  const finish=()=>{if(active===sheet)active=null;sheet.element.close();sheet.element.style.height='';document.documentElement.classList.remove('sheet-open');sheet.trigger.focus({preventScroll:true});sheet.timer=null;};
  if(immediate)finish();else sheet.timer=setTimeout(finish,reduced.matches?120:180);
 }
 function open(sheet){
  if(!compact)return;if(active)close(true);
  if(sheet.timer){clearTimeout(sheet.timer);sheet.timer=null;}
  active=sheet;sheet.element.style.height='';sheet.element.showModal();document.documentElement.classList.add('sheet-open');
  requestAnimationFrame(()=>{if(active===sheet)sheet.element.dataset.visible='true';});
  const focus=sheet.element.querySelector('[data-device][aria-pressed="true"]')||sheet.closeButton;focus.focus({preventScroll:true});
  sheet.element.querySelector('.sheet-grip').setAttribute('aria-valuemin',String(Math.round(160/(globalThis.visualViewport?.height||innerHeight)*100)));
  sheet.element.querySelector('.sheet-grip').setAttribute('aria-valuenow',String(Math.round(sheet.element.offsetHeight/(globalThis.visualViewport?.height||innerHeight)*100)));
  if(focus.dataset.device)sheet.content.scrollTop=Math.max(0,focus.offsetTop-sheet.content.offsetTop-sheet.content.clientHeight/2+focus.clientHeight/2);
 }
 function panel(id,title,triggerClass='mobile-panel'){
  const trigger=document.createElement('button');trigger.id=id;trigger.className=triggerClass;trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',`${id}-sheet`);trigger.innerHTML=`<span>${title}</span>${chevron}`;
  const element=document.createElement('dialog');element.id=`${id}-sheet`;element.className='mobile-sheet';element.setAttribute('aria-labelledby',`${id}-title`);
  element.innerHTML=`<div class="sheet-grip" role="separator" tabindex="0" aria-label="Resize ${title.toLowerCase()} sheet" aria-orientation="horizontal" aria-valuemin="30" aria-valuemax="90" aria-valuenow="60"><span></span></div><div class="sheet-header"><h2 id="${id}-title">${title}</h2><button class="sheet-close" type="button" aria-label="Close ${title.toLowerCase()}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div><div class="sheet-body"></div>`;
  document.body.append(element);const content=element.querySelector('.sheet-body'),closeButton=element.querySelector('.sheet-close'),grip=element.querySelector('.sheet-grip'),sheet={element,content,trigger,closeButton,timer:null};
  trigger.onclick=()=>open(sheet);closeButton.onclick=()=>close();element.addEventListener('cancel',event=>{event.preventDefault();close();});
  element.addEventListener('click',event=>{if(event.target!==element)return;const r=element.getBoundingClientRect();if(event.clientY<r.top||event.clientX<r.left||event.clientX>r.right)close();});
  element.addEventListener('keydown',event=>event.stopPropagation());
  let drag=null;
  const maxHeight=()=>Math.max(160,(globalThis.visualViewport?.height||innerHeight)*.9);
  const setHeight=value=>{const height=Math.max(160,Math.min(maxHeight(),value));element.style.height=`${height}px`;grip.setAttribute('aria-valuenow',String(Math.round(height/(globalThis.visualViewport?.height||innerHeight)*100)));};
  grip.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={y:event.clientY,height:element.offsetHeight,time:performance.now()};grip.setPointerCapture(event.pointerId);element.dataset.dragging='true';});
  grip.addEventListener('pointermove',event=>{if(drag)setHeight(drag.height+drag.y-event.clientY);});
  grip.addEventListener('pointerup',event=>{if(!drag)return;const distance=event.clientY-drag.y,velocity=distance/Math.max(1,performance.now()-drag.time);element.dataset.dragging='false';if(distance>100&&(element.offsetHeight<260||velocity>.6))close();drag=null;});
  grip.addEventListener('pointercancel',()=>{drag=null;element.dataset.dragging='false';});
  grip.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();setHeight(event.key==='Home'?220:event.key==='End'?maxHeight():element.offsetHeight+(event.key==='ArrowUp'?64:-64));});
  return sheet;
 }
 const picker=panel('mobile-board','Choose device','mobile-board-picker'),controls=panel('mobile-controls','Controls'),components=panel('mobile-components','Components & details');
 picker.trigger.setAttribute('aria-label','Choose device');header.append(picker.trigger);workspace.append(controls.trigger);workspace.after(components.trigger);
 for(const family of deviceFamilies(boards)){
  const section=document.createElement('section');section.className='sheet-device-group';const title=document.createElement('h3');title.textContent=family.name;section.append(title);
  for(const board of family.devices){const button=document.createElement('button');button.type='button';button.dataset.device=board.id;button.setAttribute('aria-pressed','false');const name=document.createElement('span'),detail=document.createElement('small');name.textContent=board.tab;detail.textContent=board.menuDetail||board.model;button.append(name,detail);button.onclick=()=>{close();onBoardChange(board.id);};section.append(button);}
  picker.content.append(section);
 }
 const moves=[['.assembly-controls',controls],['.tools',controls],['#export',controls],['.sidebar',components],['.inspector',components]].map(([selector,destination])=>{const element=document.querySelector(selector),marker=document.createComment(selector);element.before(marker);return{element,marker,destination};});
 const apply=()=>{if(compact===media.matches)return;close(true);compact=media.matches;for(const{element,marker,destination}of moves){if(compact)destination.content.append(element);else marker.after(element);}document.querySelector('#component-browser').open=true;};
 media.addEventListener('change',apply);apply();
 return{
  setBoard:id=>{picker.trigger.querySelector('span').textContent=boards.find(b=>b.id===id)?.tab||'Choose device';for(const button of picker.content.querySelectorAll('[data-device]'))button.setAttribute('aria-pressed',String(button.dataset.device===id));},
  close:()=>close(true),
  focusControls:()=>{if(!compact)return false;controls.trigger.focus({preventScroll:true});return true;},
  closeComponents:()=>{if(compact&&active===components)close();}
 };
}
