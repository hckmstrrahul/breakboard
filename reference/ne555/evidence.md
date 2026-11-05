# TI NE555D — evidence record

## Locked configuration

Texas Instruments **NE555D**, **D0008A SOIC-8**. Electrical reference: **SLFS022K, March 2026**. Mechanical drawing: **4214825/C, February 2019**. Die specimen: the genuine Texas Instruments chip purchased from an official distributor and photographed by Mikhail Svarichevsky / ZeptoBars on **3 July 2017**; visible die legends **NE5550 / TI06**. Those legends do not establish a publicly documented silicon stepping, and the model does not invent one.

Sources:

- [TI NE555 datasheet](https://www.ti.com/lit/ds/symlink/ne555.pdf), particularly the astable application and D0008A outline.
- [ZeptoBars first-hand genuine-versus-counterfeit comparison](https://zeptobars.com/en/read/Ti-555-NE555-real-vs-face-china-chinese). Only the genuine TI image is used; the counterfeit examples are excluded.
- [Original genuine die micrograph](https://s.zeptobars.com/Ti-NE555-genuine.jpg).
- [ZeptoBars image reuse terms](https://zeptobars.com/en/about-us): die photographs are **Creative Commons Attribution 3.0 Unported**. Attribution is retained in the asset, public inspector, source links, and this record.

The micrograph is reproduced as an embedded RGBA DataTexture in `src/assets/ne555-die-pixels.js`. Its dark camera margin was cropped and the image resampled to 512 × 378. No circuitry was added or moved. The embedded bytes make image loading deterministic and keep the offline build self-contained.

## Feature classification

| Feature | Evidence | Implementation |
| --- | --- | --- |
| SOIC body and eight terminals | Documented D0008A | 4.90 × 3.90 mm nominal body; 6.00 mm total lead span; 1.27 mm lead pitch; 0.41 mm lead width and 0.19 mm lead thickness and 0.18 mm body standoff above the seating plane. The modeled top is within 1.75 mm maximum package height. |
| External pin functions | Documented TI pinout | GND, TRIG, OUT, RESET, CONT, THRES, DISCH, VCC. The schematic’s discharge junction is pin 7 and the capacitor junction is pins 2/6. |
| Die outline and surface | Observed and measured in the matching genuine TI photograph | 1.034 × 0.762 mm source-measured die, with its actual surface image at that scale. Thickness is representative. |
| Bond sites | Observed photograph | Eight sites placed using photo coordinates. |
| Wire routing, metal, paddle and attachment | Representative | The decapped image does not recover package routing, wire alloy or paddle construction. All remain explicitly identified as a reconstruction. |
| Mold section and internal cavity | Representative cutaway | Mold is sectioned for explanation; it does not suggest a removable factory lid. |
| Physical functional-region map | Unverified; omitted | The image is not relabeled with positions inferred from unrelated 555 dies. No transistor-scale physical layout is invented. |
| External timing circuit | Documented circuit, representative graphic | Separate explanatory overlay; not part of the chip inventory and not a measured PCB. |
| Timing and thresholds | Documented ideal equations | ⅓ and ⅔ VCC; capacitor charges through RA + RB and discharges through RB. |

## Behavior and limits

`RA` and `RB` are in kΩ; `C` is in µF. The ideal steady-state equations are:

- `tHigh = ln(2) × (RA + RB) × C × 0.001` seconds.
- `tLow = ln(2) × RB × C × 0.001` seconds.
- `f = 1 / [ln(2) × (RA + 2 RB) × C × 0.001]` hertz.
- `D = (RA + RB) / (RA + 2 RB)`.
- Charge: `VC = VCC × [1 − (2/3) exp(−t / ((RA + RB) C))]`.
- Discharge: `VC = (2/3) VCC exp(−t / (RB C))`.

The model begins at the lower threshold in steady state, omitting the initial power-up charge from zero. One physical cycle is displayed in three seconds so all supported RC settings remain inspectable; its actual calculated period is separately reported. Supply offsets, leakage, component tolerances, output-stage drop and loading are not simulated. “High” denotes the ideal logical state, not a claim of rail-to-rail NE555 output. The phase input gives paused inspection. Pause, reduced motion and separation stop automatic progression; reset restores default controls and phase. The external schematic and moving charge marker are marked `explanatoryEffect` and excluded from selection/anatomy inventory.

## Reproducibility and checks

- `node --check src/ne555.js`
- `/tmp/logic-check.mjs`: finite geometry; control extremes; pause, reset, reduced-motion and separation stability; independent equation checks at known resistor values and threshold boundaries.
- `/tmp/logic-proof.mjs`: actual Three.js scene, assembled/exploded/Play in light and dark; narrow viewport at 390 × 580.
- Runtime: `buildNE555`, `NE555_BOARD`, standard `behavior` and `getWaveform` contracts.

Source snapshots were downloaded to `/tmp/breakboard-logic-reference` for this work. SHA-256:

- `ne555.pdf`: `a3756e59fd06d0ba736edf9ffe71d99d2aae33fb7e49fedc86165a241179f4a6`.
- `ne555-die.jpg`: `b9f7c9292acab3f86213a2ea370a824175848f0636dd9ffe29f772ec395f6a0f`.
- `zepto-about.html`: `c3d9f51fd35cf716e134b877fed810eaf78e1255af7c319e4d622c45220cbe4f`.

Intended use: an educational interactive teardown, not a bond diagram or manufacturing model.

### Render verification

Inspected normal and anatomy close-ups in both themes: the same micrograph stays legible under `texture.userData.anatomyLuminance`, using source luminance for ink coverage without modifying the source pixels. Linear filtering with mipmaps suppresses minification sparkle. Inspected all eighteen overview states and narrow Play framing after widening its minimum frame. The external RC graphic fits entirely at 390 px width. Public licensing notice is also included at `public/licenses/ne555-zeptobars.txt` for the portable build.
