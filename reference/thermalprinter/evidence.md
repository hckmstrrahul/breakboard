# SII LTP02-245-01 — evidence and reconstruction record

Locked hardware: Seiko Instruments LTP02-245-01, technical reference **U00128436600, August 2012**. The current -13x product specifications are not substituted for the locked -01 mechanism. Source lock and drawing inspection preceded detailed geometry.

## Sources inspected

1. [SII technical reference, LTP02-245-01, August 2012 — distributor-hosted manufacturer PDF](https://www.e-kom.com/Documents/Products/1700/ltp02.pdf). SII authored the document; the publicly accessible copy is hosted by a distributor. SHA-256: `d27c57ab32ce25b3fca15682d2cd4e7629a01840d13d28bf154ccab58871d7ae`. Chapters 2–4 cover dimensions, printing/feed timing and terminals; Figures 7-1/7-2 are the platen and exterior drawings. Those drawing pages were rasterized and visually inspected.
2. [SII official LTP02 product/document listing](https://sii-thermalprinters.com/mechanisms-and-components-12-2023/low-voltage-thermal-printer-mechanisms/ltp02-245/). Lists the older -01 technical reference alongside current variants. The current 100 mm/s -13x headline is not used for this older model; the locked reference permits 90 mm/s. The official download requires a login; no access control was bypassed.

## Feature truth ledger

| Feature | Evidence level | Implementation |
|---|---|---|
| 67.3 W × 18.1 D × 30.0 H mm excluding protrusions | Documented nominal envelope | Width retained. The source exterior drawing separately has a 32 mm protrusion height and extended flex tail. Media is additional scene context, excluded from the product-envelope claim. |
| Ø6.8 mm rubber platen, 64.55 mm shaft span, Ø8.05 mm platen-gear outside diameter | Documented Figure 7-1 | Actual dimensions, separate rotating rubber/shaft/gear. Rubber axial width 51.5 mm is photo/drawing estimated, not dimensioned by SII. |
| 384 heat elements, .125 mm pitch, 48 mm print width | Documented | 384 individual resistors; first-to-last centers 47.875 mm. The 48 mm area includes element cells. |
| .0625 mm heater height, .03125 mm feed per motor step | Documented | Half-dot row activates on steps 1 and 3 of each four-step .125 mm line. Quantized travel, gear/platen rotation and raster share the same feed state. |
| 58 mm paper | Documented | .06 mm representative paper thickness; continuous flat/quarter-wrap/exit path contacts Ø6.8 mm platen without a gap. The source permits paper below 75 µm. |
| PM bipolar motor, 1–2 phase excitation; 8.3 Ω/phase ±10%; max 2,933 pulses/s | Documented | Motor exterior and shaft represented. Electrical step angle is not inferred from illustrative tooth counts. |
| 24 terminals; 12.5 mm flex width | Documented | 24 contact pads. Detailed flex routing and printed L02 mark are representative. Recommended interface connector is Molex 0545502471. |
| Reflective paper sensor and head thermistor; no platen-position sensor on -01 | Documented | Out-of-paper input stops feed/heating. No invented platen detector. |
| 12:34 and compound 12:21 involute gear train | Representative concealed mechanism | Working common-module, 20° pressure-angle teeth with backlash; opposite rotation and tooth-count ratios. Counts are not manufacturer claims. |
| Frame ribs, head-package outlines, pressure springs and detailed motor construction | Drawing-estimated/representative | Source envelope and external silhouette constrain placement; hidden detail not claimed exact. Actual shaft bores and bearing clearance are preserved. |

## Functional behavior

Feed-speed input is 0–90 mm/s. Display runs uniformly at 1/12 selected speed, permitting inspection of motor steps and thermal strobes. `travel = completed steps × .03125 mm`; platen angle is `−travel / 3.4 mm`, so the upper/front nip advances the paper in the shown direction. Gears use the same travel and opposing tooth-count ratios. The paper's surface follows the roller and the heater face touches the outer coating at z = 3.46 mm.

Receipt/grid/checker samples write persistent half-dot rows to a finite 64 mm teaching raster. Changing pattern never alters already printed rows. Disabling heating continues feeding blank paper; removing the paper stops both feed and heat. Orange heater highlights are explanatory, never a claim that the actual resistors visibly glow. At most 45 explanatory resistor highlights appear together, reflecting the reference's simultaneous-heating limit. No temperature, drive-energy, print-quality or literal text-controller simulation is claimed.

Pause preserves feed/printed memory/gear pose. Reset clears the raster and restores 45 mm/s, receipt, heating enabled, paper present. Reduced-motion and separation freeze feed; selected/isolate states hide explanatory heating. Reaching 64 mm ends the finite teaching sample until Reset.

## Maker verification

- `/tmp/breakboard-print/check.mjs`: 384 elements and pitch, strobes on steps 1/3, feed/angle relationship, gear ratios, persistent raster, heat-off blank feed, out-of-paper stop, zero speed, pause/reset and equal elapsed time at 30/120 Hz passed.
- `/tmp/breakboard-print/gear-check.mjs`: actual per-tooth convex hulls in the gear plane over 180 moving poses; maximum tooth intersection **0 mm** across both meshes. Checks use transformed geometry, not tooth-count metadata.
- `/tmp/breakboard-print/proof.mjs`: actual shared renderer, assembled/exploded/Play in both themes, anatomy and close view; mobile captures at 390 × 600 via `mobile-proof.mjs`; no browser errors. Moving assemblies are explicitly dynamic before batching. Motor-can radial normals are smooth with rim creases retained.
- Finite bounds and floor clearance checked at five separation values. Scene bounds include the visible paper and flex; these are not misreported as the nominal hardware envelope.
- Independent checker owns final release approval.

Performance sample: 600 shared-scene frames in Chrome/Metal on the local M5 Max, after warm-up, measured CPU render/update p95 0.6 ms normal and 0.4 ms anatomy (max 1.3/0.8 ms). This measures local CPU work, not cross-device GPU throughput.
