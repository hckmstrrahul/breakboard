# README captures

The original 52 PNGs were captured from the running application on 4 November 2026 using **Save image**. The first three expansion batches add thirty captures on 5 November using the same renderer/export path through `scripts/render-device-proofs.mjs --gallery`. These are original renderer exports, not generated mockups or photographs. All 82 PNGs are 2400 × 2217 px, use Light appearance (`#efeee9`), and retain the app's native framing and colors.

| Pair | Device | Separation | Camera | Accessories |
| --- | --- | --- | --- | --- |
| `esp32-*-light.png` | ESP32-DevKitC V4 / WROOM-32E | 78% | Default 3D | — |
| `pi5-*-light.png` | Raspberry Pi 5 | 100% | Default 3D | Active Cooler on |
| `uno-*-light.png` | Arduino Uno R3 / UNO-TH_Rev3e | 100% | Default 3D | — |
| `jetson-*-light.png` | Jetson Orin Nano Super / P3768 carrier | 100% | Default 3D | Cooling assembly on |
| `pico2w-*-light.png` | Raspberry Pi Pico 2 W | 100% | Default 3D | — |
| `nano-*-light.png` | Arduino Nano V3.3 | 100% | Default 3D | — |
| `orangepi5-*-light.png` | Xunlong Orange Pi 5 | 100% | Default 3D | — |
| `beaglebone-*-light.png` | BeagleBone Black Rev C | 100% | Default 3D | — |
| `nucleo-*-light.png` | NUCLEO-F401RE / MB1136 C-03 | 100% | Default 3D | — |
| `portenta-*-light.png` | Portenta X8 | 100% | Default 3D | — |
| `nixie-*-light.png` | Nixie tube | 100% | Default 3D | — |
| `neopixel-*-light.png` | NeoPixel 8×8 | 100% | Default 3D | — |
| `dlp-*-light.png` | DLP micromirrors | 100% | Default 3D | 600× mechanism detail |
| `hqcamera-*-light.png` | HQ Camera | 100% | Default 3D | C-to-CS adapter |
| `stepper-*-light.png` | Stepper motor | 100% | Default 3D | — |
| `hackrf-*-light.png` | HackRF One | 100% | Default 3D | — |
| `grobot-*-light.png` | Grobot / open brass frame | 100% | Default 3D | Exposed modules, perfboard and servo pointer; two filament pairs |
| `pmt-*-light.png` | Hamamatsu R928 | 100% | Default 3D | — |
| `spectrometer-*-light.png` | Hamamatsu C12880MA | 100% | Default 3D | — |
| `epyc-*-light.png` | AMD EPYC 9654 | 100% | Default 3D | — |
| `lidar-*-light.png` | SLAMTEC RPLIDAR A1 | 100% | Default 3D | — |
| `vfd-*-light.png` | Representative eight-digit VFD | 100% | Default 3D | — |
| `corememory-*-light.png` | Representative 32 × 32 magnetic core plane | 100% | Default 3D | — |
| `lepton-*-light.png` | Teledyne FLIR Lepton 3.5 | 100% | Default 3D | — |
| `intel4004-*-light.png` | Intel C4004 ceramic package | 100% | Default 3D | — |
| `sps30-*-light.png` | Sensirion SPS30 | 100% | Default 3D | — |
| `relay-*-light.png` | Omron G2R-1 DC12 | 100% | Default 3D | — |
| `bldc-*-light.png` | T-MOTOR MN2212 V2.0 KV920 | 100% | Default 3D | — |
| `haptic-*-light.png` | Precision Microdrives C10-100 | 100% | Default 3D | Representative suspension cutaway |
| `as5600-*-light.png` | ams AS5600-SO_AB_V2 adapter | 100% | Default 3D | AS5000-MD6H-1 magnet |
| `quartz-*-light.png` | Epson FC-135 | 100% | Default 3D | Representative tuning-fork cutaway |
| `memsmic-*-light.png` | Infineon IM73A135V01 | 100% | Default 3D | Representative dual-membrane cutaway |
| `armature-*-light.png` | Knowles ED-29689-000 | 100% | Default 3D | Representative linkage |
| `planar-*-light.png` | Audeze LCD-2 Classic | 100% | Default 3D | Representative internal construction |
| `bme688-*-light.png` | Bosch BME688 | 100% | Default 3D | Representative sensing structures |
| `scd41-*-light.png` | Sensirion SCD41-D-R2 | 100% | Default 3D | Representative photoacoustic interior |

| `imu-*-light.png` | TDK ICM-42688-P | 100% | Default 3D | Representative hidden construction |
| `tof-*-light.png` | ST VL53L8CXV9GC/1 | 100% | Default 3D | Representative hidden construction |
| `radar-*-light.png` | TI IWR6843ISK / PROC073D / 001_IWR | 100% | Default 3D | Rev D fitted assembly |
| `pir-*-light.png` | Panasonic EKMB1101111 / Rev 7.1 | 100% | Default 3D | Representative hidden construction |
| `ultrasonic-*-light.png` | Devantech SRF04 / Pro-Wave 400ST160 + 400SR160 | 100% | Default 3D | Representative hidden construction |

For each pair, reset the device, choose Light, leave component labels off and set the separation above. Leave playback, auto rotation and isolation off. Save the material view, enable X-ray to clear selection and show the complete anatomy view, then save again without changing the camera. The viewer's width-to-height ratio was 2400:2217; export height follows that ratio.

The PNG exporter includes the model and scene background, not the surrounding HTML controls or callouts. Normal-mode assembly guides and shadows are retained; anatomy uses its own contour treatment. All 82 saved images were opened and visually checked. Model provenance and reuse terms remain those documented in the [project README](../../README.md#attribution).

The added devices use their documented source revision. The DLP package and enlarged mechanism retain permanent scale labels in both treatments. Glass in the Nixie tube and camera filter preserves translucency with anatomy contours. Tall devices use their fully exploded framing for both exports.

The core-memory pair was refreshed after widening its separated tiers. The 4004 pair was refreshed for its shorter lid, exposed ceramic shoulders, tapered leads and procedural ceramic mottling.

The BeagleBone, core-memory, DLP, EPYC, Grobot, Orange Pi, photomultiplier and particle-sensor pairs were refreshed after fitting printed inscriptions inside their texture margins. Matching light/dark picker previews were regenerated.
