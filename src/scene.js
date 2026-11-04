import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {pickComponent,projectAnchor,createPickGesture} from './selection.js';
import {createOperation} from './operation.js';
import {createAnatomy} from './anatomy.js';


export function createScene(host,onSelect){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Interactive 3D ESP32 teardown. Drag to orbit and scroll to zoom. Use the component list to select a part.');canvas.tabIndex=0;host.prepend(canvas);
 const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor('#efeee9',0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;
 const scene=new T.Scene();const camera=new T.OrthographicCamera(-70,70,48,-48,.1,800);camera.position.set(76,80,105);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,10,-4);controls.enableDamping=true;controls.dampingFactor=.09;controls.minZoom=.55;controls.maxZoom=20;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI*.88;controls.enablePan=true;controls.autoRotateSpeed=.65;controls.update();
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const delta=camera.position.clone().sub(controls.target),spherical=new T.Spherical().setFromVector3(delta),step=Math.PI/24;if(e.key==='ArrowLeft')spherical.theta-=step;if(e.key==='ArrowRight')spherical.theta+=step;if(e.key==='ArrowUp')spherical.phi=Math.max(controls.minPolarAngle,spherical.phi-step);if(e.key==='ArrowDown')spherical.phi=Math.min(controls.maxPolarAngle,spherical.phi+step);camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(spherical));transition=null;controls.update();});
 const environment=new RoomEnvironment();const pm=new T.PMREMGenerator(renderer);const env=pm.fromScene(environment,.08);scene.environment=env.texture;scene.environmentIntensity=.55;environment.dispose();pm.dispose();
 scene.add(new T.HemisphereLight('#ffffff','#b7bdc4',.65));
 const key=new T.DirectionalLight('#ffffff',2.4);key.position.set(-45,95,45);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:300});key.shadow.bias=-.0004;key.shadow.normalBias=.05;key.shadow.radius=5;key.shadow.blurSamples=8;scene.add(key);
 const fill=new T.DirectionalLight('#f5f7ff',.65);fill.position.set(50,35,-55);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(500,500),new T.ShadowMaterial({color:'#62656b',opacity:.19}));floor.rotation.x=-Math.PI/2;floor.position.y=-19.2;floor.receiveShadow=true;scene.add(floor);
 let model=null,parts=[],partMap=new Map(),definition=null; const cache=new Map(); let loadVersion=0;
 const pose=e=>Object.fromEntries(parts.map(p=>[p.id,p.offset.map(v=>v*e)]));
 // An unobtrusive ground datum marks the physical assembly axis.
 const ring=new T.Mesh(new T.RingGeometry(33.95,34.03,128),new T.MeshBasicMaterial({color:'#c9cbc0',side:T.DoubleSide,transparent:true,opacity:.55}));ring.rotation.x=-Math.PI/2;ring.position.y=-19.1;scene.add(ring);
 let themeBackground='#efeee9',darkTheme=false,lastState=null,inView=true;
 const inViewObserver=new IntersectionObserver(entries=>{inView=entries.at(-1).isIntersecting;});inViewObserver.observe(host);
 const setTheme=mode=>{const dark=darkTheme=mode==='dark';themeBackground=dark?'#14171c':'#efeee9';renderer.setClearColor(themeBackground,0);floor.material.color.set(dark?'#04060a':'#62656b');floor.material.opacity=dark?.4:.19;ring.material.color.set(dark?'#697784':'#c9cbc0');ring.material.opacity=dark?.3:.55;model?.guides.traverse(object=>{if(object.material?.color)object.material.color.set(dark?'#a1abb7':'#8b9185');});model?.operation?.setTheme(dark);model?.anatomy?.setTheme(dark);};
 const pick=new T.Raycaster();pick.layers.enable(1);const pointer=new T.Vector2(),gesture=createPickGesture();
 canvas.addEventListener('pointerdown',e=>gesture.start(e));
 canvas.addEventListener('pointermove',e=>gesture.move(e));
 canvas.addEventListener('pointercancel',()=>gesture.cancel());
 canvas.addEventListener('lostpointercapture',()=>gesture.cancel());
 canvas.addEventListener('pointerup',e=>{if(!gesture.end(e)||!model)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);camera.updateMatrixWorld(true);pick.setFromCamera(pointer,camera);const hit=pickComponent(pick,model.groups,{preferredId:lastState?.xray?lastState.selected:null});onSelect(hit?.id??null,hit?.anchor??null);});
 let size={w:1,h:1}, transition=null, selected=null,isolated=false,selectionAnchor=null,selectionSurface=null,framingPose=0,fitPose=0,autoFrame=true;
 const frameTarget=(e=fitPose)=>new T.Vector3(...(definition?.assembledTarget||definition?.target||[0,10,-4])).lerp(new T.Vector3(...(definition?.target||[0,10,-4])),e);
 const projection=()=>{const aspect=size.w/size.h,base=T.MathUtils.lerp(definition?.assembledHalf||definition?.half||45,definition?.half||45,fitPose),half=Math.max(base,(definition?.minHalfWidth||base*.82)/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();};
 const resize=()=>{size={w:Math.max(1,host.clientWidth),h:Math.max(1,host.clientHeight)};renderer.setSize(size.w,size.h);projection();};
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const camTo=(pos,target,zoom=1)=>{transition={from:camera.position.clone(),to:new T.Vector3(...pos),a:controls.target.clone(),b:new T.Vector3(...target),z0:camera.zoom,z1:zoom,start:performance.now()};};
 let views={perspective:[76,80,105],top:[0,160,-3.99],front:[0,30,150]};
 const view=(name,immediate=false)=>{autoFrame=true;fitPose=framingPose;projection();const target=frameTarget(),shift=target.clone().sub(new T.Vector3(...(definition?.target||[0,10,-4]))),position=new T.Vector3(...views[name]).add(shift);if(immediate){camera.position.copy(position);controls.target.copy(target);camera.zoom=1;camera.updateProjectionMatrix();transition=null;controls.update();}else camTo(position.toArray(),target.toArray());};
 controls.addEventListener('start',()=>{transition=null;autoFrame=false;});
 const focus=(id,e)=>{selected=id;const p=parts.find(p=>p.id===id);const poses=pose(e);const a=new T.Vector3(...p.anchor).add(new T.Vector3(...poses[id]));const distance=new T.Vector3(65,75,95);const bounds=new T.Box3().setFromObject(model.groups[id]);const center=bounds.getCenter(new T.Vector3()),sz=bounds.getSize(new T.Vector3());const fit=Math.min(20,Math.max(.6,(definition?.half||45)*1.2/Math.max(sz.x,sz.y,sz.z)));camTo(center.clone().add(distance).toArray(),center.toArray(),fit);};
 const select=(id,isolate,xray,e,anchor)=>{if(!model)return;isolate=!!id&&isolate;if(anchor!==undefined||id!==selected){selectionAnchor=anchor?.clone()||null;selectionSurface=anchor?.surface||null;}model.setSelection(id,isolate,xray&&!!id);selected=id;if(isolate)focus(id,e);else if(isolated)view('perspective');isolated=isolate;};
 const project=id=>{const picked=id===selected&&!!selectionAnchor;let anchor=picked?selectionAnchor:new T.Vector3(...partMap.get(id).anchor);if(picked&&selectionSurface){selectionSurface.object.updateWorldMatrix(true,false);anchor=model.groups[id].worldToLocal(selectionSurface.object.localToWorld(selectionSurface.point.clone()));}return{...projectAnchor(model.groups[id],anchor,camera,size),picked};};
 const draw=()=>{
  if(lastState?.xray){
   if(!model.anatomy){model.anatomy=createAnatomy(model);model.anatomy.setTheme(darkTheme);}
   model.anatomy.update(lastState.selected);model.root.visible=false;model.operation.root.visible=false;renderer.render(scene,camera);model.root.visible=true;model.anatomy.render(renderer,camera);
  }else renderer.render(scene,camera);
 };
 const render=(state,time,dt=0)=>{
  if(!model)return;lastState=state;framingPose=state.explode;
  if(autoFrame&&!state.isolate&&definition.assembledHalf&&fitPose!==framingPose){const delta=frameTarget(framingPose).sub(frameTarget(fitPose));camera.position.add(delta);controls.target.add(delta);if(transition){for(const key of ['from','to','a','b'])transition[key].add(delta);}fitPose=framingPose;projection();}
  model.setPose(state.explode);ring.visible=!state.isolate;model.guides.visible=state.explode>.08&&!state.isolate&&state.guides&&!state.xray;
  model.operation.update(dt,{playing:state.playing,explode:state.explode,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,isolate:state.isolate});
  if(transition){const u=Math.min(1,(performance.now()-transition.start)/(matchMedia('(prefers-reduced-motion: reduce)').matches?1:850));const t=u*u*(3-2*u);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.a,transition.b,t);camera.zoom=T.MathUtils.lerp(transition.z0,transition.z1,t);camera.updateProjectionMatrix();if(u===1)transition=null;}
  controls.autoRotate=state.rotate&&!transition;controls.update();draw();
 };
 const snapshot=()=>{const W=2400,H=Math.round(W*size.h/size.w);const oldRatio=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.setClearColor(themeBackground,1);draw();const data=canvas.toDataURL('image/png');renderer.setClearColor(themeBackground,0);renderer.setPixelRatio(oldRatio);renderer.setSize(size.w,size.h);return data;};
 const zoom=delta=>{autoFrame=false;transition=null;camera.zoom=T.MathUtils.clamp(camera.zoom*delta,.55,20);camera.updateProjectionMatrix();};
 const warm=()=>renderer.compileAsync(scene,camera);
 const setBoard=async def=>{const token=++loadVersion; if(!cache.has(def.id))cache.set(def.id,Promise.resolve().then(()=>def.build()).catch(e=>{cache.delete(def.id);throw e;}));const next=await cache.get(def.id);if(token!==loadVersion)return false;if(model){model.operation.reset();scene.remove(model.root,model.operation.root);}model=next;model.operation||=createOperation(model,def);model.operation.reset();selectionAnchor=null;selectionSurface=null;gesture.cancel();definition=def;framingPose=fitPose=def.start;autoFrame=true;parts=def.parts;selected=parts[0].id;partMap=new Map(parts.map(p=>[p.id,p]));model.setSelection(parts[0].id,false,false);model.setPose(def.start);scene.add(model.root,model.operation.root);isolated=false;transition=null;views={perspective:def.camera,top:[0,180,.01],front:[0,30,180]};ring.scale.setScalar(def.id==='pi5'?1.5:def.id==='uno'?1.3:1);resize();view('perspective',true);canvas.setAttribute('aria-label',`Interactive 3D ${def.tab} teardown. Drag to orbit and scroll to zoom.`);setTheme(document.documentElement.dataset.theme);await warm();return true;};
 return{renderer,camera,controls,setTheme,get model(){return model;},get inView(){return inView;},setBoard,setCooler:enabled=>model?.setAccessories?.(enabled),render,view,select,project,snapshot,zoom,warm,getSize:()=>size};
}
