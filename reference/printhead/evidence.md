# Epson I3200(4)-A1 — evidence and reconstruction record

Locked configuration: aqueous Epson I3200(4)-A1, March 2022 catalogue. This is not the I1600, I3200(8)-A1HD, eco-solvent E1 or UV U1. Source lock and drawing inspection preceded detailed geometry.

## Sources inspected

1. [Epson, I3200(4)/I1600 catalogue, March 2022](https://inkjet-solution.epson.com/knowledge/documents/pdf/20220428_PrintheadI3200_4_I1600_EN.pdf). Page 2 has the model table, full exterior views and nozzle-position drawing. PDF SHA-256: `c56ab1d063f21a9749a19a8ae70c36a4675ebb8f5939a3f2fd8057f0d86d1cbd`. The full page was rasterized and visually inspected, not inferred solely from extracted text.
2. [Epson, PrecisionCore MicroTFP head](https://corporate.epson/en/technology/overview/printer-inkjet/precision-core-head.html). Documents the actuator, ink-channel and nozzle-plate silicon stack and COF assembly; gives general technology descriptions including approximately 1 µm piezo film and 20 µm nozzle bores. These are not released I3200 chamber drawings.
3. [Epson, thin-film Micro Piezo](https://corporate.epson/en/technology/overview/printer-inkjet/thin-film-micro-piezo.html). Explains mechanically changing chamber volume using thin-film piezo actuation. This model does not depict thermal bubble-jet operation.

## Feature truth ledger

| Feature | Evidence level | Implementation |
|---|---|---|
| 69.1 × 59.5 × 35.6 mm exterior envelope | Documented, model-specific | Actual hardware groups retain this envelope; separate teaching inset excluded. |
| 3,200 nozzles, eight rows, 400 per row | Documented, model-specific | All 3,200 apertures are pierced geometry, with instanced unit cells rather than painted dots. |
| 1/300 inch nozzle pitch, 1.016 mm paired-row spacing, 8.128 mm pair-center spacing | Documented drawing | Each row has 33.782 mm first-to-last centers. The documented 600 npi combined pair requires a half-pitch longitudinal stagger; its positive/negative polarity is representative. The paired union spans 33.824 mm, consistent with the stated 33.8 mm rounded effective width. |
| Four ink colors; no recirculation and no internal heater | Documented, model-specific | Four separate inlet/supply groups; no heater or fabricated recirculation pump. Cyan/magenta/yellow/black assignments are illustrative. |
| 20 µm nozzle bore; approximately 1 µm piezo film | General Epson technology, not part-specific dimensions | Used for the representative microcell. The inspector explicitly distinguishes this from a verified I3200 bore or chamber specification. |
| Guard, ribs, inlet collars, mounting holes, COF form | Drawing/photo estimated | Nominal dimensions fixed; fine molding, screw sizes and component counts are reconstructed. Mount/ink/nozzle openings are genuine holes. |
| Chamber, restrictor, filter mesh, manifold routing, driver layout | Representative hidden geometry | Separate supplies feed open side restrictors; chamber roof is above the pierced plate; reservoir-floor outlets are real holes. No undisclosed mask or exact die map is claimed. |
| Piezo displacement, waveform, emission timing and visible droplet | Representative explanatory behavior | Fixed membrane boundary, shared substrate/film displacement field, enlarged drops; relative drive is neither volts nor calibrated picoliters. |

## Interaction and scale

One selected row/nozzle is active. Changing the selector restores the prior static cell and replaces the new cell's roof/film with deforming meshes at its real coordinates. The selected cell retains its full 8 µm representative roof thickness and 1 µm film thickness, including side faces, and is clamped at its boundary. Both film and substrate use the same displacement field, so the film follows the substrate.

During assembled Play, a separately labeled **Enlarged · representative** MicroTFP chamber illustrates expansion/refill, compression/ejection and recovery. It has a real inlet bore, open cutaway wall and outlet aperture. It is an explanatory effect, not additional hardware: excluded from inventory, picking and anatomy. It is hidden when paused, reduced-motion, exploded, selected or isolated. Physical selected-membrane motion is exaggerated; enlarged droplets and cycle speed are explicitly non-calibrated. Pulse zero produces no motion or emitted droplets. Pause holds phase; Reset restores row 1/nozzle 201, relative drive 0.8 and cycle 1 Hz. Reduced-motion or explosion parks the membrane while preserving phase.

## Maker verification

- `/tmp/breakboard-print/check.mjs`: exact physical envelope, actual aperture raycasts at both row ends and middle, pitch/positions, all four paired arrays at uniform 600 npi (800 distinct longitudinal positions each), 3,200 count, fixed boundary, common film/roof warp, selector coordinates, zero-drive behavior, pause/reset, and equal elapsed time at 30/120 Hz passed.
- `/tmp/breakboard-print/proof.mjs`: actual shared scene in Chrome/Metal; assembled/exploded/Play in both themes, anatomy and close view. `/tmp/breakboard-print/mobile-proof.mjs`: 390 × 600 assembled/exploded/Play captures. No browser errors.
- Physical bounds are 69.1 × 35.6 × 59.5 mm in scene X/Y/Z; the visible teaching inset intentionally increases total scene bounds.
- Finite bounds/floor clearance checked through separation 0, .25, .5, .75 and 1. Final exploded placement exposes the actuator/channel/nozzle layers beside the holder.
- Independent checker owns final release approval; maker results are not a substitute for that review.

Performance sample: 600 shared-scene frames in Chrome/Metal on the local M5 Max, after warm-up, measured CPU render/update p95 0.4 ms normal and 2.1 ms anatomy (max 0.9/2.3 ms) after the full-thickness selected-roof correction. This is a local CPU sample, not a cross-device GPU/FPS guarantee. Deforming fluid in the enlarged diagram follows the same roof field with a small rendering clearance; no persistent air gap is used to transmit pressure.
