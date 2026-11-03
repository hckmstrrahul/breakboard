import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from 'three';
const raw=JSON.parse(fs.readFileSync('reference/jetson/native-meshes.json'));
const inventory=JSON.parse(fs.readFileSync('reference/jetson/native-inventory.json'));
const within=(b,x0,y0,x1,y1)=>b.min[0]>=x0-.12&&b.max[0]<=x1+.12&&b.min[1]>=y0-.12&&b.max[1]<=y1+.12;
function group(b){
 const i=b.i;
 if((i>=1271&&i<=1376)||i===1379)return null; // Optional example SSD, not supplied with the developer kit.
 if(i===274)return 'board';
 if(i===1266||i>=1267&&i<=1270)return 'base';
 if(i===2||i>=3&&i<=262)return 'module';
 if(i===268)return 'heatsink';
 if([272,273,1395].includes(i))return 'fan';
 if(i>=263&&i<=267||i>=269&&i<=271||i<=1||i>=1262&&i<=1265||[1393,1394].includes(i))return 'mounts';
 if(i===1377||i===1378||i>=1380&&i<=1392)return 'wireless';
 if([276,1396,1397].includes(i)||i>=1398&&i<=1401||i>=1403&&i<=1417)return 'fanwire';
 if([277,1418].includes(i))return 'headers';
 if(i===278||i>=279&&i<=522||i===1419)return 'socket';
 if(i>=523&&i<=530||i===1420||i===1421||i>=564&&i<=609||i===682||i===726||i>=1455&&i<=1460)return 'ports';
 if(i>=531&&i<=533||i>=1422&&i<=1424)return 'expansion';
 if(i>=733&&i<=736||i===1521||i===1522)return 'camera';
 if(i>=610&&i<=622||i===1461)return 'control';
 if(i===629||i===631||i===633||i>=1463&&i<=1465)return 'board';
 if(b.name.startsWith('V')||b.name.startsWith('LOGO')||(b.max[2]-b.min[2]<.12&&b.min[2]>.9&&b.max[2]<1.8))return 'board';
 if(b.min[2]>1.2&&within(b,64,-19,82,3))return 'ports';
 if(b.min[2]>1.2&&within(b,82,-19,94,-7))return 'ports';
 return 'smd';
}
const palette={board:['#172e26',0,.64],module:['#244d38',0,.66],heatsink:['#33383c',.82,.34],fan:['#171b1e',0,.5],mounts:['#9a9b9d',.88,.34],base:['#15181c',0,.68],headers:['#17191d',0,.62],socket:['#17191d',0,.62],ports:['#bfc3c6',.9,.3],expansion:['#25272b',0,.65],wireless:['#253e2f',0,.65],fanwire:['#1d2024',0,.5],camera:['#ddd9cb',0,.6],control:['#15191d',0,.6],smd:['#302e2c',0,.72]};
const buckets=new Map(),counts={},sourceMap=[];
function add(src,b,id,indices,mat){
 const rotor=b.i===273,key=id+':'+mat.join(',')+(rotor?':impeller':'');if(!buckets.has(key))buckets.set(key,{group:id,material:mat,...(rotor?{rotorPivot:[-2,0,-19.5]}:{}),p:[],n:[],i:[]});const dst=buckets.get(key),offset=dst.p.length/3;
 const p=[];for(let i=0;i<src.p.length;i+=3)p.push(+(src.p[i]-46).toFixed(4),+(src.p[i+2]-.785).toFixed(4),+(22.5-src.p[i+1]).toFixed(4));
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(indices);geo.computeVertexNormals();
 for(const v of p)dst.p.push(v);for(const v of geo.attributes.normal.array)dst.n.push(+v.toFixed(5));for(const v of indices)dst.i.push(v+offset);geo.dispose();
}
for(let i=0;i<raw.length;i++){
 const b=inventory[i],src=raw[i],id=group(b);if(!id||id==='ports')continue;let mat=palette[id]; // Port envelopes are reconstructed as open receptacles in jetson.js.
 if(id==='module'&&i!==2)mat=['#c7a24b',.82,.32];
 if(id==='board'&&i!==274)mat=b.name.startsWith('LOGO')?['#e2e6dd',0,.7]:['#a8aba1',.7,.44];
 if(id==='smd'){
  const [r,g,blue]=src.c||[.15,.15,.15],bright=(r+g+blue)/3;
  mat=bright>.65?['#a7a9a4',.62,.48]:['#282b2b',0,.66];
 }
 if(id==='wireless'&&/CABLE/.test(b.name))mat=['#1b1e20',0,.55];
 if(id==='wireless'&&/ANTENNA/.test(b.name))mat=['#151b17',0,.6];
 if(id==='headers'){
  const top=[],body=[];for(let j=0;j<src.i.length;j+=3){const tri=src.i.slice(j,j+3);const height=tri.reduce((n,k)=>n+src.p[k*3+2],0)/3;(height<1.57?top:body).push(...tri);}
  if(top.length)add(src,b,id,top,['#c8a34a',.82,.32]);if(body.length)add(src,b,id,body,mat);
 }else add(src,b,id,src.i,mat);
 counts[id]=(counts[id]||0)+1;sourceMap.push({i,name:b.name,group:id,min:b.min,max:b.max});
}
const result={metadata:{source:'NVIDIA P3766-P3768SKU4-P3767ENVELOPE.stp',sourceMeshes:raw.length,includedShapes:sourceMap.length,reconstructedGroups:['ports'],boardSize:[100,79],boardThickness:1.57,sourceUnit:'mm',counts},meshes:[...buckets.values()]};
fs.mkdirSync('public/models',{recursive:true});fs.writeFileSync('public/models/jetson.json.gz',zlib.gzipSync(JSON.stringify(result),{level:9}));fs.writeFileSync('reference/jetson/source-groups.json',JSON.stringify(sourceMap));
console.log({groups:counts,triangles:result.meshes.reduce((n,m)=>n+m.i.length/3,0),draws:result.meshes.length});
