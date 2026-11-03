# Hardware teardowns — evidence and reconstruction notes

Purpose: an interactive educational 3D render of an ESP32-DevKitC V4 carrying an ESP32-WROOM-32E-N4 module. Dimensions are millimetres; viewing scale is not physical drawing scale. Desktop composition is intended for 1440–1920 px screens with a separate narrow layout. PNG export is 2400 pixels wide with the current viewport aspect ratio.

| Feature group | Evidence classification | Source and treatment |
| --- | --- | --- |
| Main PCB envelope | Supplied dimensions | Espressif's DevKitC V4 drawing: 48.26 × 27.94 mm. Thickness of 1.6 mm is illustrative. |
| Header spacing and count | Supplied dimensions and official pinout | Two 19-contact rows; 2.54 mm pitch and 25.40 mm row separation. Signals use the official J2/J3 pin order. |
| Module envelope | Supplied dimensions | ESP32-WROOM-32E datasheet: 18 × 25.5 × 3.1 mm. Module includes its projecting antenna area. |
| Module overhang | Supplied dimensions and visible photograph | Dimension drawing gives 6.04 mm projecting length. Placement follows this datum. |
| RF shield | Features visible in official photograph | Hollow five-sided shell. Shell subdivision, exact thickness, seams, and underside tabs are estimated. Lettering is redrawn for the model. The matrix graphic is decorative, not a valid QR code. |
| ESP32 package and SPI flash | Functional components documented; hidden placement illustrative | ESP32-D0WD-V3, 48-pin QFN package, external Quad SPI flash. N4 has 4 MB. Dimensions and placement beneath the shield are illustrative. |
| Crystal and RF passives | Documented functions; visible form estimated | 40 MHz crystal per datasheet. Package positions and RF component values/layout are not reconstructed from manufacturing artwork. |
| Printed antenna | Visible physical construction; routing illustrative | Inverted-F style printed conductor in the antenna end. Geometry is illustrative and not an RF design. |
| Micro-USB, CP2102N, regulator, EN/BOOT and LED | Features visible in official photograph and guide | Functional layout from official photo. Connector shell has a real cavity, tongue, and five contacts. Package details and coordinates are estimated. |
| Copper traces, vias, small passives | Illustrative construction | They establish board topology visually; they are not an electrically accurate routing or BOM. |
| Exploded movement | Illustrative disassembly | All groups derive from one bounded separation input. Zero returns every part to its assembled position. Soldered packages are shown separated for explanation, not as removable service modules. |
| Readouts | Published specifications | Maximum clock, radio band, flash capacity and header count are static specifications. No simulated electrical telemetry is presented. |

## Sources read

- [Elvar's teardown repository](https://github.com/elvarofficial/teardown): README, SKILL, build script, studio setup, geometry examples, shader warmup and interactive runtime.
- [How I Turn Any Machine Into a 3D Simulator You Can Take Apart](https://x.com/elvar_official/status/2116174609355571402): full article read in the browser. Applied its pale studio, reference-first geometry, unified model, camera views, subsystem controls, and render review principles.
- [ESP32-DevKitC V4 guide](https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)
- [Official board dimensions](https://dl.espressif.com/dl/schematics/esp32_devkitc_v4_dimensions.pdf), also saved in `reference/dimensions.pdf`.
- [ESP32-WROOM-32E and ESP32-WROOM-32UE datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf)
- [Official board photograph](https://raw.githubusercontent.com/espressif/esp-dev-kits/master/docs/_static/esp32-devkitc/esp32-devkitc-v4-functional-overview.png), saved in `reference/devkitc.png` and visually inspected before modeling.

## Build and run

```sh
npm install
npm run dev -- --port 5174
npm run build
npm run check
```

`dist/index.html` is the deployable Vite build. `dist/breakboard.html` is a self-contained offline page with Three.js and Latin fonts embedded. Both derive from the same model and UI. The app's Save render button exports the current camera, geometry, isolation and x-ray state to a 2400 px wide PNG. This WebGL study does not offer vector SVG or PDF exports.

## Review status

`npm run build` and `npm run check` pass. The actual geometry builder produces 6 component groups, 38 header contacts, 28 mesh draws and 118,786 triangles. Checks cover finite mesh coordinates, the CPU/flash clearance under the shield, floor clearance at five separation values, header pitch and row separation, module length and 6.04 mm overhang, assembled/exploded poses, and isolated-part visibility. The expanded three-board standalone collection is about 9.4 MiB with embedded models, scripts and fonts.

Browser rendering and control verification remain incomplete. The user approved access and reported updating saved permissions, but the browser tool continued rejecting `http://localhost:5174` because of a saved permission block. No screenshots, responsive browser checks, downloaded PNG checks, or visual approval are claimed. The development server remains available at that URL for direct user inspection.


## Raspberry Pi 5 — official 3D assembly

Source: [Raspberry Pi 5 product information portal](https://pip.raspberrypi.com/categories/892-raspberry-pi-5), official **3D STEP (No Graphics)** archive. The original archive, STEP and license are retained in `reference/pi5/`. [Direct archive](https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010083-CA-1-rpi-5%203D%20STEP%20-%20No%20Graphics%20small%20file.zip).

The [official mechanical drawing](https://datasheets.raspberrypi.com/rpi5/raspberry-pi-5-mechanical-drawing.pdf) was downloaded, rendered and visually inspected. The board envelope is 85 × 56 mm, the primary mounting-hole pattern is 58 × 49 mm, and the main holes are Ø2.7 mm. Specifications were checked against [Raspberry Pi hardware documentation](https://www.raspberrypi.com/documentation/computers/sbcs.html). Memory capacity is deliberately unspecified because it varies by board configuration.

Native OpenCascade reads the STEP via STEPCAFControl, retaining colors and locations. The importer traverses both solids and free shells; retaining the latter is necessary for the micro-HDMI connector shells. All **2,711 source shapes** survive, with no invented chip interiors or generic replacements for the large connectors. Reference shape inventory and group assignment are recorded in `reference/pi5/source-groups.json`.

Tessellation uses an absolute linear-deflection setting of **0.04 mm** and angular deflection of **0.55 radians**. This is a meshing setting, not an independently certified model-error bound. Coordinates remain in millimetres and are rounded to 0.0001 mm when packaged. The proper coordinate transform is `(x − 42.5, z − 0.668, 28 − y)`, which changes the up axis without mirroring the geometry. The source PCB thickness is 1.276 mm; it is preserved rather than replaced by an assumed value.

The displayed groups are BCM2712, LPDDR4X memory, RP1, external connectors, GPIO header and carrier board. Small passives, FFC connectors, microSD socket and wireless hardware remain on the carrier. The 40-contact header preserves its housing and individual posts. Explosion is an explanatory movement of soldered groups, not a service disassembly sequence. The source model contains no printed graphics. Colors and lighting are rendering choices.

**Verification:** 35 mesh draws and 836,366 triangles; all source shapes retained; actual geometry indices and coordinates checked; assembly and separation at five poses; floor clearance; each group's isolation and X-ray state; GPIO inventory and both micro-HDMI shells retained. Source PCB bounds match 85 × 56 mm. Browser visual verification remains pending as described above.

**Accuracy limit:** Raspberry Pi Ltd explicitly supplies this CAD for guidance without a guarantee of accuracy or currency. It is appropriate reference geometry, not certified fitment/manufacturing data. CAD © 2026 Raspberry Pi Ltd, MIT. The complete original notice is retained in `public/licenses/raspberry-pi-cad-MIT.txt` and embedded in the standalone HTML.

## Arduino Uno R3 — official EAGLE coordinates

Sources: [Arduino Uno R3 documentation](https://docs.arduino.cc/hardware/uno-rev3), [official CAD archive](https://docs.arduino.cc/static/6bb7a3ca51ebee82a252f60c0b418787/A000066-cad-files.zip), [datasheet](https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf), and the official pinout photograph saved in `reference/uno/pinout.png` and visually inspected. The modeled variant is **classic socketed DIP-28 Uno R3**, using `UNO-TH_Rev3e.brd`, not Uno R4 or Uno R3 SMD.

`prepare-uno.py` extracts the EAGLE board outline, curved corners, mounting holes, copper paths, artwork, component centers/rotations and package pads into `src/uno-layout.json`. These coordinates are preserved in the 3D builder. The 68.58 × 53.34 mm outline includes its original stepped end. The four mounting holes are Ø3.2 mm at `(66.04,35.56)`, `(66.04,7.62)`, `(15.24,50.8)` and `(13.97,2.54)` in EAGLE coordinates. DC-jack overlapping drill hits are represented as three capsule slots.

The four female header banks have **10 + 8 + 8 + 6 sockets**, a 2.54 mm within-bank pitch and the original **4.064 mm** gap between the digital banks. The ATmega328P's socket remains on the PCB when the DIP package is lifted. USB-B, the DC barrel jack, ATmega16U2, resonator, quartz crystal, regulators, ICSP headers, reset switch, capacitors and small passives follow the source footprint centers and rotations. Copper and artwork are rasterized for display from the source paths; routed copper is a visual surface, not an electrical simulation.

**Accuracy limit:** EAGLE supplies planar layout, not complete 3D packages. Package bodies are reconstructed from footprint/type references. Heights, lead bends, USB-B and barrel-jack interiors, small package details and the 1.6 mm PCB thickness are representative. Silkscreen fonts and surface colors are approximations. This model is dimensionally grounded in the official board layout, but a fully exact physical replica is not claimed.

**Verification:** 33 mesh draws and 202,787 triangles. The actual extruded PCB's bounds match 68.58 × 53.34 mm. Checks cover the four source mounting holes, header counts/pitch/gap, finite geometry and indices, assembly at five poses, floor clearance, isolated visibility and X-ray restoration. Browser visual verification remains pending as described above.

**Attribution:** Arduino hardware layout © Arduino, CC BY-SA 4.0. The original license notice is retained in `public/licenses/arduino-cad-CC-BY-SA-4.0.txt` and embedded in the standalone HTML. The extracted layout and adapted Uno geometry retain that license. Changes include extraction of the EAGLE layout, reconstructed 3D bodies and new rendering materials.

## Board-tab behavior

Three accessible tabs switch the shared stage and reference panel. Each tab loads its own model, camera framing, component inventory and specifications. Pi CAD is loaded lazily and cached. Switches clear isolation and X-ray; new Pi/Uno views start assembled so that their original placement is immediately visible. All controls operate on the active board. Asynchronous model loads have a version guard to prevent a slower earlier click replacing a later selection.

Latest validation: `npm run build` and `npm run check` both pass. The local Vite process is listening on localhost:5174. No successful browser render, screenshot or downloaded-PNG inspection is claimed.

## Pi loading regression fix

The Pi loader previously tried to decompress every response. Vite's installed static-file middleware sends `.gz` assets with `Content-Encoding: gzip`, so browser Fetch delivers already-decoded JSON. A second decompression failed before the Pi model could replace the previous board.

The loader now checks for gzip's byte signature before applying decompression. This preserves support for raw compressed files and the embedded offline asset. `scripts/check-pi-loader.mjs` reproduced the original failure (`Z_DATA_ERROR: incorrect header check`) using the actual Pi asset and a browser-decoded response. After the fix, the same test passes, together with compressed-file loading, offline loading, missing-file rejection and invalid-response rejection. It is included in `npm run check`. These are local loader tests; browser access was retried and remains rejected by the saved localhost permission.

## Material, small-component and Active Cooler revision

This revision replaces the warm, high-intensity studio illumination with neutral white lighting and Three.js neutral tone mapping. PCB material colors are estimated from official product photographs: black/navy for ESP32, teal for Uno, and green for Pi. Plastic and ceramic bodies are dielectric; metal shells and contacts have separate metallic responses. These are visual matches to photographic references, not spectrally calibrated colors. Browser visual verification remains incomplete because of the previously recorded localhost restriction.

Additional references inspected:

- [Arduino Uno R3 official product photographs](https://store.arduino.cc/products/arduino-uno-rev3), with the front photograph retained in `reference/uno/product.jpg`.
- [Raspberry Pi 5 official product photographs](https://www.raspberrypi.com/products/raspberry-pi-5/), retained in `reference/pi5/product.png`.
- [Raspberry Pi Active Cooler official product page](https://www.raspberrypi.com/products/active-cooler/), with the installed cooler photograph retained in `reference/cooler/product.jpg`.
- [Active Cooler mechanical drawing](https://datasheets.raspberrypi.com/cooling/raspberry-pi-active-cooler-mechanical-drawing.pdf), retained and rendered to `reference/cooler/mechanical.png` for inspection.
- [Active Cooler product brief](https://pip-assets.raspberrypi.com/categories/993-raspberry-pi-active-cooler/documents/RP-008188-DS-2-raspberry-pi-active-cooler-product-brief.pdf).

| Feature | Evidence kind | Treatment |
| --- | --- | --- |
| Board mask, plastic, contact and shell finishes | Features visible in official photographs | Estimated material colors with neutral illumination; no calibrated color claim. |
| Uno discrete components | Supplied geometry / layout | Separate groups for each modeled populated EAGLE element: capacitors, resistors, resistor networks, clocks, regulators, LEDs, switches, diodes, ICSP headers and IC socket. Existing footprint positions and rotations preserved. Body heights remain reconstructed. |
| Pi peripheral packages | Supplied geometry | PMIC, wireless shield/circuitry, FAN, RTC, UART, both CAM/DISP connectors, PCIe connector, power switch, PoE header, Ethernet PHY, clock packages and microSD socket now separate from the carrier. |
| Pi small packages | Supplied geometry, geometric grouping inferred | Touching residual CAD solids are connected into 438 small geometric groups. Original bodies and terminals are retained. Names identify geometry, not a verified electrical BOM or resistor/capacitor value. Some touching bodies can form a group; disconnected source solids may remain separate. |
| Cooler outline | Supplied dimensions | 63.5 × 42.5 mm planar envelope from the official drawing. Nominal drawing height 13.7 mm. |
| Cooler pin axes | Supplied dimensions and CAD geometry | Board coordinates (3.5, 9.5) and (61.5, 46.5) mm. Ray tests confirm both axes pass through the actual official PCB holes and the heatsink openings and intersect the modeled pins. |
| Heatsink fins and underside lands | Photograph-visible / hidden reconstruction | Segmented fin field follows visible construction. Fin profiles, spacing and underside thermal lands are reconstructed; no precise manufacturing claim. |
| Blower and fasteners | Supplied dimensions and photograph-visible features | 30 × 30 mm blower, open inlet, black rotor, metal shroud, side outlet, three mounting screws; detailed impeller shape reconstructed. |
| Thermal pads | Documented function / hidden reconstruction | Three contact pads at CPU, memory and PMIC positions. Thicknesses and contact lands reconstructed. |
| Fan wiring | Documented connection / photograph-visible reconstruction | Four conductors and plug to the dedicated FAN connector. Cable curvature is illustrative. |
| Teardown paths | Explanatory illustration | All components return to their source coordinates at zero separation. Cooler pieces lift above chips; underside components move downward. The view is not a service procedure. |

The updated Uno has **47 selectable parts**, 105 source meshes and 202,787 triangles. Pi has **466 selectable groups**, including 438 small CAD groups and six cooler groups, with 907,726 triangles total. Every one of the original 2,711 Pi CAD shapes is preserved exactly once in the grouping inventory. No native mesh simplification was added in this revision.

Pi rendering uses **33 material batches** plus four textured decals. The original component meshes remain on a picking/bounds layer, retaining individual selection, isolation and camera framing. Batch transforms and visibility are checked against the original groups at assembled and separated poses, including X-ray and cooler toggling. Actual GPU frame rate has not been measured in the blocked browser.

The list now supports component search. Small-component labels appear for the selected item rather than placing hundreds of labels over the board. The **Active Cooler** toggle hides the entire accessory so the bare Pi can be inspected. Isolated components support up to 20× zoom. Guided tours cover major groups and a few representative small components.

Rebuild with `node scripts/package-pi5.mjs`, then `npm run build && npm run check`. Checks include all component IDs and non-empty geometry, source-shape coverage, five assembly poses, floor clearance, isolation, X-ray restoration, cooler envelope, accessory visibility, batch transforms, mounting-hole alignment and the gzip loading regression. Official reference photos and drawings were viewed; the deliverable itself has not been visually approved in the browser.
