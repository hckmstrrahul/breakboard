import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {disposeModel} from './model-cache.js';

// One WebGL context, scissored into the visible tiles. No per-card canvases,
// shadow-map passes, anatomy copies or operation effects in collection mode.
export function createCollectionRenderer(canvas,{boards,pixelRatio=Math.min(devicePixelRatio,1.5),capacity=24,squareFraming=false,onReady=()=>{},onError=()=>{}}){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
 renderer.setPixelRatio(pixelRatio);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.autoClear=false;
 const environment=new RoomEnvironment(),pm=new T.PMREMGenerator(renderer),env=pm.fromScene(environment,.08);environment.dispose();pm.dispose();
 const definitions=new Map(boards.map(b=>[b.id,b])),entries=new Map(),protectedIds=new Set(),Y=new T.Vector3(0,1,0);
 let width=1,height=1,tick=0,dark=true,loading=0,pumping=false,disposed=false,frames=0;
 const queue=[];
 function trim(){
  const ready=[...entries.values()].filter(e=>e.model).sort((a,b)=>a.used-b.used);
  let extra=ready.length-capacity;
  for(const entry of ready){if(extra<=0)break;if(protectedIds.has(entry.id))continue;entries.delete(entry.id);entry.scene.remove(entry.model.root);disposeModel(entry.model,[...entries.values()].flatMap(e=>e.model?[e.model]:[]));extra--;}
 }
 function bounds(model){const box=new T.Box3();for(const group of Object.values(model.groups)){group.updateWorldMatrix(true,true);box.expandByObject(group,true);}return box;}
 function fit(box,direction){const half=box.getSize(new T.Vector3()).multiplyScalar(.5),radius=Math.hypot(half.x,half.z);return{center:box.getCenter(new T.Vector3()),radius,vertical:half.y*Math.sqrt(1-direction.y**2)+radius*Math.abs(direction.y),distance:Math.max(80,box.getSize(new T.Vector3()).length()*3)};}
 function prepare(entry,model){
  model.setSelection(null,false,false);model.setPose(0);const a=bounds(model);model.setPose(1);const b=bounds(model);model.setPose(0);model.guides.visible=false;
  const definition=definitions.get(entry.id),direction=new T.Vector3(...definition.camera).sub(new T.Vector3(...definition.target)).normalize();
  const scene=new T.Scene();scene.environment=env.texture;scene.environmentIntensity=.55;scene.add(model.root,new T.HemisphereLight('#ffffff','#b7bdc4',.65));
  const key=new T.DirectionalLight('#ffffff',2.4);key.position.set(-45,95,45);scene.add(key);
  const fill=new T.DirectionalLight('#f5f7ff',.65);fill.position.set(50,35,-55);scene.add(fill);
  Object.assign(entry,{model,scene,direction,assembled:fit(a,direction),exploded:fit(b,direction),camera:new T.OrthographicCamera(-1,1,1,-1,.1,800),used:++tick});
  trim();onReady(entry.id);
 }
 async function pump(){
  if(pumping||disposed)return;pumping=true;
  while(queue.length&&!disposed){
   const entry=queue.shift();if(entries.get(entry.id)!==entry)continue;
   loading++;
   try{const model=await definitions.get(entry.id).build();if(disposed){disposeModel(model);entry.resolve();}else{prepare(entry,model);entry.resolve(model);}}
   catch(error){if(entries.get(entry.id)===entry)entries.delete(entry.id);entry.reject(error);onError(entry.id,error);}
   finally{loading--;}
   // Leave an input/paint opportunity between procedural model builds.
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  pumping=false;
 }
 function load(id){
  if(!definitions.has(id))return Promise.reject(Error('Unknown model '+id));
  let entry=entries.get(id);
  if(!entry){entry={id,used:++tick};entry.promise=new Promise((resolve,reject)=>Object.assign(entry,{resolve,reject}));entries.set(id,entry);queue.push(entry);pump();}
  entry.used=++tick;return entry.promise;
 }
 function protect(ids){protectedIds.clear();for(const id of ids)protectedIds.add(id);
  // Cancel queued work that a quick scroll has already left behind.
  for(let i=queue.length-1;i>=0;i--)if(!protectedIds.has(queue[i].id)){const e=queue.splice(i,1)[0];entries.delete(e.id);e.resolve();}
  trim();
 }
 function resize(w,h,ratio=pixelRatio){width=Math.max(1,w);height=Math.max(1,h);renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);}
 function render(tiles){
  renderer.setScissorTest(false);renderer.setClearColor(dark?'#14171c':'#efeee9',1);renderer.clear();renderer.setScissorTest(true);renderer.info.reset();renderer.info.autoReset=false;
  for(const tile of tiles){
   const e=entries.get(tile.id);if(!e?.model)continue;const {x,y,w,h}=tile.rect;
   if(x+w<=0||x>=width||y+h<=0||y>=height)continue;
   const left=Math.max(0,x),bottom=Math.max(0,height-y-h),right=Math.min(width,x+w),top=Math.min(height,height-y);
   renderer.setViewport(x,height-y-h,w,h);renderer.setScissor(left,bottom,right-left,top-bottom);renderer.clearDepth();
   const u=tile.explode||0,a=e.assembled,b=e.exploded,target=a.center.clone().lerp(b.center,u),radius=T.MathUtils.lerp(a.radius,b.radius,u),vertical=T.MathUtils.lerp(a.vertical,b.vertical,u),distance=T.MathUtils.lerp(a.distance,b.distance,u),aspect=w/h;
   // Square source images use object-fit:contain. Match that exact framing in
   // the live preview at every tile aspect ratio, so the handoff never jumps.
   const half=squareFraming?Math.max(vertical/.82,radius/.84,.01)/Math.min(1,aspect):Math.max(vertical/.82,radius/aspect/.84,.01);
   const camera=e.camera;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.near=Math.max(.01,distance-half*4);camera.far=distance+half*6+100;
   camera.position.copy(e.direction).multiplyScalar(distance).applyAxisAngle(Y,tile.angle||0).add(target);camera.lookAt(target);camera.updateProjectionMatrix();
   e.model.setPose(u);e.model.guides.visible=false;renderer.render(e.scene,camera);e.used=++tick;
  }
  renderer.setScissorTest(false);frames++;
 }
 function clear(){protectedIds.clear();for(const e of queue.splice(0)){entries.delete(e.id);e.resolve();}const models=[...entries.values()].filter(e=>e.model);for(const e of models){entries.delete(e.id);disposeModel(e.model,[...entries.values()].flatMap(e=>e.model?[e.model]:[]));}renderer.renderLists.dispose();}
 return{renderer,resize,load,protect,render,has:id=>!!entries.get(id)?.model,setTheme:theme=>{dark=theme==='dark';},clear,
  get diagnostics(){return{frames,loaded:[...entries.values()].filter(e=>e.model).map(e=>e.id),pending:queue.length+loading,protected:[...protectedIds],drawCalls:renderer.info.render.calls,memory:{...renderer.info.memory},contextLost:renderer.getContext().isContextLost()};},
  dispose(){disposed=true;clear();env.dispose();renderer.dispose();}
 };
}
