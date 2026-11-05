import {controlPresentation} from './control-presentation.js';
import './device-controls.css';
import {createDepthMap} from './depth-map.js';
// Controls belong to the selected device. The same nodes move into the mobile
// Controls accordion, keeping keyboard focus and input state intact.
export function createDeviceControls(host,getModel){
 let presentation=controlPresentation({}),controls=[],rows=[],readoutKey='',waveformKey='',lastReadout=-Infinity;
 const fields=document.createElement('div');fields.className='device-control-fields';
 const readouts=document.createElement('dl');readouts.className='device-readouts';
 const waveform=document.createElement('figure');waveform.className='device-waveform';waveform.hidden=true;
 const waveLabel=document.createElement('figcaption'),waveCaption=document.createElement('span');waveCaption.className='device-waveform-caption';
 const ns='http://www.w3.org/2000/svg',plot=document.createElementNS(ns,'svg'),baseline=document.createElementNS(ns,'path'),trace=document.createElementNS(ns,'path');
 plot.setAttribute('viewBox','0 0 240 40');plot.setAttribute('preserveAspectRatio','none');plot.setAttribute('role','img');baseline.setAttribute('d','M0 20H240');baseline.classList.add('waveform-baseline');trace.classList.add('waveform-trace');plot.append(baseline,trace);waveform.append(waveLabel,plot,waveCaption);
 const results=document.createElement('div');results.className='device-control-results';const kind=document.createElement('span');kind.className='device-simulation';kind.textContent='Sim';kind.title='Educational simulation — see Model notes';kind.setAttribute('aria-label','Simulated values');results.append(kind,readouts,waveform);host.append(fields,results);
 const depthMap=createDepthMap(results);
 function bind(definition){
  presentation=controlPresentation(definition);controls=definition.controls||[];rows=[];fields.replaceChildren();readouts.replaceChildren();readoutKey='';waveformKey='';waveform.hidden=true;depthMap.reset();lastReadout=-Infinity;
  host.hidden=controls.length===0;document.querySelector('.workspace')?.classList.toggle('has-device-controls',!!controls.length);
  for(const spec of controls){
   const row=document.createElement('div');row.className='device-control';
   const meta=document.createElement('div');meta.className='device-control-meta';
   const label=document.createElement('label'),output=document.createElement('output'),input=document.createElement('input');
   input.type='range';input.id=`device-input-${spec.id}`;input.dataset.control=spec.id;input.min=spec.min;input.max=spec.max;input.step=spec.step;input.value=spec.value;
   label.htmlFor=input.id;label.textContent=presentation.label(spec);input.title=spec.label;output.htmlFor=input.id;
   function show(){const value=Number(input.value),text=presentation.value(spec,value);output.textContent=text;output.classList.toggle('is-choice',!!spec.format&&!/^(?:[\d+−-]|f\/)/i.test(text));input.setAttribute('aria-valuetext',spec.format?spec.format(value):text);input.style.setProperty('--progress',`${(value-spec.min)/(spec.max-spec.min)*100}%`);}
   input.addEventListener('input',()=>{getModel()?.behavior?.setControl(spec.id,Number(input.value));show();refresh(true);});
   show();meta.append(label,output);row.append(meta,input);fields.append(row);rows.push({input,output,spec,show});
  }
  refresh(true);
 }
 function refresh(force=false){
  if(host.hidden)return;const now=performance.now();if(!force&&now-lastReadout<100)return;lastReadout=now;
  const behavior=getModel()?.behavior,dragged=behavior?.drag?.getValues?.();
  if(dragged)for(const row of rows){const value=dragged[row.spec.id];if(Number.isFinite(value)&&Number(row.input.value)!==value){row.input.value=value;row.show();}}
  const wave=behavior?.getWaveform?.(),waveKey=JSON.stringify(wave);
  const depth=behavior?.getDepthMap?.();depthMap.update(depth);
  if(waveKey!==waveformKey){
   waveformKey=waveKey;const samples=wave?.samples;waveform.hidden=!Array.isArray(samples)||samples.length<2||samples.some(value=>!Number.isFinite(value));
   if(!waveform.hidden){waveLabel.textContent=presentation.wave?.[0]||wave.label;waveCaption.textContent=presentation.wave?.[1]||'';plot.setAttribute('aria-label',`${wave.label}. ${wave.caption||''}`);trace.setAttribute('d',samples.map((value,i)=>`${i?'L':'M'}${(i/(samples.length-1)*240).toFixed(2)} ${(20-Math.max(-1,Math.min(1,value))*17).toFixed(2)}`).join(' '));}
  }
  const values=presentation.readouts(behavior?.getReadouts?.()||[]),key=JSON.stringify(values);readouts.hidden=values.length===0;results.hidden=values.length===0&&waveform.hidden&&!depth;if(key===readoutKey)return;readoutKey=key;
  if(readouts.children.length!==values.length){readouts.replaceChildren(...values.map(()=>{const row=document.createElement('div');row.append(document.createElement('dt'),document.createElement('dd'));return row;}));}
  values.forEach((value,i)=>{const row=readouts.children[i];row.dataset.readout=value.source;row.children[0].textContent=value.label;const number=document.createElement('span');number.className='device-readout-value';number.classList.toggle('is-status',typeof value.value==='string'&&!/^(?:[\d+−.-]|f\/)/i.test(value.value));number.textContent=String(value.value);row.children[1].replaceChildren(number,document.createTextNode(value.unit?` ${value.unit}`:''));});
 }
 function reset(){for(const row of rows){row.input.value=row.spec.value;row.show();}refresh(true);}
 function setEnabled(enabled){for(const{input}of rows)input.disabled=!enabled;}
 return{bind,refresh,reset,setEnabled};
}
