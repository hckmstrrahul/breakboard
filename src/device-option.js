import previews from './previews/index.js';

export function createDeviceOption(device){
 const image=document.createElement('img');image.className='device-preview';image.dataset.preview=device.id;
 image.width=image.height=192;image.alt='';image.loading='lazy';image.decoding='async';
 const theme=document.documentElement.dataset.theme==='light'?'light':'dark';
 image.src=previews[device.id][theme];image.dataset.previewTheme=theme;
 const copy=document.createElement('span');copy.className='device-option-copy';
 const name=document.createElement('span');name.className='device-option-name';name.textContent=device.tab;
 const detail=document.createElement('small');detail.textContent=device.menuDetail||device.model;
 copy.append(name,detail);return[image,copy];
}

export function setDevicePreviewTheme(theme){
 for(const image of document.querySelectorAll('[data-preview]')){
  if(image.dataset.previewTheme===theme)continue;
  image.src=previews[image.dataset.preview][theme];image.dataset.previewTheme=theme;
 }
}
