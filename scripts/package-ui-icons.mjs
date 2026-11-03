import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(new URL('../reference/untitled-ui/package.json',import.meta.url));
const {createElement}=require('react'),{renderToStaticMarkup}=require('react-dom/server'),icons=require('@untitledui/icons');
const names={sun:'Sun',moon:'Moon01',system:'Monitor01',chip:'CpuChip01',download:'Download01',arrow:'ArrowRight',isolate:'Maximize02',xray:'LayersThree01',labels:'Tag01',rotate:'RefreshCcw02',reset:'RefreshCcw01',plus:'Plus',minus:'Minus',play:'Play',pause:'PauseCircle',expand:'Maximize01',search:'SearchLg',cube:'Cube01'};
const paths=Object.fromEntries(Object.entries(names).map(([name,component])=>[name,renderToStaticMarkup(createElement(icons[component])).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')]));
fs.writeFileSync('src/ui-icons.js','// Official Untitled UI icons, retrieved through the Untitled UI MCP. Product use only.\nexport const icons='+JSON.stringify(paths,null,2)+';\n');
fs.copyFileSync('reference/untitled-ui/node_modules/@untitledui/icons/LICENSE','public/licenses/untitled-ui-icons.txt');
