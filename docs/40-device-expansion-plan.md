# Forty-device expansion plan

Status: implementation in progress. Batches 1–6 are integrated and independently reviewed: thirty additions, **56 devices total**. Batch 7 is being reviewed; the remaining 10 additions and the final 66-device review are pending. [Batch 1 verification](verification/expansion-batch1.md) · [Batch 2 verification](verification/expansion-batch2.md) · [Batch 3 verification](verification/expansion-batch3.md) · [Batch 4 verification](verification/expansion-batch4.md) · [Batch 5 verification](verification/expansion-batch5.md) · [Batch 6 verification](verification/expansion-batch6.md).

Scope: add all 40 agreed devices to the existing 26-device collection, for 66 total. Each addition includes geometry, component selection, assembled/exploded views, X-ray, useful interaction, documentation, previews and offline support. The entries below are research targets, not claims that their exact hardware revision or hidden construction has already been verified. No device is silently dropped or substituted.

The first batch locks Omron G2R-1 DC12, T-MOTOR MN2212 V2.0 KV920, Precision Microdrives C10-100, ams AS5600-SO_EK_AB/AS5600-SO_AB_V2 and Epson FC-135. Shared controls, per-device behavior, a three-model GPU cache, deforming anatomy contours and offline browser verification are implemented. Later mechanisms still need their own geometry and operation work.

## 1. Lock the evidence before modelling

Create a public-safe `reference/<device-id>/evidence.md` for every addition. Record:

- Manufacturer, exact part number, package, capacity/configuration where relevant, board revision and specimen identifier when available. A family name is not a revision lock.
- Datasheet/drawing revision, page/figure references, source URLs, retrieval date, dimensions and units. Pin downloadable source versions with checksums.
- A feature-by-feature inventory labelled **documented**, **photo-estimated**, or **representative**. Record contradictions and choose one consistent specimen; do not combine incompatible revisions.
- Source/redistribution rights. Link evidence when its imagery or CAD cannot be redistributed. Keep private local material and identifying metadata out of published assets.
- Geometry counts supported by evidence: platters, heads, pins, lens elements, blades, coils, channels and dies. Unknown counts remain explicitly unknown until resolved.

Preferred evidence order: official CAD/mechanical drawings; manufacturer datasheets/service documentation; manufacturer photographs and diagrams; attributable photographs of the same specimen. Published die imagery must match the actual chip revision to support a physical layout claim. A functional block diagram does not establish a die floorplan.

If internals are unavailable, retain accurate external geometry and label the relevant interior **Representative cutaway**. Conceptual signal routes, optical rays and enlarged MEMS structures receive a concise explanation in the inspector. Different evidence levels can coexist within one model. Source disagreements block the affected detail, not unrelated work on other devices.

Completion gate: a specific reference configuration and a complete evidence map exist before detailed geometry begins. Research targets below may be narrowed within the agreed device; changing the device itself requires a scope decision.

## 2. Extend the existing runtime first

Reuse the Three.js viewer and its visual language. Do not introduce a second viewer or rebuild the app interface.

| Area | Planned work | Acceptance condition |
| --- | --- | --- |
| Catalogue | Separate lightweight catalogue metadata from heavy builders; register the 40 explicit IDs in a scope manifest. | All 66 devices appear exactly once, with stable routes and no missing previews. |
| Memory and loading | Replace the unbounded model cache in `scene.js` with bounded reuse; dispose geometry, textures, effects and anatomy resources safely, respecting shared ownership. Load expensive geometry only when needed. | Repeated full-catalogue navigation reaches a stable memory level; switching during loading cannot show stale models. |
| Motion | Extend `hardware-motion.js` and `operation.js` for sliding joints, iris linkages, linked rotation, spring motion, membrane deformation and sequenced mechanisms. | Motion uses real pivots/constraints, stays out of static batches, is independent of frame rate and resets reproducibly. |
| Device behaviour | Add per-device operation controllers instead of growing one large device-specific conditional. Expose input, phase/time, output and reset state. | Changing an input changes the correct mechanism/readout; labels and anatomy follow moving parts. |
| Playback | Preserve assembly gating; add deterministic pause/resume and inspection of a specific operation phase. Changing separation pauses and parks mechanisms before disassembly. | No running mechanism falls apart mid-cycle; reset restores materials, poses, controls and outputs. |
| Effects | Share electrical, optical, magnetic, acoustic, thermal and fluid overlays where appropriate. Keep actual physical wires separate from explanatory flow. | Routes remain attached to their actual endpoints; no decorative activity disconnected from function. |
| Geometry | Add reusable lens profiles, iris blades, gear/pivot assemblies, coils, wound tapes, compliant membranes and package stacks. | Real openings, wall thickness and connections; no arbitrary repeated detail used to imply accuracy. |
| Rendering | Preserve stable decals and contours, add scale-aware detail and physically plausible material presets. Use controlled highlights for metal/glass. | No z-fighting, clipped markings, faceted close-up silhouettes or opaque decal shadows. |
| Tests | Extend existing collection/operation/selection tests using the explicit scope manifest and device contracts. Remove assumptions that every new device is a PCB or has a particular LED/fan count. | Existing device-specific checks remain intact; new requirements are asserted independently of the implementation. |

Solid-state chips do not acquire fictional moving hardware. Their interaction is an explanatory change of state, routed data, waveform or readout. MEMS displacement and high-speed mechanical motion can be magnified/slowed, with the display scale distinguished from physical specifications.

Target performance: smooth orbit/play near 60 fps on the reference desktop and at least 30 fps on the reference mobile device, measured during representative heavy scenes. Record hardware, resolution, pixel ratio and frame-time percentiles; emulation is not a substitute for a claimed physical-phone result. Optimize repeated geometry and draw calls before removing distinguishing detail.

## 3. Implement eight batches of five

The order follows shared mechanisms and increasing complexity. Every batch reaches the per-device completion gate before release. All 40 remain in scope; the early batches are not a reduced substitute for the full collection.

### Batch 1 — Mechanical and electromagnetic foundations

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 01 | Electromechanical relay: choose one documented Omron package/contact configuration. [Reference](https://components.omron.com/sg-en/products/basic-knowledge/relays/basics) | Power | Coil on/off drives the armature and switches the correct contacts; an output circuit responds. Verify contact travel, spring return and electrical state agree. |
| 02 | BLDC motor: choose one documented motor with known topology, pole/slot count and rotor dimensions. [Reference](https://www.portescap.com/en/products/brushless-dc-motors/bldc-motor-design) | Motion | Speed/direction controls drive the rotor; winding phases and a magnetic-field overlay explain commutation. Verify linked parts remain registered and stationary housing stays fixed. |
| 03 | Linear resonant haptic actuator: lock a Precision Microdrives model and spring/mass configuration. [Reference](https://www.precisionmicrodrives.com/understanding-horizontal-linear-resonant-actuators) | Motion | Frequency/amplitude and tap-pattern controls move the suspended mass. Verify clearance, spring attachment and repeatable return to rest. |
| 04 | AS5600 magnetic encoder: lock sensor package, evaluation board and magnet dimensions. [Reference](https://look.ams-osram.com/m/4f8342513a447495/original/AS5600_UG000254_2-00.pdf) | Sensors | Rotate a shaft/magnet and observe angle/output. Verify 0/360-degree wrap, rotation direction and contactless air gap. |
| 05 | Quartz watch resonator: choose one documented tuning-fork resonator package. The Astron history is conceptual background, not its dimensional reference. [Background](https://corporate.epson/en/about/history/milestone-products/1969-12-35sq.html) | Chips | Show enlarged opposite tine motion and a divided clock output. Verify the illustrated frequency division and clearly distinguish display speed from physical frequency. |

### Batch 2 — Audio and environmental sensing

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 06 | Infineon MEMS microphone: select a specific IM-series package, port orientation and documented architecture. [Reference](https://www.infineon.com/products/sensor/mems-microphones) | Audio | Sound amplitude/frequency controls membrane motion and an output waveform. Verify the acoustic port and correct moving element. |
| 07 | Balanced-armature driver: choose a specific Knowles receiver with documented cross-section. [Reference](https://product.knowles.com/audio/receivers/balanced-armature) | Audio | Input waveform drives armature, linkage and diaphragm; show the acoustic outlet. Verify the stationary coil stays fixed and motion transfers coherently. |
| 08 | Planar magnetic headphone driver: select an Audeze driver revision supported by published construction. [Reference](https://www.audeze.com/blogs/technology-and-innovation/planar-magnetic-technology) | Audio | Frequency/amplitude controls move the diaphragm between magnet arrays. Verify conductor pattern evidence, clearances and membrane anchoring. |
| 09 | Bosch BME688: lock package and datasheet revision; choose a particular carrier only if one is included. [Reference](https://www.bosch-sensortec.com/en/products/environmental-sensors/gas-sensors/bme688) | Sensors | Temperature/humidity/pressure and gas scenarios update the relevant illustrated channels. Keep gas response representative; do not imply true CO2 measurement or universal gas identification. |
| 10 | Sensirion SCD41: lock package and datasheet revision. [Reference](https://sensirion.com/products/catalog/SCD41) | Sensors | CO2 concentration changes an illustrative photoacoustic response and readout. Verify the sequence is infrared absorption → pressure response → sensing, not a fabricated moving pump. |

### Batch 3 — Motion, ranging and presence sensors

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 11 | TDK ICM-42688-P: lock package/datasheet and attributable die/MEMS evidence. [Reference](https://invensense.tdk.com/wp-content/uploads/2021/06/DS-000347-ICM-42688-P-v1.5.pdf) | Sensors | Explicit tilt/acceleration/rotation controls drive representative MEMS motion and axis readouts. Keep camera orbit separate from the simulated stimulus; verify axis signs. |
| 12 | ST VL53L8CX: lock sensor package and optical specification revision. [Reference](https://www.st.com/en/imaging-and-photonics-solutions/vl53l8cx.html) | Sensors | Move a virtual target; show emitted/returned pulses and an 8×8 depth map. Verify round-trip distance calculation, target bounds and zone mapping. |
| 13 | TI IWR6843ISK: lock the ISK EVM PCB revision and antenna layout, not an ODS/AOP substitute. [Reference](https://www.ti.com/document-viewer/lit/html/swra758) | Sensors | Move a target in range/angle and show illustrative chirps and detections. Verify transmit/receive geometry and consistent target/readout motion. |
| 14 | Panasonic PIR: choose an exact PaPIRs part number and matching lens. [Reference](https://na.industrial.panasonic.com/panasonics-pir-motion-sensors) | Sensors | Move a warm target through detection zones. Verify the sensor receives infrared, does not emit it, and responds to changes across zones. |
| 15 | Ultrasonic ranging module: choose a specific documented module plus its transducer construction. [Reference](https://www.murata.com/en-SG/products/sensor/ultrasonic/overview/basic/about) | Sensors | Distance control changes pulse/echo timing and readout. Verify the round trip and transmitter/receiver roles; distinguish illustrative wavefronts from hardware. |

### Batch 4 — Measurement, positioning and imaging silicon

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 16 | MAX30102: lock sensor package and a named carrier revision if used. [Reference](https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf) | Sensors | Red/IR channels respond to a synthetic pulsatile tissue scenario. Verify emitter sequencing and photodetector response; present an educational waveform, not a clinical result. |
| 17 | Strain-gauge load cell: choose an exact beam model, capacity, gauge arrangement and drawing. [Reference](https://cloud.hbkworld.com/en/knowledge/resource-center/articles/what-is-a-load-cell-and-how-does-a-load-cell-work) | Sensors | Apply force to an exaggerated beam deformation and bridge output. Verify mounting/load direction, zero/tare and sign of response. |
| 18 | u-blox ZED-F9P: lock the module variant, carrier revision and antenna if included. [Reference](https://www.u-blox.com/en/product/zed-f9p-module) | Radio | Change a satellite/correction scenario and illustrate acquisition and RTK convergence. Verify the states and label this as a synthetic scenario, not a live GNSS solver. |
| 19 | Sony IMX500: lock the package and published stacked architecture; a camera carrier is optional context, not another counted device. [Reference](https://www.aitrios.sony-semicon.com/edge-ai-devices/imx500) | Chips | Change a sample scene and follow pixel acquisition into an illustrative inference pipeline. Verify sensor/processing layer roles; no unsupported transistor floorplan. |
| 20 | Sony/Prophesee IMX636: lock the sensor package and published architecture revision. [Reference](https://www.prophesee.ai/event-based-sensors/) | Chips | Move/brighten a target and display positive/negative pixel events. Verify events respond to brightness changes rather than a conventional full-frame animation. |

### Batch 5 — Precision optics

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 21 | Canon EF 50mm f/1.8 STM: lock this lens and one consistent mechanical specimen/reference set. [Reference](https://global.canon/en/c-museum/product/ef451.html) | Optics | Aperture and focus controls drive iris blades and the focus group. Verify element/group/blade counts and assembly; ray paths are illustrative unless the optical prescription is available. |
| 22 | Nikon AF-S 24–70mm f/2.8E ED VR: lock this exact lens, avoiding mixed F/Z variants. [Reference](https://imaging.nikon.com/imaging/lineup/lens/f-mount/zoom/normalzoom/af-s_24-70mmf_28e_ed_vr/index.html) | Optics | Zoom/focus and a stabilization demonstration move the correct groups. Verify group clearances and full travel; identify unknown cam paths as representative. |
| 23 | Folded smartphone telephoto module: lock one Samsung Electro-Mechanics prism-lead or lens-lead variant. [Reference](https://www.samsungsem.com/global/product/module/camera-module/mobile-camera-modules.do) | Optics | Focus and a shake stimulus move the documented lens/prism elements. Verify the folded optical path and avoid combining mechanisms from different module variants. |
| 24 | RealSense D455: lock D455 hardware/module revision, not D455f or D457. [Reference](https://www.realsenseai.com/products/real-sense-depth-camera-d455f/?cst=&query-1b67a595-page=1) | Optics | Move a target and compare stereo views, disparity and depth. Verify the sensor baseline and basic disparity-depth relationship using the chosen reference. |
| 25 | Mechanical camera shutter: choose one documented shutter assembly from a specific camera. [Background](https://imaging.nikon.com/imaging/information/chronicle/history-fm3a/) | Optics | Shutter-speed control changes front/rear curtain timing and slit travel. Verify sequence, exposure interval, reset and mechanical constraints. |

### Batch 6 — Storage mechanisms and memory cells

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 26 | 3.5-inch HDD: choose exact model/capacity, PCB revision and documented specimen; lock platter/head count. [Background](https://www.seagate.com/innovation/hard-drives-and-ssds/) | Storage | Seek/read/park and spin-up controls drive spindle and actuator. Verify coherent head-stack motion, no head/platter intersection and a credible parking sequence. |
| 27 | Blu-ray optical pickup: choose an exact pickup part number and compatible sled/drive reference. [Background](https://www.sony.com/en/SonyInfo/News/Press/200409/04-050E/) | Storage | Track/focus controls move the sled/objective and trace the beam path. Verify emitter, optics, disc and return detector roles. |
| 28 | LTO tape drive plus cartridge: choose exact drive generation/model and supported cartridge. [Reference](https://www.ibm.com/docs/en/dtl/2.12.3?topic=media-lto-data-cartridge) | Storage | Load/thread/read/rewind/eject sequence drives guides and reels. Verify tape continuity, tension and coordinated spool speeds as reel radius changes. |
| 29 | Samsung 990 PRO NVMe SSD: lock capacity, PCB revision and controller/NAND package configuration. [Reference](https://news.samsung.com/global/samsung-electronics-unveils-high-performance-990-pro-ssd-optimized-for-gaming-and-creative-applications) | Storage | Read/write workloads show the controller-to-memory path. Verify connector/package placement and distinguish architectural data flow from literal PCB copper. |
| 30 | 3D NAND flash: select one Kioxia BiCS generation and package/reference structure. [Reference](https://www.kioxia.com/en-jp/rd/technology/bics-flash.html) | Chips | A magnified cell cutaway supports program/read/erase demonstrations. Verify word-line/channel relationship; do not confuse stacked package dies with layers inside each die. |

### Batch 7 — Chip packaging and logic

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 31 | NE555 timer: lock manufacturer, package and any available matching die reference. [Reference](https://www.ti.com/lit/ds/symlink/ne555.pdf) | Chips | Change an illustrative RC network and observe charge/discharge and output. Verify comparator thresholds and timing against the chosen reference circuit. |
| 32 | RP2350: lock A/B package and silicon stepping. [Reference](https://www.raspberrypi.com/products/rp2350/) | Chips | Select a supported core configuration and demonstrate PIO/I/O activity. Verify architecture labels and avoid suggesting all four cores run simultaneously. |
| 33 | Artix-7 FPGA: lock exact device/package and documentation revision. [Reference](https://docs.amd.com/r/en-US/ug474_7Series_CLB/7-Series-FPGA-CLB-Resources) | Chips | Configure a small logic example and change input bits. Verify its truth table and show architectural logic/routing without claiming an unpublished physical floorplan. |
| 34 | HBM3E stack: lock manufacturer, stack height/capacity and published package structure. [Reference](https://www.micron.com/about/blog/applications/ai/microns-hbm3e-powering-the-future-of-ai-with-high-bandwidth-memory) | Chips | Layer inspection and read/write traffic show vertical interconnects. Verify stack count, layer order and distinction between real structure and explanatory traffic. |
| 35 | Windowed UV EPROM: choose an exact ceramic windowed part, not its opaque OTP variant. [Reference](https://www.st.com/resource/en/datasheet/cd00004936.pdf) | Chips | Address/data inputs read cells; an accelerated UV sequence illustrates bulk erasure. Verify pinout, window/die placement and uniform erased state. |

### Batch 8 — Power, printing and acoustic filtering

| # | Device and reference to lock | Category | Interaction and functional check |
| --- | --- | --- | --- |
| 36 | GaN USB-C charger: use Power Integrations RDK-942 and lock its board/BOM/report revision. [Reference](https://www.power.com/design-support/design-kits/rdk-942-reference-design-kit) | Power | Select a supported output profile/load and follow conversion stages. Verify documented topology, primary/secondary separation and negotiation states. |
| 37 | Qi2 charger/receiver pair: choose a documented matched design and magnetic power profile revision. [Reference](https://www.wirelesspowerconsortium.com/knowledge-base/qi-specification/history-of-the-qi-specifications/) | Power | Drag the receiver off-axis; illustrate alignment and coupling. Verify coil orientation, magnet placement and qualitative response; do not invent measured efficiency curves. |
| 38 | Epson PrecisionCore printhead: lock a published printhead/MicroTFP generation and module configuration. [Reference](https://corporate.epson/en/technology/overview/printer-inkjet/precision-core-head.html) | Motion | Fire selected nozzles and vary an illustrative drive pulse; show actuator, chamber and droplet. Verify fluid continuity, layer order and that mechanics match piezoelectric printing. |
| 39 | Thermal receipt-printer mechanism: select an exact Seiko Instruments mechanism/model and drawing. [Background](https://www.sii-ps.com/mpa40/MPA40_UG_EN.pdf) | Motion | Feed paper and print a small pattern using a heating-element row. Verify roller direction, paper contact and synchronized feed/print sequence. |
| 40 | SAW RF filter: select an exact Murata package and published electrode/cross-section reference. [Reference](https://corporate.murata.com/en-us/technology/technology-applications/saw) | Radio | Sweep input frequency and show a representative surface wave/filter response. Verify transducer roles; disclose when electrode layout or response is schematic. |

## 4. Per-device construction and completion gate

For each device, work in this order:

1. Lock evidence and record the part inventory, material roles, motion constraints and interaction inputs/outputs.
2. Build the silhouette and major volumes. Compare assembled front/top/three-quarter views against the selected source before detailing.
3. Add real cavities, mating faces, fasteners, wires, flex cables and functional internals. Use shared coordinates for parts that meet.
4. Add restrained material detail: brushed/turned metal where documented, ceramic finish, PCB traces, optical coatings, winding structure and legible markings. No decorative traces or die patterns presented as real circuitry.
5. Establish a hierarchy for whole-device parts, subassemblies and magnified details. MEMS/cell views state their scale; the main assembly retains millimetre dimensions.
6. Design an explosion along credible disassembly axes. Test separation at 0%, 25%, 50%, 75% and 100%; all parts must reassemble exactly. Inspect projected gaps at full separation.
7. Implement the useful controls and coupled operation. Add model-specific controls inside the existing desktop/mobile controls areas, with keyboard alternatives to dragging.
8. Check component selection, labels, ghosting, isolation, anatomy, playback, material restoration and export together.
9. Render and inspect the assembled, exploded and operating model in light and dark themes, including close-ups at 3–4×. Correct defects and repeat the affected views.
10. Generate actual assembled WebP previews and gallery captures; complete the evidence/accuracy text and regression tests.

A device is complete only when its physical representation is reviewed, its advertised interaction works, and its device-specific check passes. Passing a build or seeing an animated object is insufficient.

## 5. Integrate all 66 devices without adding clutter

- Keep Boards, Displays, Optics, Sensors, Chips, Motion and Radio; add Storage, Power and Audio. Each device has one primary category.
- Preserve desktop hover menus, theme-aware previews, selected-item visibility and category-scoped previous/next navigation. Validate overflow and keyboard navigation with the expanded category set.
- Retain mobile device/component bottom sheets and inline upward-expanding Controls, leaving the 3D canvas usable. Group model-specific controls into compact sections.
- Preserve dark default, labels off by default, selected label visibility, sentence-case labels, matching selection ghosting in normal/X-ray mode and stable callouts during orbit.
- Add 80 new assembled WebP previews, making 132 light/dark previews in total. Use renders of the actual geometry rather than concept images.
- Add all 40 devices to the GitHub gallery, with consistent light/dark captures and short descriptions.
- Continue producing one fully offline HTML with geometry, fonts, textures and previews embedded once. Web loading can be lazy; the standalone build must not depend on a server, dynamic network fetches or a CDN.
- Measure the new HTML size after each batch. Preserve automatic README device-count/file-size updates; do not promise the 66-device build will retain the current 26-device file size.

## 6. Final review after implementation — required release gate

Run this after all 40 additions are implemented, as well as smaller checks during each batch. Do not mark the expansion complete until this final pass finishes.

| Review | Required evidence |
| --- | --- |
| Scope | Exactly 40 additions plus all original 26; unique IDs/routes, correct categories, complete parts and 132 theme previews. |
| Accuracy | Reopen each evidence record and compare the final render with the selected revision. Check dimensions, component counts, pinouts, material roles and every representative-cutaway disclosure. |
| Visual quality | Capture a baseline of 264 images: all 66 devices × assembled/exploded × light/dark. Inspect every image, not just a contact sheet, and capture functional close-ups for each addition. |
| Dynamic quality | Exercise each control at minimum/default/maximum and capture key operation phases. Check real pivots, no unintended collisions, no drifting wires, continuous tape paths and moving label anchors. |
| Rendering defects | Orbit slowly and zoom to the supported maximum: inspect flickering surfaces, clipping, transparency order, smooth contours, shadows, texture seams and printed-text cropping. |
| Functional behaviour | Test Play, pause/resume, reset, separation, camera presets, selection, deselection, isolation, X-ray and category navigation; verify outputs respond to inputs. |
| Regression | Run `npm run build`, `npm run check` and the new browser/operation checks against all 66. Keep existing Grobot, label, selection, material and offline regressions. |
| Browser/responsive | Test Chromium, Firefox and WebKit plus available real Chrome/Safari browsers. Cover 320/390 px phones, landscape, tablet and 1280/1600 px desktop; touch, keyboard, zoom, light/dark/system and reduced motion. Report physical-device gaps explicitly. |
| Performance | Profile the heaviest mechanical, optical and dense-silicon scenes. Cycle through all devices repeatedly and verify bounded caches, resource cleanup and no WebGL errors. Record frame times and memory trends. |
| Offline | Open the generated HTML directly with network unavailable. Visit all 66 models, operate controls, switch themes and export images. Verify no missing external asset or chunk request. |
| Documentation/assets | Check gallery links, model descriptions, source links, alt text, preview framing and the measured offline size/count. Confirm licenses and remove private paths or source metadata from public output. |
| Publication | Review the complete diff; run the secrets hook and use the existing GitHub noreply identity. Push the final commit, deploy to `breakboard-teardown.vercel.app`, and verify production catalogue, representative interactions, thumbnails and downloadable offline file against that build. |

Keep the final verification report at `docs/verification/40-device-expansion.md`, with the commit/build, browsers/hardware, pass/fail results, proof locations and specifically named limitations. Fix discovered defects and rerun affected checks plus shared regressions. A final report must distinguish verified behaviour from representative physics and from anything that could not be checked.

## Delivery sequence

1. Evidence inventory and reference locks, alongside the shared-runtime foundation.
2. Eight completed and reviewed batches; update source records, previews, gallery and measured offline statistics with each.
3. Full 66-device final review and correction pass.
4. Final source commit, production deployment and post-deployment verification.

This document tracks the full implementation plan. The progress line and batch reports identify completed work; the final performance and 66-device review remain separate completion gates.
