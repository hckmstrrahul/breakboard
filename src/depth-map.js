import './depth-map.css';

// A readout of simulated measurements, separate from the physical sensor model.
// Values and the color scale remain in millimeters; null means no valid return.
export function createDepthMap(host){
 const figure=document.createElement('figure');figure.className='device-depth-map';figure.hidden=true;
 const label=document.createElement('figcaption'),plot=document.createElementNS('http://www.w3.org/2000/svg','svg');
 plot.setAttribute('role','img');plot.setAttribute('viewBox','0 0 80 80');
 const legend=document.createElement('div');legend.className='depth-map-legend';
 const near=document.createElement('span'),far=document.createElement('span'),caption=document.createElement('p');
 caption.className='depth-map-caption';legend.append(near,far);
 const valuesWrap=document.createElement('div');valuesWrap.className='depth-map-values';
 const table=document.createElement('table');valuesWrap.append(table);
 const tableCaption=document.createElement('caption');tableCaption.textContent='Depth by row and column, in millimeters';table.append(tableCaption);
 figure.append(label,plot,legend,caption,valuesWrap);host.append(figure);
 let key='',shape='',cells=[];
 function update(data){
  const next=JSON.stringify(data);if(next===key)return;key=next;
  const valid=data&&Number.isInteger(data.rows)&&Number.isInteger(data.columns)&&data.rows>0&&data.rows<=16&&data.columns>0&&data.columns<=16&&Array.isArray(data.values)&&data.values.length===data.rows*data.columns&&data.values.every(v=>v===null||Number.isFinite(v))&&Number.isFinite(data.min)&&Number.isFinite(data.max)&&data.max>data.min;
  figure.hidden=!valid;if(!valid)return;
  const dimensions=`${data.rows}:${data.columns}`;
  if(shape!==dimensions){
   shape=dimensions;cells=[];plot.replaceChildren();table.replaceChildren(tableCaption);
   const head=table.createTHead().insertRow();head.append(document.createElement('td'));
   for(let column=0;column<data.columns;column++){const th=document.createElement('th');th.scope='col';th.textContent=`Column ${column+1}`;head.append(th);}
   const body=table.createTBody();
   for(let row=0;row<data.rows;row++){
    const tr=body.insertRow(),th=document.createElement('th');th.scope='row';th.textContent=`Row ${row+1}`;tr.append(th);
    for(let column=0;column<data.columns;column++){
     const rect=document.createElementNS(plot.namespaceURI,'rect'),title=document.createElementNS(plot.namespaceURI,'title');
     rect.setAttribute('x',column*80/data.columns+.5);rect.setAttribute('y',row*80/data.rows+.5);rect.setAttribute('width',80/data.columns-1);rect.setAttribute('height',80/data.rows-1);rect.setAttribute('rx','1');rect.append(title);plot.append(rect);
     cells.push({rect,title,cell:tr.insertCell(),row,column});
    }
   }
  }
  label.textContent=data.label||'Depth map';caption.textContent=data.caption||'';
  near.textContent=`Near · ${data.min} mm`;far.textContent=`Far · ${data.max} mm`;
  const returns=data.values.filter(v=>v!==null),summary=returns.length?`${Math.min(...returns)} to ${Math.max(...returns)} millimeters; ${returns.length} valid zones`:'No valid returns';
  plot.setAttribute('aria-label',`${label.textContent}, ${data.rows} by ${data.columns}. ${summary}.`);
  data.values.forEach((value,i)=>{
   const {rect,title,cell,row,column}=cells[i],text=value===null?'No return':`${Math.round(value)} mm`;
   const strength=value===null?0:20+80*(1-Math.max(0,Math.min(1,(value-data.min)/(data.max-data.min))));
   rect.style.fill=`color-mix(in srgb, var(--accent) ${strength}%, var(--surface))`;
   title.textContent=`Row ${row+1}, column ${column+1}: ${text}`;cell.textContent=text;
  });
 }
 return{update,reset(){key='';figure.hidden=true;}};
}
