// A segmented category picker: each pill owns a menu of actual devices.
// Use menu-button semantics, rather than tabs whose content is another picker.
export const DEVICE_CATEGORIES=[
 {id:'boards',name:'Boards'}, {id:'displays',name:'Displays'},
 {id:'optics',name:'Optics'}, {id:'motion',name:'Motion'}, {id:'radio',name:'Radio'}
];
const family={nixie:'displays',neopixel:'displays',dlp:'displays',hqcamera:'optics',stepper:'motion',hackrf:'radio'};
export const deviceCategory=device=>device.category||family[device.id]||'boards';
export function deviceFamilies(devices){return DEVICE_CATEGORIES.map(category=>({...category,devices:devices.filter(device=>deviceCategory(device)===category.id)})).filter(category=>category.devices.length);}

export function createDeviceMenu(host,devices,onChange){
 const categories=deviceFamilies(devices),buttons=[],menus=[];
 let selected=devices[0].id,openIndex=-1,typeahead='',lastTyped=0;
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
  menu.setAttribute('role','menu');menu.setAttribute('aria-labelledby',button.id);menu.hidden=true;
  for(const device of category.devices){
   const item=document.createElement('button');item.type='button';item.dataset.board=device.id;
   item.tabIndex=-1;item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked','false');
   const name=document.createElement('span');name.textContent=device.tab;
   const detail=document.createElement('small');detail.textContent=device.menuDetail||device.model;
   item.append(name,detail);menu.append(item);
  }
  document.body.append(menu);menus.push(menu);
 }
 const items=index=>[...menus[index].querySelectorAll('[data-board]')];
 function close(returnFocus=false){
  if(openIndex<0)return;
  const index=openIndex;menus[index].hidden=true;buttons[index].setAttribute('aria-expanded','false');openIndex=-1;
  if(returnFocus)buttons[index].focus({preventScroll:true});
 }
 function open(index,last=false){
  close();openIndex=index;const menu=menus[index],button=buttons[index];
  menu.hidden=false;button.setAttribute('aria-expanded','true');
  const bounds=button.getBoundingClientRect(),width=menu.offsetWidth;
  menu.style.left=`${Math.max(12,Math.min(bounds.left,innerWidth-width-12))}px`;
  menu.style.top=`${bounds.bottom+8}px`;menu.style.maxHeight=`${Math.max(120,innerHeight-bounds.bottom-24)}px`;
  const choices=items(index);(last?choices.at(-1):choices.find(item=>item.dataset.board===selected)||choices[0]).focus({preventScroll:true});
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>openIndex===index?close(true):open(index));
  button.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopPropagation();open(index,event.key==='ArrowUp');}
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
    const match=choices.find(item=>item.querySelector('span').textContent.toLowerCase().startsWith(typeahead.toLowerCase()));
    if(match){event.preventDefault();match.focus();}
   }
  });
 });
 document.addEventListener('pointerdown',event=>{if(openIndex>=0&&!menus[openIndex].contains(event.target)&&!buttons[openIndex].contains(event.target))close();});
 document.addEventListener('focusin',event=>{if(openIndex>=0&&!menus[openIndex].contains(event.target)&&!buttons[openIndex].contains(event.target))close();});
 addEventListener('resize',()=>close());
 addEventListener('scroll',event=>{if(openIndex>=0&&!menus[openIndex].contains(event.target))close();},true);
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
