import {Plane,Raycaster,Vector2,Vector3} from 'three';
import {pickComponent} from './selection.js';

// A device may opt into planar dragging for physical input. Capturing handlers
// reserve only its declared parts; empty space retains the viewer's orbit gesture.
export function createDeviceDrag(canvas,{camera,controls,getModel,getState,onStart=()=>{},onTap=()=>{}}){
 const raycaster=new Raycaster();raycaster.layers.enable(1);
 const pointer=new Vector2(),plane=new Plane(),point=new Vector3();
 let drag=null,pointerId=null,previousEnabled=true,origin=null,moved=false,tapHit=null;
 function ray(event){
  const rect=canvas.getBoundingClientRect();
  pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  camera.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);
 }
 function position(){return raycaster.ray.intersectPlane(plane,point)?{x:point.x,z:point.z}:null;}
 function swallow(event){event.preventDefault();event.stopImmediatePropagation();}
 function cancel(){
  if(!drag)return;
  const id=pointerId,finished=drag;drag=null;pointerId=null;tapHit=null;origin=null;
  finished.end();controls.enabled=previousEnabled;canvas.style.cursor='';
  if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 }
 canvas.addEventListener('pointerdown',event=>{
  if(drag){swallow(event);return;}
  const state=getState(),model=getModel(),candidate=model?.behavior?.drag;
  if(!candidate||event.button!==0||!event.isPrimary||state?.isolate||state?.explode>.002)return;
  ray(event);const hit=pickComponent(raycaster,model.groups,{preferredId:state?.selected});
  if(!hit||!candidate.partIds.includes(hit.id))return;
  plane.set(new Vector3(0,1,0),-candidate.planeY());const start=position();if(!start)return;
  drag=candidate;pointerId=event.pointerId;origin={x:event.clientX,y:event.clientY};moved=false;tapHit=hit;
  previousEnabled=controls.enabled;controls.enabled=false;onStart();drag.start(start);
  canvas.focus({preventScroll:true});canvas.setPointerCapture(pointerId);canvas.style.cursor='grabbing';swallow(event);
 },true);
 canvas.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==pointerId)return;
  // Preserve ordinary tapping; a few pixels of hand jitter should not move it.
  moved ||= Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>4;
  if(moved){ray(event);const next=position();if(next)drag.move(next);}
  swallow(event);
 },true);
 canvas.addEventListener('pointerup',event=>{
  if(!drag||event.pointerId!==pointerId)return;
  const tap=!moved?tapHit:null;cancel();swallow(event);if(tap)onTap(tap.id,tap.anchor);
 },true);
 canvas.addEventListener('pointercancel',event=>{if(event.pointerId===pointerId){cancel();swallow(event);}},true);
 canvas.addEventListener('lostpointercapture',event=>{if(event.pointerId===pointerId)cancel();},true);
 canvas.addEventListener('keydown',event=>{if(drag&&event.key==='Escape'){cancel();swallow(event);}},true);
 canvas.addEventListener('blur',cancel);
 window.addEventListener('blur',cancel);
 return{cancel,get active(){return!!drag;}};
}
