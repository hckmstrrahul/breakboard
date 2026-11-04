// A board fact can already be represented by a more detailed component row.
// Match its meaning and component, not just the number: two chips may share a clock.
const fact=(label,covered={})=>({label,covered});
const schema={
 pmt:[fact('Dynode stages'),fact('Spectral response',{cathode:['Response']})],
 spectrometer:[fact('Detector pixels',{sensor:['Pixels']}),fact('Spectral range')],
 epyc:[fact('CPU cores'),fact('Compute dies'),fact('Total L3 cache')],
 lidar:[fact('Scan coverage'),fact('Max. sample rate')],
 vfd:[fact('Digits',{phosphor:['Digits']}),fact('Segments per digit',{phosphor:['Segments per digit']})],
 corememory:[fact('Plane capacity',{frame:['Plane capacity'],cores:['Storage']}),fact('Ferrite array',{cores:['Matrix']})],
 lepton:[fact('Thermal resolution',{detector:['Resolution']}),fact('Horizontal field of view',{lens:['Field of view']})],
 intel4004:[fact('Word size',{die:['Architecture']}),fact('Package leads',{leads:['Contacts']}),fact('Transistors',{die:['Transistors']})],
 sps30:[fact('Particle diameter range'),fact('Supply',{connector:['Supply']})],

 esp32:[fact('CPU clock',{cpu:['CPU clock']}),fact('Radio band'),fact('SPI flash',{flash:['Capacity']}),fact('Header contacts',{headers:['Contacts']})],
 pi5:[fact('CPU clock',{cpu:['CPU clock']}),fact('GPIO header',{headers:['Contacts']}),fact('Micro HDMI',{ports:['Display']}),null],
 uno:[fact('CPU clock',{cpu:['Clock']}),fact('Program flash',{cpu:['Flash / SRAM']}),fact('Digital I/O'),fact('Analog inputs')],
 jetson:[fact('LPDDR5 memory',{module:['Memory']}),fact('CUDA cores',{module:['GPU']}),fact('GPIO header',{headers:['Contacts']}),fact('USB Type-A',{ports:['USB-A']})],
 pico2w:[fact('MCU clock',{cpu:['Clock']}),fact('SRAM',{cpu:['SRAM']}),fact('Program flash',{flash:['Capacity']}),fact('GPIO')],
 nano:[fact('CPU clock',{cpu:['Clock'],clock:['Frequency']}),fact('Program flash',{cpu:['Flash / SRAM']}),fact('Header contacts',{headers:['Contacts']}),fact('Analog inputs')],
 orangepi5:[fact('CPU cores',{cpu:['CPU']}),fact('NPU',{cpu:['NPU']}),fact('Expansion header',{headers:['Contacts']}),null],
 beaglebone:[fact('CPU clock',{cpu:['CPU']}),fact('DDR3L memory',{memory:['Capacity']}),fact('eMMC storage',{emmc:['Capacity']}),fact('Cape contacts',{headers:['Banks']})],
 nucleo:[fact('MCU clock',{cpu:['Clock']}),fact('Program flash'),fact('SRAM'),fact('ST morpho',{morpho:['Contacts']})],
 portenta:[fact('Application cores',{cpu:['CPU']}),fact('LPDDR4 memory',{memory:['Capacity']}),fact('eMMC storage',{emmc:['Capacity']}),fact('Carrier contacts',{headers:['Connectors']})],
 hqcamera:[fact('Image resolution',{sensor:['Resolution','Pixels']}),fact('Pixel pitch',{sensor:['Pixel pitch']}),fact('CSI-2 data lanes',{csi:['Interface','Data lanes']}),fact('Reference clock',{clock:['Frequency']})],
 nixie:[fact('Numeral cathodes'),fact('Symbol height'),fact('Base contacts',{pins:['Contacts']}),fact('Contact circle',{pins:['Pitch circle']})],
 stepper:[fact('Full-step angle',{shaft:['Full-step angle']}),fact('Steps per revolution'),fact('Stator poles',{stator:['Stator poles']}),fact('Teeth per rotor cup',{rotorNorth:['Teeth'],rotorSouth:['Teeth']})],
 dlp:[fact('Mirror array',{array:['Array']}),fact('Mirror pitch',{array:['Pitch']}),fact('Mirror tilt',{mirrors:['Tilt']}),fact('Package pins',{pins:['Pins']})],
 neopixel:[fact('RGB pixels',{pixels:['Pixels']}),fact('Color per pixel',{pixels:['Color']}),fact('Nominal supply',{input:['Supply']}),fact('Pixel pitch',{board:['Pixel pitch']})],
 hackrf:[fact('RF range',{rf:['External range']}),fact('Max. sample rate'),fact('I / Q sample bits',{converter:['Sample stream']}),fact('Copper layers')]
};
export function mergedSpecifications(board,part){
 const rows=part?.specs.map(row=>[...row])||[];
 for(const [index,[value,unit]]of board.stats.entries()){
  const entry=schema[board.id]?.[index];
  if(!entry||entry.covered[part?.id]?.some(label=>rows.some(([key])=>key===label)))continue;
  if(board.id==='nixie'&&index===1&&rows.some(([key])=>key==='Numeral height'))continue;
  const displayUnit=({PINS:'pins',PORTS:'ports',CORES:'cores',BIT:'bits',CONTACTS:'contacts'})[unit]||unit;
  const label=rows.some(([key])=>/clock|frequency/i.test(key))&&/clock/i.test(entry.label)?`Board ${entry.label}`:entry.label;
  const row=[label,[value,displayUnit].filter(Boolean).join(' ')];
  if(!rows.some(existing=>existing[0]===row[0]&&existing[1]===row[1]))rows.push(row);
 }
 const dimensions=board.dimensions.replace(/MM\b/,'mm').replace(/ CARRIER$/,'');
 const normalize=value=>String(value).toLowerCase().replace(/\s/g,'');
 if(!rows.some(([,value])=>normalize(value)===normalize(dimensions)))rows.push([board.id==='stepper'?'Body dimensions':(board.category&&board.category!=='boards')||['nixie','dlp','hqcamera'].includes(board.id)?'Device dimensions':'Board dimensions',dimensions]);
 return rows;
}
