// The simulation API retains full scientific labels. The instrument panel shows
// only useful outputs, with the longer method notes in the device inspector.
const row=(source,label=source,unit)=>({source,label,...(unit===undefined?{}:{unit})});
const profiles={
 relay:{labels:{coil:'Coil',cycle:'Cycle'},formats:{cycle:v=>v?'Auto':'Manual'},readouts:[row('Contact path','Contact'),row('Coil current','Current')]},
 bldc:{labels:{speed:'Speed'},formats:{direction:v=>v>0?'CW':'CCW'},readouts:[row('Electrical frequency','Electrical rate')]},
 haptic:{labels:{amplitude:'Level',frequency:'Frequency',pattern:'Pattern'},formats:{pattern:v=>['Steady','Single','Double'][v]},readouts:[]},
 as5600:{labels:{angle:'Angle',speed:'Speed'},readouts:[row('Magnet angle','Angle'),row('Raw angle','Code')]},
 quartz:{labels:{amplitude:'Motion',divider:'Divide stages'},readouts:[row('External divider','Divider'),row('External clock output','Clock')]},
 memsmic:{labels:{frequency:'Frequency',amplitude:'Pressure'},readouts:[row('Output at 1 kHz','Output @ 1 kHz')],wave:['Signal','2 ms · relative']},
 armature:{labels:{frequency:'Frequency',amplitude:'Current'},readouts:[row('Pressure phase','Phase')],wave:['Pressure','2 ms · relative']},
 planar:{labels:{frequency:'Frequency',amplitude:'Level'},readouts:[],wave:['Drive','2 ms · relative']},
 bme688:{labels:{temperature:'Temperature',humidity:'Humidity',pressure:'Pressure',gas:'Gas level'},readouts:[row('Relative gas response','Gas response','relative')]},
 scd41:{labels:{co2:'CO₂',duration:'Cycle time'},readouts:[row('Sequence','Stage'),row('Relative absorption','Absorption','relative')],wave:['Pressure','Relative']},
 imu:{labels:{roll:'Roll X',pitch:'Pitch Y',accelX:'Accel X',accelY:'Accel Y',accelZ:'Accel Z',rateX:'Rate X',rateY:'Rate Y',rateZ:'Rate Z'},readouts:[row('Acceleration X','Total X'),row('Acceleration Y','Total Y'),row('Acceleration Z','Total Z')]},
 tof:{labels:{distance:'Background',depth:'Depth offset',column:'Column',row:'Row',width:'Width',zone:'Zone'},readouts:[row('Zone distance','Distance'),row('Axial-equivalent light time','Light time')]},
 radar:{labels:{range:'Range',angle:'Angle'},readouts:[row('Round-trip delay','Delay'),row('Illustrative beat','Beat'),row('Active transmitter','Tx')],wave:['Chirp','60–63 GHz · demo']},
 pir:{labels:{range:'Range',angle:'Angle',contrast:'Heat contrast',movement:'Motion'},readouts:[row('Digital output','Output'),row('Relative change','Change')]},
 ultrasonic:{labels:{distance:'Distance',temperature:'Temperature'},readouts:[row('Acoustic round trip','Echo time'),row('Sequence','Stage'),row('Echo output','Output')]},
 max30102:{labels:{rate:'Pulse rate',perfusion:'Pulse depth',current:'LED current',contact:'Contact'},readouts:[row('Optical slot','Channel'),row('Red return','Red','relative'),row('IR return','IR','relative')],wave:['Pulse','5 s · synthetic']},
 loadcell:{labels:{force:'Force',tare:'Tare',cycle:'Cycle'},formats:{cycle:v=>v?'Auto':'Steady'},readouts:[row('Applied force','Load'),row('Raw bridge','Bridge'),row('After tare','Tared')],wave:['Bridge output','5 s · ±22 mV']},
 gnss:{labels:{satellites:'Satellites',corrections:'Corrections',obstruction:'Blocked sky'},readouts:[row('Synthetic fix','Fix'),row('Usable satellites','Visible'),row('Illustrated convergence','Progress')]},
 imx500:{labels:{objects:'Objects',position:'Position',illumination:'Light',output:'Output'},formats:{output:v=>v?'Data':'Image + data'},readouts:[row('Illustrative pipeline','Stage'),row('Demo detections','Detections')]},
 eventcamera:{labels:{position:'Position',speed:'Speed',brightness:'Brightness',size:'Size',threshold:'Contrast'},readouts:[row('ON / OFF this sample','On / off'),row('Accumulated ON / OFF','Total')],wave:['Events + / −','0.53 s · demo']},
 periscope:{labels:{focus:'Far focus',shakeX:'Pitch shake',shakeY:'Yaw shake',stabilize:'OIS'},readouts:[row('Focus scenario','Focus'),row('Illustrative beam offset','Beam offset')]},
 nand:{labels:{mode:'Operation',wordline:'Word line',string:'String',target:'Write level',reference:'Read level'},readouts:[row('Operation','State'),row('Stored threshold','Stored'),row('Read comparison','Read')],wave:['Threshold','Relative']},
 prime50:{labels:{aperture:'Aperture',focus:'Near focus',sweep:'Sweep'},formats:{sweep:v=>v?'Auto':'Hold'},readouts:[row('Relative light','Light'),row('Focus setting','Focus')]},
 zoomlens:{labels:{zoom:'Zoom',focus:'Focus',aperture:'Aperture',shake:'Shake',vr:'VR',sweep:'Sweep'},formats:{sweep:v=>v?'Auto':'Hold'},readouts:[row('Focus group offset','Focus shift','mm'),row('Patent-based VR correction','VR shift','mm'),row('Relative light','Light')]},
 d455:{labels:{range:'Depth',angle:'Angle',sweep:'Motion'},formats:{sweep:v=>v?'Sweep':'Still'},readouts:[row('Disparity'),row('Depth from fB/d','Depth')]},
 hdd:{labels:{spindle:'Spindle',mode:'Action',track:'Track',head:'Head'},formats:{spindle:v=>v?'Run':'Park'},readouts:[row('State'),row('Spindle','Speed'),row('Head position','Radius','mm')]},
 bluray:{labels:{track:'Track',focus:'Focus',tracking:'Tracking',layer:'Collimator',wavelength:'Disc',scan:'Scan'},formats:{scan:v=>v?'Auto':'Hold'},readouts:[row('Objective focus travel','Focus travel','mm'),row('Fine tracking travel','Track travel','mm'),row('Illustrative return signal','Return')]},
 lto:{labels:{position:'Cycle',target:'Transfer',rate:'Speed'},readouts:[row('Sequence','Stage'),row('Tape on takeup','On takeup')]},
 nvme:{labels:{mode:'Operation',rate:'Activity'},readouts:[row('Payload route','Data path')]},
 shutter:{labels:{speed:'Speed'},readouts:[row('Sequence','Stage'),row('Nominal moving slit','Slit')]}
};
const shortValues={'Parked on inner landing zone':'Parked','Seeking landing zone / slowing':'Parking','Infrared excitation':'Infrared','Pressure response':'Pressure','Acoustic response':'Pressure','Microphone readout':'Readout','Pixel acquisition':'Capture','Signal conditioning':'Readout','Dark interval':'Dark','Red illumination':'Red','Infrared illumination':'Infrared','No brightness change':'No change','Object metadata':'Metadata'};
export function controlPresentation(definition){
 const profile=profiles[definition.id]||{},controls=definition.controls||[];
 return{
  label:spec=>profile.labels?.[spec.id]||spec.label,
  value(spec,value){if(profile.formats?.[spec.id])return profile.formats[spec.id](value);if(spec.format)return spec.format(value);const number=Number(value.toFixed(3));return `${number}${spec.unit?` ${spec.unit}`:''}`;},
  readouts(values){
   const selected=profile.readouts||values.filter(value=>!controls.some(control=>control.label===value.label)&&!['Geometry','Motion','Visualization','Simulation','Timing','Inference','Reference'].includes(value.label)).slice(0,3).map(value=>row(value.label));
   return selected.flatMap(spec=>{const found=values.find(value=>value.label===spec.source);if(!found)return[];const optical=spec.source==='Optical slot'&&/^(Red|Infrared) · (\d+ nm)$/.exec(found.value);return[{...found,...spec,value:optical?(optical[1]==='Red'?'Red':'IR'):shortValues[found.value]||(typeof found.value==='number'?Number(found.value.toFixed(3)):found.value),...(optical?{unit:optical[2]}:{})}];});
  },
  wave:profile.wave
 };
}
