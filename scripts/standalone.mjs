import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {BOARD_LIST} from '../src/boards.js';
// A portable offline version of the same application, including fonts and Three.js.
const inlineAssets={name:'inline-assets',setup(build){
 build.onResolve({filter:/\?url&inline$/},args=>({path:path.resolve(args.resolveDir,args.path.split('?')[0]),namespace:'inline-asset'}));
 build.onLoad({filter:/.*/,namespace:'inline-asset'},args=>({contents:`export default ${JSON.stringify('data:application/gzip;base64,'+fs.readFileSync(args.path).toString('base64'))}`,loader:'js'}));
}};
const result=await build({entryPoints:['src/main.js'],bundle:true,minify:true,write:false,format:'iife',target:'es2022',outdir:'out',loader:{'.woff2':'dataurl','.woff':'dataurl','.svg':'dataurl','.webp':'dataurl'},plugins:[inlineAssets],legalComments:'none'});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
const brandIcon='data:image/svg+xml;base64,'+fs.readFileSync('src/brand.svg').toString('base64');
const source=fs.readFileSync('index.html','utf8').replace('href="/src/brand.svg"',`href="${brandIcon}"`);
// Jetson is already in the shared application bundle; embed each payload once.
const assets=JSON.stringify(Object.fromEntries(fs.readdirSync('public/models').filter(f=>f.endsWith('.json.gz')&&f!=='jetson.json.gz').map(f=>[f.replace('.json.gz',''),fs.readFileSync('public/models/'+f).toString('base64')])));
const notices=fs.readdirSync('public/licenses').filter(f=>f.endsWith('.txt')).map(f=>f+'\n'+fs.readFileSync('public/licenses/'+f,'utf8')).join('\n\n');
const html=source.replace('<head>','<head>\n<!-- '+notices.replaceAll('--','—')+' -->').replace(/<script type="module" src="\/src\/main.js"><\/script>/,()=>`<style>${css}</style><script>globalThis.__BREAKBOARD_ASSETS=${assets};</script><script>${js}</script>`);
fs.writeFileSync('dist/breakboard.html',html);
const bytes=Buffer.byteLength(html);
console.log(`Offline collection: dist/breakboard.html (${Math.round(bytes/1024)} KB)`);
// Measure the actual portable build. README is omitted from CLI deployment uploads.
if(fs.existsSync('README.md')){
 const readme=fs.readFileSync('README.md','utf8');
 const block=/<!-- offline-stats:start -->[\s\S]*?<!-- offline-stats:end -->/;
 if(!block.test(readme))throw new Error('README is missing its offline-stats markers');
 const count=BOARD_LIST.length;
 const summary=`**${count} interactive ${count===1?'device':'devices'} in one ${(bytes/1e6).toFixed(2)} MB HTML file** (${(bytes/1024**2).toFixed(2)} MiB).`;
 const updated=readme.replace(block,`<!-- offline-stats:start -->\n${summary}\n<!-- offline-stats:end -->`);
 if(updated!==readme)fs.writeFileSync('README.md',updated);
}
