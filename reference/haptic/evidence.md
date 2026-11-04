# C10-100 reference lock

Manufacturer: Precision Microdrives. Part: **C10-100**, datasheet **R006-PROD**, 2024; mechanical drawing **V0023**. Checked 2026-11-05.

Primary sources:
- [C10-100 datasheet](https://www.precisionmicrodrives.com/datasheets/C10-100%20-%20datasheet-006.pdf), especially physical/specification tables and drawing on PDF page 5.
- [Manufacturer explanation of linear resonant actuators](https://www.precisionmicrodrives.com/understanding-horizontal-linear-resonant-actuators), for axial LRA operating principle, **not exact C10-100 internals**.

PDF SHA-256: `18130003355e6d85c1fa2b2fc2af7dfa536b5b2cb4ddd764ef8d8cf7e5eee103`. Source PDF is not redistributed.

| Feature | Evidence class | Implementation |
| --- | --- | --- |
| Body and adhesive area | Documented | Ø10 × 3.7 mm body; Ø9 mm mounting pad. |
| Drive | Documented | 175 Hz rated frequency; 2 V RMS. Resonance is specified separately as 174 ±8 Hz. |
| Leads | Documented with visual abbreviation | Two AWG32 leads; source length 100 ±2 mm. Model shows shortened leads. |
| Closure, cup wall and engraving | Estimated | Exterior inferred from drawing. Text is an identifying visualization. |
| Mass, magnet, coil and suspension | Representative | Axial moving-magnet mechanism; four curved flexures and coil turn count do not claim production anatomy. |

The body uses millimetres. Moving groups share the same axial travel; outer spring anchors remain fixed. Maximum displayed travel is ±0.15 mm. Collision checks must inspect the full travel envelope. Operation is slowed 50× and enlarged, with a simple illustrative resonance envelope rather than measured output. Reset restores 70% amplitude, 175 Hz and zero travel; paused and reduced-motion states do not advance phase.

Tap-pattern control adds continuous, single-pulse and double-pulse illustrations. The latter repeat over a 2.4-second display cycle with smooth 0.5-second pulse envelopes. These are explanatory drive patterns, not a manufacturer haptic-driver waveform or measured transient response. Pattern and phase freeze when paused and reset with the model.
