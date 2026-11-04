# Expansion batch 2 verification

Status: model, reference and integrated interaction checks passed on 2026-11-05. Final gallery and packaging results are recorded separately by the integrating agent.

Scope: Infineon MEMS microphone, Knowles balanced-armature receiver, Audeze planar driver, Bosch BME688 and Sensirion SCD41. These five additions bring the catalogue to **36 devices**. Thirty planned additions and the final 66-device review remain pending.

## Reference locks and acceptance

| Model | Independently reviewed reference | Required physical and causal checks |
| --- | --- | --- |
| IM73A135V01 | Infineon V1.20, 2021-07-07, PG-LLGA-5-2 drawing p11 and architecture p2 | 4 × 3 mm package, 1.2 nominal / 1.28 maximum height; four rectangular pads plus ground ring; real Ø0.6 bottom port. Two moving membranes around a fixed stator; sound input and differential output remain causally connected. |
| ED-29689-000 | Knowles RevC, 2008-10-23, p1 outline; generic Knowles WP03 mechanism | 6.30 × 4.29 × 2.97 mm body, Ø1.41 sound outlet, three center-tapped contacts. Coil/magnets fixed; reed→rod→diaphragm registration. Preserve documented output-pressure polarity if presenting terminal polarity. Generic RAB-series explanatory anatomy is not exact ED internal evidence. |
| LCD-2 Classic driver | Audeze SKU100-LC-1017-00 product specification | 106 mm transducer, N50 magnets, 70 Ω, non-Fazor. No invented production revision, exact trace mask or magnet-array dimensions. Frequency/amplitude move a rim-anchored membrane with conductor geometry attached and adequate magnetic-gap clearance. |
| BME688 | Bosch BST-BME688-DS000-03 Rev1.3, February2024, technical code0273017016; package p53 | 3 × 3 × 0.93 mm nominal, eight pads, Ø0.35 actual top vent at documented offset. Independent T/RH/P/gas stimuli affect the proper channels. Gas response is qualitative; no direct CO₂ measurement or universal gas identification. |
| SCD41-D-R2 | Sensirion v1.7, April2025, package p24 and performance table p3 | 10.1 × 10.1 × 6.5 mm nominal outline, twenty perimeter and four central lands, porous protective top membrane. CO₂ changes infrared absorption→pressure response→microphone sensing, with no moving pump. Distinguish 0–40000 ppm output range from specified accuracy range400–5000 ppm. |

Primary links and evidence: [IM73A135V01](../../reference/memsmic/evidence.md), [ED-29689-000](../../reference/armature/evidence.md), [LCD-2 Classic](../../reference/planar/evidence.md), [BME688](../../reference/bme688/evidence.md), [SCD41](../../reference/scd41/evidence.md). The checker independently read the primary package drawings, specifications and mechanism explanations, including the Infineon SDM architecture and Knowles generic WP03 construction. Evidence summaries alone were not treated as verification.

The Audeze product page does not publish an internal production revision or conductor mask. Its illustration's “Fluxor” wording conflicts with the selected product table; no Fluxor construction is asserted. The named N50/non-Fazor/70 Ω configuration is the reference, with hidden dimensions and bar count explicitly representative. The Knowles WP03 drawing explains a generic mechanism, not the ED-29689 production anatomy. These limitations are also exposed in the app.

## Independent numerical checks

`node scripts/check-expansion-batch2.mjs` checks finite vertices/indices, exact part inventory, moving geometry outside static merges, separation at 0/25/50/75/100%, floor clearance, all control limits/defaults, pause/reset, reduced motion, separation gating, selection/ghost/isolation and exact material restoration. Deforming anatomy is checked against newly generated edge coordinates, including restoration after Reset. Every physical surface must remain in the anatomy inventory; explicitly classified explanatory particles/light/pressure rings must be absent and cannot intercept picking.

Device-specific checks operate on actual geometry and output, rather than trusting metadata:

- Microphone: 3 × 4 mm substrate and maximum package height; open underside acoustic port, four rectangular contacts and circular ground contact. The two membranes move together with fixed rims, clear the stator at maximum drive and retain a stationary stator. A 2 Pa input yields 25.18 mV RMS from the nominal −38 dBV/Pa 1 kHz sensitivity; zero input flattens the illustrative waveform.
- Balanced armature: body dimensions, open front wall and sound spout, fixed coil and magnets, clamped reed root and diaphragm perimeter. Reed tip, formed rod and diaphragm share the same ±0.07 mm enlarged display displacement. Positive terminal-2 phase gives rarefaction as documented.
- Planar driver: actual Ø106 mm outer ring, stationary front/rear arrays, clamped film perimeter and conductor vertices following the same displacement field. Both signs of maximum displayed travel remain clear of the magnet assemblies. Zero drive neutralizes the membrane and waveform.
- BME688: actual 3 mm footprint, cap height within the drawing tolerance, eight physical land locations and real offset vent. Pressure changes membrane deflection with a fixed rim; humidity, temperature and gas inputs affect their own cues. Gas response remains explicitly relative and does not claim CO₂ measurement.
- SCD41: actual 10.1 mm footprint/6.5 mm height, twenty perimeter plus four central pads and open thermal-relief hole. CO₂ monotonically increases the illustrative absorption and delayed microphone amplitude. The microphone remains still before the absorption/pressure phase; duration changes display speed without changing the same-phase response. Reduced motion neutralizes its sensing diaphragm.

Audio waveforms are checked for finite normalized bounds, silence at zero amplitude, increasing spatial frequency as input frequency rises, phase advance during Play, frozen phase on Pause and repeatable Reset. They are illustrative, not measured acoustic or electrical transfer functions.

## Findings corrected

- A BME688 cap refinement mixed geometry with and without UV attributes in a shared merge, causing a build exception. Adding valid loft UVs restored the build and render.
- The microphone's exploded lid initially obscured its upper membrane. Separation was increased. Its SDM seal and bond endpoints were also refined and visually rechecked.
- The added microphone seal initially shared an outer cylindrical surface with the gold rings, producing gold flecks during orbit. Recessing the silicon radius by 0.005 mm leaves the rings proud; a ray-based cross-material separation assertion guards the fix, and close-up orbit renders were rechecked.
- Planar film/trace close-ups revealed small surface-shadow artifacts. The conductor was lifted slightly and its tiny cast shadow removed. Deforming tessellation was reduced while retaining the silhouette and registered membrane/trace motion, improving local X-ray CPU p95 from 12.2 ms to approximately 7 ms.
- BME gas particles and SCD infrared/molecule/pressure overlays were initially included in anatomy as though they were physical surfaces. They now carry an explicit explanatory-effect classification. Anatomy and picking omit them while retaining every actual component surface; the full-context invariant was preserved.
- The shared picked-label anchor now follows triangle deformation, as well as rigid transforms. The integrating agent's independent triangle-weight test covers a known point before and after vertex motion.
- SCD's estimated concealed aperture was reduced to remain completely covered by the notched protective membrane. Mobile model framing and exploded layer spacing were refined after rendered inspection.

## Actual browser checks

Chrome/ANGLE Metal rendered all five devices assembled and exploded in both themes, Play, selection/ghosting, X-ray and close-up orbit views. The actual app at `http://127.0.0.1:4287/` was exercised at 1440 × 1100 and 390 × 844. Every device input and relevant readout was exercised at limits; Reset restored all numeric defaults. The SVG waveform advanced, froze on Pause and remained static with reduced motion. Mobile Controls stayed inline without a modal scrim, reduced the 3D viewport while keeping it usable, and scrolled to the last readout. The picker contained 36 previews. No horizontal page overflow or browser exceptions were observed.

Local evidence: `/tmp/breakboard-proof/batch2/checker-final/` contains model renders and orbit close-ups; `/tmp/breakboard-proof/batch2/app-*.png` records integrated desktop/mobile behavior. `/tmp/breakboard-proof/batch2/frame-profile.json` records timing samples. Temporary proof files are not repository assets.

## Local timing sample

One hundred animated frames per state after twenty warm-up frames, 1000 × 900 canvas at DPR1, Chrome/ANGLE Metal on Apple M5 Max. These are CPU render/update submission times, not certified end-to-end GPU latency or physical-phone measurements.

| Model | Normal p95 | X-ray p95 | Highest X-ray sample |
| --- | ---: | ---: | ---: |
| MEMS microphone | 0.5 ms | 3.1 ms | 3.2 ms |
| Balanced armature | 0.6 ms | 5.3 ms | 5.5 ms |
| Planar driver | 1.2 ms | 6.7 ms | 8.8 ms |
| BME688 | 0.9 ms | 0.8 ms | 0.9 ms |
| SCD41 | 0.7 ms | 2.6 ms | 2.8 ms |

## Integration and offline packaging

The integrating agent ran the complete `npm run check` suite against all 36 registered devices, including the new independent batch gate, and built the standalone HTML. All ten added light/dark assembled WebP previews and ten light-mode gallery PNGs were generated from the actual renderer. Every new gallery PNG was opened and inspected; the microphone pair was regenerated and rechecked after its seal fix.

The final HTML passed `npm run check:offline` in Chrome 156.0.8078.80, Firefox 157.0 and WebKit 27.2. Each browser opened the actual local file with networking disabled and HTTP requests blocked, visited all 36 models, exercised operation/selection/anatomy/reset and inputs, decoded all 72 theme previews, and exported a 2400 px PNG. No HTTP requests or page exceptions occurred.

Artifact: **22,787,390 bytes**, SHA-256 `ea7b90e065cbba108855415feb732474bd1a3d5fcbdffe76a5ce50c002e9014b`. The build updates the README size and model count automatically.

## Limits

No physical specimen was measured or electrically tested. Published package specifications and stated functional architecture were checked; unpublished MEMS structures, exact silicon placement, internal dimensions, winding/trace patterns and manufacturing tolerances remain representative. No acoustic response, sensor noise, heater timing, gas calibration or physical force is certified. Browser emulation does not establish physical-phone performance. This gate covers these five additions, not the remaining thirty or the final 66-device audit.
