import {T,TAU,mesh,box,material,makeAssembly,finishAssembly,part,definition,palette,rod,wire,cylinder,ring,glass,inscription} from './module-kit.js';
const pdf='https://www.hamamatsu.com/content/dam/hamamatsu-photonics/sites/documents/99_SALES_LIBRARY/etd/R928_R928P_R955_R955P_TPMS1091E.pdf';
const dynodes=Array.from({length:9},(_,i)=>{const a=(-130+i*32)*Math.PI/180;return[i,Math.sin(a)*8,63,Math.cos(a)*8];});
export const PMT_PARTS=[
 part('glass','Borosilicate envelope','Vacuum envelope',[0,83,0],[0,53,0],'The curved glass envelope encloses a vacuum. Light enters from the side, facing the photocathode.',[['Bulb diameter','28.5 ± 1.5 mm']]),
 part('cathode','Multialkali photocathode','Photoelectric conversion',[0,63,11],[0,10,22],'An 8 × 24 mm sensitive area releases electrons when illuminated. This is a side-on tube.',[['Response','185–900 nm'],['Active area','8 × 24 mm']]),
 part('focus','Focusing electrode','Electron optics',[-3,64,5],[-24,13,0],'The entrance electrode directs photoelectrons toward the first multiplication stage. Its precise stamped form is illustrative.'),
 ...dynodes.map(([i,x,y,z])=>part('dynode'+i,`Dynode ${i+1}`,'Secondary emission',[x,y,z],[x*1.7,20+i*3,z*1.7],`Stage ${i+1} of the documented nine-stage circular-cage multiplier. Electrode curvature and spacing are representative.`,[['Stage',`${i+1} / 9`]])),
 part('anode','Collector anode','Signal electrode',[0,62,0],[0,18,-20],'The anode collects the amplified electron pulse. It is separate from the multiplication electrodes.'),
 part('mica','Mica support plates','Electrical insulation',[10,78,0],[25,17,0],'Two pierced insulating plates hold the circular electrode cage and support wires.'),
 part('leads','Electrode feedthroughs','Vacuum feedthrough',[7,39,5],[25,2,18],'Fine support wires connect the electrode cage to eleven base contacts. Routing is illustrative, not a wiring diagram.'),
 part('base','B11-88 base & pins','Eleven-pin base',[0,26,13],[0,0,0],'The 32.2 mm base carries eleven contacts and a keyed center spigot.',[['Base','JEDEC B11-88'],['Contacts','11']])
];
export function buildPMT(){const{root,groups:g}=makeAssembly(PMT_PARTS),m=palette();
 cylinder(g.base,16.1,26,[0,27,0],m.black);cylinder(g.base,5,8,[0,10,0],m.black);box(g.base,2,8,2,[0,10,5],m.black);
 for(let i=0;i<11;i++){const a=(i*30+30)*Math.PI/180,x=12*Math.sin(a),z=12*Math.cos(a);rod(g.base,[x,14,z],[x,1,z],.75,m.nickel);wire(g.leads,[[x,40,z],[x*.75,46,z*.75],[x*.6,53,z*.6]],.18,m.nickel);}
 ring(g.base,16.15,14.5,1,[0,40,0],m.nickel);
 const outer=[[14.25,40],[14.25,79.75]],inner=[];for(let i=1;i<=28;i++){const a=i*Math.PI/56;outer.push([14.25*Math.cos(a),79.75+14.25*Math.sin(a)]);}for(let i=28;i>=0;i--){const a=i*Math.PI/56;inner.push([13.5*Math.cos(a),79.75+13.5*Math.sin(a)]);}const profile=[...outer,...inner,[13.5,40],[14.25,40]].map(v=>new T.Vector2(...v));glass(g.glass,new T.LatheGeometry(profile,80),[0,0,0]);
 box(g.cathode,8,24,.18,[0,63,11],material('#6a3b52',.74,.23),.05);
 for(const x of[-4.5,4.5])rod(g.cathode,[x,50,11],[x,77,11],.2,m.nickel);
 for(const x of[-5.2,5.2])box(g.focus,1.2,26,5,[x,64,7],m.nickel,.1);
 for(const[i,x,y,z]of dynodes){const assembly=new T.Group();assembly.position.set(x,y,z);assembly.rotation.y=(-130+i*32)*Math.PI/180;g['dynode'+i].add(assembly);
  const geo=new T.CylinderGeometry(2.4,2.4,24,24,1,true,-Math.PI*.6,Math.PI*1.2);mesh(geo,m.nickel,assembly);for(const yy of[-12,12])box(assembly,4.2,.25,1,[0,yy,0],m.nickel,.03);rod(assembly,[0,-14,0],[0,14,0],.16,m.nickel);
 }
 for(const y of[49,78])ring(g.mica,12.8,3,.6,[0,y,0],m.ceramic);
 rod(g.anode,[0,51,0],[0,76,0],.7,m.nickel);for(let i=0;i<8;i++)rod(g.anode,[-1.4,54+i*2.7,0],[1.4,54+i*2.7,0],.12,m.nickel);
 inscription(g.base,'HAMAMATSU R928',26,9,[0,40.6,0]);
 root.userData.effects={paths:[{points:[[0,63,30],[0,63,11],...dynodes.map(d=>d.slice(1)),[0,62,0]],color:'#80c8e8',count:14,radius:.45,cascade:true}],cutaway:[]};
 return finishAssembly(root,g,PMT_PARTS);
}
export const PMT_BOARD=definition({id:'pmt',tab:'Photomultiplier',category:'optics',parts:PMT_PARTS,build:buildPMT,dimensions:'Ø32.2 × 94 mm',half:87,target:[0,74,0],assembledHalf:61,assembledTarget:[0,47,0],floorY:0,groundRadius:33,camera:[105,95,165],start:.55,model:'Hamamatsu R928 / side-on tube',description:'A photon detector with a nine-stage electron multiplier inside a glass vacuum envelope.',operationNote:'Illustrative electron multiplication · slowed down',stats:[['9','','DYNODE STAGES'],['185–900','nm','SPECTRAL RESPONSE']],sources:[['Hamamatsu · R928 dimensions & basing',pdf],['Hamamatsu · PMT principles','https://www.hamamatsu.com/eu/en/product/optical-sensors/pmt/about_pmts.html']],accuracy:'The side-on optical geometry, active area, nine circular-cage stages, eleven contacts and maximum envelope follow Hamamatsu R928 documentation. The stamped electrode profiles, feedthrough routing, glass wall and exploded support structure are explanatory reconstructions, not manufacturer CAD. Play depicts an electron cascade at an illustrative rate.'});
