# breakboard

Explore nine development boards as interactive 3D assemblies. Separate components, inspect their functions, switch to anatomy linework, and play restrained fan, LED and signal-flow animations.

Built with Three.js, vanilla JavaScript and Vite. Runs entirely in the browser.

## Light-mode gallery

Actual 2400 px PNG captures from **Save image**. Each pair shares its camera and separation. Anatomy is the app's **X-ray** mode, shown with no component selected.

| Board | Teardown · materials | Anatomy · contours and markings |
| --- | --- | --- |
| **ESP32** | ![Exploded ESP32 in light mode, showing its shield, radio module, carrier and headers](docs/images/esp32-teardown-light.png) | ![The same ESP32 assembly with anatomy shading, outlines and original markings](docs/images/esp32-anatomy-light.png) |
| **Raspberry Pi 5** | ![Raspberry Pi 5 with its Active Cooler, fan and packages separated in light mode](docs/images/pi5-teardown-light.png) | ![The same Raspberry Pi 5 in anatomy mode, retaining fins, fan blades and connector details](docs/images/pi5-anatomy-light.png) |
| **STM32 Nucleo** | ![White and blue NUCLEO-F401RE with processors, headers and controls separated](docs/images/nucleo-teardown-light.png) | ![The same Nucleo board in anatomy mode with pin outlines and printed graphics](docs/images/nucleo-anatomy-light.png) |

To reproduce: choose **Light**, reset the board, disable labels, and use **3D**. ESP32 uses its default 78% separation; Pi and Nucleo use **Exploded** at 100%. Save with X-ray off, then on, without moving the camera. [Capture details](docs/images/README.md).

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
| Assembled / Exploded + Separation | Move between the assembled board and separated component groups. |
| Selection | Click a component or list item. Its tag follows the clicked surface. Click empty canvas to clear selection and show all tags when labels are enabled. |
| X-ray | Show the whole board in anatomy style. Selecting a part ghosts the others; clicking empty canvas restores the complete view. |
| Isolate | Frame one component group. Also works with X-ray. |
| Play / Pause | Assemble the board, then animate supported fans, indicators and illustrative signal paths. Changing separation stops playback. Reduced motion uses a still powered view. |
| 3D / Top / Front | Switch cameras. Drag to orbit, right-drag to pan, scroll or use + / − to zoom. |
| Light / Dark / System | Change appearance; the preference persists. |
| Save image | Download a 2400 px PNG of the model in its current view and theme. |

Overview tags are packed around their component anchors. Dense boards use concise tags, including the Uno’s printed reference codes; selecting a component restores its full label and explanation.

X-ray, playback and camera choice persist across board tabs. Pi's **Cooler** switch toggles its cooling assembly. Shortcuts: **E** separation, **L** labels, **P** playback, **R** reset, **H** interface. **Esc** stops playback and exits X-ray, isolation and hidden-interface mode. Arrow keys orbit a focused canvas.

## Boards and evidence

| Board | Route | Geometry basis |
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

These are educational reconstructions. Separating soldered parts explains their roles; it is not a physical disassembly procedure. Estimated heights, connector interiors and hidden placements are recorded in [reference/](reference/) and the [board registry](src/boards.js). X-ray reuses modeled surfaces, without inventing buried copper or silicon internals. Signal paths illustrate activity, not an electrical simulation.

## How we built it

1. **Start with evidence.** Import manufacturer STEP geometry with OpenCascade; extract Arduino footprints and artwork from EAGLE files. Use drawings and photographs to reconstruct missing packages, recording assumptions.
2. **Build shared assemblies.** Give component groups geometry, identity, selection anchors and separation vectors. Batch small meshes while retaining selectable groups; Pi's surface-mount packages share one SMD group.
3. **Render two treatments.** Three.js supplies materials, lighting, shadows and an orthographic camera. Anatomy reuses the same geometry, transforms and artwork with tonal shading and geometric contours. Raycast anchors keep callouts attached through orbit and separation.
4. **Connect the controls.** Shared state drives board tabs, cameras, selection, isolation, themes and playback. Only identified moving parts and indicators animate.
5. **Inspect and check.** Geometry and interaction checks accompany independent maker–checker reviews and browser inspection. The [review record](reference/maker-checker.md) distinguishes verified behavior from reconstruction limits.

### Skills and tools

These informed the implementation; the shipped viewer is custom Three.js code.

| Resource | Contribution |
| --- | --- |
| [Teardown skill · Jakub Krehel](https://github.com/jakubkrehel/skills/blob/main/skills/teardown/SKILL.md) | Evidence-led reconstruction, coherent assembly views and precise part-to-annotation correspondence. |
| [Anatomy skill · wheresryan22](https://github.com/wheresryan22/anatomy) | Detailed solids, tonal hierarchy and fine contours. Its illustration principles were adapted to our WebGL renderer. |
| [Untitled UI MCP](https://www.untitledui.com/react/integrations/mcp) | Component and icon references for tabs, buttons, inputs and sliders. Adapted to semantic HTML/CSS; [integration notes](reference/untitled-ui/README.md). |
| [Elvar's Teardown](https://github.com/elvarofficial/teardown) | Original inspiration for an interactive machine you can take apart. |
| [Crisp technical docs](docs/skills/crisp-technical-docs/SKILL.md) | Reusable documentation skill added for this README: verify against source, show real captures and keep explanations concise. |

### Code map

| Files | Responsibility |
| --- | --- |
| [boards.js](src/boards.js), board builders, [board-kit.js](src/board-kit.js) | Inventories, geometry, shared packages and connectors |
| [assembly.js](src/assembly.js), [batching.js](src/batching.js) | Separation, group visibility and mesh batching |
| [scene.js](src/scene.js), [selection.js](src/selection.js) | Cameras, rendering, picking, callouts and PNG export |
| [anatomy.js](src/anatomy.js), [operation.js](src/operation.js) | Anatomy rendering and illustrative activity |
| [main.js](src/main.js), [style.css](src/style.css), [theme.js](src/theme.js) | Interface, state and appearance |

## Build and verify

```sh
npm run build
npm run check
```

Deploy `dist/` to a static host. The build also creates `dist/breakboard.html`, embedding scripts, styles, fonts and both CAD payloads. Jetson CAD ships in the app bundle; Pi CAD loads on first selection. Built models are cached.

Checks cover inventories, dimensions, geometry, assembly poses, isolation, anatomy, picking, callout layout, CAD loading, themes and playback. Browser review is recorded separately. Direct `file://` inspection of the standalone file was blocked by browser policy; embedded-loader tests passed.

Normal development uses the supplied runtime assets. Downloaded reference CAD, PDFs, photographs and intermediate meshes stay local; source URLs and evidence records are included. Regenerating STEP meshes additionally requires `cadquery-ocp==7.9.3.1.1` and the `import-*` / `package-*` scripts in [scripts/](scripts/). Arduino extraction uses `prepare-uno.py` and `prepare-nano.py`.

## Attribution

- Raspberry Pi CAD © 2026 Raspberry Pi Ltd, [MIT](public/licenses/raspberry-pi-cad-MIT.txt). Adaptations: tessellation, coordinates, grouping and materials.
- Arduino Uno/Nano layouts and adapted geometry retain [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Adaptations: layout extraction, package reconstruction and materials; [source notice](public/licenses/arduino-cad-CC-BY-SA-4.0.txt).
- BeagleBoard documentation/imagery © BeagleBoard.org Foundation, CC BY-SA 4.0; reconstructed BeagleBone geometry is offered under the same license. NVIDIA reference geometry remains subject to its download terms. Per-board records in [reference/](reference/) link original sources.
- [Untitled UI icon notice](public/licenses/untitled-ui-icons.txt). Board names and logos identify their respective hardware vendors.
