import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BOARD_LIST,BOARDS} from '../src/boards.js';
import {mergedSpecifications} from '../src/specifications.js';
import {createThemeController,THEME_KEY} from '../src/theme.js';
import {readJetsonData} from '../src/jetson.js';

const cpu=BOARDS.uno.parts.find(p=>p.id==='cpu');
assert.deepEqual(mergedSpecifications(BOARDS.uno,cpu),[
 ['Clock','16 MHz'],['Flash / SRAM','32 KB / 2 KB'],['Package','DIP-28'],['Digital I/O','14 pins'],['Analog inputs','6 pins'],['Board dimensions','68.58 × 53.34 mm']
]);
const module=BOARDS.jetson.parts.find(p=>p.id==='module');
assert.deepEqual(mergedSpecifications(BOARDS.jetson,module).slice(3),[['GPIO header','40 pins'],['USB Type-A','4 ports'],['Board dimensions','100 × 79 mm']]);
const bridge=BOARDS.uno.parts.find(p=>p.id==='bridge');
assert.deepEqual(mergedSpecifications(BOARDS.esp32,null),[['CPU clock','240 MHz'],['Radio band','2.4 GHz'],['SPI flash','4 MB'],['Header contacts','38 pins'],['Board dimensions','27.94 × 48.26 mm']],'Deselected inspector shows board facts without stale component information');
assert(mergedSpecifications(BOARDS.uno,bridge).some(([label])=>label==='Board CPU clock'),'Distinct processor clocks retain their scope');
for(const board of BOARD_LIST)for(const part of board.parts){
 const rows=mergedSpecifications(board,part);
 assert.deepEqual(rows.slice(0,part.specs.length),part.specs,'Detailed component information is retained');
 assert.equal(rows.filter(([,value])=>value.toLowerCase().replace(/\s/g,'')===board.dimensions.toLowerCase().replace(/ carrier$/,'').replace(/\s/g,'')).length,1,'Board dimensions appear exactly once');
 assert.equal(new Set(rows.map(row=>JSON.stringify(row))).size,rows.length,'No duplicate specification rows');
}

const root={dataset:{}},events=new Map(),store=new Map(),changes=[];
const media={matches:false,addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
const storage={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)};
const options={root,media,storage,onChange:(...state)=>changes.push(state)};
let theme=createThemeController(options);
assert.deepEqual(changes.at(-1),['dark','dark']);
assert.equal(root.dataset.theme,'dark','New visits default to dark even on a light system');
theme.set('system');assert.equal(root.dataset.theme,'light');
media.matches=true;events.get('change')();assert.equal(root.dataset.theme,'dark');
theme.set('light');assert.equal(root.dataset.theme,'light');assert.equal(store.get(THEME_KEY),'light');
events.get('change')();assert.equal(root.dataset.theme,'light','Explicit light ignores system dark');
theme.set('dark');media.matches=false;events.get('change')();assert.equal(root.dataset.theme,'dark');
theme.destroy();theme=createThemeController(options);assert.equal(theme.preference,'dark','Preference survives reload');
theme.set('system');assert.equal(root.dataset.theme,'light');
theme.destroy();store.set(THEME_KEY,'invalid');theme=createThemeController(options);assert.equal(theme.preference,'dark');theme.destroy();
createThemeController({...options,storage:{getItem(){throw Error('Denied');},setItem(){throw Error('Denied');}}}).set('dark');
assert.equal(root.dataset.theme,'dark','Unavailable storage does not block theme changes');
store.clear();store.set('teardown-appearance','light');theme=createThemeController(options);assert.equal(theme.preference,'light','Renaming retains the existing appearance preference');theme.set('dark');assert.equal(store.get(THEME_KEY),'dark');theme.destroy();

// Verify the production app really carries the CAD, then build without any network.
const encoded=fs.readFileSync('public/models/jetson.json.gz').toString('base64');
const app=fs.readdirSync('dist/assets').filter(file=>file.endsWith('.js')).map(file=>fs.readFileSync('dist/assets/'+file,'utf8')).join('');
assert(app.includes(encoded),'Jetson compressed CAD is bundled in the production app');
const standalone=fs.readFileSync('dist/breakboard.html','utf8');
assert.equal(standalone.split(encoded).length-1,1,'Offline build carries only one Jetson payload');
const fetch=globalThis.fetch,assets=globalThis.__BREAKBOARD_ASSETS;
try{
 globalThis.fetch=async()=>{throw Error('Network unavailable');};
 globalThis.__BREAKBOARD_ASSETS={jetson:encoded};
 const data=await readJetsonData();assert.equal(data.metadata.sourceMeshes,1920);assert.equal(data.meshes.reduce((sum,mesh)=>sum+mesh.i.length/3,0),267668);
}finally{globalThis.fetch=fetch;globalThis.__BREAKBOARD_ASSETS=assets;}
console.log('PASS · merged specifications, distinct fact scope, Light/Dark/System, persistence, system changes, denied storage and bundled Jetson without network');
