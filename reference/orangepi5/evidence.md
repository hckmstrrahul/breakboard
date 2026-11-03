# Orange Pi 5 — model evidence

Intended use: interactive educational 3D teardown of the **original Xunlong Orange Pi 5**, blue PCB, V1.3.x style. This is not the Orange Pi 5B, 5 Plus, Pro, Max or Ultra. The base board is shown without an aftermarket cooler, SSD, or Wi-Fi adapter.

| Feature group | Evidence kind | Implementation / limits |
| --- | --- | --- |
| PCB envelope | Manufacturer dimensions | 100 × 62 mm from Xunlong User Manual v2.4, appearance specifications. 1.6 mm thickness assumed. |
| Blue solder mask, board orientation, major component centers | Manufacturer photograph | `top.png` and `bottom.png` are the manufacturer-labeled layout diagrams reproduced by the regional distributor. Board edge pixel extents calibrated to 100 × 62 mm. Colors are reconstructed. |
| Eight holes and plated rings | Photograph-derived estimates | The visible centers and approximate 3.1 mm bores are reconstructed; they are not tolerance-certified mechanical coordinates. |
| RK3588S processor | Official manual + photograph | Eight-core 4×A76/4×A55, 2.4 GHz big-core maximum, Mali-G610, up-to-6-TOPS NPU. Package plan/height estimated from image; no silicon die invented. |
| Two RAM packages | Photograph + manual | Two package positions and aspect ratios reproduced; memory capacity explicitly variant-dependent, avoiding fabricated exact chip BOM. |
| External connectors | Official manual + photographs | 3 USB-A (1 USB3/2 USB2), separate USB-C power and USB-C data/DP, full-size HDMI, RJ45 and 3.5 mm audio. One USB2 interface is shared with Type-C. Shells have actual open mouths and recessed tongues. Fine profiles/terminal bends representative. |
| 26-position expansion | Documented count/pitch + photograph | 2×13 at 2.54 mm pitch. Color-coded housing reconstructed from photograph. No mistaken 40-pin header. |
| RK806-1, YT8531C, 16 MB SPI NOR | Manufacturer identification | Named functions and positions sourced from Xunlong diagram/manual. Package dimensions estimated. |
| microSD | Manufacturer photograph | Top side at the left edge, opening outwards. No card inserted. |
| M.2 Key-M | Official manual + underside photograph | Underside PCIe 2.0 ×1 expansion socket. No invented eMMC or integrated Wi-Fi. Socket fine geometry representative. |
| Three cameras / two displays | Manufacturer diagrams | Two top camera connectors, one underside; one display FFC connector on each side. Body and terminal geometry reconstructed. |
| Recovery, MaskROM, power, microphone, fan, UART | Manufacturer diagrams | Functions and approximate positions retained. Decorative button tops/contacts representative. |
| SMD support circuitry | Photo reconstruction | Representative visible clusters, grouped as one part. Exact passive count and values are not claimed; underside subset simplified. No invented copper traces. |
| Hidden PCB layers and internal connector construction | Unspecified | Omitted or represented only by simple cavities; not presented as exact electrical/cutaway geometry. |

## Independent checker corrections

The separate maker–checker pass identified and corrected the RK806 package to QFN-68, 7 × 7 mm at 0.35 mm pitch, following Rockchip's original [RK806 datasheet, revision 1.4](https://rockchip.fr/RK806%20datasheet%20V1.4.pdf). Its terminals are short flush perimeter pads. The photographed SPI NOR is modeled as SOIC-8 with four gull-wing leads on each of two sides, rather than a four-sided package. The processor marking uses a single legible `RK3588S` line.

## Sources

- [Xunlong official user manual v2.4](https://drive.google.com/file/d/1vkLacoP3UiOWDQ3Z0vA9xyLeo9nIkiTi/view), downloaded from [Xunlong’s shared user manual folder](https://drive.google.com/drive/folders/1ob_qOW2MMa7oncxIW6625NqwXHRxdeAo). Local `manual.pdf`, text extraction `manual.txt`.
- [Original manufacturer product URL](http://www.orangepi.org/html/hardWare/computerAndMicrocontrollers/details/Orange-Pi-5.html) — unavailable during the modeling session.
- [Regional distributor reproducing manufacturer diagrams and linking Xunlong downloads](https://orange-pi.it/products/orange-pi-5). Local top and underside images preserve the manufacturer annotations.

Manufacturer documents and images are reference-only; no photo texture is distributed inside the app. The visible 3D geometry is reconstructed in code.

## Rebuild and proof

```sh
npm run build
npm run check
```

Source: `src/orangepi5.js`, shared dimensional primitives `src/board-kit.js`.

Maker verification: all 13 groups have finite geometry, stay above the floor at 0/50/100% explosion, return to assembled origin, and isolate as exactly one group. PCB dimensions and 26-pin header metadata were checked. Browser verification and independent checker findings are recorded by the integration review.
