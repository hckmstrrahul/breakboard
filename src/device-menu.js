// A segmented category picker: each pill owns a menu of actual devices.
// Use menu-button semantics, rather than tabs whose content is another picker.
export const DEVICE_CATEGORIES=[
 {id:'boards',name:'Boards'}, {id:'displays',name:'Displays'},
 {id:'optics',name:'Optics'}, {id:'sensors',name:'Sensors'}, {id:'chips',name:'Chips'}, {id:'storage',name:'Storage'}, {id:'motion',name:'Motion'}, {id:'power',name:'Power'}, {id:'audio',name:'Audio'}, {id:'radio',name:'Radio'}
];
const family={nixie:'displays',neopixel:'displays',dlp:'displays',hqcamera:'optics',stepper:'motion',hackrf:'radio'};
export const deviceCategory=device=>device.category||family[device.id]||'boards';
export function deviceFamilies(devices){return DEVICE_CATEGORIES.map(category=>({...category,devices:devices.filter(device=>deviceCategory(device)===category.id)})).filter(category=>category.devices.length);}

export function adjacentDevice(devices,id,direction){
 const current=devices.find(device=>device.id===id);if(!current)return null;
 const siblings=devices.filter(device=>deviceCategory(device)===deviceCategory(current));
 if(siblings.length<2)return null;
 return siblings[(siblings.indexOf(current)+direction+siblings.length)%siblings.length];
}

export function createDeviceMenu(host,devices,onChange,createOption){
 const categories=deviceFamilies(devices),buttons=[],menus=[];
 const hover=matchMedia('(hover: hover) and (pointer: fine)'),exitTimers=new Map();
 let selected=devices[0].id,openIndex=-1,openSource='',typeahead='',lastTyped=0,openTimer,closeTimer,recentUntil=0;
 host.setAttribute('role','navigation');host.setAttribute('aria-label','Devices');
 host.replaceChildren();
 for(const category of categories){
  const button=document.createElement('button'),label=document.createElement('span');
  button.type='button';button.dataset.category=category.id;button.id=`category-${category.id}`;
  button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-controls',`devices-${category.id}`);label.textContent=category.name;
  button.append(label);button.insertAdjacentHTML('beforeend','<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 6.5 3.5 3.5 3.5-3.5"/></svg>');
  host.append(button);buttons.push(button);
  const menu=document.createElement('div');menu.className='device-menu';menu.id=`devices-${category.id}`;
  menu.setAttribute('role','menu');menu.setAttribute('aria-labelledby',button.id);menu.setAttribute('aria-hidden','true');menu.hidden=true;menu.inert=true;menu.dataset.state='closed';
  for(const device of category.devices){
   const item=document.createElement('button');item.type='button';item.dataset.board=device.id;
   item.tabIndex=-1;item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked','false');
   item.append(...createOption(device));menu.append(item);
  }
  document.body.append(menu);menus.push(menu);
 }
 const items=index=>[...menus[index].querySelectorAll('[data-board]')];
 function cancelHover(){clearTimeout(openTimer);clearTimeout(closeTimer);}
 function close(returnFocus=false,instant=true){
  cancelHover();if(openIndex<0)return;
  const index=openIndex,menu=menus[index];openIndex=-1;openSource='';recentUntil=performance.now()+300;
  buttons[index].setAttribute('aria-expanded','false');
  if(returnFocus||menu.contains(document.activeElement))buttons[index].focus({preventScroll:true});
  menu.inert=true;menu.setAttribute('aria-hidden','true');menu.dataset.instant=String(instant);menu.dataset.state='closed';
  clearTimeout(exitTimers.get(menu));
  if(instant)menu.hidden=true;else exitTimers.set(menu,setTimeout(()=>{menu.hidden=true;exitTimers.delete(menu);},100));
 }
 function positionMenu(index){
  const menu=menus[index],bounds=buttons[index].getBoundingClientRect(),width=menu.offsetWidth;
  const left=Math.max(12,Math.min(bounds.left,innerWidth-width-12));
  menu.style.left=`${left}px`;menu.style.top=`${bounds.bottom+8}px`;menu.style.maxHeight=`${Math.max(120,innerHeight-bounds.bottom-24)}px`;
  menu.style.setProperty('--menu-origin',`${Math.max(12,Math.min(width-12,bounds.left+bounds.width/2-left))}px`);
 }
 function open(index,{last=false,source='click',instant=false}={}){
  cancelHover();const switching=openIndex>=0&&openIndex!==index;
  if(switching)close(false,true);
  const menu=menus[index],button=buttons[index],wasHidden=menu.hidden;
  clearTimeout(exitTimers.get(menu));exitTimers.delete(menu);
  openIndex=index;openSource=source;menu.dataset.instant=String(instant||switching);
  menu.hidden=false;menu.inert=false;menu.setAttribute('aria-hidden','false');button.setAttribute('aria-expanded','true');positionMenu(index);
  // Flush only first entry. A returning pointer reverses the current transition.
  if(wasHidden&&!instant&&!switching)void menu.offsetWidth;
  menu.dataset.state='open';
  const choices=items(index),choice=last?choices.at(-1):choices.find(item=>item.dataset.board===selected)||choices[0];
  if(wasHidden)menu.scrollTop=Math.max(0,choice.offsetTop-menu.clientHeight/2+choice.offsetHeight/2);
  if(source!=='hover')choice.focus({preventScroll:true});
 }
 function leave(index){
  clearTimeout(openTimer);
  if(openIndex===index&&openSource==='hover')closeTimer=setTimeout(()=>close(false,false),160);
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('pointerenter',event=>{
   if(!hover.matches||event.pointerType!=='mouse')return;
   cancelHover();if(openIndex===index)return;
   const instant=openIndex>=0||performance.now()<recentUntil;
   if(instant)open(index,{source:'hover',instant:menus[index].hidden});
   else openTimer=setTimeout(()=>open(index,{source:'hover'}),70);
  });
  button.addEventListener('pointerleave',()=>leave(index));
  menus[index].addEventListener('pointerenter',()=>clearTimeout(closeTimer));
  menus[index].addEventListener('pointerleave',()=>leave(index));
  button.addEventListener('click',event=>{
   const keyboard=event.detail===0;
   if(openIndex===index&&openSource!=='hover')close(true,keyboard);
   else open(index,{source:keyboard?'keyboard':'click',instant:keyboard});
  });
  button.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopPropagation();open(index,{last:event.key==='ArrowUp',source:'keyboard',instant:true});}
   if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    buttons[next].focus();
   }
  });
  menus[index].addEventListener('click',event=>{
   const item=event.target.closest('[data-board]');if(!item)return;
   close(true);onChange(item.dataset.board);
  });
  menus[index].addEventListener('keydown',event=>{
   // Menu typing and Escape must not trigger the viewer's shortcuts.
   event.stopPropagation();const choices=items(index),at=choices.indexOf(document.activeElement);
   if(event.key==='Escape'){event.preventDefault();close(true);return;}
   if(event.key==='Tab'){close(true);return;}
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?choices.length-1:(at+(event.key==='ArrowDown'?1:-1)+choices.length)%choices.length;
    choices[next].focus();return;
   }
   if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
    const now=performance.now();typeahead=now-lastTyped<650?typeahead+event.key:event.key;lastTyped=now;
    const match=choices.find(item=>item.querySelector('.device-option-name').textContent.toLowerCase().startsWith(typeahead.toLowerCase()));
    if(match){event.preventDefault();match.focus();}
   }
  });
 });
 // Hover never moves focus, so Escape must also dismiss from outside the menu.
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;cancelHover();if(openIndex>=0){event.preventDefault();event.stopImmediatePropagation();close(false,true);}},true);
 hover.addEventListener('change',()=>close());
 document.addEventListener('pointerdown',event=>{if(openIndex>=0&&!menus[openIndex].contains(event.target)&&!buttons[openIndex].contains(event.target))close();});
 document.addEventListener('focusin',event=>{if(openIndex>=0&&!menus[openIndex].contains(event.target)&&!buttons[openIndex].contains(event.target))close();});
 addEventListener('resize',()=>close());
 addEventListener('scroll',event=>{if(openIndex<0)return;if(event.target===host)positionMenu(openIndex);else if(!menus[openIndex].contains(event.target))close();},true);
 function setDevice(id){
  selected=id;
  categories.forEach((category,index)=>{
   const device=category.devices.find(device=>device.id===id),button=buttons[index];
   button.dataset.active=String(!!device);button.querySelector('span').textContent=device?.tab||category.name;
   button.setAttribute('aria-label',device?`${category.name}: ${device.tab}. Choose device`:`Choose ${category.name.toLowerCase()}`);
   if(device)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
   for(const item of items(index))item.setAttribute('aria-checked',String(item.dataset.board===id));
  });
 }
 setDevice(selected);return{setDevice,close,get selected(){return selected;}};
}
