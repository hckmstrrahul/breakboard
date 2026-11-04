# Expansion batch 1 verification

Status: independent model and interaction checks, integration, gallery and offline packaging passed on 2026-11-05.

Scope: relay, BLDC motor, haptic actuator, AS5600 encoder and quartz watch resonator. The remaining 35 additions and the final 66-device review are pending.

## Acceptance checks

- Exact reference configuration, source revision and documented/estimated/representative evidence are distinguishable.
- Assembled geometry and 0/25/50/75/100% separation preserve inventory, clearances and credible assembly.
- User inputs cause the correct mechanical or electrical response, including minimum/default/maximum values.
- Play, reset, reduced motion, separation gating, selection/ghosting, isolation and anatomy work together.
- Moving meshes remain outside static merges/batches; fixed housings remain fixed.
- Both themes, assembled and exploded states, operation close-ups and narrow/mobile layouts are visually inspected in a real WebGL renderer.

## Independent reference checks

| Device | Reference checked | Verified / deliberately not asserted |
| --- | --- | --- |
| Relay | Omron G2R-1 DC12, K013-E1-24, standard PCB SPDT drawing p9 and coil table | 28.8 × 12.7 × 25.3 mm case, five terminal locations, 1/5 coil, 4 common, 2 NC, 3 NO, 12 V / 275 Ω. Linkage and winding internals remain representative. |
| BLDC | T-MOTOR MN2212 V2.0 KV920 table and MN2212-draw-0604-v1 drawing | Ø27.5 × 26.5 mm body, 32.6 mm shaft span, Ø4 shaft, 9N12P, Ø22 × 13 stator, six top apertures, adapter/mount positions. The unrelated MN4112 marketing paragraph is excluded; winding schedule, bearings and tooth profiles remain representative. |
| Haptic | Precision Microdrives C10-100 R006-PROD, drawing V0023, PDF p5 | Ø10 × 3.7 mm body, Ø9 adhesive area, 175 Hz rated drive and 2 V RMS. Spring/mass/coil anatomy, enlarged travel and tap envelopes remain illustrative. |
| Encoder | ams AS5600-SO_EK_AB Rev1.3, mechanical setup p5 and layout/schematic p8 | 22 × 28 mm board, four Ø2.6 mounting holes on 18 × 11 mm centers, eight header contacts, Ø6 × 2.5 magnet and permitted air gap. Chip die/bond layout and reconstructed PCB traces remain representative. |
| Quartz | Epson FC-135_E_Ver2.0, package drawing p4, 32.768 kHz / 12.5 pF / ±20 ppm configuration | 3.2 × 1.5 × 0.9 mm maximum envelope and two crystal terminals. Fork/electrodes/cavity are representative. The divider is explicitly external; no oscillator or divider IC is claimed inside the crystal. |

Primary links and maker evidence: [relay](../../reference/relay/evidence.md), [BLDC](../../reference/bldc/evidence.md), [haptic](../../reference/haptic/evidence.md), [AS5600](../../reference/as5600/evidence.md), [quartz](../../reference/quartz/evidence.md). The checker independently opened the primary PDFs/drawing images, rather than accepting the evidence summaries alone. The Omron drawing was also cross-checked against its [official US-hosted catalogue](https://omronfs.omron.com/en_US/ecb/products/pdf/en-g2r.pdf).

## Findings corrected before passing

- Relay pause initially snapped the armature and idle updates re-energized Reset. Pause now holds position; Reset remains NC/unpowered. The first pusher did not reach the moving leaf. Its connected linkage, offset leaf/tab and fixed-contact clearance were revised and visually rechecked. Silver contact faces meet the appropriate fixed face at both endpoints.
- BLDC carrier initially occupied the bearing volume; separate bearing seats corrected it. Direction wording was reconciled with rotation viewed from the output shaft. Exploded retaining hardware was raised clear of the ground. Six cap holes plus adapter bores initially overlapped during triangulation, leaving only four visible vents. The apertures are now disjoint and independently raycast; solid bridges are also tested.
- AS5600 initially described generic 1 µF decoupling. The selected adapter schematic specifies C2 = 10 µF, which is now shown in its description. Lettering and mobile framing were refined.
- Quartz side terminals initially shared a coplanar surface with the ceramic, producing visible gold flecks. Metal now stands 0.0075 mm proud of the ceramic face, inside the published package tolerance.
- Dynamic meshes are excluded from static merges. Anatomy now regenerates changed flexure contours, rather than retaining rest-state edges. Tests compare actual edge coordinates during operation and after Reset.
- Plan-contract checks added the haptic single/double pulse control and BLDC illustrative field arrows. Both are explicitly explanatory rather than measured device response.

## Automated and rendered evidence

`node scripts/check-expansion-batch1.mjs` verifies finite geometry/index buffers, part inventory, 0/25/50/75/100% separation and floor clearance, every input's response, pause/reset, reduced motion, assembly gating, selection material identity, ghosting/isolation, moving-mesh ownership and deforming anatomy contours.

Additional independent checks cover relay PCB-pin rays and contact-face mating; actual BLDC vent/bore geometry, twelve magnet sectors, shaft dimensions, direction, electrical frequency and field visibility; haptic matched mass/magnet travel, bounded resonance envelope and single/double pulse timing; AS5600 dimensions, air gap, 0/90/180/270/360° mapping and reverse wrap; quartz opposing tines with fixed roots and every external binary-divider stage.

Chrome with a real WebGL renderer was used at `http://127.0.0.1:4287/`. The five models were inspected assembled/exploded in both themes, with Play and selected/X-ray states. Desktop controls were exercised through actual DOM inputs. At 390 × 844, every device retained a visible 3D area when opening inline Controls, used no modal scrim for those controls, and had no horizontal page overflow. The custom device picker contained all 31 previews. Reduced-motion operation was also exercised. No browser exceptions were observed.

Local proof artifacts: `/tmp/breakboard-proof/batch1/checker-final/` (model renders), `/tmp/breakboard-proof/batch1/app-*.png` (integrated desktop/mobile states), and `/tmp/breakboard-proof/batch1/frame-profile.json` (timing). These temporary proof files are not repository assets. Gallery regeneration is a separate integration step.

## Local timing sample

100 animation frames per state after 20 warm-up frames, Chrome/ANGLE Metal on Apple M5 Max, 1000 × 900 canvas, DPR1. Values below measure CPU render/update submission time, not a certified end-to-end GPU latency or mobile benchmark.

| Model | Normal p95 | X-ray p95 | Highest observed X-ray frame |
| --- | ---: | ---: | ---: |
| Relay | 0.8 ms | 1.1 ms | 1.2 ms |
| Haptic actuator | 0.7 ms | 2.4 ms | 5.3 ms |
| Quartz resonator | 0.7 ms | 2.6 ms | 3.0 ms |

The measured contour updates fit a 16.7 ms CPU budget on this machine. Physical phone performance remains unchecked.

## Integration and packaging

The integrating agent ran `npm run build` and the complete `npm run check` suite against all 31 registered devices, including the independent batch test. Ten 192 px assembled WebP previews and ten 2400 × 2217 px light-mode gallery PNGs were regenerated. Every new gallery PNG was opened and inspected after the final geometry fixes.

`npm run check:offline` passed against the actual `file:` HTML in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2 with networking disabled and HTTP requests blocked. Each browser visited all 31 devices, exercised operation/selection/anatomy/reset and device inputs, decoded all 62 theme previews, and exported a 2400 px PNG. There were no HTTP requests or page exceptions.

The bounded cache was checked with repeated browser cycles through ESP32, photomultiplier, Intel 4004, stepper, Lepton and RPLIDAR. Both completed cycles settled at 407 geometries and 14 textures, retaining only the last three models. Node checks additionally cover failed-load retry, late completion and shared-resource ownership. This is a bounded-cache regression sample, not the final 66-device performance audit.

## Verification limitations

No physical device was measured or electrically tested by the checker. No exact hidden production geometry, manufacturing tolerances, torque/force, actual transient waveform, sensor noise, thermal behavior or device safety performance is certified. Product dimensions and specifications are checked against published sources; undisclosed internals remain representative. Browser emulation does not certify physical mobile performance. This gate covers five additions, not the remaining 35 additions or the final 66-device audit.
