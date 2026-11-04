// Controls belong to the selected device. The same nodes move into the mobile
// Controls accordion, keeping keyboard focus and input state intact.
export function createDeviceControls(host,getModel){
 let controls=[],rows=[],readoutKey='',lastReadout=-Infinity;
 const fields=document.createElement('div');fields.className='device-control-fields';
 const readouts=document.createElement('dl');readouts.className='device-readouts';
 host.append(fields,readouts);
 function bind(definition){
  controls=definition.controls||[];rows=[];fields.replaceChildren();readouts.replaceChildren();readoutKey='';lastReadout=-Infinity;
  host.hidden=controls.length===0;document.querySelector('.workspace')?.classList.toggle('has-device-controls',!!controls.length);
  for(const spec of controls){
   const row=document.createElement('div');row.className='device-control';
   const meta=document.createElement('div');meta.className='device-control-meta';
   const label=document.createElement('label'),output=document.createElement('output'),input=document.createElement('input');
   input.type='range';input.id=`device-input-${spec.id}`;input.dataset.control=spec.id;input.min=spec.min;input.max=spec.max;input.step=spec.step;input.value=spec.value;
   label.htmlFor=input.id;label.textContent=spec.label;output.htmlFor=input.id;
   function show(){const value=Number(input.value),text=spec.format?spec.format(value):`${value}${spec.unit?` ${spec.unit}`:''}`;output.textContent=text;input.setAttribute('aria-valuetext',text);input.style.setProperty('--progress',`${(value-spec.min)/(spec.max-spec.min)*100}%`);}
   input.addEventListener('input',()=>{getModel()?.behavior?.setControl(spec.id,Number(input.value));show();refresh(true);});
   show();meta.append(label,output);row.append(meta,input);fields.append(row);rows.push({input,output,spec,show});
  }
  refresh(true);
 }
 function refresh(force=false){
  if(host.hidden)return;const now=performance.now();if(!force&&now-lastReadout<100)return;lastReadout=now;
  const values=getModel()?.behavior?.getReadouts?.()||[],key=JSON.stringify(values);if(key===readoutKey)return;readoutKey=key;
  if(readouts.children.length!==values.length){readouts.replaceChildren(...values.map(()=>{const row=document.createElement('div');row.append(document.createElement('dt'),document.createElement('dd'));return row;}));}
  values.forEach((value,i)=>{const row=readouts.children[i];row.children[0].textContent=value.label;row.children[1].textContent=`${value.value}${value.unit?` ${value.unit}`:''}`;});
 }
 function reset(){for(const row of rows){row.input.value=row.spec.value;row.show();}refresh(true);}
 function setEnabled(enabled){for(const{input}of rows)input.disabled=!enabled;}
 return{bind,refresh,reset,setEnabled};
}
