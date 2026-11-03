import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {readPiData} from '../src/pi5.js';
import {readJetsonData} from '../src/jetson.js';

const originalFetch=globalThis.fetch,originalDocument=globalThis.document,originalAssets=globalThis.__BREAKBOARD_ASSETS;
try{
 globalThis.document={baseURI:'http://localhost:5174/#uno'};
 for(const[id,read,shapeCount,groupCount,triangles]of [['pi5',readPiData,2711,23,836366],['jetson',readJetsonData,1920,14,267668]]){
  const compressed=fs.readFileSync(`public/models/${id}.json.gz`),decoded=gunzipSync(compressed);
  const verify=data=>{assert.equal(data.metadata.sourceMeshes,shapeCount);assert.equal(new Set(data.meshes.map(m=>m.group)).size,groupCount);assert.equal(data.meshes.reduce((n,m)=>n+m.i.length/3,0),triangles);};
  delete globalThis.__BREAKBOARD_ASSETS;
  // Browsers decode HTTP Content-Encoding before exposing the response body.
  globalThis.fetch=async url=>{assert.equal(url.pathname,`/models/${id}.json.gz`);return new Response(decoded,{headers:{'Content-Type':'application/json','Content-Encoding':'gzip'}});};
  verify(await read());
  globalThis.fetch=async()=>new Response(compressed,{headers:{'Content-Type':'application/gzip'}});verify(await read());
  globalThis.__BREAKBOARD_ASSETS={[id]:compressed.toString('base64')};globalThis.fetch=async()=>{throw Error('Offline model must not fetch');};verify(await read());
  delete globalThis.__BREAKBOARD_ASSETS;
  globalThis.fetch=async()=>new Response('Not found',{status:404});await assert.rejects(read(),/Could not load/);
  globalThis.fetch=async()=>new Response('<!doctype html>');await assert.rejects(read(),SyntaxError);
  console.log(`PASS · ${id} loader: browser-decoded, raw gzip, offline embedded, missing and invalid asset responses`);
 }
}finally{
 globalThis.fetch=originalFetch;
 if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;
 if(originalAssets===undefined)delete globalThis.__BREAKBOARD_ASSETS;else globalThis.__BREAKBOARD_ASSETS=originalAssets;
}
