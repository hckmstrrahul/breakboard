import assert from 'node:assert/strict';
import * as T from 'three';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BOARD_LIST} from '../src/boards.js';
import {createCalloutLayout,calloutVisible,calloutHeight} from '../src/selection.js';

const piAnchors=JSON.parse(gunzipSync(fs.readFileSync('public/models/pi5.json.gz'))).anchors;
for(const board of BOARD_LIST){
 const items=board.parts.map(part=>{const text=part.tag||part.short,w=Math.min(230,text.length*6+20);return{id:part.id,w,h:16+15*Math.ceil(text.length*6/(w-20)),minLeader:board.id==='uno'?24:8,part};});
 const view={w:900,h:Math.max(700,calloutHeight(items,{w:900}))};
 const half=board.assembledHalf||board.half,camera=new T.OrthographicCamera(-half*view.w/view.h,half*view.w/view.h,half,-half,.1,800),target=new T.Vector3(...(board.assembledTarget||board.target));
 const layout=createCalloutLayout(),previous=new Map(),direction=new T.Vector3(...board.camera).sub(new T.Vector3(...board.target));let positions,shown,maxAdjustment=0;
 for(let frame=0;frame<420;frame++){
  const angle=Math.min(frame,180)*.006;
  camera.position.copy(direction).applyAxisAngle(new T.Vector3(0,1,0),angle).add(target);camera.lookAt(target);camera.updateMatrixWorld();
  shown=items.map(item=>{const anchor=board.id==='pi5'?(piAnchors[item.id]||item.part.anchor):item.part.anchor,p=new T.Vector3(...anchor).project(camera);return{...item,point:{x:(p.x*.5+.5)*view.w,y:(-.5*p.y+.5)*view.h,depthVisible:p.z>-1&&p.z<1}};}).filter(item=>calloutVisible(item.point,view));
  positions=layout.update(shown,view,1/60);
  assert.equal(positions.size,shown.length,board.id+' keeps every in-view label');
  for(const item of shown){
   const p=positions.get(item.id),old=previous.get(item.id);
   assert(p.x>=5&&p.y>=5&&p.x+item.w<=view.w-5&&p.y+item.h<=view.h-5,board.id+' keeps text in bounds');
   assert(p.endX>=p.x&&p.endX<=p.x+item.w&&p.endY>=p.y&&p.endY<=p.y+item.h,board.id+' leader ends on the displayed box');
   if(old){
    const adjustment=Math.hypot(p.x-old.x-item.point.x+old.point.x,p.y-old.y-item.point.y+old.point.y);
    maxAdjustment=Math.max(maxAdjustment,adjustment);
    assert(adjustment<12,board.id+' avoids discontinuous repacking during a slow orbit: '+adjustment);
    if(frame>400)assert(adjustment<.01,board.id+' stops moving when the camera stops: '+adjustment);
   }
   previous.set(item.id,{...p,point:{...item.point}});
  }
 }
 for(let i=0;i<shown.length;i++)for(let j=0;j<i;j++){
  const a={...shown[i],...positions.get(shown[i].id)},b={...shown[j],...positions.get(shown[j].id)};
  assert(a.x+a.w<=b.x+.1||b.x+b.w<=a.x+.1||a.y+a.h<=b.y+.1||b.y+b.h<=a.y+.1,board.id+' settled labels do not overlap: '+a.id+'/'+b.id);
 }
 console.log(`PASS · ${board.tab}: orbit continuity, accurate leader endpoints, settled packing; max adjustment ${maxAdjustment.toFixed(2)} px/frame`);
}
// Repeatedly cross the old single-tag left/right threshold by a fraction of a
// pixel. The chosen side must not toggle as the anchor jitters at that boundary.
const view={w:600,h:400},single=createCalloutLayout();let prior;
for(let frame=0;frame<100;frame++){
 const point={x:371+(frame%2?.1:-.1),y:200},item={id:'one',point,w:200,h:31,minLeader:24},p=single.update([item],view,1/60).get('one');
 if(prior)assert(Math.hypot(p.x-prior.x,p.y-prior.y)<5,'Selected tag stays stable at its previous side-switch threshold');prior=p;
}
const small={w:320,h:400},item={id:'one',point:{x:300,y:200},w:160,h:31};
const resized=single.update([item],small).get('one');assert(resized.x>=5&&resized.x+item.w<=315,'Resize drops stale viewport coordinates');
single.reset();assert.deepEqual(single.update([item],small),createCalloutLayout().update([item],small),'Board/selection reset discards prior packing');
assert(calloutVisible({x:1,y:100},view,true));assert(!calloutVisible({x:1,y:100},view,false));assert(!calloutVisible({x:-3,y:100},view,true));assert(!calloutVisible({x:100,y:100,depthVisible:false},view,true));
console.log('PASS · selected-tag hysteresis, resize/reset and unclamped offscreen anchors');
