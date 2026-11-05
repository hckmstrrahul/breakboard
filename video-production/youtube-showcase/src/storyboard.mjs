export const FPS = 30;
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const DURATION = 175;
export const HEROES = [
  {id:'esp32',title:['ESP32'],family:'CONNECTED HARDWARE',version:['DevKitC V4','WROOM-32E'],focus:'module',labels:['shield','usb','headers'],explodedLabels:['cpu','module','board'],note:'Documented envelope · illustrative internal layout',play:'Follow the signal.',detail:'Power and data paths come to life.'},
  {id:'pi5',title:['Raspberry','Pi 5'],family:'SINGLE-BOARD COMPUTER',version:['Raspberry Pi 5','Official Active Cooler'],focus:'blower',labels:['blower','headers','ports'],explodedLabels:['cpu','heatsink','blower'],note:'Official board CAD · reconstructed cooler',play:'Keep it cool.',detail:'Watch the blower and signal paths.'},
  {id:'hdd',title:['Hard disk','drive'],family:'MAGNETIC STORAGE',version:['Seagate Barracuda 7200.12','ST31000528AS · 1 TB'],focus:'actuator',labels:['cover','base','pcb'],explodedLabels:['upper','actuator','spindle'],note:'Documented specimen · representative hidden details',play:'Seek. Spin. Read.',detail:'The head stack sweeps the disks.'},
  {id:'prime50',title:['50 mm','prime lens'],family:'PHOTOGRAPHIC OPTICS',version:['Canon EF 50mm f/1.8 STM','May 2015'],focus:'iris',labels:['body','focusRing','filter'],explodedLabels:['iris','front','motor'],note:'Documented optics · representative mechanism details',play:'Shape the light.',detail:'Aperture and focus move together.'},
  {id:'stepper',title:['Hybrid','stepper'],family:'ELECTROMECHANICS',version:['42 mm two-phase motor','Representative construction'],focus:'phasea',labels:['front','shaft','connector'],explodedLabels:['phasea','rotorNorth','shaft'],note:'Representative hybrid-motor cutaway',play:'One step at a time.',detail:'Energized coils drive the rotor.'},
  {id:'neopixel',title:['NeoPixel','matrix'],family:'ADDRESSABLE LIGHT',version:['Adafruit NeoMatrix 8 × 8','WS2812B v2'],focus:'pixels',labels:['pixels','input','board'],explodedLabels:['pixels','smd','board'],note:'Board-layout reconstruction · illustrative signal flow',play:'64 points of colour.',detail:'Individual LEDs animate as a matrix.'},
];
export const MONTAGE = [
  {id:'epyc',name:'AMD EPYC 9654',sub:'CHIPLET PROCESSOR',pose:1},
  {id:'intel4004',name:'Intel 4004',sub:'CERAMIC PROCESSOR',pose:.8},
  {id:'fpga',name:'Artix-7 FPGA',sub:'PROGRAMMABLE LOGIC',pose:1},
  {id:'hbm',name:'Micron HBM3E',sub:'STACKED MEMORY',pose:1},
  {id:'nvme',name:'NVMe SSD',sub:'SOLID-STATE STORAGE',pose:.65},
  {id:'nand',name:'3D NAND',sub:'NONVOLATILE MEMORY',pose:1},
  {id:'rp2350',name:'RP2350',sub:'MICROCONTROLLER',pose:1},
  {id:'eprom',name:'Windowed EPROM',sub:'UV-ERASABLE MEMORY',pose:.8},
  {id:'nixie',name:'Nixie tube',sub:'GAS-DISCHARGE DISPLAY',pose:0,play:true},
  {id:'pmt',name:'Photomultiplier',sub:'SINGLE-PHOTON SENSING',pose:.35},
  {id:'lidar',name:'RPLIDAR A1',sub:'ROTATING RANGE SCANNER',pose:0,play:true},
  {id:'lepton',name:'FLIR Lepton',sub:'THERMAL IMAGING',pose:.75},
  {id:'memsmic',name:'MEMS microphone',sub:'ACOUSTIC SENSING',pose:.8},
  {id:'imu',name:'Inertial sensor',sub:'MOTION SENSING',pose:1},
  {id:'gan',name:'GaN charger',sub:'POWER CONVERSION',pose:.45},
  {id:'qi2',name:'Qi2 charging pair',sub:'WIRELESS POWER',pose:.65},
];
export const SHOTS = [
  {key:'00-opening',kind:'opening',id:'esp32',duration:5},
  ...HEROES.map((h,i)=>({...h,key:`${String(i+1).padStart(2,'0')}-${h.id}`,kind:'hero',index:i,duration:20})),
  ...MONTAGE.map((m,i)=>({...m,key:`${String(i+7).padStart(2,'0')}-${m.id}`,kind:'montage',index:i,duration:2.5})),
  {key:'23-collage',kind:'collage',duration:5},
  {key:'24-ending',kind:'ending',duration:5},
];
let cursor=0;
for(const shot of SHOTS){shot.start=cursor;cursor+=shot.duration;}
if(cursor!==DURATION)throw Error('Story timing mismatch');
