# Lepton 3.5 — evidence and reconstruction

A miniature thermal camera with infrared optics, a calibration shutter, and a microbolometer array.

## Supported construction

11.8 × 12.7 × 7.2 mm envelope with socket; 32-contact interface; 160 × 120 array, 12 µm pitch, 57° horizontal field, infrared optics and calibration shutter.

## Reconstruction limits

The socket envelope, 32 contacts, 160 × 120 detector, 12 µm pitch and 57° field of view follow FLIR documentation. Lens surfaces, die carrier, bond wires, processing packages and shutter actuator are illustrative reconstructions, not internal manufacturer CAD. The Play thermal pattern is synthetic, not measured temperature data.

All geometry is generated locally in [the model builder](../../src/lepton.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative shutter calibration & thermal field. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [Teledyne FLIR · Lepton 3.5](https://oem.flir.com/en-in/products/lepton/?model=500-0771-01&segment=oem&vertical=microcam)
- [Teledyne FLIR · Engineering datasheet, Rev 400](https://groupgets-files.s3.amazonaws.com/purethermal/Lepton%20Engineering%20Datasheet%20Rev%20400%20%28500-0659-00-09%29.pdf)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
