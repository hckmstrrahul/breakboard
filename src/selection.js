import {Vector3} from 'three';

// Original meshes remain pickable on layer 1 when their render geometry is batched.
export function pickComponent(raycaster,groups,{preferredId=null}={}){
 for(const group of Object.values(groups))group.updateWorldMatrix(true,true);
 const hits=raycaster.intersectObjects(Object.values(groups),true).filter(hit=>{
  if(!hit.object.isMesh||!groups[hit.object.userData.partId])return false;
  for(let object=hit.object;object;object=object.parent)if(!object.visible)return false;
  return true;
 });
 // Anatomy renders the selected assembly above its transparent context. Picking
 // uses that same ordering so a visible internal part is not stolen by its shell.
 const hit=hits.find(hit=>hit.object.userData.partId===preferredId)||hits[0];
 if(!hit)return null;
 const id=hit.object.userData.partId;
 const anchor=groups[id].worldToLocal(hit.point.clone());
 anchor.surface={object:hit.object,point:hit.object.worldToLocal(hit.point.clone())};
 return{id,anchor};
}

export function projectAnchor(group,anchor,camera,size){
 const point=group.localToWorld(new Vector3().copy(anchor)).project(camera);
 return{x:(point.x*.5+.5)*size.w,y:(-.5*point.y+.5)*size.h,
  depthVisible:point.z>-1&&point.z<1,
  visible:point.z>-1&&point.z<1&&Math.abs(point.x)<=1&&Math.abs(point.y)<=1};
}

// A small edge hysteresis prevents repeated hide/show at the clip boundary.
// Never move the projected anchor onto the viewport edge or another component.
export function calloutVisible(point,view,wasVisible=false){
 const inset=wasVisible?-2:4;
 return point.depthVisible!==false&&point.x>=inset&&point.y>=inset&&point.x<=view.w-inset&&point.y<=view.h-inset;
}

// Constrain the text box only. Its leader always starts at the true 3D point.
export function placeCallout(point,label,view){
 const pad=5,gap=24,clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max)));
 const right=point.x+gap+label.w<=view.w-pad;
 const x=clamp(right?point.x+gap:point.x-gap-label.w,pad,view.w-label.w-pad);
 const y=clamp(point.y-label.h/2,pad,view.h-label.h-pad);
 return{x,y,endX:clamp(point.x,x,x+label.w),endY:clamp(point.y,y,y+label.h)};
}

// Search around each anchor in every direction. Vertical columns make an
// assembled board's clustered anchors produce long, downward-hanging leaders.
export function placeCallouts(items,view,preferred=new Map()){
 if(items.length===1&&!preferred.has(items[0].id))return new Map([[items[0].id,placeCallout(items[0].point,items[0],view)]]);
 const pad=8,gap=5,result=new Map(),placed=[],clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max)));
 const ordered=[...items].sort((a,b)=>b.w*b.h-a.w*a.h||a.id.localeCompare(b.id));
 for(const item of ordered){
  const {point:p,w,h}=item,prior=preferred.get(item.id);let best={...placeCallout(p,item,view),w,h},bestScore=Infinity;
  const overlaps=(x,y,other)=>Math.min(x+w+gap,other.x+other.w)>Math.max(x-gap,other.x)&&Math.min(y+h+gap,other.y+other.h)>Math.max(y-gap,other.y);
  const consider=(cx,cy)=>{
   const x=clamp(cx,pad,view.w-pad-w),y=clamp(cy,pad,view.h-pad-h),endX=clamp(p.x,x,x+w),endY=clamp(p.y,y,y+h);
   const distance=(endX-p.x)**2+(endY-p.y)**2;if(distance<(item.minLeader||8)**2)return;
   let score=distance+.01*((x+w/2-p.x)**2+(y+h/2-p.y)**2);
   if(prior)score+=4*((x-prior.x)**2+(y-prior.y)**2);
   for(const other of placed){
    const ox=Math.min(x+w+gap,other.x+other.w)-Math.max(x-gap,other.x),oy=Math.min(y+h+gap,other.y+other.h)-Math.max(y-gap,other.y);
    if(ox>0&&oy>0)score+=1e7+ox*oy*1e4;
   }
   if(score>=bestScore)return;
   // Avoid hiding another component's endpoint underneath a text box.
   for(const other of items)if(other!==item&&other.point.x>x-3&&other.point.x<x+w+3&&other.point.y>y-3&&other.point.y<y+h+3)score+=900;
   if(score<bestScore){bestScore=score;best={x,y,endX,endY,w,h};}
  };
  // Keep a valid anchor-relative position instead of switching between equally
  // good radial candidates every frame. Only crowding/bounds require a new slot.
  if(prior){
   const x=clamp(prior.x,pad,view.w-pad-w),y=clamp(prior.y,pad,view.h-pad-h),endX=clamp(p.x,x,x+w),endY=clamp(p.y,y,y+h);
   const distance=Math.hypot(endX-p.x,endY-p.y);
   if(distance>=(item.minLeader||8)&&distance<=Math.max(220,(item.minLeader||8)*15)&&!placed.some(other=>overlaps(x,y,other))){
    best={x,y,endX,endY,w,h};placed.push(best);result.set(item.id,best);continue;
   }
   consider(x,y);
   for(const other of placed){
    for(const cx of[other.x-w-gap,other.x+other.w+gap])consider(cx,y);
    for(const cy of[other.y-h-gap,other.y+other.h+gap])consider(x,cy);
   }
  }
  for(const radius of [24,40,60,84,112,144,180,224,280,352,448,576,736,944]){
   if(radius>Math.hypot(view.w,view.h))break;
   for(let angle=0;angle<16;angle++){
    const dx=Math.cos(angle*Math.PI/8),dy=Math.sin(angle*Math.PI/8);
    consider(p.x+dx*radius-(Math.abs(dx)<.001?w/2:dx<0?w:0),p.y+dy*radius-(Math.abs(dy)<.001?h/2:dy<0?h:0));
   }
   if(radius>Math.sqrt(bestScore)+Math.max(w,h))break;
  }
  // Obstacle edges fill small local gaps that a radial candidate can miss.
  for(const other of placed){
   for(const x of [other.x-w-gap,other.x+other.w+gap])consider(x,p.y-h/2);
   for(const y of [other.y-h-gap,other.y+other.h+gap])consider(p.x-w/2,y);
  }
  placed.push(best);result.set(item.id,best);
 }
 return result;
}

// Retain packing targets across camera frames. Boxes follow their anchors
// immediately; any necessary collision adjustment eases independently. Leaders
// are always recomputed from the current anchor to the actually drawn box.
export function createCalloutLayout(){
 let history=new Map(),lastView=null;
 const clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max)));
 return{
  reset(){history.clear();lastView=null;},
  update(items,view,dt=1/60,{reduced=false}={}){
   if(!lastView||lastView.w!==view.w||lastView.h!==view.h)history.clear();
   lastView={...view};
   const preferred=new Map();
   for(const item of items){
    const old=history.get(item.id);
    if(old&&old.w===item.w&&old.h===item.h)preferred.set(item.id,{x:old.target.x+item.point.x-old.point.x,y:old.target.y+item.point.y-old.point.y});
   }
   const targets=placeCallouts(items,view,preferred),result=new Map();
   const seconds=Math.max(0,Math.min(.08,dt)),ease=1-Math.exp(-seconds/.12);
   for(const item of items){
    const {id,point,w,h}=item,target=targets.get(id),old=preferred.has(id)?history.get(id):null;
    let x=target.x,y=target.y;
    if(old&&!reduced){
     x=old.x+point.x-old.point.x;y=old.y+point.y-old.point.y;
     const dx=target.x-x,dy=target.y-y,distance=Math.hypot(dx,dy);
     const fraction=distance<.1?1:Math.min(ease,240*seconds/distance);
     x+=dx*fraction;y+=dy*fraction;
    }
    x=clamp(x,5,view.w-w-5);y=clamp(y,5,view.h-h-5);
    const placement={x,y,endX:clamp(point.x,x,x+w),endY:clamp(point.y,y,y+h)};
    result.set(id,placement);history.set(id,{...placement,target,point:{...point},w,h});
   }
   return result;
  }
 };
}

// Narrow screens may need extra area, but no longer grow to two full columns.
export function calloutHeight(items,view){
 return Math.ceil(items.reduce((sum,item)=>sum+(item.w+10)*(item.h+10),0)*1.6/Math.max(1,view.w-16));
}

export function createPickGesture(threshold=5){
 let active=null;
 return{
  start(event){if(event.isPrimary===false||event.button!==0){active=null;return;}active={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};},
  move(event){if(active?.id===event.pointerId&&Math.hypot(event.clientX-active.x,event.clientY-active.y)>threshold)active.moved=true;},
  end(event){this.move(event);const clicked=!!active&&active.id===event.pointerId&&!active.moved;active=null;return clicked;},
  cancel(){active=null;}
 };
}
