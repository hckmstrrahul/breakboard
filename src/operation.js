import * as T from 'three';

// These are explanatory connections between functional assemblies, not a PCB
// netlist or a drawing of buried copper. Endpoints stay on the actual assemblies.
export const CONNECTIONS={
 esp32:[['usb','bridge'],['bridge','cpu']],
 pi5:[['ports','pmic'],['pmic','cpu']],
 uno:[['usb','bridge'],['bridge','cpu']],
 jetson:[['ports','module'],['module','fanwire']],
 pico2w:[['usb','power'],['power','cpu']],
 nano:[['usb','bridge'],['bridge','cpu']],
 orangepi5:[['ports','power'],['power','cpu']],
 beaglebone:[['power','pmic'],['pmic','cpu']],
 nucleo:[['usb','power'],['power','cpu']]
};

export function advanceOperation(state,dt,{playing,assembled,reduced}){
 dt=Math.min(.05,Math.max(0,dt));const target=playing&&assembled?1:0;
 state.power=reduced?target:state.power+(target-state.power)*(1-Math.exp(-dt/(target?.55:.32)));
 if(Math.abs(state.power-target)<.001)state.power=target;
 if(!reduced){state.angle=(state.angle+state.power*9*dt)%(Math.PI*2);if(target)state.time+=dt;}
 return state;
}

export function createOperation(model,definition){
 const root=new T.Group();root.name='Illustrative signal flow';const rotors=[],motions=[],indicators=new Set(),indicatorRest=new Map();
 model.root.traverse(object=>{
  if(object.userData.motion)motions.push({object,rest:object.quaternion.clone(),config:object.userData.motion});
  else if(object.userData.rotor)rotors.push(object);
  const mat=object.userData.originalMaterial||object.material;
  if(mat?.userData.indicator)indicators.add(mat);
 });
 for(const material of indicators)indicatorRest.set(material,{color:material.color.clone(),emissive:material.emissive.clone()});
 const parts=new Map(definition.parts.map(p=>[p.id,p]));
 const routes=(definition.connections||CONNECTIONS[definition.id]||[]).map(([from,to])=>{
  const material=new T.LineBasicMaterial({color:'#a43e23',transparent:true,opacity:0,depthTest:false,depthWrite:false});
  const line=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:33},()=>new T.Vector3())),material);line.frustumCulled=false;line.renderOrder=20;root.add(line);
  const dotMaterial=new T.MeshBasicMaterial({color:'#a43e23',transparent:true,opacity:0,depthTest:false,depthWrite:false});
  const dot=new T.Mesh(new T.SphereGeometry(.36,10,8),dotMaterial);dot.renderOrder=21;root.add(dot);
  const endGeometry=new T.SphereGeometry(.23,8,6),ends=[new T.Mesh(endGeometry,dotMaterial),new T.Mesh(endGeometry,dotMaterial)];ends.forEach(end=>{end.renderOrder=21;root.add(end);});
  return{from,to,line,dot,ends,curve:new T.CubicBezierCurve3(),material,dotMaterial};
 });
 const optical=model.root.userData.opticalPath;
 const rays=[];
 if(optical){
  const material=new T.LineBasicMaterial({color:'#d6ab62',transparent:true,opacity:0,depthWrite:false});
  for(const offset of [-1.8,0,1.8]){
   const from=new T.Vector3(...optical.from),to=new T.Vector3(...optical.to);from.x+=offset;to.x+=offset;
   const ray=new T.Line(new T.BufferGeometry().setFromPoints([from,to]),material);root.add(ray);rays.push(ray);
  }
 }
 const state={power:0,angle:0,time:0},a=new T.Vector3(),b=new T.Vector3(),rotation=new T.Quaternion();
 function update(dt,{playing,explode,reduced,isolate}){
  const assembled=explode<.002;advanceOperation(state,dt,{playing,assembled,reduced});
  for(const rotor of rotors)rotor.rotation.y=state.angle;
  for(const {object,rest,config}of motions){
   const axis=new T.Vector3(...(config.axis||[0,1,0])).normalize();let angle=0;
   if(config.type==='stepper')angle=Math.floor(state.time*(config.rate||8))*T.MathUtils.degToRad(config.stepAngle||1.8);
   if(config.type==='mirror')angle=T.MathUtils.degToRad(config.angle||12)*state.power*(Math.sin(state.time*2+(config.phase||0))>=0?1:-1);
   object.quaternion.copy(rest).multiply(rotation.setFromAxisAngle(axis,angle));
  }
  for(const material of indicators){
   const {kind,phase=0,digit,index=phase}=material.userData.indicator;
   if(kind==='nixie'){material.emissiveIntensity=digit===Math.floor(state.time*.65)%10?state.power*3:0;continue;}
   if(kind==='coil'){material.emissiveIntensity=state.power*.22*(Math.floor(state.time*8)%2===phase?1:0);continue;}
   if(kind==='matrix'){
    const row=material.userData.indicator.row??Math.floor(index/8),col=material.userData.indicator.column??index%8,level=.08+.92*Math.pow(.5+.5*Math.sin(state.time*1.5-(row+col)*.35),5);
    material.emissive.setHSL(((row+col)/28+state.time*.025)%1,.8,.48);material.emissiveIntensity=state.power*level*2.4;continue;
   }
   const activity=reduced||kind==='power'?1:.25+.75*Math.pow(.5+.5*Math.sin(state.time*2+phase),6);material.emissiveIntensity=state.power*(.5+activity*1.6);
  }
  for(const ray of rays)ray.material.opacity=state.power*(reduced?.5:.4+.15*Math.sin(state.time*1.5));
  root.visible=state.power>.002&&assembled&&!isolate;
  if(!root.visible)return;
  routes.forEach((route,index)=>{
   const ga=model.groups[route.from],gb=model.groups[route.to];const visible=ga.visible&&gb.visible;
   route.line.visible=route.dot.visible=visible;route.ends.forEach(end=>end.visible=visible);if(!visible)return;
   a.fromArray(parts.get(route.from).anchor).add(ga.position);b.fromArray(parts.get(route.to).anchor).add(gb.position);
   const lift=Math.max(a.y,b.y)+Math.min(8,a.distanceTo(b)*.16);
   route.curve.v0.copy(a);route.curve.v1.set(a.x,lift,a.z);route.curve.v2.set(b.x,lift,b.z);route.curve.v3.copy(b);
   const points=route.line.geometry.attributes.position;for(let i=0;i<points.count;i++){const p=route.curve.getPoint(i/(points.count-1));points.setXYZ(i,p.x,p.y,p.z);}points.needsUpdate=true;
   route.dot.position.copy(route.curve.getPoint(reduced?.5:(state.time*.23+index*.45)%1));route.ends[0].position.copy(a);route.ends[1].position.copy(b);
   route.material.opacity=state.power*.3;route.dotMaterial.opacity=state.power*.9;
  });
 }
 function setTheme(dark){for(const route of routes){route.material.color.set(dark?'#efa17e':'#a43e23');route.dotMaterial.color.copy(route.material.color);}}
 function reset(){Object.assign(state,{power:0,angle:0,time:0});for(const rotor of rotors)rotor.rotation.y=0;for(const {object,rest}of motions)object.quaternion.copy(rest);for(const material of indicators){material.emissiveIntensity=0;material.color.copy(indicatorRest.get(material).color);material.emissive.copy(indicatorRest.get(material).emissive);}root.visible=false;}
 reset();return{root,rotors,motions,indicators,routes,rays,state,update,setTheme,reset};
}
