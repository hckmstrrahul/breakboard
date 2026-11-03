// A board fact can already be represented by a more detailed component row.
// Match its meaning and component, not just the number: two chips may share a clock.
const fact=(label,covered={})=>({label,covered});
const schema={
 esp32:[fact('CPU clock',{cpu:['CPU clock']}),fact('Radio band'),fact('SPI flash',{flash:['Capacity']}),fact('Header contacts',{headers:['Contacts']})],
 pi5:[fact('CPU clock',{cpu:['CPU clock']}),fact('GPIO header',{headers:['Contacts']}),fact('Micro HDMI',{ports:['Display']}),null],
 uno:[fact('CPU clock',{cpu:['Clock']}),fact('Program flash',{cpu:['Flash / SRAM']}),fact('Digital I/O'),fact('Analog inputs')],
 jetson:[fact('LPDDR5 memory',{module:['Memory']}),fact('CUDA cores',{module:['GPU']}),fact('GPIO header',{headers:['Contacts']}),fact('USB Type-A',{ports:['USB-A']})],
 pico2w:[fact('MCU clock',{cpu:['Clock']}),fact('SRAM',{cpu:['SRAM']}),fact('Program flash',{flash:['Capacity']}),fact('GPIO')],
 nano:[fact('CPU clock',{cpu:['Clock'],clock:['Frequency']}),fact('Program flash',{cpu:['Flash / SRAM']}),fact('Header contacts',{headers:['Contacts']}),fact('Analog inputs')],
 orangepi5:[fact('CPU cores',{cpu:['CPU']}),fact('NPU',{cpu:['NPU']}),fact('Expansion header',{headers:['Contacts']}),null],
 beaglebone:[fact('CPU clock',{cpu:['CPU']}),fact('DDR3L memory',{memory:['Capacity']}),fact('eMMC storage',{emmc:['Capacity']}),fact('Cape contacts',{headers:['Banks']})],
 nucleo:[fact('MCU clock',{cpu:['Clock']}),fact('Program flash'),fact('SRAM'),fact('ST morpho',{morpho:['Contacts']})]
};
export function mergedSpecifications(board,part){
 const rows=part?.specs.map(row=>[...row])||[];
 for(const [index,[value,unit]]of board.stats.entries()){
  const entry=schema[board.id]?.[index];
  if(!entry||entry.covered[part?.id]?.some(label=>rows.some(([key])=>key===label)))continue;
  const displayUnit=unit==='PINS'?'pins':unit==='PORTS'?'ports':unit==='CORES'?'cores':unit;
  const label=rows.some(([key])=>/clock|frequency/i.test(key))&&/clock/i.test(entry.label)?`Board ${entry.label}`:entry.label;
  const row=[label,[value,displayUnit].filter(Boolean).join(' ')];
  if(!rows.some(existing=>existing[0]===row[0]&&existing[1]===row[1]))rows.push(row);
 }
 const dimensions=board.dimensions.replace(/MM\b/,'mm').replace(/ CARRIER$/,'');
 const normalize=value=>String(value).toLowerCase().replace(/\s/g,'');
 if(!rows.some(([,value])=>normalize(value)===normalize(dimensions)))rows.push(['Board dimensions',dimensions]);
 return rows;
}
