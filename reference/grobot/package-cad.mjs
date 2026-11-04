// Rebuild with: node reference/grobot/package-cad.mjs /path/to/tessellation-prefixes
// Inputs: ups-{inventory,meshes}.json and lcd-{inventory,meshes}.json.
// Stable asset coordinates; src/grobot.js applies rigid open-frame mount poses.
import fs from 'node:fs';import zlib from 'node:zlib';import path from 'node:path';import * as T from 'three';
const input=process.argv[2];if(!input)throw Error('Pass the folder containing tessellated Waveshare modules');
const buckets=new Map(),inventory=[],counts={};
for(const type of ['ups','lcd']){
 const raw=JSON.parse(fs.readFileSync(path.join(input,type+'-meshes.json'))),inv=JSON.parse(fs.readFileSync(path.join(input,type+'-inventory.json')));
 for(let i=0;i<raw.length;i++){
  // Replace the vendor's generic cell envelopes with BAK CG-50 dimensions.
  // The loose HAT stacking studs and acrylic base are not used in Grobot's mounts.
  if(type==='ups'&&i>=286)continue;
  const item=inv[i],source=raw[i],group=type==='lcd'?'display':i>=33&&i<=37?'holder':'ups';
  let color='#22272a',metalness=0,roughness=.65;
  if(i===0){color='#194871';roughness=.68;}
  else if(type==='lcd'){
   if(i===38){color='#161c20';roughness=.23;}else if(i===33)color='#e0ded0';else if(i>=34){color='#c5a15c';metalness=.8;}else if(/CAPC/.test(item.name))color='#b7a28a';else if(/232_|23055/.test(item.name)){color='#b8bec2';metalness=.8;}
  }else if(i===35)color='#1b1d21';
  else if((i>=33&&i<=37)||/PIN|EXTRUDED-117798|EXTRUDED-164034|EXTRUDED-169356/.test(item.name)||[247,248,252,255,256,257,281,282].includes(i)){color='#b8bec2';metalness=.8;roughness=.32;}
  else if(i>=283){color='#c8a44c';metalness=.8;roughness=.32;}
  else if(/CERAMIC/.test(item.name))color='#b7a28a';
  else if(source.c&&Math.max(...source.c)-Math.min(...source.c)<.1&&source.c[0]>.6){color='#a9adb1';metalness=.5;}
  const key=group+color+metalness;if(!buckets.has(key))buckets.set(key,{group,material:[color,metalness,roughness],p:[],n:[],i:[]});const dst=buckets.get(key),offset=dst.p.length/3,p=[];
  for(let j=0;j<source.p.length;j+=3){const[x,y,z]=source.p.slice(j,j+3);const point=type==='ups'?[y-43,13-x,6+z]:[-9-y,85+x,27.5+z];p.push(...point.map(v=>+v.toFixed(4)));}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(source.i);geo.computeVertexNormals();
  dst.p.push(...p);for(const n of geo.attributes.normal.array)dst.n.push(+n.toFixed(5));for(const index of source.i)dst.i.push(index+offset);geo.dispose();
  counts[group]=(counts[group]||0)+1;inventory.push({module:type,index:i,name:item.name,group,min:item.min,max:item.max});
 }
}
const metadata={source:'Waveshare UPS-HAT_D.stp and 1_47inch_lcd_module_asm-221122.stp',sourceMeshes:325,counts,omitted:'UPS generic cell envelopes, stacking studs and acrylic base; custom mounts used instead'};
const data={metadata,meshes:[...buckets.values()]};fs.writeFileSync('public/models/grobot.json.gz',zlib.gzipSync(JSON.stringify(data),{level:9}));fs.writeFileSync('reference/grobot/source-groups.json',JSON.stringify(inventory));
console.log({counts,draws:data.meshes.length,bytes:fs.statSync('public/models/grobot.json.gz').size,triangles:data.meshes.reduce((n,m)=>n+m.i.length/3,0)});
