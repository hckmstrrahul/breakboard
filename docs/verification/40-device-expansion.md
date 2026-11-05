# Forty-device expansion — verification

Date: 5 November 2026. The current catalogue contains **65 electronics models**: 25 original devices and all forty approved additions. None of the forty additions was dropped or substituted.

Status: **complete and published**. This report combines the retained models' existing reviews with the current catalogue, regression and offline checks. Historical batch reports retain the collection size measured at their review date.

## Construction and evidence

Each addition has an individual evidence record, a selected hardware configuration, a selectable part inventory, assembled/exploded views, anatomy, causal controls and reset behaviour. Unknown internal revisions and concealed structures remain explicitly representative. Solid-state devices show explanatory signals or state changes rather than invented moving hardware.

The independent checker reopened all forty evidence records and the final public model/source/accuracy fields. The reference locks and remaining limitations are recorded in the [batch 8 closure table](expansion-batch8.md#final-40-referencedisclosure-closure). Detailed source, geometry, operation and visual checks remain in the eight batch reports:

[Batch 1](expansion-batch1.md) · [Batch 2](expansion-batch2.md) · [Batch 3](expansion-batch3.md) · [Batch 4](expansion-batch4.md) · [Batch 5](expansion-batch5.md) · [Batch 6](expansion-batch6.md) · [Batch 7](expansion-batch7.md) · [Batch 8](expansion-batch8.md).

## Visual review

The [review ledger](40-device-visual-baseline.json) contains **260 previously reviewed images**: 65 current devices × assembled/exploded × light/dark. Every retained entry preserves its original image SHA-256, reviewer and result. This is the current-catalogue subset of the completed visual review, not a claim of a new inspection. Full-resolution originals were retained; some were displayed as individual resized copies.

Two final baseline findings were corrected and re-reviewed: the planar driver's exploded shadow was clipped by the fixed shadow volume, and the assembled PIR package sat too low in its frame. The planar driver now uses fitted shadow coverage; PIR has a corrected assembled camera target. The resulting eight baseline captures passed. Fine dark ferrite/metal surfaces remain deliberately restrained; this is sampled visual inspection, not a guarantee for every possible camera angle.

The current catalogue has **130 assembled WebP previews**, two themes per device, and **130 gallery PNGs** at 2400 px width. All forty additions received operating/close-up checks during their batch reviews. The final five models' ten gallery images and ten previews were separately opened and reviewed.

## Interaction and shared runtime

- All 40 custom control panels passed at 1440, 1280, 390 and 320 px: input extremes, short copy, mono typography, at most three essential readouts, no page overflow and keyboard-operated Labels/Rotate text toggles.
- The completed component-isolation review covered every current model in assembled/exploded views and wide, phone and reduced-height phone canvases, including resize while isolated. Removing documentation references does not change model geometry or these controls.
- Qi2 supports off-center receiver dragging without an initial jump. All five receiver layers move together; keyboard sliders stay synchronized. Empty-space dragging still orbits, and tapping still selects.
- Drag cancellation passed for Escape, pointer cancellation, blur, separation, isolation, model switching, Reset and explicit camera changes. Reset during a held grab can no longer be undone by the next pointer movement. The independent checker exercised native touch events and the actual app's keyboard Reset path.
- The dotted separator above device readouts was removed. Waveform baselines remain part of their graphs.

The floor regression checks each device's declared floor, retaining strict positive clearance. GaN's lowest exploded part is −27.01 mm against its −32 mm floor. The printhead has no invented physical package artwork; its explanatory inset caption is excluded from anatomy artwork checks. Every existing physical marking still has exact anatomy/UV preservation checks.

## Regression and offline delivery

The complete 65-model `npm run check`, production build and `check:complete` gates passed. They cover inventories, geometry, labels, materials, selection, operation, model caching and all eight expansion batches. The catalogue gate verifies all forty evidence records, 130 previews, 130 gallery images and a continuous README gallery. Build output retains Vite's large-chunk warning; no build error occurred.

The standalone artifact measures **23,448,518 bytes** (23.45 MB / 22.36 MiB), SHA-256 `f05418034fda5bbcd6247e11e0cb674c02466ec07dd6bef5df1b362a0c2f9dc0`. All 65 models passed from the local HTML file with networking disabled in **Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2**. Each engine verified part inventory, input extremes, Play/Pause, selection, anatomy, Reset, both sets of 65 previews and 2400 px image export. There were no HTTP requests or page errors.

## Performance

The current 65-device gate passed **195 device visits** in three traversals, with no lost contexts or page errors and at most three cached models. Geometry, texture and compiled-program counts matched exactly between traversals two and three. Final-traversal live ranges were 94–1133 geometries, 11–192 textures and 15–29 programs. These count allocations, not GPU bytes.

Environment: Chrome 156, Apple M5 Max through ANGLE Metal, 1280 × 960, DPR 1. Each model/mode uses 12 warmup and 40 measured submission frames. Maximum p95 CPU submission was 2.6 ms in normal mode (loadcell) and 6.9 ms in anatomy (planar). Animation-frame samples use 20 warmup and 120 measured frames; observed p95 intervals ranged from 16.7 to 16.8 ms.

Current-catalogue measurements are recorded in [40-device-performance.json](40-device-performance.json). The gate runs three complete catalogue traversals, checks bounded model caching and stable GPU allocation counts after warm-up, and samples CPU submission timing in normal and anatomy modes. Separate animation-frame samples cover zoom lens, LTO, NAND, printhead and Qi2. CPU submission and headless frame intervals are not GPU completion times or physical-phone performance guarantees.

## Publication

The 65-device source release **13cff08** was pushed and deployed to [the production app](https://breakboard-teardown.vercel.app). Production checks verified 65 desktop and mobile choices, decoded all 130 theme previews, exercised category navigation and recorded no page errors. The downloaded standalone file matched the local artifact byte for byte. The documentation cleanup preserves that application output.

## Limits

These are source-informed educational reconstructions, not measured physical specimens, fabrication drawings or calibrated device simulators. Hidden layouts, waveform models, enlarged motion and accelerated sequences retain their individual disclosures. Browser touch emulation and headless desktop timings do not establish physical-phone performance, safe-area behaviour or sustained thermal performance. No physical-phone pass is claimed.
