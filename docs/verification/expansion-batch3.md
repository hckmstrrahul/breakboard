# Expansion batch 3 verification

Scope: five additions — ICM-42688-P, VL53L8CX, IWR6843ISK, PaPIRs and SRF04. This brings the collection to **41 devices**, including 15 of the planned 40 additions. The remaining 25 additions and the final 66-device review remain pending.

Independent checker result: **passed**, 2026-11-05. The independent checker reviewed primary drawings and rendered the actual Three.js application. Package fidelity and illustrative operation were checked separately. This is not validation against physical sensor measurements or a recovered proprietary die layout.

## Reference audit

| Device | Locked reference and independently checked details | Explicit limits |
|---|---|---|
| ICM-42688-P | TDK DS-000347 v1.9, 2024-11-12, pp53–56: 3 × 2.5 × 0.91 mm LGA, fourteen 0.25 × 0.475 mm contacts at 0.5 mm pitch, orientation and marking. [Evidence](../../reference/imu/evidence.md) | Six-cell MEMS arrangement, cavity, combs, flexures and circuit regions are representative; motion is enlarged and drive slowed to 2 Hz. |
| VL53L8CXV9GC/1 | ST DS14161 Rev12, 22 July 2025, DM00891572 rev2.0: 6.4 × 3.03 × 1.75 mm, 6.2 × 2.83 mm substrate, sixteen peripheral contacts plus B4 thermal pad, left Ø0.510 mm receiver, right 0.740 × 0.965 mm transmitter window, 4 mm optical-center spacing, zone orientation. Official outline and zone figures inspected. [Evidence](../../reference/tof/evidence.md) | Hidden dies, nanostructure, wire counts and separated coating are representative. Reporting zones are not individual SPADs. The 64 depths are perpendicular scene distances; `2d/c` is explicitly an axial-equivalent time, not off-axis photon flight time. |
| IWR6843ISK | TI PROC073D / 001_IWR, SWRR164D and SWRC355D: Rev D assembly/BOM, placement and outline; 350 PCB placements, LP87524J, six-position S1, J1/J6 plus J3, J2 DNP, three TX/four RX arrays with three patches each. [Evidence](../../reference/radar/evidence.md) | Fine feed routing, vias and package surfaces are reconstructed. The separate H1–H16 mounting kit is omitted. No proprietary silicon floorplan or RF performance claim. |
| EKMB1101111 | Panasonic white standard lens, reference specification Rev7.1: Ø11 × 14.4 mm body, three Ø0.45 mm leads on Ø5.08 mm circle, 4.6 mm exposed leads, 64 zones and 94° × 82° field. Four-element architecture separately sourced. [Evidence](../../reference/pir/evidence.md) | Lens groove prescription and concealed sensor construction are representative; 64 zones do not imply 64 lens facets. Warm-target scenario starts after stabilization. |
| Devantech SRF04 | Published updated `srf1.pdf`: PIC12C508, ST232CD, LMC6032 and LP311, May 2003 timing-input configuration. Pro-Wave 400ST160/400SR160 drawing: Ø16.2 × 12.25 mm cans, Ø13.15 mm mouths, Ø1 mm leads on 10 mm pitch. [Evidence](../../reference/ultrasonic/evidence.md) | No unpublished PCB revision claimed. Board placement is photo-estimated. Hidden piezo/cone sizes and travel are representative; acoustic time is slowed 300× and carrier display may alias. |

## Numerical and runtime checks

Run `node scripts/check-expansion-batch3.mjs`. It checks actual geometry, rather than accepting reference metadata as proof:

- Finite vertices/indices, complete part inventory, floor clearance at five separation values, control endpoints, meaningful input response, deterministic reset, pause, reduced motion and assembly gating. Geometry is compared at the same elapsed time with 30 Hz and 120 Hz updates.
- Every selected part retains its material while context ghosts; isolation and exact material restoration pass. Anatomy retains every physical surface, follows deforming geometry and restores contours. Explanatory overlays are excluded from anatomy and ray picking and disappear during hardware selection.
- IMU gravity projections, signed acceleration, camera independence, opposed gyro masses and all three perpendicular Coriolis sense axes. ToF physical ports/pads, all four native corner mappings, 64-value target clipping, 20 mm clamp, axial light-time arithmetic and outgoing/return sequence.
- Radar mounting apertures, 21 patches, Rev D fitted/DNP population, BGA seating, signed azimuth, `2R/c`, beat frequency and TX sequence. PIR stationary/no-contrast/out-of-field rejection, motion triggering, hold/mask timing and incoming radiation direction.
- SRF04 nine lead/header through-holes, TX/RX role separation, delayed receiving motion, attached cone, reduced/separated parking and bistatic time across distance/temperature extremes.

An independent parse of the original Rev D XLS BOM matched all 350 modeled PCB designators. Its other sixteen nonzero entries are the separate four washers, four nuts, four standoffs and four screws; these are explicitly outside this bare-board view.

Final source geometry counts are 38,408 / 68,702 / 71,300 / 40,410 / 50,874 triangles respectively; these exclude viewer ground/shadows and do not represent one-frame draw totals.

## Browser and visual checks

Actual Chrome app verification used 1440 × 1100 desktop and 390 × 844 mobile viewports. All five input panels, readouts, Play/Pause, reset, component selection, X-ray and 41-item thumbnail picker passed without browser exceptions. Mobile controls remain inline, preserve a usable 3D area and scroll to the last readout without horizontal page overflow. The radar waveform freezes under Pause and reduced motion.

ToF checks cover 64 SVG cells, eight row/eight column table headers, distinct computed foreground/background colors, near/far legend, corner clipping and accessible range summary. A separate rendered helper fixture checks null returns, invalid dimensions/data, all-null summary and reset. This caught undefined color tokens; the implementation now uses the app's actual theme tokens. The accessible table wrapper also avoids mobile intrinsic-width overflow.

Both themes, assembled/exploded states, Play, orbit close-ups and X-ray close-ups were rendered. Proofs and browser fixtures are in `/tmp/breakboard-proof/batch3/checker-final/`; actual-app captures use the `app-` prefix. These are local review artifacts rather than redistributed manufacturer imagery.

The maker/checker cycle corrected IMU gyro axes and cavity clearance; ToF optical-window alignment, selection overlays and axial-time wording; radar Rev D population, package aliases, PMIC, DIP count, BGA seating and feed clearance; PIR detector visibility; and SRF04 missing through-holes, can extent, lead/wire connections, parking and hidden-wave reset state. Exploded-view spacing received a final visual pass after these fixes.

## Performance and limits

Independent 100-frame samples per mode, after warm-up, used Chrome/ANGLE Metal on **Apple M5 Max**, 1000 × 900, DPR1. CPU render-update p95 in normal/X-ray modes was:

| IMU | ToF | Radar | PIR | SRF04 |
|---|---|---|---|---|
| 1.4 / 1.6 ms | 1.0 / 0.9 ms | 1.0 / 0.5 ms | 0.7 / 0.8 ms | 0.7 / 0.8 ms |

Raw results: `checker-final/frame-profile.json`. These are local CPU submission timings, not a claim of physical-phone performance or complete GPU presentation timing. Mobile checks use viewport emulation. No real-hardware electrical, acoustic, optical, MEMS displacement, noise or calibration testing was performed. Shared full-collection regression and offline packaging results are recorded separately by the integration owner below.


## Integration and offline packaging

The integration owner ran the full `npm run check`, including the independent batch-3 script, after the final geometry corrections. `npm run build` produced a standalone file of **22,914,334 bytes** (22.91 MB) for **41 devices**. SHA-256: `baf0d0a49a057ee0c321bbc6251ae1461cbbda2194542db14821d32db8313453`.

The final HTML was opened directly with network requests blocked in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2. All 41 inventories, operation inputs, selection, anatomy and reset passed; both sets of assembled previews decoded and 2400 px PNG export worked. No HTTP requests or browser exceptions occurred. The ten new assembled WebPs and ten native gallery PNGs were regenerated after the final fixes; every new gallery image was opened and inspected.

The shared 8 × 8 depth readout includes a theme-aware color scale and a complete row/column table for assistive technology. The hidden table is clipped by a wrapper so its intrinsic width does not expand the mobile page.

Production commit `3f54245` includes a final accuracy clarification that the radar mounting kit is omitted. The resulting 114-byte text-only build change was rebuilt and rechecked offline in Chrome; the deployed HTML matches that verified artifact byte for byte.
