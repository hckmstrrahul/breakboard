# Expansion batch 6 verification

Scope: Seagate Barracuda HDD, Sony Blu-ray pickup, IBM LTO-9 transport, Samsung 990 PRO and Kioxia BiCS8 3D NAND. These bring the collection to **56 devices**, including **30 of the planned 40 additions**. Ten additions and the final 66-device review remain pending.

**Independent checker gate: PASS.** Source, geometry, causal behavior, actual application, rendered close-ups and performance were checked. This is a software reconstruction review, not physical hardware qualification.

## Reference audit

| Device | Independently checked reference | Limits |
|---|---|---|
| Barracuda HDD | Seagate ST31000528AS, PN 9YP154-521, firmware JC4A, PCB 100535537 Rev A in Cheadle’s February 2019 specimen. Seagate 100529369 Rev H specifies two disks, four physical heads, 7200 RPM and a 101.6 × 146.99 × 26.1 mm maximum enclosure. Primary specimen photographs opened; inner landing-zone parking is distinguished from a ramp. [Evidence](../../reference/hdd/evidence.md) | Chassis detail, 95 mm disk diameter, stack spacing, motor internals and clearances are estimated. A separate matching-revision PCB photograph does not prove identical chip substitutions. The recovery comb and tall spindle fixture are excluded; the obscured factory clamp is explicitly representative. |
| Blu-ray pickup | Sony KES-400A specimen marked 1216 / 060905 / 6138 in Wright/Goldwasser’s dissection. Original optical inventory photograph opened: one five-pin triple-emitter package, two return arrays, two splitters, moving collimator, LCD corrector, negative meniscus doublet, turning mirror, wave plate and one objective with a separate zone optic. [Evidence](../../reference/bluray/evidence.md) | The 75 mm length is a firsthand measurement, not a Sony drawing. Compatible deck dimensions, servo strokes and prescriptions are estimated. Approximately 48 zone pairs are an observer estimate; wave-plate retardance is unconfirmed. The source’s KES-400AAA deck name is distinguished from catalog KEM-400AAA. |
| LTO-9 transport | IBM TS2290 3580-H9S and green/teal 02XW568 / 3589-653 cartridge. IBM product sheets and cartridge diagram confirm the 213 × 58 × 332 mm enclosure, single supply reel, leader, permanent takeup reel, contactless memory, 18 TB and 1,035 m tape. Fujifilm’s June 2025 table supplies 12.65 mm width, 5.2 µm thickness and a 105.4 × 102 × 21.5 mm standard cartridge. [Evidence](../../reference/lto/evidence.md) | Concealed transport, roller coordinates, hubs and circuit layouts are representative. Fujifilm’s thickness is a same-generation illustrative parameter, not an IBM measurement. Some IBM marketing rate units conflict; those units are not repeated in the animation. |
| Samsung 990 PRO | Original October 2022 2 TB MZ-V9P2T0BW, Samsung datasheet Rev 1.0 and KitGuru’s photographed specimen. 80 × 22 × ≤2.3 mm, 2 GB LPDDR4, PCIe 4.0 ×4 / NVMe 2.0; actual photograph opened for S4LV008 and two K9DVGY8JRD-DCK0 packages. TE’s M-key reference confirms 67 positions and 0.5 mm pitch. [Evidence](../../reference/nvme/evidence.md) | Unreadable PCB revision remains explicitly unresolved. Hidden ball maps, die geometry and routing are representative. Sixteen 512 Gb dies per package are a capacity inference, not decapsulation evidence. The 176 levels are inside each die. |
| BiCS8 NAND | Kioxia’s March 28, 2024 1 Tb TLC / 218-word-line configuration with CBA and OPS. Manufacturer cell and bonded-orientation diagrams opened: radial storage layers, drain-side routing near CMOS, and source above the inverted array. [Evidence](../../reference/nand/evidence.md) | An enlarged eight-string section, not a retail package or dimensioned complete die. Dimensions, CMOS floorplan, staircase wiring and contact count are representative. A 2025 Schottky-source article informs only the general operating principle; its experimental 96-layer structure is not attributed to this model. |

Manufacturer and firsthand URLs are recorded in the evidence files. Source photographs are not reused as artwork in these five models. Documented counts and disclosed inference remain distinct from unpublished internals.

## Reproducible checks

Run `node scripts/check-expansion-batch6.mjs`. The final gate passes for all five models. It checks finite geometry and indices, control extremes, causal responses, floor clearance through separation, reset, pause, reduced motion and 30/120 Hz agreement. Mode-dependent inputs are tested in their meaningful state: NAND threshold while programming, read reference after stored charge, and LTO transfer target during transport.

| Model | Component groups | Moving mesh descendants | Source triangles |
|---|---:|---:|---:|
| HDD | 12 | 97 | 163,604 |
| Blu-ray | 17 | 154 | 332,298 |
| LTO | 13 | 127 | 158,009 |
| NVMe | 12 | 68 | 138,014 |
| NAND | 14 | 9 | 282,746 |

Moving counts include explanatory effects; SSD and NAND silicon stays stationary. Source triangle counts do not multiply instances or render passes.

- **HDD:** Four actual sliders, two disks, real spindle openings and spacer contacts. Rays against complete platter surfaces verify zero parked penetration and the enlarged 0.18 mm flight gap across tracks. The actual actuator position agrees with the radius output. Parking precedes deceleration; startup retains the inner radius until speed is established. Stop/start sequences agree at 30/60/120 Hz. The spindle follows the disclosed 100× display slowdown. Actual enclosure bounds and blind side bores are checked, including the recessed metal annulus and closed bore back.
- **Blu-ray:** All fourteen pickup groups share 33 mm translation while guide shafts remain fixed. Guide and nut bores clear the shafts, and the screw follows its representative 2 mm lead. Objective and collimator controls cause their declared motion. Actual optical meshes include two cubes, two meniscus layers, one objective and one zone optic; 48 ring pairs are counted. The actual 45° mirror normal reflects the incoming +X ray upward. Each format activates exactly one emitter and its detector; defocus reduces illustrative return strength.
- **LTO:** 482 cycle/target samples independently check tangent dot products, physical tape width and endpoints, actual pack radii, door timing and all seven phases. `π(Rs² + Rt² − 2Rhub²) / thickness + freeLength` remains 1,035,000 mm. Both barrel surfaces meet their 20 mm pack bore within polygonal-circle approximation. Drive and cartridge bounds fit; the front bay is a real opening. Reel angular changes preserve the disclosed relative surface-speed relationship.
- **NVMe:** Actual envelope; 67 disconnected pads in opposing 34/33 rows with 0.5 mm pitch; real M-key and mounting openings; 32 inferred die sheets with separate surfaces. Particle positions independently follow forward Write and reversed Read routes. Zero activity and inspection hide the overlay while physical parts stay still.
- **NAND:** Rays count 218 physical gate layers; geometry yields eight channel bodies with the correct radial order. Source/drain/bond/CMOS order agrees with the cited architecture. Programming changes only the selected eight-cell page. Raising stored thresholds succeeds; lowering them requires erase. Block erase checks all 1,744 sample cells. Read comparison responds to reference voltage. Pause and reduced motion cannot commit an operation. Completion agrees at 30/60/120 Hz.

Every physical surface remains in anatomy, with visibility matching its source hierarchy. Conditional LTO threading hardware therefore stays conditional. Deformed and instanced contours match source geometry. Explanatory effects cannot intercept picking; selection and isolation restore exact materials. Large-model shadow fitting is checked against physical bounds and ground projections.

Shared regressions also cover the optional cover-opacity target at default, zero, 0.025 and out-of-range values, including restoration, shadow behavior and ghost selection. A synthetic two-pixel test verifies that the future NE555 luminance opt-in changes only its intended anatomy shader, retains geometry/maps/alpha and uses a distinct shader cache key. Actual NE555 photo review belongs to batch 7.

## Findings resolved

1. HDD seek motion depended on frame cadence. Fixed-step simulation now matches through seeks, parking and spin-up.
2. HDD sliders penetrated raised landing rings by 0.0155 mm. The band is now a flush material region; actual-surface rays verify contact and flight clearance.
3. Blu-ray guides crossed perimeter ribs and the nut bridge. Real guide corridors and a bored nut now clear the shafts.
4. LTO barrels ended at 18.5 mm while the tape bore was 20 mm. They now meet the pack; the leader has matching barrel/flange clearances. Proud cartridge details were brought within its stated envelope.
5. Multiple faded HDD lid/label slabs obscured the mechanism. The settled Play view now has one faint cover and hidden artwork, while selection/reset restores normal surfaces.
6. HDD side details exceeded the enclosure and then overlapped solid walls after recessing. Centered side rings, corrected end-wall positions and actual blind bores remove both defects.
7. NVMe anatomy lost its label under an opaque artwork slab. Transparent artwork now preserves the SAMSUNG / 990 PRO text. HDD and Blu-ray artwork also retain lettering without filled rectangles.

## Application and rendered review

Frozen application: `/tmp/breakboard-proof/batch6/frozen-app`, served at port 4298. Proof: `/tmp/breakboard-proof/batch6/checker-final/`; source hashes: `source-sha256.json`. All relevant live source hashes matched the frozen copy at final review. A later LTO whitespace-only edit does not alter tested behavior.

The actual application passed at 1440 × 1100 and 390 × 844 with zero page errors. All five devices were selected through their real controls. Causal outputs, input extremes, reset, pause, selection, X-ray, reduced motion, concise readouts and Model notes were checked. Labels and Rotate retain pressed-state behavior. Mobile Controls stays inline, preserves a visible 3D area and introduces no horizontal overflow; the stable picker exposes all 56 preview items. The completed application run preceded the last artwork and side-bore-only corrections; direct rendered review and numerical checks used those final corrections.

Independent visual review opened assembled/exploded views across both themes, operating close-ups, anatomy detail and mobile controls/picker captures. Final HDD Play captures wait three seconds for cover opacity to settle. Its disk/arm mechanism is clear, side bores read as openings, and lettering survives anatomy. Blu-ray guide corridors are unobstructed; LTO tape stays continuous around rollers; NVMe’s separate die sheets and label remain legible; NAND’s layered section and channel order are visible. Not every generated camera angle was manually opened. The parent separately opened all ten final gallery images and ten theme previews.

## Performance

Final isolated browser profile: Apple M5 Max / ANGLE Metal, 1000 × 900, DPR 1, 20 warmup frames and 100 measured frames per mode. LTO was threaded and operating. Values measure JavaScript/update/render submission, not guaranteed GPU completion or mobile-device performance.

| Model | Normal p95 | Anatomy p95 | Maximum observed across both |
|---|---:|---:|---:|
| HDD | 1.3 ms | 0.9 ms | 1.8 ms |
| Blu-ray | 1.3 ms | 1.9 ms | 2.4 ms |
| LTO | 1.8 ms | 3.0 ms | 4.9 ms |
| NVMe | 2.4 ms | 0.8 ms | 2.8 ms |
| NAND | 0.5 ms | 0.4 ms | 0.5 ms |

Raw results: `frame-profile.json`. Browser profiling completed before the parent’s final offline browser run.

## Integration and limits

Parent-reported integration gate: `npm run build` and `npm run check` pass. All 56 models passed offline checks in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2 with networking blocked, including preview decoding and PNG export. The parent’s compact-controls audit passed all 30 operating panels at widths 1440, 1280, 390 and 320. Final artifact: 23,822,263 bytes, SHA-256 `76b627019d5795f763f1d4092c169645b65d0106f1c427fd2af59514c23f31f8`. Production publication remains a separate parent step.

No physical HDD, laser pickup, tape drive, SSD or NAND chip was operated or measured. These are sampled geometric and state-machine checks, not exhaustive collision analysis or calibrated electrical, optical or mechanical simulation. Firmware timing, optical prescriptions, servo transfer functions, electrical thresholds, signal integrity, manufacturing tolerances and physical-phone performance remain unvalidated. LTO transfer timing and reel-angle slowdown explicitly use different teaching scales.
