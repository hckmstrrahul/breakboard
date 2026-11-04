# Sony IMX500 bare-chip reconstruction

## Configuration and source lock

- **Sony IMX500 bare chip**, public configuration announced **14 May 2020**. This is not the ceramic-packaged IMX501. No public silicon stepping or full IMX500 mechanical die drawing was found; the release date and specification snapshot define this reconstruction.
- [Sony original announcement](https://www.sony.com/en/SonyInfo/News/Press/202005/20-037E/) distinguishes bare IMX500 from packaged IMX501 and documents the upper pixel / lower logic arrangement, Bayer pixels, ISP, Sony DSP and memory.
- [Sony AITRIOS IMX500 specification](https://www.aitrios.sony-semicon.com/edge-ai-devices/imx500), retrieved 5 November 2026. Local HTML SHA-256: `dfa95ccec05bc308f4d277f5ad356ade61664fb8a4b51bed39f27c420435451a`.
- [Sony AITRIOS bare-chip photograph](https://www.aitrios.sony-semicon.com/hubfs/aitrious/edge-ai-devices/imx500/IMX500_miniChip.jpg.jpg). Local SHA-256: `d5816289d0308020ac124dfd0d636993ac33f0baf31122f9c0f9e8e2689fc88b`. The photo provides silhouette and surface appearance, not mechanical tolerances. Foreshortening limits dimension estimates.

## Evidence classification

| Feature | Basis | Model treatment |
|---|---|---|
| Effective array | Documented 4056 × 3040; pitch 1.55 µm | Exact active area derived as 6.2868 × 4.712 mm |
| Two stacked silicon chips | Documented pixel chip above logic chip | Preserved; functional regions are slices of the single lower chip |
| Bare-chip product | Documented | No invented LGA package or board |
| Die border and outline | Broad photo estimate | Approximately 9 × 7 mm, explicitly not a released drawing |
| Stack / film thickness | Representative | Approximately 0.8 mm displayed stack; microscopic layers enlarged |
| ISP / DSP / memory / interfaces | Documented functional blocks | Representative placements and circuit patterns, no transistor floorplan claim |
| Memory | Documented 8,388,480 usable bytes | Shown in inspector; visible bank count is not physical bank count |
| Bayer filters | Documented | Enlarged 32 × 24 sampling illustration, two green / one red / one blue; phase representative |
| Microlenses / photodiode grid / bonding sheet | Representative microscopic anatomy | Visible tessellation, interconnection count, lens shape and film details are explanatory |
| Output choices | Documented image / ROI / metadata capability | Demo selects metadata or image plus metadata |

The outer die dimensions must never be reported as a verified package drawing. Public model dimensions deliberately report the exact active array instead.

## Interaction contract

Controls select zero to three sample objects, scene position, relative illumination and output mode. Play shows a four-second acquisition → ISP → DSP → memory → output illustration. The synthetic object detections are scripted; **no neural network is executed**, and no inference confidence, detection accuracy or calibrated photometry is claimed. Zero relative illumination suppresses the scripted detections. The displayed input tensor is an illustrative 320 × 320, within the documented supported input dimensions.

Pause freezes the pipeline phase. Reduced motion suppresses traveling/scan effects. Explicit controls update static inspection while paused. Separation, selection and isolation hide explanatory scene effects. Reset restores all input values and phase. `userData.explanatoryEffect` excludes those effects from anatomy and picking.

## Validation

Finite-geometry, all-control-extrema, pause, reset and separation/selection/isolation gates passed. Final dark/light/mobile assembled, exploded and Play renders were generated and inspected without browser errors. Logic-region slices fan forward at full separation so all remain visible. Independent checker review pending. Optical textures are procedural, with no bundled source photographs.

Rebuild: import the exported `IMX500_BOARD` from `src/imx500.js` and call `build()`. Standard app controls provide assembled, exploded, Play and X-ray views. Maker proof command: `node /tmp/imaging-proof.mjs` against the local Vite server; proof images are `/tmp/imaging-final-imx500-{dark,light,mobile}-{assembled,exploded,play}.png`. These temporary paths are review artifacts, not shipped assets.
