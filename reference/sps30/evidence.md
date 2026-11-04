# Particle sensor — evidence and reconstruction

A miniature fan pulls airborne particles through an optical measuring chamber.

## Supported construction

41 × 41 × 12 mm enclosure and laser-scattering principle from Sensirion. Aluminum cover, miniature centrifugal fan, laser, photodetector, filter and flow channel are supported by MistyWest’s physical teardown.

## Reconstruction limits

The 41 × 41 × 12 mm envelope, laser-scattering principle and interface follow Sensirion documentation. Fan, aluminum cover, filter, channel and laser/photodetector arrangement follow MistyWest’s physical teardown. Interior dimensions, impeller blade count, PCB packages and duct details are representative. Sheath-air routing follows the teardown author’s interpretation. Play uses synthetic particles, not measured concentrations.

All geometry is generated locally in [the model builder](../../src/sps30.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative airflow & scattering · cover fades during Play. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [Sensirion · SPS30 datasheet](https://sensirion.com/resource/datasheet/sps30)
- [MistyWest · Original SPS30 teardown](https://www.mistywest.com/posts/teardown-sensirion-particle-matter-sensor/)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
