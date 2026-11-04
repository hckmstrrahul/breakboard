# Panasonic EKMB1101111

## Locked configuration

Standard-detection white lens, 1 µA digital-output PaPIRs, **EKMB1101111**. Current manufacturer reference specification at the linked URL is **Rev 7.1**, footer DKC-D09-D01,24,260401. Search indexes still describe the older 6.4 document; this model uses the downloaded 7.1 bytes. Intended use is an interactive explanatory teardown, not a manufacturing drawing or a calibrated motion-detector simulator. Hardware geometry uses millimetres; target distance is deliberately compressed.

Primary evidence, inspected 2026-11-05:

- [Reference specification](https://industrial.panasonic.com/cdbs/www-data/pdf/EWA0000/bltn_eng_ekmb110611_ast-ind-247372.pdf), 488906 bytes, SHA-256 `98633e73b7d287a0fca782a41454f1cb2421a275a7c8cb605311766377390955`. Rendered pages 1–2; read electrical timing and polarization diagrams.
- [Exact product](https://na.industrial.panasonic.com/products/sensors/motion-displacement-sensors/series/149462/model/149468).
- [Panasonic EKMB architecture](https://na.industrial.panasonic.com/products/sensors/sensors-automotive-industrial-applications/pir-motion-sensor-papirs/series/149462) documents a four-element pyroelectric array and single-chip ASIC.

| Feature | Evidence kind | Implementation |
| --- | --- | --- |
| Lens envelope | Documented dimensions | Ø11 base, Ø9.5 crown at 13 mm, domed overall 14.4 mm; hollow molded skirt. |
| Three leads | Documented dimensions and bottom-view drawing | Ø0.45, 4.6 mm exposed length, Ø5.08 pitch circle; Vdd/OUT/GND positions follow the drawing. |
| White color / marking | Documented / reconstructed appearance | White opaque lens and PaPIRs family marking; no fabricated serial number. |
| Inner lenslets | Representative detailed reconstruction | Fine grooves and segmentation inside the cap explain Fresnel action. The 64 detection zones are **not** represented as 64 physical lens facets. Exact groove prescription is unpublished. |
| Can / window / carrier | Representative hidden structure | Smooth hollow metal can with a true window, filter, ceramic carrier and supports. Not an exact internal cross-section. |
| Pyroelectric quartet and ASIC | Documented architecture, representative geometry | Four electrodes and a plain ASIC die with terminating bond wires; no transistor map. |
| Target / rays / zone fan | Explanatory effect | Tagged separately from physical inventory. Radiation travels from the warm target to the lens. No radiation is emitted by the PIR. |
| Response | Representative scenario with documented timing | Changes in alternating zone input drive an illustrative high-pass response. A stationary warm target settles. Typical 2.6 s hold / 1.3 s mask follow the reference timing chart. Initialized warm; power-on stabilization is intentionally omitted and disclosed. The range scenario allows 5 m, or 7 m at ≥8°C contrast, rather than predicting actual sensitivity. |

Pause freezes phase and output; reduced motion freezes the scene; disassembly hides explanatory effects. Reset returns the default warm-sensor scenario. Lens rotates only during explosion to expose the inner optics. No real output loading or electrical safety circuit is modeled.

Maker proof: `node /tmp/breakboard-ranging/proof.mjs` (actual Three.js renderer; desktop assembled/exploded/Play, both themes) and `/tmp/breakboard-ranging/check.mjs` (behavior and real aperture/clearance checks). Mobile proof uses `/tmp/breakboard-ranging/mobile-proof.mjs`. Root owns integrated catalogue/build/preview tests. Proof assets are local to `/tmp/breakboard-ranging`; independent checker uses `/tmp/breakboard-proof/batch3`.
