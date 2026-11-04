// Explicit requested scope, independent of the runtime catalogue. Integrated
// batches join IMPLEMENTED_EXPANSION_IDS and must pass review before release.
export const ORIGINAL_DEVICE_IDS=['esp32','pi5','uno','jetson','pico2w','nano','orangepi5','beaglebone','nucleo','portenta','nixie','neopixel','dlp','hqcamera','stepper','hackrf','grobot','pmt','spectrometer','epyc','lidar','vfd','corememory','lepton','intel4004','sps30'];
export const EXPANSION_BATCHES=[
 ['relay','bldc','haptic','as5600','quartz'],
 ['memsmic','armature','planar','bme688','scd41'],
 ['imu','tof','radar','pir','ultrasonic'],
 ['max30102','loadcell','gnss','imx500','eventcamera'],
 ['prime50','zoomlens','periscope','d455','shutter'],
 ['hdd','bluray','lto','nvme','nand'],
 ['ne555','rp2350','fpga','hbm','eprom'],
 ['gan','qi2','printhead','thermalprinter','saw']
];
export const IMPLEMENTED_EXPANSION_IDS=EXPANSION_BATCHES.slice(0,4).flat();
