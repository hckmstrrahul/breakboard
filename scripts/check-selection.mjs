import assert from 'node:assert/strict';
import * as T from 'three';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {BOARDS} from '../src/boards.js';
import {pickComponent,projectAnchor,placeCallout,placeCallouts,calloutHeight,createPickGesture} from '../src/selection.js';

const root=new T.Group(),groups={ports:new T.Group(),pcb:new T.Group()};
for(const [id,group]of Object.entries(groups)){root.add(group);group.userData.partId=id;}
function box(group,id,x,y,z,w,h,d){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial());mesh.position.set(x,y,z);mesh.userData.partId=id;mesh.layers.set(1);group.add(mesh);return mesh;}
box(groups.ports,'ports',-8,3,0,4,4,4);box(groups.ports,'ports',8,3,0,4,4,4);
box(groups.pcb,'pcb',0,0,0,30,1,20);
const ray=new T.Raycaster();ray.layers.enable(1);
ray.set(new T.Vector3(80,30,80),new T.Vector3(0,-1,0));
assert.equal(pickComponent(ray,groups),null,'Clicking empty space has no selected component');
ray.set(new T.Vector3(8,30,0),new T.Vector3(0,-1,0));
const right=pickComponent(ray,groups);assert.equal(right.id,'ports');assert.deepEqual(right.anchor.toArray(),[8,5,0]);
assert.equal(pickComponent(ray,groups,{preferredId:'pcb'}).id,'pcb','Anatomy picking follows its selected-through-shell rendering order');
assert.equal(right.anchor.surface.object.parent,groups.ports);
const surface=right.anchor.surface,originalSurface=surface.object.localToWorld(surface.point.clone());
surface.object.rotation.z=.3;surface.object.updateWorldMatrix(true,false);
assert(surface.object.localToWorld(surface.point.clone()).distanceTo(originalSurface)>.01,'Exact picked surface can follow a moving impeller');
surface.object.rotation.z=0;
ray.set(new T.Vector3(-8,30,0),new T.Vector3(0,-1,0));
const left=pickComponent(ray,groups);assert.equal(left.id,'ports');assert.equal(left.anchor.x,-8,'Separate pieces in one group retain different hit points');
groups.ports.visible=false;assert.equal(pickComponent(ray,groups).id,'pcb','Hidden/isolate proxies do not intercept picks');groups.ports.visible=true;
groups.ports.position.set(4,16,-3);root.updateMatrixWorld(true);
ray.set(new T.Vector3(12,40,-3),new T.Vector3(0,-1,0));
assert.deepEqual(pickComponent(ray,groups).anchor.toArray(),right.anchor.toArray(),'Exploded hits convert back to assembled group coordinates');

const camera=new T.OrthographicCamera(-40,40,30,-30,.1,300),size={w:800,h:600};
for(const position of [[50,60,80],[-60,40,50],[0,90,.01]]){
 camera.position.set(...position);camera.lookAt(0,10,0);camera.updateMatrixWorld(true);
 for(const separation of [0,.25,.5,1]){
  groups.ports.position.set(4*separation,16*separation,-3*separation);root.updateMatrixWorld(true);
  const projected=projectAnchor(groups.ports,right.anchor,camera,size);
  ray.setFromCamera(new T.Vector2(projected.x/size.w*2-1,1-projected.y/size.h*2),camera);
  const expected=right.anchor.clone().add(groups.ports.position);
  assert(ray.ray.distanceToPoint(expected)<1e-8,'Leader point stays on the clicked surface after separation/orbit');
 }
}
groups.ports.position.x=1000;root.updateMatrixWorld(true);assert.equal(projectAnchor(groups.ports,right.anchor,camera,size).visible,false,'Offscreen anchors are not clamped onto other parts');
for(const point of [{x:2,y:2},{x:318,y:398},{x:160,y:200}]){
 const placement=placeCallout(point,{w:180,h:34},{w:320,h:400});
 assert(placement.x>=5&&placement.x+180<=315&&placement.y>=5&&placement.y+34<=395);
 assert(placement.endX>=placement.x&&placement.endX<=placement.x+180);
 assert(placement.endY>=placement.y&&placement.endY<=placement.y+34);
}
// Exercise real component anchors in dense assembled, exploded and edge-on views.
const piAnchors=JSON.parse(gunzipSync(fs.readFileSync('public/models/pi5.json.gz'))).anchors;
for(const board of Object.values(BOARDS))for(const width of [320,800,1260])for(const pose of [0,1])for(const viewName of ['3d','front','top']){
 const items=board.parts.map(part=>{
  const text=part.tag||part.short,w=Math.min(230,width/2-20,text.length*6+20);
  return{id:part.id,w,h:16+15*Math.ceil(text.length*6/(w-20)),part,minLeader:board.id==='uno'?24:8};
 });
 const view={w:width,h:Math.max(width===320?360:600,calloutHeight(items,{w:width}))};
 const half=Math.max(board.half,(board.minHalfWidth||board.half*.82)/(view.w/view.h));
 const camera=new T.OrthographicCamera(-half*view.w/view.h,half*view.w/view.h,half,-half,.1,800);
 camera.position.set(...(viewName==='3d'?board.camera:viewName==='front'?[0,30,180]:[0,180,.01]));camera.lookAt(...board.target);camera.updateMatrixWorld();
 for(const item of items){
  const anchor=board.id==='pi5'?(piAnchors[item.id]||item.part.anchor):item.part.anchor;
  const point=new T.Vector3(...anchor).addScaledVector(new T.Vector3(...item.part.offset),pose).project(camera);
  item.point={x:(point.x*.5+.5)*view.w,y:(-.5*point.y+.5)*view.h};
 }
 const shown=items.filter(item=>item.point.x>=0&&item.point.x<=view.w&&item.point.y>=0&&item.point.y<=view.h);
 const anchors=shown.map(item=>({...item.point})),placements=placeCallouts(shown,view),boxes=[];
 const context=`${board.id} ${width}px ${viewName} separation=${pose}`;
 assert.equal(placements.size,shown.length,context+' every component receives a tag');
 assert.deepEqual(shown.map(item=>item.point),anchors,'Packing never changes the real component anchors');
 for(const item of shown){
  const p=placements.get(item.id),box={x:p.x,y:p.y,w:item.w,h:item.h};
  assert(p.x>=8&&p.y>=8&&p.x+item.w<=view.w-8&&p.y+item.h<=view.h-8,context+' tags stay inside the viewport');
  assert(p.endX>=p.x&&p.endX<=p.x+item.w&&p.endY>=p.y&&p.endY<=p.y+item.h,context+' leader ends at its tag');
  for(const other of boxes)assert(box.x+box.w<=other.x||other.x+other.w<=box.x||box.y+box.h<=other.y||other.y+other.h<=box.y,context+' tags never overlap');
  if(width>=800)assert(Math.hypot(p.endX-item.point.x,p.endY-item.point.y)<(board.id==='uno'?360:220),context+' avoids long hanging leaders');
  boxes.push(box);
 }
}
for(const part of BOARDS.uno.parts.filter(part=>part.id.startsWith('u-'))){
 const ref=part.specs.find(([key])=>key==='Reference')[1];
 assert(part.tag.startsWith(ref+' · ')&&part.tag.length>ref.length+5,'Uno overview labels name the component type as well as its reference');
 assert(part.short.startsWith(ref+' · '),'Selected tag keeps its full component description');
}
assert.equal(placeCallouts([],size).size,0);
const uncrowded=[{id:'left',point:{x:300,y:200},w:120,h:31},{id:'right',point:{x:500,y:300},w:120,h:31}];
for(const item of uncrowded){const p=placeCallouts(uncrowded,size).get(item.id),distance=Math.hypot(p.endX-item.point.x,p.endY-item.point.y);assert(distance>=8&&distance<=24,'Uncrowded tags keep their short connector and leave the anchor visible');}
const only={id:'one',point:{x:100,y:200},w:180,h:34};
assert.deepEqual(placeCallouts([only],size).get('one'),placeCallout(only.point,only,size),'A single component keeps its existing callout placement');
const gesture=createPickGesture(),event=(x=10,y=10,extra={})=>({pointerId:1,clientX:x,clientY:y,button:0,isPrimary:true,...extra});
gesture.start(event());assert(gesture.end(event(12,11)),'Small click movement is tolerated');
gesture.start(event());gesture.move(event(40,40));assert(!gesture.end(event()),'Drag returning to its origin is not a click');
gesture.start(event());gesture.cancel();assert(!gesture.end(event()),'Canceled touch cannot select');
gesture.start(event(10,10,{button:2}));assert(!gesture.end(event()),'Right-button pan cannot select');
gesture.start(event());gesture.start(event(10,10,{pointerId:2,isPrimary:false}));assert(!gesture.end(event()),'Pinch gesture cannot select');
console.log('PASS · exact surface anchors, grouped/batched proxies, hidden parts, exploded/orbit projection, nonoverlapping overview labels and drag/touch cancellation');
