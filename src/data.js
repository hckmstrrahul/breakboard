// Physical dimensions are millimetres. Hidden package positions are illustrative.
export const DIM = Object.freeze({width:27.94, length:48.26, thickness:1.6, pitch:2.54, pinsPerSide:19, moduleWidth:18, moduleLength:25.5, moduleHeight:3.1, moduleZ:-17.42});
export const PINS = [
 ['3V3','EN','VP','VN','34','35','32','33','25','26','27','14','12','GND','13','D2','D3','CMD','5V'],
 ['GND','23','22','TX','RX','21','GND','19','18','5','17','16','4','0','2','15','D1','D0','CLK']
];
export const PARTS = [
 {id:'shield',n:'01',name:'RF shield',short:'RF SHIELD',kind:'ELECTROMAGNETIC SHIELDING',description:'A formed metal enclosure keeps radio-frequency interference away from the module’s sensitive circuitry.',specs:[['Material','Metal can'],['Construction','Formed shell'],['Assembly','Soldered perimeter']],anchor:[4,4,-14],offset:[0,36,0]},
 {id:'cpu',n:'02',name:'ESP32 processor',short:'DUAL-CORE PROCESSOR',kind:'ESP32-D0WD-V3',description:'Two Xtensa LX6 cores run your application. The same chip integrates Wi-Fi, Bluetooth, and a rich set of peripherals.',specs:[['CPU clock','Up to 240 MHz'],['Architecture','Dual-core LX6'],['On-chip SRAM','520 KB']],anchor:[-2,2.4,-14],offset:[-2,24,0]},
 {id:'flash',n:'03',name:'Flash memory',short:'SPI FLASH',kind:'NON-VOLATILE STORAGE',description:'Firmware and application data live in external Quad SPI flash. This study uses the 4 MB N4 module configuration.',specs:[['Capacity','4 MB'],['Interface','Quad SPI'],['Configuration','WROOM-32E-N4']],anchor:[4.5,2.2,-8],offset:[4,20,3]},
 {id:'crystal',n:'04',name:'40 MHz crystal',short:'REFERENCE CRYSTAL',kind:'MODULE CLOCK REFERENCE',description:'The crystal provides the module’s clock reference. Its placement beneath the shield is illustrative.',specs:[['Frequency','40 MHz'],['Location','Radio module']],anchor:[3.7,2.56,-20.3],offset:[4,22,-6]},
 {id:'rf',n:'05',name:'Module SMD components',short:'MODULE SMD',kind:'RF & SUPPORT COMPONENTS',description:'Small surface-mounted components support the module’s radio and power circuitry. Their hidden arrangement is illustrative; they lift together as one group.',specs:[['Mounting','Surface mount'],['Location','Radio module']],anchor:[-5.05,2.125,-16.6],offset:[-5,17,-1],detail:true},
 {id:'module',n:'06',name:'Radio module PCB',short:'RADIO & ANTENNA',kind:'ESP32-WROOM-32E',description:'The module substrate connects the processor, crystal, and RF network to a printed 2.4 GHz antenna. The antenna and plated contacts remain part of the PCB.',specs:[['Footprint','18 × 25.5 mm'],['Radio','Wi-Fi + BT 4.2']],anchor:[-5,1.8,-26],offset:[0,11,0]},
 {id:'usb',n:'07',name:'Micro-USB connector',short:'MICRO-USB',kind:'POWER & USB DATA',description:'The Micro-USB socket supplies power and connects a computer to the board’s USB-to-UART bridge.',specs:[['Connector','Micro-B'],['Contacts','5']],anchor:[0,3.33,22.55],offset:[0,12,12]},
 {id:'bridge',n:'08',name:'USB-to-UART bridge',short:'USB–UART BRIDGE',kind:'CP2102N',description:'The bridge converts USB data into serial communication for programming and communicating with the ESP32.',specs:[['Input','USB'],['Output','UART']],anchor:[0,1.715,12.5],offset:[0,15,5]},
 {id:'power',n:'09',name:'3.3 V regulator',short:'VOLTAGE REGULATOR',kind:'POWER SUPPLY',description:'The regulator supplies the 3.3 V rail used by the ESP32 module.',specs:[['Output','3.3 V'],['Mounting','Surface mount']],anchor:[0,2.365,0],offset:[-5,19,3]},
 {id:'buttons',n:'10',name:'EN / BOOT buttons',short:'EN / BOOT',kind:'RESET & DOWNLOAD CONTROLS',description:'EN resets the board. Holding BOOT while resetting selects the serial firmware download mode.',specs:[['Controls','2 push buttons'],['EN','Reset'],['BOOT','Download mode']],anchor:[8.1,2.525,21.6],offset:[0,9,7]},
 {id:'led',n:'11',name:'Power LED',short:'POWER LED',kind:'5 V POWER INDICATOR',description:'The LED indicates that power is present on the board’s 5 V rail.',specs:[['Function','Power indication'],['Location','Carrier PCB']],anchor:[-8,1.575,13],offset:[-9,13,4]},
 {id:'smd',n:'12',name:'Carrier SMD components',short:'CARRIER SMD',kind:'BOARD SUPPORT COMPONENTS',description:'The carrier’s small capacitors, resistors, and support packages lift together while preserving their assembled layout.',specs:[['Mounting','Surface mount'],['Location','Carrier PCB']],anchor:[6,1.325,0],offset:[0,7,0],detail:true},
 {id:'board',n:'13',name:'Development board PCB',short:'DEVELOPMENT BOARD',kind:'ESP32-DEVKITC V4',description:'The carrier PCB connects the radio module, power circuit, USB interface, and controls. Copper traces, plated holes, and printed markings stay with the board.',specs:[['PCB size','48.26 × 27.94 mm'],['Thickness','1.6 mm']],anchor:[5,.8,13],offset:[0,0,0]},
 {id:'headers',n:'14',name:'Pin headers',short:'I/O CONNECTIONS',kind:'2 × 19-PIN HEADERS',description:'Two rows of 19 pins carry power and signals to a breadboard. Flash-bus pins are exposed too, so all 38 contacts are not free GPIOs.',specs:[['Contacts','38 total'],['Pin pitch','2.54 mm'],['Row spacing','25.40 mm']],anchor:[12.7,-4,12],offset:[0,-9,0]},
];
export const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
export const smooth = t => {t=clamp(t); return t*t*(3-2*t)};
export function assemblyPose(explode) {
 const e=clamp(explode);
 return Object.fromEntries(PARTS.map(p=>[p.id,p.offset.map(v=>v*e)]));
}
export const SOURCES = {
 guide:'https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html',
 module:'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf',
 dimensions:'https://dl.espressif.com/dl/schematics/esp32_devkitc_v4_dimensions.pdf',
 inspiration:'https://github.com/elvarofficial/teardown'
};
