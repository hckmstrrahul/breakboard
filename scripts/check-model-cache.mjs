import assert from 'node:assert/strict';
import * as T from 'three';
import {createModelCache,disposeModel} from '../src/model-cache.js';

const disposed=[],cache=createModelCache({limit:3,dispose:model=>disposed.push(model.id)});
let builds=0;
for(const id of ['a','b','c','a','d','e']){
 cache.protect([id]);await cache.load(id,()=>{builds++;return{id};});
 assert(cache.size<=3);assert(cache.ids.includes(id));
}
assert.equal(builds,5,'Retained devices are reused');assert.deepEqual(disposed,['b','c'],'Least recently used devices are released');
cache.protect(['bad']);await assert.rejects(cache.load('bad',()=>{throw Error('Retryable');}));
assert(!cache.ids.includes('bad'));await cache.load('bad',()=>({id:'bad'}));

let finish;
const pending=cache.load('slow',()=>new Promise(resolve=>{finish=resolve;}));await Promise.resolve();
cache.protect(['new']);await cache.load('new',()=>({id:'new'}));finish({id:'slow'});await pending;
assert(cache.ids.includes('new'));assert(cache.size<=3,'Late builds cannot expand the settled cache');

const geometry=new T.BoxGeometry(),texture=new T.Texture(),shared=new T.MeshBasicMaterial({map:texture});
const exclusive=new T.MeshBasicMaterial(),root=new T.Group(),retained=new T.Group();
root.add(new T.Mesh(geometry,shared));const own=new T.Mesh(new T.SphereGeometry(),exclusive);root.add(own);
retained.add(new T.Mesh(geometry,shared));
const counts={geometry:0,texture:0,shared:0,exclusive:0,own:0};
for(const[item,key]of [[geometry,'geometry'],[texture,'texture'],[shared,'shared'],[exclusive,'exclusive'],[own.geometry,'own']])item.addEventListener('dispose',()=>counts[key]++);
disposeModel({root},[{root:retained}]);
assert.deepEqual(counts,{geometry:0,texture:0,shared:0,exclusive:1,own:1},'Eviction preserves resources used by another model');
disposeModel({root:retained});assert.equal(counts.geometry,1);assert.equal(counts.texture,1);assert.equal(counts.shared,1);

// Deforming models own their contour geometry before anatomy is first opened.
// A retained model may share it; a built anatomy also references the same object.
for(const createAnatomy of [false,true]){
 const surface=new T.BoxGeometry(),edges=new T.EdgesGeometry(surface),material=new T.MeshBasicMaterial();
 surface.userData.anatomyEdges=edges;
 const first=new T.Group(),second=new T.Group();
 first.add(new T.Mesh(surface,material));second.add(new T.Mesh(surface,material));
 let releases=0;edges.addEventListener('dispose',()=>releases++);
 const model={root:first};
 if(createAnatomy){const context=new T.Group();context.add(new T.LineSegments(edges,new T.LineBasicMaterial()));model.anatomy={context};}
 disposeModel(model,[{root:second}]);assert.equal(releases,0,'Shared deforming contours survive eviction');
 disposeModel({root:second});assert.equal(releases,1,'Owned contours are released exactly once with or without anatomy');
}
console.log('PASS · bounded model reuse, failed-load retry, late completion and shared/owned-resource disposal');
