import {T,mesh,box,material,makeAssembly,finishAssembly,part,definition,palette,rod,wire,plate,frame,pins,inscription,dieRegions} from './module-kit.js';
const parts=[
 part('lid','Hermetic metal cap','Optical enclosure',[0,10,0],[0,30,-3],'A hollow metal cover with a circular entrance above the integrated slit.',[['Envelope','20.1 × 12.5 × 10.1 mm']]),
 part('sensor','CMOS array & etched slit','Linear detector',[0,8,-1],[0,11,0],'The slit is etched into the same silicon chip as the 288-pixel linear sensor. Its active side faces the concave grating.',[['Pixels','288'],['Pixel size','14 × 200 µm'],['Slit','50 × 500 µm']]),
 part('bonds','Bond wires','Die interconnect',[5,8,-1],[8,8,0],'Fine arched wires connect the detector to its ceramic carrier. Individual bond routing is representative.'),
 part('grating','Concave diffraction grating','Reflective optics',[0,2,0],[0,4,-12],'The reflective concave grating disperses and focuses light back onto the sensor. Groove marks are enlarged for explanation.'),
 part('carrier','Ceramic carrier','Hermetic feedthrough',[0,.5,0],[0,0,0],'The carrier supports the grating, detector, and sealed electrical feedthroughs.'),
 part('pins','Ten interface pins','2.54 mm pitch',[5,-1,3.81],[0,-3,0],'Two rows of five pins supply power, timing, analog video and case connection.',[['Contacts','10'],['Row spacing','7.62 mm']])
];
function build(){const{root,groups:g}=makeAssembly(parts),m=palette();
 plate(g.carrier,20.1,12.5,1,[0,.5,0],m.ceramic);frame(g.carrier,19.7,12.1,.3,.45,[0,1.15,0],m.gold);
 plate(g.lid,19.4,11.8,.35,[0,9.925,0],m.nickel,[[0,0,.9]]);frame(g.lid,19.4,11.8,8.55,.28,[0,5.475,0],m.nickel);
 inscription(g.lid,'C12880MA',14,3,[0,10.12,3.8],'#373d40');
 for(const x of[-1,1])box(g.sensor,5.975,.35,6,[x*3.0125,8.1,0],m.silicon,0);for(const z of[-1,1])box(g.sensor,.05,.35,2.75,[0,8.1,z*1.625],m.silicon,0);
 // True slit cut into a separate thin layer: no black disk masquerading as a hole.
 for(const x of[-1,1])box(g.sensor,2.975,.16,1,[x*1.5125,8.36,0],m.silicon,0);
 const pixels=material('#855e9b',.7,.23);for(let i=0;i<288;i++)box(g.sensor,.011,.025,.2,[(i-143.5)*.014,7.91,1.6],pixels,0);
 dieRegions(g.sensor,9,2,[0,8.29,-1.7],{columns:12,rows:1,color:'#69818e'});
 for(let i=0;i<10;i++){const x=-5+i*1.1;wire(g.bonds,[[x,8.3,-2.8],[x,9,-3.6],[x,7.8,-4.7]],.025,m.gold);}
 // A shallow concave bowl with a real reflective inner surface.
 const geo=new T.SphereGeometry(22,64,18,0,Math.PI*2,Math.PI*.9,Math.PI*.1);const index=geo.index;for(let i=0;i<index.count;i+=3){const a=index.getX(i);index.setX(i,index.getX(i+2));index.setX(i+2,a);}geo.computeVertexNormals();box(g.grating,14,.5,10,[0,1.25,0],m.ceramic,.1);const reflective=material('#b0aecb',.85,.22);reflective.side=T.DoubleSide;const gr=mesh(geo,reflective,g.grating,[0,23.7,0]);gr.scale.z=.7;
 for(let i=-24;i<=24;i++){const x=i*.21,points=[];for(let j=0;j<=16;j++){const z=-2.7+j*5.4/16;points.push([x,23.7-Math.sqrt(22*22-x*x-(z/.7)**2)+.012,z]);}wire(g.grating,points,.009,m.gold);}
 const contacts=[];for(const z of[-3.81,3.81])for(let i=0;i<5;i++)contacts.push([(i-2)*2.54,0,z]);pins(g.pins,contacts,{length:3.3,r:.235});
 root.userData.effects={cutaway:['lid'],paths:Array.from({length:7},(_,i)=>({points:[[0,13,0],[0,8.3,0],[0,2,0],[(i-3)*.65,7.9,1.6]],color:new T.Color().setHSL(.76-i*.12,.85,.57).getStyle(),count:1,radius:.06}))};return finishAssembly(root,g,parts);
}
export const SPECTROMETER_BOARD=definition({id:'spectrometer',tab:'Mini spectrometer',category:'optics',parts,build,dimensions:'20.1 × 12.5 × 10.1 mm',half:32,target:[0,18,0],assembledHalf:17,assembledTarget:[0,4,0],floorY:-7,groundRadius:17,model:'Hamamatsu C12880MA',description:'A fingertip-sized spectrometer with a concave grating and a 288-pixel detector.',operationNote:'Illustrative optical path · cover fades during Play',stats:[['288','','DETECTOR PIXELS'],['340–850','nm','SPECTRAL RANGE']],sources:[['Hamamatsu · C12880MA','https://www.hamamatsu.com/eu/en/product/optical-sensors/spectrometers/mini-spectrometer/C12880MA.html'],['Hamamatsu · Micro series datasheet','https://www.hamamatsu.com/content/dam/hamamatsu-photonics/sites/documents/99_SALES_LIBRARY/ssd/c12880ma_c16767ma_kacc1226e.pdf']],accuracy:'Package dimensions, ten pins, pin pitch, 288 pixels and integrated slit follow the manufacturer datasheet. The hollow reflective optical topology follows its structure diagram. Interior heights, curvature, carrier, wire routing and visible grating marks are illustrative; this is not a ray-traced or wavelength-calibrated simulation.'});
