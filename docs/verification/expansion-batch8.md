# Expansion batch 8 verification

Scope: GaN reference charger, Qi2 charging pair, Epson PrecisionCore printhead, SII thermal printer and Murata SAW filter. The catalogue now includes the original 26 models and all 40 approved additions, for **66 devices**.

**Independent source, geometry, behavior, rendered-app and gesture gates: PASS.** Parent integration gates are recorded separately below. This review concerns an educational reconstruction, not physical hardware qualification.

## Source audit

| Model | Independently checked reference | Explicit limits |
|---|---|---|
| GaN charger | Power Integrations RDK-942, RD/DER-942 RevB, RDR-942 revision 1.0, 11 November 2022. Original 99-page report, BOM, layout, winding diagrams and instructions checked. Ferroxcube EQ25 drawing opened. Five fixed PDOs and 3.3–21 V/3 A PPS agree with the report. [Evidence](../../reference/gan/evidence.md) | Coordinates, winding packing, lead dress, tape thickness and L2 turns are reconstructed. U1/U2 remain intact packages. The sequence is illustrative active-clamp flyback, with no invented PFC stage or commercial enclosure. Ideal V × I is not measured efficiency. |
| Qi2 pair | WPC Qi 14294 independently opened: Apple A2580, Qi 2.0.1 MPP, 15 W, certified 9 September 2024. ChargerLAB’s 22 October 2024 first-hand specimen, PCB photograph and measured 55.5 × 4.45 mm puck checked. Apple’s drawing gives charging center 35.30 mm from left/74.98 mm from top; iFixit’s iPhone 15 Pro rear assembly photograph opened. [Evidence](../../reference/qi2/evidence.md) | Receiver regional variant/coil revision, concealed winding and magnet-segment count are unavailable. Hidden receiver turns are representative; covered magnet arrays avoid invented counts. The phone logic board/rectifier are omitted. Coupling is qualitative, not efficiency or delivered wattage. The source’s higher proprietary MagSafe power is not attributed to Qi 2.0.1. |
| Printhead | Epson aqueous I3200(4)-A1, March 2022 catalogue. Original drawing opened: 69.1 × 59.5 × 35.6 mm, 3,200 nozzles, 8 rows, 1/300 inch pitch, 600 npi per paired row, 1.016 mm pair spacing and 8.128 mm pair-center spacing. Manufacturer MicroTFP/three-silicon-layer principles checked. [Evidence](../../reference/printhead/evidence.md) | Chamber/manifold/COF geometry is representative; 20 µm bore and 1 µm piezo film are general Epson technology values, not released part-specific masks. Stagger polarity is representative. The enlarged cell/droplets and timing are explicitly explanatory. No heater, recirculation or thermal bubble-jet action is invented. |
| Thermal printer | SII LTP02-245-01, U00128436600, August 2012. Manufacturer-authored PDF on distributor host; original platen/exterior drawings opened. 384 heaters, 0.125 mm pitch, 0.0625 mm half-dot, 0.03125 mm feed/step, 90 mm/s, 24 contacts and Ø6.8 mm platen checked. [Evidence](../../reference/thermalprinter/evidence.md) | Newer-13x speed is not substituted. 12:34/12:21 concealed gears, motor internals, fine frame details and paper thickness are representative. The finite 64 mm raster is teaching media, uniformly slowed 1/12; no calibrated energy, temperature or print quality is asserted. |
| SAW filter | Murata SF2124E, SM3030-6, 29 August 2019 datasheet. Nominal 3 × 3 × 1.25 mm, 6 terminals, 2441.8 MHz, 50 Ω and 2.1 dB typical insertion loss checked. Murata’s general SAW principle supports the explanatory topology. [Evidence](../../reference/saw/evidence.md) | Piezoelectric die material/cut, bond map, absorbers and 40-finger combs are representative. Enlarged pitch and wave motion do not claim a production die. The symmetric response is synthetic and unfitted, not measured S-parameters. Legacy ceramic packaging is not replaced by modern I.H.P. construction. |

Source hashes and links remain in each evidence record. No physical specimens were measured or energized. Published exterior dimensions and specified counts are distinguished from representative hidden construction.

## Independent numerical and geometry gate

`node scripts/check-expansion-batch8.mjs` passes all five. It tests actual vertex/instance data, ray intersections, captured original TubeGeometry centerlines, triangle distances, transformed gear hulls and causal state changes.

| Model | Part groups | Moving mesh descendants | Source triangles |
|---|---:|---:|---:|
| GaN |18|12|308,224|
| Qi2 |16|72|354,044|
| Printhead |10|15|61,728|
| Thermal printer |10|89|21,932|
| SAW |9|1|10,196|

Triangles do not multiply instances/render passes. Moving descendants include explanatory meshes and translated receiver layers; their count is not a mechanical-part count.

- **GaN:** Actual board bounds and open isolation slot; independently transcribed 80-item fitted BOM, excluding R1/R2/R9/R18. Real winding centerlines verify 13 + 11 + 11 primary turns, 9 bias turns, 2 × 12 and 3 × 11 shield strands, 4 × 5 main-secondary turns and 2 secondary-bias turns. Every helix endpoint meets a separate lead/crossover. 3,706 radius samples against actual ferrite/bobbin triangles have no penetration beyond 12 µm numerical allowance; exposed nickel terminal contacts are intentionally excluded. Both flanges have open 4 mm secondary slots with solid material beside them. All fixed/PPS voltage-current limits, intermediate 5 V negotiation states, load percentages, detach and paused/reduced-motion gating pass. The actual conductors remain stationary during the illustrative conversion cycle.
- **Qi2:** Puck exterior, complete five-part receiver translation at offset/gap extremes, preserved dimensions, drag-offset clamping and reset. Increasing offset or gap reduces the authored relative waveform; zero load or disabled excitation yields zero response. Unknown magnet count remains explicitly null. Waveform and physical state pause/reset correctly.
- **Printhead:** All 3,200 actual instances, pitch and row positions. Aperture rays at both ends/middle of all 8 rows pass through real holes; neighboring plate rays hit solid material. Each pair has 800 distinct positions at 25.4/600 mm spacing. Only the selected static roof/film is replaced; full solid deforming roof/film share the same clamped displacement field. Release count, position, 2 Hz rate, zero drive, reduced-motion and selection suppression pass.
- **Thermal printer:** 384 actual heater centers and half-dot height; actual roller/shaft dimensions and matching nip surfaces. Feed quantizes at 0.03125 mm/step and strobes on steps 1/3. Platen/idler/motor rotations match feed. Actual transformed tooth hulls show zero intersections across 181 moving poses for both gear pairs. Changing a pattern preserves prior rows; disabled heating feeds blank rows; paper removal stops feed, zero speed holds, Reset clears, and 64 mm completes 1,024 half-dot rows without further writes.
- **SAW:** Package bounds, six published terminal roles and 40 actual finger solids in each representative comb. Independent loss/gain calculation at five frequencies and three levels, zero-input waveform, 8-second sweep extrema, pause/reset and stationary physical electrodes pass.

Shared gates retain finite geometry/index checks, meaningful min/default/max controls, five separation/floor samples, fitted-shadow bounds, repeatable reset, pause/reduced motion, 30/120 Hz agreement, selection/ghost/isolate restoration and complete physical anatomy inventory. Explanatory effects remain excluded from physical anatomy and picking. Instanced contours, owned-buffer disposal, cover opacity and luminance opt-in regressions remain covered.

## Findings corrected before release

1. Epson paired rows originally shared the same 300 npi grid. They now use opposite quarter-pitch offsets, giving the documented 600 npi union. Plate openings, channel supports, selection and droplets use the same positions. Selected diaphragm planes were replaced with solid roof/film volumes to preserve chamber side faces.
2. GaN split-primary layers and secondary leads originally missed their actual winding endpoints. Crossovers and individual strand terminations now form continuous centerlines; electrostatic shields remain open at their intended free ends. Source-defined bobbin slots are real cutouts.
3. A centerline-only clearance audit missed tube-radius collisions: a crossover penetrated a bobbin flange by 0.058 mm and a primary lead crossed a ferrite edge by 0.123 mm. Rerouting removed both. Winding ends now meet exposed metal above plastic pin bosses. Independent triangle-distance recheck passes.
4. Qi2 communication-coil phase was inconsistent with its lead endpoints. The phase now matches; receiver solder pads bridge winding ends to the flex.
5. Shared planar dragging prevented default pointer focus while listening for Escape only on the canvas. Successful grabs now focus the canvas without scrolling; Escape works after another control had focus.
6. The collection test compared every device against a fixed -19.2 mm floor. It now uses the same declared floor as the renderer. GaN passives reach -27.01 mm at full separation, leaving 4.99 mm above the declared -32 mm floor; no model geometry was changed. The corrected collection gate passes all 66 devices.
7. The generic anatomy test assumed every device must have printed artwork. The printhead has no physical artwork; its explanatory inset is correctly excluded. An explicit unmarked-device expectation now verifies that zero count, while the exact preservation assertions remain in place for every existing physical logo, label and graphic.

## Rendered application and gestures

Final snapshot: `/tmp/breakboard-proof/batch8/frozen-app`, served on 4300. Proof directory: `/tmp/breakboard-proof/batch8/checker-final/`. Source hashes in `source-sha256.json` identify the tested files; the final gesture-only rerun includes subsequent cancellation fixes for Reset, camera changes and blur. Model source hashes match the final maker freezes.

Actual-app tests passed at 1440 × 1100 and 390 × 844: correct control counts, concise uppercase captions, at most three essential outputs, causal output changes, waveform pause/reset, selection/anatomy and reduced-motion hold. Mobile Controls remains an inline accordion with a visible 3D region and no scrim; controls and the 66-device thumbnail picker have no horizontal overflow. Captures were opened after animations settled.

Independent native-touch testing passed movement, pointer cancellation without snapping, focus/Escape restoration, canvas/window blur cleanup, Reset during a held pointer, model-switch cleanup during an active grab, anatomy-mode picking and isolation cancellation. Parent's complementary drag gate covers off-center mouse grabs, slider synchronization, ordinary tap selection, separation cancellation and empty-space orbit.

Material/exploded/operating close-ups were generated for all five in both themes. The checker opened final GaN coil/flange details, Qi2 receiving assembly and coil views, Epson layers and explanatory cell, SII working train/printed sheet, and SAW ceramic/finger/bond views. No remaining observed clipping, coplanar flicker or disconnected lead defect in these inspected views. This is sampled visual review, not an exhaustive proof for every camera angle.

## Performance

Uncontended Chrome/Apple M5 Max/ANGLE Metal, 1000 × 900, DPR 1. Twenty warmup and 100 measured frames per mode. These measure update/render CPU submission, not guaranteed GPU completion or physical-phone FPS.

| Model | Normal p95 | Anatomy p95 | Max across both |
|---|---:|---:|---:|
| GaN |2.5 ms|2.2 ms|2.7 ms|
| Qi2 |2.3 ms|1.9 ms|2.5 ms|
| Printhead |2.0 ms|4.7 ms|6.0 ms|
| Thermal printer |1.9 ms|1.9 ms|2.4 ms|
| SAW |1.0 ms|0.6 ms|1.3 ms|

Raw data: `frame-profile.json`. No parent/checker browser capture or test was running concurrently with this profile.

## Final 40 reference/disclosure closure

All 40 evidence records and final public `model`, `sources`, and `accuracy` fields were reopened. Every addition has at least two source links and an explicit hidden-geometry/reconstruction limit. Machine-readable snapshot: `final40-source-disclosures.json`. This closes the previous batch source audits; it does not claim newly measured hardware or undisclosed production drawings.

| ID | Locked reference | Main remaining representative limit |
|---|---|---|
|relay|Omron G2R-1 DC12 PCB SPDT; K013-E1-24|Hidden bobbin/linkage/contact details and coil turns|
|bldc|T-MOTOR MN2212 V2.0 KV920, 9N12P|Wire turns, bearings and field overlay|
|haptic|Precision Microdrives C10-100, R006-PROD, V0023|Hidden mass/spring topology; exaggerated motion|
|as5600|AS5600-SO_EK_AB Rev 1.3, AS5600-SO_AB_V2|IC internals and magnetic visualization|
|quartz|Epson FC-135, 32.768 kHz, 12.5 pF, ±20 ppm, Ver 2.0|Tuning fork; external divider is explicitly external|
|memsmic|Infineon IM73A135V01, V1.20, PG-LLGA-5-2|Hidden SDM geometry and relative signal|
|armature|Knowles ED-29689-000, Rev C, 23 October 2008|Hidden reed/rod details and relative acoustics|
|planar|Audeze LCD-2 Classic, SKU 100-LC-1017-00, non-Fazor|Internal manufacturing revision unavailable; arrays/spacing representative|
|bme688|Bosch 0273017016, DS000-03, Rev 1.3|Concealed MEMS/gas elements; no CO2 inference|
|scd41|SCD41-D-R2, datasheet 1.7|Hidden photoacoustic chamber and delayed illustrative response|
|imu|TDK ICM-42688-P, DS-000347 Rev 1.9|Representative MEMS; specified axis stimulus separate from camera|
|tof|ST VL53L8CXV9GC/1, DS14161 Rev 12, DM00891572 Rev 2.0|Hidden emitter/SPAD layout; axial-equivalent light time|
|radar|TI IWR6843ISK PROC073D, 001_IWR, Rev D|Internal silicon and simplified target/chirp demonstration|
|pir|Panasonic EKMB1101111, Rev 7.1|Hidden detector/lens geometry and qualitative thermal stimulus|
|ultrasonic|Devantech SRF04 updated schematic, 400ST160/400SR160|No invented PCB revision; resonator details representative|
|max30102|MAX30102EFD+, Rev 1/2018, package 21-1048 Rev F|Illustrative optical pulsation, no physiological measurement|
|loadcell|HBK 1-PW6CMR/20KG-1, C3MR, four-wire 0.35 m|Hidden foil layout and exaggerated deformation|
|gnss|ZED-F9P-04B-01, HPG 1.32, UBX-21044850 R05|Representative blocks and synthetic acquisition/RTK, not a solver|
|imx500|Sony IMX500 bare-chip, 14 May 2020 configuration|Outer die estimate/hidden blocks; scripted detection, not executed NN|
|eventcamera|IMX636-AAMR-C, 2024 brief|Hidden pixel/logic detail; authored 120 Hz teaching sampling|
|prime50|Canon EF 50 mm f/1.8 STM, May 2015 specimen|Mechanical revision unavailable; representative drive details|
|zoomlens|AF-S 24–70 mm f/2.8E ED VR, 7MA0196C-03|Patent-informed group trajectories/prescription not confirmed production|
|periscope|Samsung SEM50M 5× prism-lead configuration|No ordering code/stepping; representative 6P prescription/mechanics|
|d455|D455 K83122-110, MD0645501 Rev 02, BMI085|Hidden routing/population; ideal stereo teaching geometry|
|shutter|Nikon FM3A 1B060-746, FAA38001-R.3538.A, June 2001|Frame estimate; representative four-leaf linkage/governor|
|hdd|ST31000528AS, 9YP154-521, JC4A, 100535537 Rev A|Hidden geometry/clamp and enlarged flight gap; inner landing zone retained|
|bluray|KES-400A specimen 1216/060905/6138, compatible KEM-400AAA|Photograph-sized pickup and representative servo strokes|
|lto|IBM TS2290 3580-H9S, 02XW568 LTO-9 cartridge|Representative concealed transport; accelerated timing/angles|
|nvme|Samsung MZ-V9P2T0BW, original October 2022 specimen|PCB silk revision unresolved; hidden die stacks/traffic representative|
|nand|Kioxia BiCS8, 1 Tb TLC, 218 WL, CBA/OPS, 28 March 2024|Magnified not-to-scale section; no invented retail package|
|ne555|TI NE555D, D0008A, SLFS022K; genuine TI06 micrograph|Die legend is not a stepping; hidden package routes representative|
|rp2350|RP2350B0A4, QFN80, Release 8/build 2026-10-01|Representative A4 floorplan; no relabeled A2 die image|
|fpga|XC7A35T-1CSG324C, UG475 v1.20 Fig 4-9|Representative die/bond subset and logical activity|
|hbm|MT65B12G16080A00QG-92:A, 24 GB, eight-high|Representative TSV/bump sampling and 128 teaching bytes|
|eprom|M27W256-80F6, FDIP28W, ST Rev 3/2006|Representative die/routes; accelerated uncalibrated UV erase|
|gan|RDK-942, RD/DER-942 Rev B, RDR-942 v1.0/2022|Lead dress/packing; authored negotiation and ideal load|
|qi2|A2580 PCB 820-02833-06/241008 + iPhone 15 Pro rear assembly|Receiver revision unknown; covered magnet arrays/qualitative coupling|
|printhead|Epson I3200(4)-A1, aqueous, March 2022|Hidden microcells/COF; enlarged explanatory chamber/drops|
|thermalprinter|SII LTP02-245-01, U00128436600, August 2012|Hidden gears/motor and finite teaching raster|
|saw|Murata SF2124E, SM3030-6, 29 August 2019|Representative combs/substrate; synthetic unfitted response|

Reproduction logs: `/tmp/b8-numeric-final.log`, `/tmp/b8-app-final-mobile.log`, `/tmp/b8-drag-check.log`, `/tmp/b8-reset-drag.log` and `/tmp/b8-floor-collection.log`. Desktop causal checks for GaN, Qi2, Epson and SII precede the final SAW/mobile rerun in `/tmp/b8-app-check.log`; the first SAW assertion used an incorrect expected value and was corrected to the independently calculated 53.55 dB at 2200 MHz. No model implementation was changed to satisfy that mistaken assertion.

Parent final full-suite, 66-device framing, offline-browser packaging, artefact inventory and publication gates are separate and may be appended after this independent report freezes.

## Parent integration

Final `npm run check` and production build passed for all 66 devices. All 40 custom control panels passed four viewport widths; component framing passed 4,752 pose/viewport checks and 264 resize checks. All 264 final baselines were inspected individually and their hashes matched the review ledger. GPU allocations remained stable on three full catalogue traversals. Network-blocked local-file checks passed all 66 devices in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2. The standalone artifact is 25,080,749 bytes, SHA-256 `60c4762563069b65fba7712084f29edb0cd98ee141db2384806ade1004cd7f59`. See the [final expansion report](40-device-expansion.md) for full results and publication verification.
