import * as T from 'three';
import {makeAssembly,finishAssembly} from './assembly.js';
import details from './pi5-details.json' with {type:'json'};
import {COOLER_PARTS,addCooler} from './cooler.js';
import {textDecal} from './model.js';
import {batchAssembly} from './batching.js';
export const PI_PARTS=[
 {id:'cpu',n:'01',name:'BCM2712 processor',short:'BCM2712 · SOC',kind:'QUAD-CORE ARM CORTEX-A76',description:'The main system-on-chip combines four 64-bit Cortex-A76 CPU cores with the VideoCore VII GPU. Its package is taken directly from the official STEP assembly.',specs:[['CPU clock','2.4 GHz'],['CPU cores','4 × Cortex-A76'],['Graphics','VideoCore VII']],anchor:[-10,3,0],offset:[0,24,0]},
 {id:'memory',n:'02',name:'LPDDR4X memory',short:'LPDDR4X SDRAM',kind:'SYSTEM MEMORY',description:'A separate LPDDR4X package supplies working memory to the processor. Capacity depends on the Pi 5 board variant; the model preserves the supplier’s package geometry.',specs:[['Type','LPDDR4X'],['Transfer rate','4267 MT/s'],['Geometry','Official CAD']],anchor:[-10,3,15],offset:[0,18,3]},
 {id:'io',n:'03',name:'RP1 I/O controller',short:'RP1 · I/O',kind:'RASPBERRY PI I/O SILICON',description:'RP1 handles the USB interfaces, Ethernet MAC, GPIO and camera/display interfaces. It connects to BCM2712 through a PCIe 2.0 ×4 link.',specs:[['Host link','PCIe 2.0 ×4'],['USB','2 × USB 3.0'],['Role','Peripheral I/O']],anchor:[15,2,0],offset:[4,21,0]},
 {id:'ports',n:'04',name:'External connectors',short:'USB / HDMI / ETHERNET',kind:'POWER, DATA & DISPLAY',description:'The USB, Ethernet, USB-C and micro-HDMI connectors retain their original CAD shells, openings and contact geometry. Smaller board connectors have their own selectable teardown groups.',specs:[['USB-A','2 × 3.0 + 2 × 2.0'],['Display','2 × micro HDMI'],['Network','Gigabit Ethernet']],anchor:[35,10,10],offset:[9,13,3]},
 {id:'headers',n:'05',name:'40-pin GPIO header',short:'40-PIN GPIO',kind:'2 × 20-PIN EXPANSION',description:'The standard Raspberry Pi expansion header exposes 3.3 V GPIO, ground and supply pins. Pin pitch, plastic body and individual posts come from the official model.',specs:[['Contacts','40'],['Pitch','2.54 mm'],['GPIO logic','3.3 V']],anchor:[-8,6,-24],offset:[0,20,-5]},
 {id:'board',n:'06',name:'Pi 5 mainboard',short:'RASPBERRY PI 5 PCB',kind:'85 × 56 MM SINGLE-BOARD COMPUTER',description:'The official PCB retains its outline and mounting holes. Connectors, power circuitry and shield separate independently, while the small SMD components lift together as one group.',specs:[['PCB envelope','85 × 56 mm'],['Mounting pattern','58 × 49 mm'],['Main holes','4 × Ø2.7 mm']],anchor:[-25,.8,12],offset:[0,0,0]}
];
const peripheral=(id,name,description,anchor,offset,specs)=>({id,name,short:name.toUpperCase(),kind:'BOARD COMPONENT · OFFICIAL CAD',description,anchor,offset,specs,detail:true,category:'Board components'});
PI_PARTS.push(
 peripheral('pmic','DA9091 power controller','The power-management package supplies the board’s regulated rails. Its body and terminals retain the official CAD position.',[-31.3,1.3,12.8],[-6,20,2],[['Role','Power management'],['Source','Official CAD']]),
 peripheral('rfshield','Wireless RF shield','The separate metal shield lifts away to expose the existing wireless package underneath.',[-30.2,2.4,-14.7],[-4,25,-3],[['Material','Shielding metal'],['Source','Official CAD']]),
 peripheral('radio','Wireless circuitry','Wireless silicon and the small packages beneath its shield are preserved from the mechanical CAD.',[-30,1.5,-14],[-4,13,-3],[['Functions','Wi-Fi / Bluetooth'],['Source','Official CAD']]),
 peripheral('fanheader','Four-pin FAN connector','The dedicated header accepts the Active Cooler’s power, ground and two control signals.',[24.25,4,-24],[2,12,-5],[['Contacts','4'],['Function','Fan power/control']]),
 peripheral('rtc','RTC battery connector','A two-contact connector for the external real-time-clock backup battery.',[-23.5,4,23],[0,12,6],[['Contacts','2'],['Function','RTC battery']]),
 peripheral('uart','UART debug connector','The three-pin debug connector is shown with its original shell and metal contacts.',[-10,4,24],[0,15,7],[['Contacts','3'],['Function','UART debug']]),
 peripheral('cam0','CAM/DISP 0 connector','One of the two flexible-cable camera/display connectors. The latch and contact geometry come from the STEP file.',[6.4,4,19.5],[3,19,7],[['Contacts','22'],['Interface','MIPI']]),
 peripheral('cam1','CAM/DISP 1 connector','The second flexible-cable camera/display connector lifts independently from the carrier.',[12.7,4,19.5],[8,22,7],[['Contacts','22'],['Interface','MIPI']]),
 peripheral('pcie','PCIe ribbon connector','The small ribbon connector at the left edge exposes the external PCIe interface.',[-39.5,4,-2],[-8,17,0],[['Contacts','16'],['Interface','PCIe']]),
 peripheral('sd','microSD socket','The underside socket detaches downward, revealing its metal shell, insulating body and contacts.',[-34.5,-1.5,0],[-6,-10,0],[['Location','Underside'],['Storage','microSD']]),
 peripheral('button','Power button','The side-facing power switch retains the original cap, housing and terminals.',[-41,3,9.6],[-8,10,0],[['Type','Momentary switch'],['Source','Official CAD']]),
 peripheral('poe','PoE header','The four-contact power-over-Ethernet expansion header is separate from the main GPIO bank.',[19,7,18.5],[5,15,5],[['Contacts','4'],['Source','Official CAD']]),
 peripheral('ethernetphy','Ethernet PHY package','The network physical-layer package sits between RP1 and the Ethernet connector.',[21.5,1.6,4.5],[7,24,2],[['Function','Ethernet PHY'],['Source','Official CAD']]),
 peripheral('clock','Clock package · top','A metal-capped clock package and its base lift together. Frequency is not inferred from this mechanical model.',[18.7,1.5,10.1],[4,15,4],[['Location','Top side'],['Source','Official CAD']]),
 peripheral('clock2','Clock package · underside A','The underside metal-capped package and contacts retain their source geometry.',[-15.5,-1.4,15.95],[-3,-12,3],[['Location','Underside'],['Source','Official CAD']]),
 peripheral('clock3','Clock package · underside B','A second underside clock package is independently selectable.',[24.1,-1.4,-2.5],[3,-12,-1],[['Location','Underside'],['Source','Official CAD']]),
 ...COOLER_PARTS,...details
);
const overviewTags={cpu:'BCM2712',memory:'LPDDR4X',io:'RP1 · I/O',ports:'USB / HDMI / LAN',board:'PI 5 PCB',pmic:'DA9091',rfshield:'RF SHIELD',radio:'WIRELESS',fanheader:'FAN HEADER',rtc:'RTC BATTERY',uart:'DEBUG UART',cam0:'CAM/DISP 0',cam1:'CAM/DISP 1',pcie:'PCIe RIBBON',sd:'microSD',button:'POWER',poe:'PoE',ethernetphy:'ETHERNET PHY',clock:'CLOCK · TOP',clock2:'CLOCK · UNDER A',clock3:'CLOCK · UNDER B',heatsink:'HEATSINK',blower:'BLOWER',coolerPins:'PUSH PINS',coolerCable:'FAN CABLE',coolerScrews:'FAN SCREWS',thermal:'THERMAL PADS'};
PI_PARTS.forEach((p,i)=>{p.n=String(i+1).padStart(2,'0');p.tag=overviewTags[p.id]||p.short;});
export async function readPiData(){
 let bytes;
 if(globalThis.__BREAKBOARD_ASSETS?.pi5){bytes=Uint8Array.from(atob(globalThis.__BREAKBOARD_ASSETS.pi5),c=>c.charCodeAt(0));}
 else{const res=await fetch(new URL('models/pi5.json.gz',document.baseURI));if(!res.ok)throw Error('Could not load Raspberry Pi CAD');bytes=new Uint8Array(await res.arrayBuffer());}
 // Fetch already decodes HTTP Content-Encoding (including Vite's .gz assets).
 // Embedded assets and some static hosts still provide the raw gzip bytes.
 // Inspect the payload, since the response header can remain after decoding.
 let stream=new Blob([bytes]).stream();
 if(bytes[0]===0x1f&&bytes[1]===0x8b)stream=stream.pipeThrough(new DecompressionStream('gzip'));
 return JSON.parse(await new Response(stream).text());
}
export async function buildPi5(data){
 data ||= await readPiData();
 const{root,groups}=makeAssembly(PI_PARTS),materials=new Map();
 for(const source of data.meshes){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(source.p,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(source.n,3));geometry.setIndex(source.i);geometry.computeBoundingSphere();
  const key=source.c.join(',');if(!materials.has(key)){
   const [r,g,b]=source.c,grey=Math.max(r,g,b)-Math.min(r,g,b)<.12,bright=(r+g+b)/3;
   let c=new T.Color().setRGB(r,g,b,T.SRGBColorSpace),metalness=0,roughness=.65;
   if(g>r*1.4&&g>b*1.3)c.set('#198b54');
   else if(bright>.94){c.set('#e8e1ce');}
   else if(grey&&bright>.48){c.set('#bfc3c6');metalness=.88;roughness=.3;}
   else if(grey&&bright<.35)c.set('#17191c');
   else if(r>.8&&g>.7&&b<.65){c.set('#c6a147');metalness=.78;roughness=.35;}
   materials.set(key,new T.MeshStandardMaterial({color:c,metalness,roughness}));
  }
  const m=new T.Mesh(geometry,materials.get(key));m.name=source.name;m.userData.sourceName=source.name;groups[source.group].add(m);
 }
 for(const p of PI_PARTS){if(data.anchors[p.id])p.anchor=data.anchors[p.id];}
 root.userData={board:'pi5',source:'Raspberry Pi Ltd official STEP',...data.metadata};
 addCooler(groups);
 textDecal(groups.cpu,'BROADCOM',12,4,[-9.35,3.055,5.25],{size:65,color:'#747572'});
 textDecal(groups.io,'RP1',8,6,[16,1.88,-7.1],{size:90,color:'#9b9b91'});
 textDecal(groups.board,'Raspberry Pi 5',27,3,[-9,.65,-19.5],{size:50,color:'#e9eeea'});
 return batchAssembly(finishAssembly(root,groups,PI_PARTS,{merge:true,skipGroups:new Set(data.meshes.map(m=>m.group))}));
}
