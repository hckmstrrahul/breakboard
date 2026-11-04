// Geometry derived from Arduino's official PortentaX8.step, 2026-11-04.
import fs from 'node:fs';import zlib from 'node:zlib';import * as T from 'three';
const raw=JSON.parse(fs.readFileSync('reference/portenta/native-meshes.json')),inv=JSON.parse(fs.readFileSync('reference/portenta/native-inventory.json'));
const ranges=[['emmc',72,268],['mcu',344,513],['memory',589,853],['ethernet',936,985],['power',986,1043],['cpu',1044,1773],['security',856,877]];
function group(s){const i=s.i;if(i===0)return'board';for(const[id,a,b]of ranges)if(i>=a&&i<=b)return id;
 if(i===553)return'usb';if(i===935)return'radio';if(i===529)return'antenna';if([1846,1847].includes(i))return'headers';if(i===1829)return'reset';if([535,536].includes(i))return'leds';if(i===537)return'display';if(i===917)return'clock';
 const markers={2000:'emmc',2003:'mcu',2005:'memory',2006:'security',2008:'ethernet',2009:'power',2010:'cpu'};if(markers[i])return markers[i];
 if(i>=1830&&i<=1845||i>=896&&i<=898)return'power';return'smd';}
const buckets=new Map(),counts={},sourceMap=[];
for(let i=0;i<raw.length;i++){const s=inv[i],src=raw[i],id=group(s);const metal=/pin|ball|lead|thermal/i.test(s.name),cap=s.name.startsWith('CAP');
 let mat=metal?['#b7b7ad',.75,.35]:cap?['#b69b77',0,.72]:['#232729',0,.62];
 if(id==='board')mat=['#105e59',0,.7];if(id==='usb')mat=['#b8bec2',.85,.3];if(id==='antenna')mat=['#d0b16d',.75,.35];if(id==='radio')mat=['#343936',.3,.5];if(id==='headers')mat=['#d2cfc2',0,.65];if(id==='clock'||id==='reset')mat=['#b4b9b6',.7,.37];if(id==='leds')mat=['#d7cfad',0,.6];
 // Marker discs are pigment, not a sheet of metal.
 if(i>=1996)mat=['#747d77',0,.7];
 const key=id+':'+mat.join(',');if(!buckets.has(key))buckets.set(key,{group:id,material:mat,p:[],n:[],i:[]});const dst=buckets.get(key),offset=dst.p.length/3;
 const p=[];for(let j=0;j<src.p.length;j+=3)p.push(+(src.p[j]-33.02).toFixed(4),+(src.p[j+2]+.785).toFixed(4),+(12.7-src.p[j+1]).toFixed(4));
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(src.i);geo.computeVertexNormals();
 dst.p.push(...p);for(const n of geo.attributes.normal.array)dst.n.push(+n.toFixed(5));for(const j of src.i)dst.i.push(j+offset);geo.dispose();counts[id]=(counts[id]||0)+1;sourceMap.push({...s,group:id});
}
const data={metadata:{source:'Arduino ABX00049 PortentaX8.step',dimensions:[66.04,1.57,25.4],sourceMeshes:raw.length,counts},meshes:[...buckets.values()]};
fs.writeFileSync('public/models/portenta.json.gz',zlib.gzipSync(JSON.stringify(data),{level:9}));fs.writeFileSync('reference/portenta/source-groups.json',JSON.stringify(sourceMap));console.log({counts,draws:data.meshes.length,bytes:fs.statSync('public/models/portenta.json.gz').size,triangles:data.meshes.reduce((n,m)=>n+m.i.length/3,0)});
