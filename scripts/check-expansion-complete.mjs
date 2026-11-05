// Final delivery gate for the explicitly approved forty-device expansion.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {BOARD_LIST} from '../src/boards.js';
import {ORIGINAL_DEVICE_IDS,EXPANSION_BATCHES,IMPLEMENTED_EXPANSION_IDS} from '../src/expansion-manifest.js';
const additions=EXPANSION_BATCHES.flat(),expected=[...ORIGINAL_DEVICE_IDS,...additions];
assert.equal(additions.length,40,'All forty approved additions are represented');
assert.equal(new Set(expected).size,65,'No duplicate or substituted catalogue IDs');
assert.deepEqual([...IMPLEMENTED_EXPANSION_IDS].sort(),[...additions].sort(),'Every approved batch is integrated');
assert.deepEqual(BOARD_LIST.map(d=>d.id).sort(),[...expected].sort(),'Catalogue contains the retained original25 and approved40');
const readme=await fs.readFile(new URL('../README.md',import.meta.url),'utf8');
const gallery=readme.slice(readme.indexOf('## Light-mode gallery'),readme.indexOf('## Run locally'));
const lines=gallery.split('\n'),start=lines.findIndex(line=>line.startsWith('| Device |'));
assert(start>=0,'Gallery has a Markdown table header');
const table=[];for(let i=start;i<lines.length&&lines[i].startsWith('|');i++)table.push(lines[i]);
assert.equal(table.length,67,'One continuous gallery table contains65 model rows');
for(const id of expected){
 const row=table.find(line=>line.includes(`docs/images/${id}-teardown-light.png`));assert(row,id+' gallery row');
 assert(row.includes(`docs/images/${id}-anatomy-light.png`),id+' paired anatomy image');
 for(const mode of['teardown','anatomy']){const p=new URL(`../docs/images/${id}-${mode}-light.png`,import.meta.url),bytes=await fs.readFile(p);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),id+' gallery PNG');assert.equal(bytes.readUInt32BE(16),2400,id+' exported gallery width');}
 for(const theme of['light','dark']){const bytes=await fs.readFile(new URL(`../src/previews/${id}-${theme}.webp`,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
}
for(const id of additions){const evidence=await fs.readFile(new URL(`../reference/${id}/evidence.md`,import.meta.url),'utf8');assert(evidence.length>500,id+' evidence record');assert(/https:\/\//.test(evidence),id+' source references');}
const proofDir=process.argv.find(arg=>arg.startsWith('--proof-dir='))?.slice('--proof-dir='.length);
if(proofDir){for(const id of expected)for(const theme of['light','dark'])for(const pose of['assembled','exploded']){const file=path.join(proofDir,`${id}-${pose}-${theme}.png`),bytes=await fs.readFile(file);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),file+' valid baseline PNG');}console.log('PASS260 baseline files exist; human visual review is a separate gate');}
console.log('PASS65 retained devices,40 evidence records,130 gallery exports,130 WebP previews and one complete gallery table');
