# Expansion batch 5 verification

Scope: Canon EF 50mm f/1.8 STM, Nikon AF-S 24–70mm f/2.8E ED VR, Samsung SEM folded telephoto configuration, RealSense D455 and Nikon FM3A shutter. These additions bring the collection to **51 devices**, including **25 of the planned 40 additions**. The remaining 15 additions and final 66-device review are pending.

Independent checker result: **passed** for all five additions, including reference, numerical, geometry, visual, actual-application and performance gates. This is a software reconstruction review, not a physical optical/mechanical qualification.

## Reference audit

| Device | Locked reference and independently checked details | Explicit limits |
|---|---|---|
| Canon EF 50mm f/1.8 STM | Canon EF451, May 2015, plus one consistent disassembly specimen. Six elements in five groups, seven diaphragm blades, f/1.8–22, 0.35 m minimum focus, 49 mm filter and Ø69.2 × 39.3 mm at infinity. Official construction diagram and specimen mount, annular PCB and flex photographs opened independently. [Evidence](../../reference/prime50/evidence.md) | Glass profiles are proportional reconstructions. Gear teeth, lead screw, guides, motor internals and iris blanks are representative. The authored 12 mm focus stroke and simplified iris radius are not measured focus or entrance-pupil laws. |
| Nikon AF-S 24–70mm f/2.8E ED VR | F-mount E version, manual 7MA0196C-03 ©2015. Twenty elements in sixteen optical groups, nine blades, f/2.8–22, Ø88 × 154.5 mm, 82 mm filter with 0.75 mm pitch. Optical diagram and manufacturer manual checked; the 2015 designer interview supports the zoom architecture. [Evidence](../../reference/zoomlens/evidence.md) | Patent US20180136444A1 example 1 informs representative G21 focus and G32 stabilization motion; it is not established as the production prescription. The fixed aperture stop agrees with the patent. Cam paths are scaled/interpolated, VR motion is enlarged 4×, and internal electronics, iris blanks and SWM anatomy are representative. HRI placement is not invented. |
| Samsung SEM folded telephoto | The documented **50M 5× prism-lead** configuration, distinct from the adjacent lens-lead product: 31.76 × 15.4 × 8.55 mm body, six polymer lenses, f/2.53, 18.45 mm track and 20.74° field. Manufacturer specification and configuration photograph opened independently. Lens-shift AF and two-axis prism-tilt OIS follow the published operating principles. [Evidence](../../reference/periscope/evidence.md) | No public ordering code or hardware revision is supplied; a manufacturer configuration and archived snapshot identify the reference. Finish and every concealed optical/mechanical detail are estimated or representative. Rays obey geometric reflection but are not a calibrated optical trace. Ideal compensation is not a measured performance result. |
| RealSense D455 | Original K83122-110 BMI085 configuration, MD0645501 Rev 02 enclosure drawing, D400 datasheet Revision 023, March 2026. 124 × 29 × 26 mm enclosure; four documented optical centers; 95 mm stereo baseline and rear M4 spacing; 119.5 × 17.4 mm D450 module. Enclosure/module drawings and hardware table opened independently. [Evidence](../../reference/d455/evidence.md) | D4 V3 provides functional architecture, not an asserted production board fit. Hidden population, flex route, lens prescriptions and internal assembly are representative. The 640 px focal length derives from nominal 90° horizontal field at 1280 px, not calibration. Image panels demonstrate ideal rectified projection, not a stereo matcher or time-of-flight measurement. |
| Nikon FM3A shutter | Unit **1B060-746** in June 2001 parts list FAA38001-R.3538.A; separate 1B060-747 control unit is not substituted. Original parts figure, Nikon history and Nikon sales sheet independently checked. Documented 36 × 24 mm gate, vertical aluminum-alloy curtains, mechanical manual timing, two release-stop paths, 1/4000 s maximum and 1/250 s flash sync. [Evidence](../../reference/shutter/evidence.md) | Frame envelope is photo-estimated. Four-leaf groups, straight guides, springs, governor and hidden couplings are explicitly representative; factory fan linkage and leaf count are not established. A representative 3.5 ms transit and exact selected release delay share the same 180× display slowdown. Cocking is illustrative. |

Manufacturer URLs, original document identifiers and source hashes are preserved in each evidence file. The optical models do not claim calibrated prescriptions, aberration calculations or image-quality predictions. Manufacturer-authored Nikon documents hosted by archive mirrors are identified as such.

## Numerical and physical checks

Reproducible gate: `node scripts/check-expansion-batch5.mjs`. All five models pass. Source-geometry triangle counts are 176,742 (Canon), 406,290 (Nikon), 74,252 (periscope), 93,830 (D455) and 117,434 (FM3A). These exclude viewer/shadow geometry and do not multiply the base geometry by its instance count.

The shared gate checks finite geometry and indices, every control's minimum/default/maximum, physical inventory, floor clearance through separation, deterministic reset, pause, reduced motion, 30/120 Hz pose agreement and stopping the mechanism while separated. Selection, isolation, context ghosting and exact material restoration are exercised. Physical anatomy must retain all source surfaces and current contours; explanatory effects must remain outside the component picker and anatomy inventory.

Device-specific checks include:

- **Canon:** actual six glass elements and eight rendered EF contacts; documented diameter and infinity rim; seven rigid iris leaves with clear centers and covered perimeter at five f-stops and 96 angles; inverse-square relative throughput; shared focus travel and stationary mount. The actual 12/14 involute tooth geometry is tested over 144 phases for tooth-to-tooth and tooth-to-root clearance, with exact 3.9 mm centers, opposite 14:12 angular ratio and 1.2 mm screw lead.
- **Nikon:** actual twenty glass elements in the six moving assemblies, including four bonded interfaces giving sixteen optical groups; nine rigid iris blades; independent focus-group motion; three cam followers meeting their actual tracks at five zoom settings. Sampled glass-surface intervals remain separate across zoom/focus/VR extremes. VR correction agrees with the disclosed patent-based equation, disabling it recenters the carrier, and every extreme physical bounding corner lies within the fitted shadow camera at assembled and exploded poses.
- **Periscope:** exact body footprint, real entrance opening, six separate optical elements, stationary sensor, 0.65 mm authored lens shift and guide balls moving half that travel while remaining tangent to actual rails and carriage walls. The visible incident/reflected ray and actual mirror-plane normal satisfy the reflection law. Uncompensated shake moves the beam; ideal compensation returns the modeled offset to zero.
- **D455:** actual enclosure and module bounds, real optical-mask and mounting openings, USB/tripod apertures, fifty rendered interface contacts and fixed 95 mm baseline. Range and angle combinations obey `d = fB/Z`, the two image coordinates differ by that disparity, their mean responds with the correct angle sign, and inverse depth recovers the scenario input.
- **FM3A:** real 36 × 24 mm frame aperture and two four-leaf groups. Exposure is integrated from actual moving leaf bounds at seven image rows for all eight speeds, using 1 ms display steps; each row receives the selected duration within 2.1 ms display tolerance. Cocking remains covered. Full-cycle bounds include the followers and rivets when checking leaf separation. Governor clearance uses actual top-face triangles, with pitch-center and angular-ratio checks.

Glass clearance is a sampled geometric check, not an exhaustive analytic proof for every possible optical surface point. The FM3A mechanism remains an explanatory reconstruction even after these coherence checks.

## Findings resolved before release

1. Canon's initial block teeth collided. Replaced with actual involute profiles, common module, correct center distance and tooth/gap phase; independent mesh checks pass.
2. FM3A collapsed leaves initially had overlapping follower blocks and rivet heads. Separate layer banks, wider pitch, real rivet apertures and U-shaped followers remove these collisions while preserving exposure timing.
3. FM3A governor teeth initially intersected. Common-module involute profiles and chained phase now replace the radial block profiles; independent actual-triangle regression passes through 144 operating samples.
4. D455 processor board and flex were obscured by the D450/back assembly at full explosion. Their offsets now fan toward the upper right; final independent light/dark images clearly show both.
5. Nikon's large exploded assembly exceeded the original shadow volume. An opt-in fit includes physical bounds and projected ground shadows; actual extreme poses are checked.
6. Nikon's instanced grip ridges exposed a shared anatomy bug: instance transforms were lost and one cylinder appeared below the ring. The fix preserves all 288 physical ridges and removes the stray line. A synthetic independent test covers rotated/scaled/transformed instances, changed matrices, count changes through zero, changed base geometry, contour reuse, selection/ghost restoration, hidden parents and exactly-once resource disposal.

7. Corrected newly introduced label acronyms, including EF, STM, SWM, VR and OIS, while preserving sentence case for prose. Exact formatter examples and the actual Canon selected label were checked.

## Visual and application checks

Final proof directory: `/tmp/breakboard-proof/batch5/checker-final/`.

Both themes and assembled/exploded poses were rendered with the shared renderer. Play, three close-up orbit angles and X-ray views were opened to inspect surface detail, layer separation, transparency and connections. The final D455 processor/flex layout is visible; the FM3A leaf hardware and involute gears remain separate; Nikon's grip ridges appear at their actual positions in anatomy. The large Nikon shadow is no longer clipped by the fixed scene shadow volume.

The actual application passed at 1440 × 1100 and 390 × 844 against a frozen source snapshot (`checker-final` contains the images; `/tmp/breakboard-proof/batch5/frozen-app` is the tested source). This avoids unrelated work triggering Vite reloads during the gate. Every new input, causal displayed result, Play/pause, reset, model switch, selection and X-ray selection was exercised without page errors. Checked outputs include Canon 100%/25% light at f/1.8 and f/3.6; Nikon −2.00 mm focus and −0.632 mm disclosed VR correction; periscope zero compensated offset; D455 60.80/30.40 px disparity at 1/2 m; FM3A 24.00/1.71 mm nominal slit at 1/30 and 1/4000 s. Reduced motion keeps every new output stable.

The Labels/Rotate text toggles update their pressed state. Custom controls use compact mono uppercase captions and at most three output rows while preserving numeric unit case. Model notes expose representative-geometry limits and source links. Mobile controls open inline, reduce the canvas height without a modal scrim, retain at least 130 px of visible canvas and remain scrollable without horizontal overflow. The custom device sheet contains all 51 square previews; stable mobile picker and readout captures were opened. These are viewport tests, not physical-phone tests.

## Performance

Measured on Apple M5 Max / ANGLE Metal in headless Chrome at 1000 × 900, scale 1, with 20 warm-up and 100 measured frames per mode. These are CPU frame-submission timings, not physical-phone benchmarks or GPU timer queries. Raw final results are in `checker-final/frame-profile.json`.

| Model | Normal p95 | X-ray p95 |
|---|---:|---:|
| Canon 50mm STM | 1.6 ms | 1.1 ms |
| Nikon 24–70mm VR | 1.6 ms | 1.8 ms |
| Folded telephoto | 0.8 ms | 0.5 ms |
| RealSense D455 | 0.7 ms | 0.5 ms |
| FM3A shutter | 0.6 ms | 0.7 ms |

The maximum measured CPU submission time was 2.1 ms. Correct instanced Nikon contours remain cached across unchanged frames; the final X-ray render includes every ridge rather than the former single-cylinder substitute.

Physical hardware, optical calibration, original proprietary mechanical drawings, electrical behavior and physical-phone performance have not been tested. Full shared regression, offline packaging and production validation are separate integration gates owned by the parent agent.


## Integration and offline packaging

The parent agent integrated all five into the Optics category and its previous/next navigation. All ten final 192 px theme-aware assembled WebPs and ten 2400 px gallery PNGs were opened and inspected. The root additionally audited all 25 device-specific control panels at 320, 390, 1280 and 1440 px: minimum/default/maximum copy fits, no horizontal page overflow, mono styling, no more than three output rows, and keyboard-operable Labels/Rotate text toggles. Numeric unit case remains unchanged.

The large Nikon assembly opts into a fitted shadow volume derived from both assembly endpoints and their ground projections. Existing devices retain the original lighting configuration. Instanced anatomy now keeps all per-instance transforms; its body copies and transformed contour buffers are owned and disposed with the model. The independent regression checks live instance edits, zero counts, deformed source geometry, selection and exact resource release.

The final standalone HTML is **23,690,826 bytes** (23.69 MB / 22.59 MiB), SHA-256 `742b276e7e3deacd50d602fd10c9dc7e1ea52bf683519d61ea7a7b402be7dc93`. All **51 devices** passed network-blocked local-file checks in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2: inventory, every operation input, Play/pause, selection, X-ray, reset, all light/dark previews and 2400 px PNG export. There were no HTTP asset requests or page errors. Logs are `/tmp/breakboard-batch5-offline-{chrome,firefox,webkit}.log`.

`npm run check` passed the full shared regression and all five expansion gates. `npm run build` and `git diff --check` also passed. The only build message is the existing Vite large-chunk advisory for bundled 3D assets.
