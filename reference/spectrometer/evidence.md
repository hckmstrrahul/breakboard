# Mini spectrometer — evidence and reconstruction

A fingertip-sized spectrometer with a concave grating and a 288-pixel detector.

## Supported construction

20.1 × 12.5 × 10.1 mm envelope; ten pins, 2.54 mm pitch and 7.62 mm row spacing; 288 pixels at 14 × 200 µm; 50 × 500 µm etched slit; hollow reflective optical topology.

## Reconstruction limits

Package dimensions, ten pins, pin pitch, 288 pixels and integrated slit follow the manufacturer datasheet. The hollow reflective optical topology follows its structure diagram. Interior heights, curvature, carrier, wire routing and visible grating marks are illustrative; this is not a ray-traced or wavelength-calibrated simulation.

All geometry is generated locally in [the model builder](../../src/spectrometer.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative optical path · cover fades during Play. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [Hamamatsu · C12880MA](https://www.hamamatsu.com/eu/en/product/optical-sensors/spectrometers/mini-spectrometer/C12880MA.html)
- [Hamamatsu · Micro series datasheet](https://www.hamamatsu.com/content/dam/hamamatsu-photonics/sites/documents/99_SALES_LIBRARY/ssd/c12880ma_c16767ma_kacc1226e.pdf)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
