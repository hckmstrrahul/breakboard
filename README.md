# breakboard

Explore development boards, displays, optics, radio hardware and mechanisms as interactive 3D assemblies. Separate components, inspect their functions, switch to anatomy linework, and play restrained hardware animations.

[Open breakboard](https://breakboard-teardown.vercel.app) · Built with Three.js, vanilla JavaScript and Vite. Runs entirely in the browser.

## Take it offline

<!-- offline-stats:start -->
**17 interactive devices in one 22.12 MB HTML file** (21.10 MiB).
<!-- offline-stats:end -->

[Save the standalone HTML](https://breakboard-teardown.vercel.app/breakboard.html) or generate `dist/breakboard.html` with `npm run build`. That single portable file includes every model, the 3D engine, fonts, styles and controls. Open it in a WebGL 2 browser with no installation, server or internet connection. Teardown, anatomy, component selection, animations and image export all work offline.

The build refreshes the device count and file size above from the board registry and the generated HTML.

## Light-mode gallery

Actual 2400 px PNG captures from **Save image**. Each pair shares its camera and separation. Anatomy is the app's **X-ray** mode, shown with no component selected.

| Device | Teardown · materials | Anatomy · contours and markings |
| --- | --- | --- |
| **ESP32** | ![Exploded ESP32 in light mode, showing its shield, radio module, carrier and headers](docs/images/esp32-teardown-light.png) | ![The same ESP32 assembly with anatomy shading, outlines and original markings](docs/images/esp32-anatomy-light.png) |
| **Raspberry Pi 5** | ![Raspberry Pi 5 with its Active Cooler, fan and packages separated in light mode](docs/images/pi5-teardown-light.png) | ![The same Raspberry Pi 5 in anatomy mode, retaining fins, fan blades and connector details](docs/images/pi5-anatomy-light.png) |
| **Arduino Uno** | ![Exploded Arduino Uno R3 with its socketed processor, headers and discrete components](docs/images/uno-teardown-light.png) | ![The same Uno in anatomy mode with PCB markings, packages and pin outlines](docs/images/uno-anatomy-light.png) |
| **Jetson Orin Nano** | ![Exploded Jetson Orin Nano with its cooling assembly, compute module and carrier](docs/images/jetson-teardown-light.png) | ![The same Jetson in anatomy mode with fan, heatsink and connector contours](docs/images/jetson-anatomy-light.png) |
| **Pico 2 W** | ![Exploded Raspberry Pi Pico 2 W with its processor, wireless circuitry and USB connector](docs/images/pico2w-teardown-light.png) | ![The same Pico 2 W in anatomy mode with component outlines and board artwork](docs/images/pico2w-anatomy-light.png) |
| **Arduino Nano** | ![Exploded classic Arduino Nano with components and pin headers separated](docs/images/nano-teardown-light.png) | ![The same Nano in anatomy mode with packages, pins and printed markings](docs/images/nano-anatomy-light.png) |
| **Orange Pi 5** | ![Exploded Orange Pi 5 with its processor, memory, connectors and expansion headers](docs/images/orangepi5-teardown-light.png) | ![The same Orange Pi 5 in anatomy mode with detailed connector and package outlines](docs/images/orangepi5-anatomy-light.png) |
| **BeagleBone Black** | ![Exploded BeagleBone Black with its processor, memory, expansion headers and ports](docs/images/beaglebone-teardown-light.png) | ![The same BeagleBone Black in anatomy mode with component contours and board markings](docs/images/beaglebone-anatomy-light.png) |
| **STM32 Nucleo** | ![White and blue NUCLEO-F401RE with processors, headers and controls separated](docs/images/nucleo-teardown-light.png) | ![The same Nucleo board in anatomy mode with pin outlines and printed graphics](docs/images/nucleo-anatomy-light.png) |
| **Portenta X8** | ![Arduino Portenta X8 with both sides, high-density connectors and processor packages separated](docs/images/portenta-teardown-light.png) | ![The same Portenta X8 assembly with anatomy contours and markings](docs/images/portenta-anatomy-light.png) |
| **Nixie tube** | ![Dalibor Farny R tube with its glass, ten numeral cathodes, anode grid and insulators separated](docs/images/nixie-teardown-light.png) | ![The same Nixie tube assembly with anatomy contours and markings](docs/images/nixie-anatomy-light.png) |
| **NeoPixel 8×8** | ![Adafruit 64-pixel matrix with its LED packages and support components lifted from the PCB](docs/images/neopixel-teardown-light.png) | ![The same NeoPixel 8×8 assembly with anatomy contours and markings](docs/images/neopixel-anatomy-light.png) |
| **DLP micromirrors** | ![TI DLP6500 package beside its separately labelled 600× micromirror mechanism detail](docs/images/dlp-teardown-light.png) | ![The same DLP micromirrors assembly with anatomy contours and markings](docs/images/dlp-anatomy-light.png) |
| **HQ Camera** | ![Raspberry Pi HQ Camera with its CS mount, adapter, infrared filter, sensor and rear electronics separated](docs/images/hqcamera-teardown-light.png) | ![The same HQ Camera assembly with anatomy contours and markings](docs/images/hqcamera-anatomy-light.png) |
| **Stepper motor** | ![Representative hybrid stepper with laminated stator, copper windings, toothed rotor and bearings separated](docs/images/stepper-teardown-light.png) | ![The same Stepper motor assembly with anatomy contours and markings](docs/images/stepper-anatomy-light.png) |
| **HackRF One** | ![HackRF One r10 with its RF front end, controller, SMA ports and fitted headers separated](docs/images/hackrf-teardown-light.png) | ![The same HackRF One assembly with anatomy contours and markings](docs/images/hackrf-anatomy-light.png) |
| **Grobot** | ![Grobot open brass frame, perfboard, servo pointer, controller, LCD, UPS, batteries and audio modules separated](docs/images/grobot-teardown-light.png) | ![The same Grobot assembly with anatomy contours and component markings](docs/images/grobot-anatomy-light.png) |

To reproduce: choose **Light**, reset the device (tags start off), and use **3D**. ESP32 uses its default 78% separation; all other devices use **Exploded** at 100%. Save with X-ray off, then on, without moving the camera. [Capture details](docs/images/README.md).

## Run locally

Requires Node.js **22.12+** (or **20.19+ on the 20.x line**) and a browser with WebGL 2 enabled.

```sh
git clone https://github.com/hckmstrrahul/breakboard.git
cd breakboard
npm ci
npm run dev -- --port 5174 --strictPort
```

Open [127.0.0.1:5174](http://127.0.0.1:5174). No account, API key or backend is required.

## Explore

| Control | Behavior |
| --- | --- |
| Device pills + dropdowns | Choose from Boards, Displays, Optics, Motion and Radio. Each active pill shows the selected device. Arrow keys navigate menus; Escape closes them. |
| Assembled / Exploded + Separation | Move between the assembled device and separated component groups. |
| Selection | Tags start off. Click a component or list item to show its selection tag; picking on the model anchors it to the clicked surface. Click empty canvas to clear selection and show all tags when labels are enabled. |
| X-ray | Show the whole device in anatomy style. Glass retains its transparency and contours. Selecting a part ghosts the others; clicking empty canvas restores the complete view. |
| Isolate | Frame one component group. Also works with X-ray. |
| Play / Pause | Assemble the device, then animate fans, LEDs, numeral cathodes, stepped shafts, a servo pointer, mirror tilt or illustrative signal/light paths. Changing separation stops playback. The camera, Nixie tube, stepper and Grobot adjust framing with separation; orbiting or zooming preserves your manual framing until a camera preset or reset. Reduced motion uses a still powered view. |
| 3D / Top / Front | Switch cameras. Drag to orbit, right-drag to pan, scroll or use + / − to zoom. |
| Light / Dark / System | Dark by default. Choose Light, Dark or System; the preference persists. |
| Save image | Download a 2400 px PNG of the model in its current view and theme. |

Overview tags retain their placement while orbiting. Collision adjustments move smoothly, while leader dots stay attached to the actual components. Most Uno tags include printed references and readable component types; about 30% use reference codes alone to reduce crowding. Other boards label key subsystems while grouping routine passives; selecting a component shows its full explanation.

On mobile, the model comes first. Use the grouped device picker and expand **Controls** or **Components & details** when needed. Selecting a component closes its panel and reveals its tag on the model.

X-ray, playback, overview tags and camera choice persist across device changes. Pi's **Cooler** switch toggles its cooling assembly. Shortcuts: **E** separation, **L** labels, **P** playback, **R** reset, **H** interface. **Esc** closes an open device menu; otherwise it stops playback and exits X-ray, isolation and hidden-interface mode. Arrow keys orbit a focused canvas.

## Devices and evidence

| Device | Route | Geometry basis |
| --- | --- | --- |
| ESP32-DevKitC V4 / WROOM-32E | `#esp32` | Published dimensions and photographs |
| Raspberry Pi 5 + Active Cooler | `#pi5` | Official STEP; reconstructed cooler details |
| Arduino Uno R3 | `#uno` | Official EAGLE layout |
| NVIDIA Jetson Orin Nano Super | `#jetson` | Official STEP; reconstructed external receptacles |
| Raspberry Pi Pico 2 W | `#pico2w` | Official dimensions and component layout |
| Classic Arduino Nano V3.3 | `#nano` | Official EAGLE layout, both sides |
| Xunlong Orange Pi 5 | `#orangepi5` | Official manual and photographs |
| BeagleBone Black Rev C | `#beaglebone` | Official drawing and photographs |
| STMicroelectronics NUCLEO-F401RE | `#nucleo` | ST UM1724, MB1136 C-03 configuration |
| Arduino Portenta X8 | `#portenta` | Official STEP; 2,011 supplied solids |
| Dalibor Farny R Nixie tube | `#nixie` | Official envelope and contact pattern; reconstructed electrode assembly |
| Adafruit NeoMatrix 8×8 v2 | `#neopixel` | Official EAGLE layout; 64 WS2812B RGB packages |
| TI DLP6500FYE | `#dlp` | Official 350-pin package; separately labelled 600× mechanism illustration |
| Raspberry Pi HQ Camera, CS mount | `#hqcamera` | Official mount drawings and schematic; reconstructed package bodies |
| 42 mm hybrid stepper | `#stepper` | Documented two-phase mechanism; representative mechanical dimensions |
| Great Scott Gadgets HackRF One r10 | `#hackrf` | Official KiCad board; 437 footprint placements |
| Grobot / open brass frame | `#grobot` | Official Waveshare UPS/LCD STEP; same specified hardware, custom perfboard and open brass frame |

These are educational reconstructions. Separating soldered parts explains their roles; it is not a physical disassembly procedure. Estimated heights, connector interiors and hidden placements are recorded in [reference/](reference/) and the [device registry](src/boards.js). X-ray reuses modeled surfaces, without inventing buried copper or silicon internals. Signal paths illustrate activity, not an electrical simulation. The stepper is a representative mechanism, not a manufacturer-specific replica. The DLP package stays at its documented scale; a separate **600× detail** explains the micromirror mechanism without claiming a disclosed fabrication stack. Nixie electrode shapes and hidden construction are identified as reconstructed.

[Grobot’s evidence record](reference/grobot/evidence.md) distinguishes the 325 original Waveshare solids from reconstructed parts. Its AYWHP ESP32-S3, SG90, two BAK cells, audio modules and four filaments retain the supplied hardware inventory. A new open brass frame, perforated carrier, visible jumpers and plain servo pointer replace the enclosure and decorative anchor. The frame, mounting layout, wiring and unmeasured kit footprints remain provisional; six driver positions remain empty. Play uses sample content and an illustrative servo command.

## How I built it

1. **Started with evidence.** I imported manufacturer STEP geometry with OpenCascade and extracted footprints and artwork from official EAGLE and KiCad files. I used drawings and photographs to reconstruct missing packages, recording assumptions.
2. **Built shared assemblies.** I gave component groups geometry, identity, selection anchors and separation vectors. I batched small meshes while retaining selectable groups; Pi's surface-mount packages share one SMD group.
3. **Rendered two treatments.** I used Three.js for materials, lighting, shadows and an orthographic camera. Anatomy reuses the same geometry, transforms and artwork with tonal shading and geometric contours. Raycast anchors keep callouts attached through orbit and separation.
4. **Connected the controls.** I used shared state to drive grouped device menus, cameras, selection, isolation, themes and playback. Only identified moving parts and indicators animate.
5. **Inspected and checked.** I combined geometry and interaction checks with independent maker–checker reviews and browser inspection. The [review record](reference/maker-checker.md) distinguishes verified behavior from reconstruction limits.

### Skills and tools

These informed the implementation; the shipped viewer is custom Three.js code.

| Resource | Contribution |
| --- | --- |
| [Teardown skill · Jakub Krehel](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md) | Evidence-led reconstruction, coherent assembly views and precise part-to-annotation correspondence. |
| [Anatomy skill · wheresryan22](https://github.com/wheresryan22/anatomy) | Detailed solids, tonal hierarchy and fine contours. Its illustration principles were adapted to my WebGL renderer. |
| [Untitled UI MCP](https://www.untitledui.com/react/integrations/mcp) | Component and icon references for tabs, buttons, inputs and sliders. Adapted to semantic HTML/CSS; [integration notes](reference/untitled-ui/README.md). |
| [Teardown skill · Elvar](https://github.com/elvarofficial/teardown/blob/main/SKILL.md) | Original simulator reference: shared model/state, studio rendering, cameras, subsystem interaction and portable HTML. I read its skill and examples; breakboard uses its own runtime. |

The two Teardown skills have different goals. **Elvar’s** starts with an interactive machine that runs: its state drives poses, controls and readouts, with optional tours and film export. **Jakub’s** starts with a technical illustration: evidence, geometry, coherent views, hidden-line handling and annotations that point to the correct features. **Anatomy** supplies the detailed tonal drawing treatment. I adapted these ideas to one Three.js model; I do not ship their complete viewers, claim circuit simulation, or use their tour/video features.

### Sharing metadata

The browser title and Open Graph title are **breakboard**. The description is: “Explore electronics in 3D, from development boards to displays and mechanisms. Take them apart, inspect each component, and switch between realistic and anatomy views.” Open Graph and Twitter image tags reference the public light-mode Pi teardown capture. The canonical URL and `og:url` point to [breakboard-teardown.vercel.app](https://breakboard-teardown.vercel.app); the preview image is served from the same site. GitHub manages the repository page’s own sharing preview separately.

### Code map

| Files | Responsibility |
| --- | --- |
| [boards.js](src/boards.js), board builders, [board-kit.js](src/board-kit.js) | Inventories, geometry, shared packages and connectors |
| [assembly.js](src/assembly.js), [batching.js](src/batching.js) | Separation, group visibility and mesh batching |
| [scene.js](src/scene.js), [selection.js](src/selection.js) | Cameras, rendering, picking, callouts and PNG export |
| [anatomy.js](src/anatomy.js), [operation.js](src/operation.js) | Anatomy rendering and illustrative activity |
| [main.js](src/main.js), [device-menu.js](src/device-menu.js), [style.css](src/style.css), [theme.js](src/theme.js) | Interface, state and appearance |

## Build and verify

```sh
npm run build
npm run check
```

Deploy `dist/` to a static host, or use the [standalone offline file](#take-it-offline). On the hosted app, Jetson CAD ships in the app bundle and Pi, Portenta and Grobot CAD load on first selection. Built models are cached.

Checks cover inventories, dimensions, geometry, assembly poses, isolation, anatomy, picking, callout layout, CAD loading, themes and playback. Browser review is recorded separately. The standalone HTML also loaded all seventeen devices from a local file in Chrome with networking disabled and no HTTP requests. Mobile layouts and selection were checked at phone, tablet and landscape viewport sizes; physical-device touch and safe-area behavior still need a phone check.

Normal development uses the supplied runtime assets. Downloaded reference CAD, PDFs, photographs and intermediate meshes stay local; source URLs and evidence records are included. Regenerating STEP meshes additionally requires `cadquery-ocp==7.9.3.1.1` and the `import-*` / `package-*` scripts in [scripts/](scripts/) and [reference/grobot/](reference/grobot/). Arduino extraction uses `prepare-uno.py` and `prepare-nano.py`.

## Attribution

- Raspberry Pi CAD © 2026 Raspberry Pi Ltd, [MIT](public/licenses/raspberry-pi-cad-MIT.txt). Adaptations: tessellation, coordinates, grouping and materials.
- Arduino Uno/Nano layouts and adapted geometry retain [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Adaptations: layout extraction, package reconstruction and materials; [source notice](public/licenses/arduino-cad-CC-BY-SA-4.0.txt).
- BeagleBoard documentation/imagery © BeagleBoard.org Foundation, CC BY-SA 4.0; reconstructed BeagleBone geometry is offered under the same license. NVIDIA reference geometry remains subject to its download terms. Per-board records in [reference/](reference/) link original sources.
- Adafruit NeoMatrix layout and adapted geometry: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); [source](https://github.com/adafruit/Adafruit-NeoPixel-8x8-Matrix). HackRF r10 hardware and adapted geometry: [CERN-OHL-P-2.0](https://ohwr.org/cern_ohl_p_v2.txt); [source](https://github.com/greatscottgadgets/hackrf/tree/main/hardware/hackrf-one). Portenta geometry is derived from Arduino’s published reference STEP; see [evidence](reference/portenta/evidence.md).
- Waveshare UPS HAT (D) and 1.47-inch LCD geometry is adapted from the manufacturer’s published STEP files; [source and modification notice](public/licenses/waveshare-grobot.txt). Grobot’s custom parts are proposed packaging geometry, not manufacturing CAD.
- [Untitled UI icon notice](public/licenses/untitled-ui-icons.txt). Board names and logos identify their respective hardware vendors.
