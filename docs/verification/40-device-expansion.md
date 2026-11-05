# Forty-device expansion — final verification

Date: 5 November 2026. Scope: all forty approved additions, alongside the original twenty-six devices. The catalogue contains **66 unique models**; none of the agreed additions was dropped or substituted.

Status: **all implementation and final local verification gates passed**. Independent review of all eight batches is complete. Production publication is recorded below after deployment.

## Construction and evidence

Each addition has an individual evidence record, a selected hardware configuration, a selectable part inventory, assembled/exploded views, anatomy, causal controls and reset behaviour. Unknown internal revisions and concealed structures remain explicitly representative. Solid-state devices show explanatory signals or state changes rather than invented moving hardware.

The independent checker reopened all forty evidence records and the final public model/source/accuracy fields. The reference lock and remaining limitations for every addition are recorded in the [batch 8 closure table](expansion-batch8.md#final-40-referencedisclosure-closure). Detailed numerical, source, operation and visual checks remain in the eight batch reports:

[Batch 1](expansion-batch1.md) · [Batch 2](expansion-batch2.md) · [Batch 3](expansion-batch3.md) · [Batch 4](expansion-batch4.md) · [Batch 5](expansion-batch5.md) · [Batch 6](expansion-batch6.md) · [Batch 7](expansion-batch7.md) · [Batch 8](expansion-batch8.md).

## Final visual review

All **264 baseline images** were opened individually: 66 devices × assembled/exploded × light/dark. Three reviewers each inspected 88 images. Full-resolution originals were retained; some were displayed as individual resized copies. The [public review ledger](40-device-visual-baseline.json) records each original file's SHA-256 and reviewer. All final hashes matched the reviewed files.

Two final baseline findings were corrected and re-reviewed: the planar driver's exploded shadow was clipped by the fixed shadow volume, and the assembled PIR package sat too low in its frame. The planar driver now uses fitted shadow coverage; PIR has a corrected assembled camera target. The resulting eight baseline captures passed. Fine dark ferrite/metal surfaces remain deliberately restrained; this is sampled visual inspection, not a guarantee for every possible camera angle.

The catalogue has **132 assembled WebP previews**, two themes per device, and **132 gallery PNGs** at 2400 px width. All forty additions received operating/close-up checks during their batch reviews. The final five models' ten gallery images and ten previews were separately opened and reviewed.

## Interaction and shared runtime

- All 40 custom control panels passed at 1440, 1280, 390 and 320 px: input extremes, short copy, mono typography, at most three essential readouts, no page overflow and keyboard-operated Labels/Rotate text toggles.
- Component isolation passed **4,752 part/pose/viewport checks** across all 66 devices, plus **264 resize checks**. This covers assembled/exploded views and wide, phone and reduced-height phone canvases.
- Qi2 supports off-center receiver dragging without an initial jump. All five receiver layers move together; keyboard sliders stay synchronized. Empty-space dragging still orbits, and tapping still selects.
- Drag cancellation passed for Escape, pointer cancellation, blur, separation, isolation, model switching, Reset and explicit camera changes. Reset during a held grab can no longer be undone by the next pointer movement. The independent checker exercised native touch events and the actual app's keyboard Reset path.
- The dotted separator above device readouts was removed. Waveform baselines remain part of their graphs.

The floor regression now checks each device's declared floor, retaining strict positive clearance. GaN's lowest exploded part is −27.01 mm against its −32 mm floor. The printhead explicitly has no invented physical package artwork; its explanatory inset caption is excluded from anatomy artwork checks. Every existing physical marking still has exact anatomy/UV preservation checks.

## Final regression, offline and performance

`npm run check` and `npm run build` passed on the final 66-model source. The complete suite includes the original boards, Grobot, labels, material/selection behaviour, model cache and all eight independent expansion batch checks. `check:controls`, `check:focus`, `check:drag` and `check:complete` passed with the counts above. Build output retains Vite's large-chunk warning; no build error occurred.

The standalone artifact measures **25,080,749 bytes** (25.08 MB / 23.92 MiB), SHA-256 `60c4762563069b65fba7712084f29edb0cd98ee141db2384806ade1004cd7f59`. All 66 models passed from the local HTML file with networking disabled in **Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2**. Each engine verified part inventory, input extremes, Play/Pause, selection, anatomy, Reset, both sets of 66 previews and 2400 px image export. There were no HTTP requests or page errors. Logs are retained locally as `/tmp/breakboard-final-offline-{chrome,firefox,webkit}.log`.

### GPU reuse and measured timing

`npm run check:gpu` passed three complete traversals: **198 device visits**, normal and anatomy modes, with no page/WebGL errors or lost contexts. The model cache never exceeded three entries. On identical visits, geometry, texture and compiled-program counts were exactly equal between traversals two and three. Final-traversal live counts varied by retained devices: 94–1,133 geometries, 11–192 textures and 15–29 programs. These are renderer allocation counts, not measured GPU bytes.

Environment: installed Chrome 156, Apple M5 Max through ANGLE Metal, 1280 × 960, DPR 1. No other checker/render browser was running during this profile. Each device/mode had 12 warmup and 40 measured submission frames. The highest final-traversal CPU submission p95 was 3.2 ms in normal mode (load cell) and 8.0 ms in anatomy (planar driver). CPU submission time is not GPU completion time.

A separate requestAnimationFrame run used 20 warmup and 120 measured frames with Play and orbit enabled. Grobot, zoom lens, LTO, NAND, printhead and Qi2 were sampled in both modes. Median intervals were 16.7 ms; p95 ranged from 16.7 to 16.8 ms, with 16.8 ms maximum in these samples. These are observed headless desktop animation-frame intervals, not a physical-display or phone FPS guarantee. [Raw measurements](40-device-performance.json) retain all visits and timing summaries.

## Publication

Publication and downloadable artifact verification are recorded after the source release is deployed.

## Limits

These are source-informed educational reconstructions, not measured physical specimens, fabrication drawings or calibrated device simulators. Hidden layouts, waveform models, enlarged motion and accelerated sequences retain their individual disclosures. Browser touch emulation and headless desktop timings do not establish physical-phone performance, safe-area behaviour or sustained thermal performance. No physical-phone pass is claimed.
