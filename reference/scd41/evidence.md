# SCD41 reference lock

Sensirion **SCD41-D-R2**, **SCD4x datasheet version 1.7, April 2025**. Checked 2026-11-05. Bare sensor package; no carrier board.

Primary sources:
- [SCD4x datasheet v1.7](https://sensirion.com/media/documents/48C4B7FB/67FE0194/CD_DS_SCD4x_Datasheet_D1.pdf): package drawing p24, pad assignment p5, functional blocks p1.
- [Sensirion PASens principle article](https://sensirion.com/products/product-insights/specialist-articles/breaking-the-size-barrier-in-co2-sensing): selective absorption, pressure rise and microphone sensing; generic functional component illustration.
- [SCD41 product page and package photograph](https://sensirion.com/products/catalog/SCD41).

PDF SHA-256: `9bbb142d27ba1b92f6701d88a3994c99b1b6a79f2036d022076f74cadc1a3f86`. No source image/PDF is redistributed.

| Feature | Evidence class | Representation |
| --- | --- | --- |
| Package | Documented | 10.1 ×10.1 ×6.5 mm envelope, 0.8 mm substrate. |
| Pads | Documented | 20 perimeter pads plus four central pads connected as ground terminal 21; 24 physical pads. |
| Relief hole / orientation | Documented | Ø0.25 mm hole; pin-1 marker and notched protective membrane. |
| Cap and membrane finish | Photo-estimated | Rounded hollow can, white porous top membrane, estimated thickness and hidden exchange aperture. |
| Functional blocks | Documented function | MEMS IR emitter, microphone, signal processor, integrated SHT4x. |
| Detailed internals | Representative | Internal sizes, exact placement, filter mounting, electrodes, diaphragm and bond routing. Generic published diagrams are not claimed as an exact teardown. |

The interaction follows **infrared excitation → CO₂ absorption → pressure rise → microphone sensing → relaxation**. The source describes absorption around 4.26 µm. Colored light, enlarged molecules, pressure rings and diaphragm motion are explanatory. The microphone detects chamber pressure; it does not pump gas. Gas exchange is passive diffusion.

CO₂ input is limited to 400–5000 ppm, the documented accuracy range; the larger digital output range is not claimed as equally accurate. The normalized absorption readout is illustrative, not a calibrated transfer function. The adjustable 2–8 second display cycle is educational timing rather than actual device modulation or update timing. Pause freezes the sequence; reset restores 800 ppm and a 4-second display cycle. Reduced motion retains static explanatory cues without oscillation.
