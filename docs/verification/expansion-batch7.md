# Expansion batch 7 verification

Scope: TI NE555D, Raspberry Pi RP2350B A4, Artix-7 FPGA, Micron HBM3E and ST windowed EPROM. The collection now has **61 devices**, including **35 of the planned 40 additions**. Five additions and the final 66-device review remain pending.

**Independent checker gate: PASS.** Source, geometry, numerical behavior, desktop/mobile controls, rendered detail, performance and corrected isolation framing pass. This is an educational reconstruction review, not hardware qualification.

## Source audit

| Model | Independently verified basis | Explicit limits |
|---|---|---|
| NE555D | TI SLFS022K, March 2026, and D0008A drawing 4214825/C, February 2019. Genuine TI specimen in ZeptoBars’ July 3, 2017 firsthand article; the original micrograph was opened and compared with the rendered die. Its measured outline is 1.034 × 0.762 mm. The author’s site HTML explicitly grants CC BY 3.0; attribution and source link are retained. [Evidence](../../reference/ne555/evidence.md) | TI06 / NE5550 legends do not establish a public stepping. Die thickness, paddle, wire routes and mold cut are representative. The actual die image is not relabeled with guessed transistor functions. The external ideal RC graphic is separate from physical chip geometry. |
| RP2350B0A4 | Manufacturer datasheet Release 8, build 2026-10-01, and July 29, 2025 A4 announcement. QFN-80 drawing and top-view pin map independently inspected. Architecture selection, mixed Arm/RISC-V combinations, ten SRAM banks, three PIO blocks and GPIOBASE behavior checked in the original PDF. [Evidence](../../reference/rp2350/evidence.md) | All die dimensions, macro positions, bonds and floorplan detail are representative. No A2 image is presented as an A4 die. Two sockets select at most two active processors; changing architecture represents reset in the unsecured configuration. RP2354 in-package flash is not attributed to RP2350B. |
| XC7A35T-1CSG324C | AMD UG475 v1.20, Figure 4-9, independently opened: the Artix-specific wire-bond package is 15 mm square, nominally 1.36 mm seated, with 324 balls at 0.8 mm pitch. DS180 v2.6.1 and UG474 v1.9 support device resources and LUT architecture. [Evidence](../../reference/fpga/evidence.md) | Earlier generic package heights are not substituted. Die size, metallization, routing and 80-wire subset are representative. No package ball assignment or exact transistor floorplan is claimed. |
| MT65B12G16080A00QG-92:A | Micron’s public product API was independently fetched from the exact page’s declared endpoint. It returns 10.98 × 10.98 × 0.78 mm and `192Mb ×1088`. Manufacturer HBM3E articles support eight 24 Gb core dies, a base die, 24 GB and the 1,024-bit family interface. [Evidence](../../reference/hbm/evidence.md) | Die dimensions/thickness, 48 TSV samples per core, 400 external bumps, bank pattern and molding are representative. The catalogue configuration is not treated as a bump map; its 1500 MHz field is not converted into an unsupported exact-part bandwidth claim. |
| M27W256-80F6 | ST April 2006 Rev 3, FDIP28W windowed configuration. Mechanical figure 10 independently opened: 28 pins, 2.54 mm pitch, 33.02 mm row span and nominal 7.11 mm window. Read/program/erase roles checked against the source. Historical US3660819A is used only for isolated charge-storage and optical discharge. [Evidence](../../reference/eprom/evidence.md) | Cavity, die, eight depicted regions, routing, wires and finishes are representative. No matching ST die photograph is claimed. The historical patent’s PMOS process is not attributed to this CMOS part. Window material is unspecified rather than assumed to be quartz. |

Source URLs, revisions and hashes are retained in the evidence files. Independently fetched Micron API output is also saved with the checker proof.

## Reproducible numerical gate

`node scripts/check-expansion-batch7.mjs` passes all five. The script uses actual meshes, recovered disconnected solids, instance matrices, ray intersections and state transitions; source metadata alone is insufficient to pass.

| Model | Component groups | Moving mesh descendants | Source triangles |
|---|---:|---:|---:|
| NE555 | 6 | 23 | 12,964 |
| RP2350 | 10 | 2 | 103,128 |
| FPGA | 7 | 12 | 72,276 |
| HBM | 11 | 8 | 66,534 |
| EPROM | 8 | 17 | 66,920 |

Moving descendants are explanatory overlays. Physical package and silicon geometry is explicitly checked to remain stationary during operation. Triangle counts do not multiply instancing or render passes.

- **NE555:** Actual eight separate lead solids, body, seating clearance, lead span and measured die scale. Ideal frequency, duty, period and exponential capacitor voltage are independently calculated over resistor, capacitor and supply extremes. Threshold crossing changes output/discharge state. The waveform stays between one-third and two-thirds supply and freezes/resets correctly. The photograph remains a multitone source image with an explicit license notice.
- **RP2350:** Eighty physical lands and the 3.4 mm exposed pad; eight large and two small SRAM macros; twelve state-machine regions. All 48 GPIO choices are compared against an independent transcription of manufacturer Figure 3, including the actual highlighted contact position and GPIOBASE 16 above GPIO31. Divider/delay frequency arithmetic, both SET states, all four architecture combinations and reset semantics pass. Exactly two processor alternatives are selected.
- **FPGA:** All 324 actual instance centers form eighteen rows and columns; pitch, ball dimensions and package bounds match the drawing. Bond endpoints meet physical pads. All 24 program/input combinations pass independently calculated parity, majority and multiplexer functions; the truth-table string and automatic sequence agree. Selection/isolation suppress explanatory routes.
- **HBM:** Eight source die volumes and their gaps, 384 open silicon holes, copper/bump alignment and continuity across the stack, plus the explicitly representative contact field. Delayed writes affect only the selected byte at first/middle/last layer/address samples. Reads do not write; controls while paused do not commit. Five transfers in six display seconds agree at 30/60/120 Hz. Reset restores all 128 teaching bytes. Read and Write start at opposite path ends, with the selected endpoint at the actual chosen layer height.
- **EPROM:** Actual formed leads, lead pitch, body bounds and unobstructed ceramic window. Pin functions match the source. Programming at addresses 0, 12345 and 32767 leaves neighbors unchanged. A forbidden 0→1 request is reported while legal 1→0 changes remain possible. Erase does not commit early, then restores all 32,768 bytes to FF. Paused/reduced motion cannot execute hidden writes.

Shared checks cover finite positions/indices, meaningful control extremes, separation/floor clearance, reset/pause/reduced motion, frame-cadence agreement, selection/material restoration and physical anatomy completeness. Explanatory meshes cannot intercept selection. Instanced anatomy retains every instance and contour; synthetic instance/count/deformation/disposal regressions pass. The luminance opt-in preserves the NE555 image geometry/map/alpha while using a separate shader cache key. Existing default artwork behavior remains covered.

## Actual application and rendered proof

Frozen source: `/tmp/breakboard-proof/batch7/frozen-app`, served on port 4299. Proof: `/tmp/breakboard-proof/batch7/checker-final/`. `source-sha256.json` records matching tested/live source hashes, including the final camera correction.

The actual application passed all five at 1440 × 1100 and 390 × 844, without page errors. Inputs produce the expected frequency, GPIO destination, truth result and stored bytes. Two waveforms advance under Play, freeze under Pause and respond to manual phase/instruction changes. Reset restores all controls. Labels/Rotate pressed states, component selection, anatomy, source notes and reduced motion pass. Mobile Controls stays inline, leaves usable canvas space and has no horizontal overflow; all 61 picker thumbnails are present. Readout count stays at three or fewer. The eight-control RP2350 panel scrolls within the container.

Rendered review opened assembled/exploded and operating detail in both themes, the genuine die image, representative HBM via field and complete FPGA contacts. The NE555 photo remains legible in both material and anatomy rendering and matches its source orientation/features. No new model geometry or causal-behavior defect was found. Not every generated orbit capture was manually opened.

**Framing defects found and resolved:** isolated HBM core7 and FPGA balls were clipped because focus used the exploded model scale with the assembled camera projection. Fitting projected current bounds corrected this. The wider regression then found LTO tape using a stale cached bounding box after deformation, and the LTO enclosure crossing the near plane because the fixed camera distance was too short. The final implementation measures current vertices, fits the active frustum, sets adequate depth clearance and refits an isolated part when its viewport changes.

The committed independent browser gate is `npm run check:focus` (`scripts/check-focus-browser.mjs`). It starts its own Vite server and verifies all **61 models, 4,374 part/pose/viewport combinations and 244 isolated resize transitions**. Every part is checked in assembled and exploded poses at 1440 × 900, 390 × 580 and 390 × 180. Assertions project all eight corners of current physical bounds through the settled camera and check horizontal, vertical and depth clipping planes. The resize harness first renders the selected pose before resizing, avoiding an artificial stale-state race. Final `focus-bounds.json` has zero failures. Refreshed isolated HBM and FPGA detail images were opened and fully fit with margins.

## Performance

Isolated Chrome / Apple M5 Max / ANGLE Metal, 1000 × 900, DPR 1. Each mode receives twenty warmup frames and one hundred measured frames. These are update/render CPU submission measurements, not guaranteed GPU completion, physical-phone FPS or hardware timing.

| Model | Normal p95 | Anatomy p95 | Maximum across both |
|---|---:|---:|---:|
| NE555 | 0.9 ms | 0.6 ms | 1.1 ms |
| RP2350 | 0.8 ms | 0.6 ms | 0.9 ms |
| FPGA | 0.5 ms | 0.5 ms | 0.6 ms |
| HBM | 0.7 ms | 1.1 ms | 1.1 ms |
| EPROM | 0.6 ms | 0.6 ms | 0.9 ms |

Raw data: `frame-profile.json`. No other checker or parent browser capture was running during this profile.

## Limits and integration

No physical chip was measured, programmed or electrically exercised. Ideal timer equations omit leakage, tolerances and loading. PIO output is an instructional loop, not measured throughput. FPGA activity is logical, not transistor timing. HBM uses 128 teaching bytes rather than physical addressing. EPROM omits programming verification retries, retention and calibrated UV exposure; its two-second sequence does not represent actual erase time. Concealed geometry remains classified as representative.

Final shared regression, all-browser offline packaging and production publication are separate parent integration gates. The independent script and report are frozen after the successful framing recheck; integration results can be appended by the parent.


Parent integration passed `npm run build` and the complete `npm run check` suite. The compact-control browser audit covered all 35 current custom panels at 1440, 1280, 390 and 320 px, including extreme values, short mono copy, three-readout limits and keyboard text toggles. All ten batch gallery PNGs and ten theme previews were opened and reviewed. Root also opened the corrected HBM and FPGA isolation captures.

The standalone artifact contains **61 devices**, measures **24,947,069 bytes**, and has SHA-256 `0ef1e4074e19fbfe96e87d4d0017bbda5356b2133415983f09b46466de9e92cd`. All 61 models passed network-blocked local-file checks in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2: inventory, input extremes, Play/Pause, anatomy, selection, reset, both preview themes and 2400 px image export. Logs: `/tmp/breakboard-batch7-{check,controls,offline-chrome,offline-firefox,offline-webkit}.log`. The package remains an educational simulation, and physical-phone testing is still pending.
