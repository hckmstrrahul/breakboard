import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from 'three';
const raw=JSON.parse(fs.readFileSync('reference/pi5/native-meshes.json','utf8'));
const inventory=JSON.parse(fs.readFileSync('reference/pi5/native-inventory.json','utf8'));
function inside(b,x0,y0,x1,y1){return b.min[0]>x0-.005&&b.min[1]>y0-.005&&b.max[0]<x1+.005&&b.max[1]<y1+.005;}
function group(b){
 if(b.name==='OBJ8571')return'board';
 if(b.min[2]>1.3&&inside(b,24.65,14.25,41.65,31.25))return'cpu';
 if(b.min[2]>1.3&&inside(b,25.9,34.2,40.4,44.2))return'memory';
 if(b.min[2]>1.3&&inside(b,52.5,29.1,64.5,41.1))return'io';
 if(b.i>=1341&&b.i<=1381)return'headers';
 if((b.max[2]>1.4)&&(inside(b,66.4,2.2,88.1,20)||inside(b,70.2,21.7,88.1,36.3)||inside(b,70.2,39.7,88.1,54.3)||inside(b,6.7,-1.3,15.7,6.9)||inside(b,22.2,-1.7,29.4,6.9)||inside(b,35.6,-1.7,42.8,6.9)))return'ports';
 if(b.i>=496&&b.i<=526)return'pmic';
 if(b.i===1417)return'rfshield';
 if(b.min[2]>1.3&&inside(b,6.9,36.2,17.7,49.2))return'radio';
 if(b.i>=546&&b.i<=553&&inside(b,65.2,48.9,69.2,55.1))return'fanheader';
 if(b.i>=491&&b.i<=495)return'rtc';
 if(b.min[2]>1.3&&inside(b,30,2.5,35,6.3))return'uart';
 if(b.min[2]>1.3&&inside(b,47.1,.14,50.65,16.85))return'cam0';
 if(b.min[2]>1.3&&inside(b,53.3,.14,56.85,16.85))return'cam1';
 if(b.i>=1878&&b.i<=1913)return'pcie';
 if(b.i>=2668&&b.i<=2681)return'sd';
 if(inside(b,-.5,16.1,3.1,20.7)&&b.max[2]>1.4)return'button';
 if(b.i>=1382&&b.i<=1386)return'poe';
 if(b.i>=1311&&b.i<=1314)return'ethernetphy';
 if(b.i>=400&&b.i<=402)return'clock';
 if(b.i>=2428&&b.i<=2430)return'clock2';
 if(b.i>=2432&&b.i<=2434)return'clock3';
 return null;
}
const assignments=inventory.map(group);
// Count touching CAD solids as packages, then keep all small packages in one
// selectable assembly. No electrical reference designators or values are inferred.
const remaining=inventory.filter((b,i)=>!assignments[i]);
const parent=new Map(remaining.map(b=>[b.i,b.i]));
function find(i){while(parent.get(i)!==i){parent.set(i,parent.get(parent.get(i)));i=parent.get(i);}return i;}
const overlap=(a,b)=>[0,1,2].every(k=>a.min[k]<=b.max[k]+.025&&b.min[k]<=a.max[k]+.025);
for(let i=0;i<remaining.length;i++)for(let j=i+1;j<remaining.length;j++)if(overlap(remaining[i],remaining[j]))parent.set(find(remaining[j].i),find(remaining[i].i));
const clusters=new Map();for(const b of remaining){const id=find(b.i);if(!clusters.has(id))clusters.set(id,[]);clusters.get(id).push(b);}
const min=[0,1,2].map(k=>Math.min(...remaining.map(b=>b.min[k]))),max=[0,1,2].map(k=>Math.max(...remaining.map(b=>b.max[k]))),center=min.map((v,k)=>(v+max[k])/2);
const detailParts=[{id:'smd',n:'',name:'SMD components',short:'SMD COMPONENTS',kind:'SURFACE-MOUNT COMPONENTS',description:'The small surface-mount packages on both sides of the board form one group. Their bodies and terminals select, isolate and lift together, preserving their layout. Electrical identities and values are not supplied by the mechanical CAD.',specs:[['Packages',String(clusters.size)],['Location','Top and underside'],['Source','Official CAD']],anchor:[center[0]-42.5,center[2]-.668,28-center[1]],offset:[0,10,0],detail:true,category:'Small components',sourceShapes:remaining.map(b=>b.name)}];
for(const b of remaining)assignments[b.i]='smd';
const buckets=new Map(),counts={},sourceMap=[];
for(let m=0;m<raw.length;m++){
 const src=raw[m],b=inventory[m],id=assignments[m];
 // The USB shell shares the CAD's gold contact color; match the silver shell
 // beside it before batching, keeping the connector contacts gold.
 const color=src.name==='OBJ3733'?[.8,.8,.8]:(src.c||[.5,.5,.5]);
 const c=color.map(n=>Math.round(n*255)/255),key=id+':'+c.join(',');
 if(!buckets.has(key))buckets.set(key,{group:id,c,name:id,p:[],n:[],i:[]});const dst=buckets.get(key),offset=dst.p.length/3;
 const p=[];for(let i=0;i<src.p.length;i+=3)p.push(+(src.p[i]-42.5).toFixed(4),+(src.p[i+2]-.668).toFixed(4),+(28-src.p[i+1]).toFixed(4));
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setIndex(src.i);geometry.computeVertexNormals();const normals=geometry.attributes.normal.array;
 for(const n of p)dst.p.push(n);for(const n of normals)dst.n.push(+n.toFixed(5));for(const index of src.i)dst.i.push(index+offset);geometry.dispose();
 counts[id]=(counts[id]||0)+1;sourceMap.push({name:src.name,group:id,min:b.min,max:b.max});
}
const result={metadata:{sourceMeshes:raw.length,boardSize:[85,56],boardThickness:1.276,sourceUnit:'mm',tessellationTolerance:.04,angularTolerance:.55,source:'rpi-5b_no_graphics.step',counts},anchors:{cpu:[-9.35,3.05,5.25],memory:[-9.35,1.67,-11.2],io:[16,1.87,-7.1],headers:[-10,9.2,-24.5],ports:[40,12,18],board:[-25,.65,10]},meshes:[...buckets.values()]};
fs.mkdirSync('public/models',{recursive:true});const zipped=zlib.gzipSync(JSON.stringify(result),{level:9});fs.writeFileSync('public/models/pi5.json.gz',zipped);fs.writeFileSync('reference/pi5/source-groups.json',JSON.stringify(sourceMap,null,2));fs.writeFileSync('src/pi5-details.json',JSON.stringify(detailParts));
console.log({detailParts:detailParts.length,majorGroups:Object.keys(counts).filter(k=>!k.startsWith('smd')),draws:result.meshes.length,triangles:result.meshes.reduce((n,m)=>n+m.i.length/3,0),gzipKB:Math.round(zipped.length/1024)});
