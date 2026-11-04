// Sentence case for prose; retain electrical references, units and product names.
const names='SDRAM DRAM SRAM RAM ROM SoC PMIC CPU GPU NPU NOR NAND MOSFET QFN DIP DLP ADC DAC NFC PWM RF SPI SMD USB UART I/O HDMI LAN GPIO PCB RTC CAM/DISP PoE PHY PCIe microSD ICSP DC MHz GHz V DIP QSPI IC BOOTSEL SWD LED LEDs MB GB eMMC ST ST-LINK/V2-1 NXP i.MX U.FL RGB CMOS IR CS C-to-CS CSI HQ CPLD SMA DFU LCD UPS HAT EN BOOT ON RX TX A B X Y Orin Nano Pico Pi Orange Rockchip Sitara BeagleBone Black Arduino Uno Nucleo Portenta Mini Murata NeoPixels NeoMatrix Sony CoolRunner-II HackRF One'.split(' ');
const protectedWords=new Map(names.map(name=>[name.toUpperCase(),name]));
export function formatLabel(value){
 const text=String(value),reference=text.match(/^([A-Z][A-Z0-9]*) · /)?.[1];
 let result=text.replace(/[A-Za-z][A-Za-z0-9]*(?:[./–-][A-Za-z0-9]+)*/g,(word,index)=>{
  if(index===0&&word===reference)return word;
  if(protectedWords.has(word.toUpperCase()))return protectedWords.get(word.toUpperCase());
  if(/^ATMEGA/i.test(word))return word.replace(/^ATMEGA/i,'ATmega');
  if(/[0-9]/.test(word)||word!==word.toUpperCase())return word;
  if(/[–-]/.test(word))return word.split(/([–-])/).map(piece=>protectedWords.get(piece.toUpperCase())||(piece.length===1?piece:piece.toLowerCase())).join('');
  return word.toLowerCase();
 });
 const first=result.match(/^[A-Za-z][A-Za-z0-9]*(?:[./–-][A-Za-z0-9]+)*/)?.[0];
 if(first&&!protectedWords.has(first.toUpperCase()))result=result[0].toUpperCase()+result.slice(1);
 return result;
}
