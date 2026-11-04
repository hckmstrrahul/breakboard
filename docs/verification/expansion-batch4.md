# Expansion batch 4 verification

Scope: ZED-F9P GNSS receiver, IMX500 AI sensor, IMX636 event sensor, MAX30102 optical sensor and PW6C load cell. These additions bring the collection to **46 devices**, including **20 of the planned 40 additions**. The remaining 20 additions and final 66-device review are still pending.

Independent checker result: **passed** for all five additions, including numerical, reference, geometry, visual, actual-application and performance gates. This is a software reconstruction review, not a physical sensor qualification.

## Reference audit

| Device | Locked reference and independently checked details | Explicit limits |
|---|---|---|
| ZED-F9P-04B-01 | u-blox UBX-21044850 R05, 21 March 2024, HPG 1.32: 22 × 17 × 2.4 mm package; 54 perimeter contacts at 1.10 mm pitch and 48 central ground lands at 2.10 mm pitch; top-view pin-one and RF input orientation; dual-band receiver architecture. [Evidence](../../reference/gnss/evidence.md) | Shield construction, internal footprints, die, interconnect and routing are representative. No antenna or GNSS solver is included. Acquisition and RTK convergence are authored scenarios. |
| Sony IMX500 | 14 May 2020 bare-chip configuration, checked against Sony's AITRIOS specification. 4056 × 3040 pixels at 1.55 µm give a 6.2868 × 4.712 mm active array. Pixel chip above logic chip, Bayer sampling and ISP/DSP/memory functions. [Evidence](../../reference/imx500/evidence.md) | This is not the packaged IMX501. Outer die dimensions and thickness are estimated; microscopic structures and functional positions are representative. Detection counts are scripted; no neural network executes. |
| IMX636-AAMR-C | Prophesee's 2024 brief and Sony's 9 September 2021 publication: 13 × 13 mm ceramic LGA156, 1280 × 720 monochrome array at 4.86 µm, Cu-Cu pixel-over-logic stack, nominal 0.25 natural-log threshold. Manufacturer underside photograph independently counted: 152 round contacts plus 4 corner contacts. [Evidence](../../reference/eventcamera/evidence.md) | Pad pitch, cavity, glass and die dimensions are estimated. The demonstration uses 32 × 18 coarse sample cells and authored timing. Native throughput, noise and latency are not simulated. |
| MAX30102EFD+ | ADI 19-7740 Rev 1, October 2018, and package 21-1048 Rev F: 3.3 × 5.6 × 1.55 mm, 14 contacts at 0.8 mm pitch, 2.4 mm row centers, two distinct optical windows and 0.20 mm cover glass. Typical 660/880 nm channels and 1.38 × 0.98 mm detector. [Evidence](../../reference/max30102/evidence.md) | Hidden die and bond arrangement are representative. Optical timing is expanded and infrared is false-colored. Reflectance and pulse input are synthetic; there is no clinical estimate. |
| HBK 1-PW6CMR/20KG-1 | B01994 09 E00 04, 29 August 2024, and official PW6C 1.5–30 kg STEP. The 20 kg C3MR configuration has four wires and a 350 mm cable; 130 × 25.4 × 22 mm body, four M6 holes at 106 × 15 mm, nominal 2.2 ± 0.2 mV/V sensitivity and 5 V reference excitation. The cable end is fixed. [Evidence](../../reference/loadcell/evidence.md) | Concealed foil and wiring are representative. The enlarged S-bend is kinematic, not FEA or measured compliance. The nominal electrical model omits production tolerances and calibration. |

The primary mechanical drawings, package photographs, pinouts and block diagrams were opened independently. The original PW6C STEP was loaded independently with Open Cascade to verify body and cutout bounds. Removing the fused CAD label and closing its end face is documented; the remaining body comes from the published CAD. Manufacturer source URLs and file hashes are preserved in the evidence files.

## Numerical and runtime checks

Run `node scripts/check-expansion-batch4.mjs` from the repository root. All five models pass. The gate checks finite geometry, rendered part inventory, every control's minimum/default/maximum, floor clearance throughout separation, pause, reduced motion, deterministic reset, selection/isolation and exact material restoration. It also checks that explanatory effects are excluded from hardware picking and anatomy while every physical surface remains represented. The picker test first proves that its ray actually intersects the explanatory geometry.

Specific causal and physical checks include:

- **GNSS:** recover all 102 contacts from actual merged mesh solids; verify both pitches and the top-view index; exercise no-fix, acquisition, RTK float/fixed and standalone states. Fewer than four usable satellites prevent a fix; obstruction and correction-feed edits change the authored acquisition state.
- **IMX500:** derive the active area from published pixel dimensions; check two-chip ordering and the Bayer 2:1:1 green/red/blue ratio; verify zero objects, low illumination, output modes and ordered pixel/ISP/DSP/memory/output phases. The scripted inference disclosure is asserted.
- **IMX636:** count actual 156-pad geometry and check active area; verify no events for unchanged brightness, signed natural-log threshold crossings and retained residuals, including the distinction between a 25% linear change and a 0.25 log threshold. Motion against equal brightness produces no new events. An extreme-input five-second run produces identical cumulative counts and waveform history at 30 and 120 updates per second. Pause and reset preserve or clear actual instanced-cell colors correctly.
- **MAX30102:** verify real optical apertures and the divider, detector dimensions, 14 contact positions, cover-glass thickness and clearance. The sequence is red/dark/infrared/dark with exclusive emitting channels. Zero current or missing tissue removes returned light; zero modulation removes AC variation; stronger absorption reduces return. Waveform phase, pause and reset are checked.
- **PW6C:** verify the CAD body, four through-bores, transverse cutout and rigid endpoints. A 196.133 N load gives the nominal 11.000 mV at 5 V; reversing load reverses polarity. Tare changes output without changing any elastic vertex. Actual foil deformation gives alternating tensile/compressive arms. Actual wire endpoints and colors form the documented bridge nodes, and independently computed branch voltages agree with the output. The cable has a 350 mm centerline and non-intersecting adjacent turns.

Source-geometry triangle counts are 82,222 (GNSS), 99,582 (IMX500), 153,632 (IMX636), 14,338 (MAX30102) and 35,592 (PW6C). These counts exclude viewer/shadow geometry and are not a count of all instanced triangles submitted per frame.

### Dynamic anatomy and resource ownership

Ordinary deforming contours are compared with a fresh edge extraction from the current mesh. The PW6C uses an explicit owned contour buffer to avoid extracting its CAD edges every animation frame. The checker verifies source creases at body corners, mounting-hole countersinks and the machined opening, and compares every non-body rest contour against an independent edge extraction. Every animated contour endpoint is checked against an independently expressed S-bend equation, and reset must reproduce the exact rest array.

The resource check proves that these owned buffers are collected even before anatomy is attached and disposed exactly once when shared between the model and its anatomy view. This protects both the animation and the bounded model cache.

## Visual and actual-application checks

Independent rendered proof is under `/tmp/breakboard-proof/batch4/checker-final/`. Each model was rendered in both themes, assembled and exploded, during Play, at three close-up orbit angles and in X-ray. These images were opened and inspected for framing, layer separation, transparency, surface artifacts and visible connections. The final MAX30102 glass/mask clearance removes the triangular surface artifacts observed in its first assembled render. The final PW6C contours remain coherent during enlarged bending.

The actual application was exercised at 1440 × 1100. Every new control, reset and model switch was checked, together with causal displayed values, live waveforms and pause. The Labels and Rotate text toggles change their pressed state correctly. Compact control captions use the intended uppercase styling, while numerical values and SI unit case are preserved. The presentation keeps the original source readout names in `data-readout` for stable verification. Native range serialization of zero at the PW6C's 0.001 N step is accepted only within 1e-10 N; displayed zero output remains exact to its stated precision.

At 390 × 844, all five models pass the mobile application gate: opening inline controls reduces the canvas height while keeping it visible and creates no modal scrim; controls, output rows and waveforms remain reachable without horizontal overflow. The device sheet contains all 46 square previews. The three live waveforms remain static when reduced motion is enabled. These are browser viewport tests, not tests on physical phones. Stable picker and readout screenshots were opened independently.

## Performance

Measured in headless Chrome with ANGLE Metal on Apple M5 Max, a 1000 × 900 viewport, device scale 1, 20 warm-up frames and 100 measured frames per mode. These are CPU frame-submission timings, not a physical-phone benchmark or a GPU timer query. Raw results: `checker-final/frame-profile.json` in the proof directory.

| Model | Normal p95 | X-ray p95 |
|---|---:|---:|
| GNSS | 1.0 ms | 0.7 ms |
| IMX500 | 1.1 ms | 0.5 ms |
| IMX636 | 0.6 ms | 0.8 ms |
| MAX30102 | 0.8 ms | 0.8 ms |
| PW6C | 2.1 ms | 2.9 ms |

The original PW6C X-ray implementation measured **44.6 ms p95** because it extracted all CAD edges on every deformation. The owned, co-deforming contour buffers reduced that measurement to **2.9 ms p95**, with a 3.3 ms maximum in the final sample. Geometry and crease checks remained enabled through the change.

## Findings resolved before release

1. Corrected the GNSS top-view pin-one index.
2. Removed refresh-rate dependence in event-camera sampling with a fixed 1/120 s simulation step and a fixed 0.533 s waveform history.
3. Corrected the PW6C physical bridge from adjacent tensile arms to alternating arms, with positive differential output and the documented wire colors.
4. Separated the MAX30102 optical mask and glass, and removed an opaque glass shadow.
5. Corrected PW6C input quantization, cable turn clearance and mobile framing.
6. Replaced repeated PW6C edge extraction with verified co-deforming contours and checked disposal ownership.
7. Preserved the lowercase `nm` suffix in the MAX30102 channel readout by separating it from the uppercase channel caption. The final actual-app check observes both RED 660 nm and IR 880 nm.

The review does not establish physical-phone performance, electrical or RF performance, optical calibration, proprietary die-layout fidelity, or measured strain compliance. Full shared regression, offline packaging and production verification are separate integration gates recorded by the parent agent.


## Integration and offline release checks

The parent agent ran the full 46-device `npm run check` suite, including the new batch 4 gate and shared-resource disposal checks. The load-cell input maximum was then normalized from a floating-point expression to the equivalent exact decimal **196.133 N**, resolving native range-step validity; the dedicated load-cell gate passed again. Browser input assertions use numerical tolerance for harmless native serialization differences. The artwork regression excludes explanatory scene captions from physical anatomy, while still checking every physical printed surface.

The controls redesign was checked across all **20** device-specific panels at **320, 390, 1280 and 1440 px**, at both input extrema: no horizontal overflow, short mono labels, at most three essential output rows and keyboard-operable Labels/Rotate toggles. Full scientific readout APIs remain unchanged. Both themes were visually inspected; detailed reconstruction limits and sources are available in the inspector's Model notes.

All ten new 2400 × 2217 gallery exports and all ten theme-specific WebP previews were opened and visually checked. The README gallery now contains 92 images for 46 devices.

The final standalone artifact is **23,581,181 bytes** (23.58 MB). SHA-256: `f10730601f95c1aa00371325d8736607cc55ec0894a3e173e4670efe4a147004`.

With networking disabled, that exact local HTML loaded **all 46 devices** in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2. Inventories, maximum inputs, playback, component selection, anatomy, reset, both theme-preview sets and 2400 px PNG export passed with no page errors or HTTP requests. Physical-phone verification remains pending.
