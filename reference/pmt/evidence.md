# Photomultiplier — evidence and reconstruction

A photon detector with a nine-stage electron multiplier inside a glass vacuum envelope.

## Supported construction

28.5 mm nominal bulb drawing, 32.2 mm base, 94 mm maximum height; side-on 8 × 24 mm photocathode, nine circular-cage stages and eleven base pins.

## Reconstruction limits

The side-on optical geometry, active area, nine circular-cage stages, eleven contacts and maximum envelope follow Hamamatsu R928 documentation. The stamped electrode profiles, feedthrough routing, glass wall and exploded support structure are explanatory reconstructions, not manufacturer CAD. Play depicts an electron cascade at an illustrative rate.

All geometry is generated locally in [the model builder](../../src/pmt.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative electron multiplication · slowed down. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [Hamamatsu · R928 dimensions & basing](https://www.hamamatsu.com/content/dam/hamamatsu-photonics/sites/documents/99_SALES_LIBRARY/etd/R928_R928P_R955_R955P_TPMS1091E.pdf)
- [Hamamatsu · PMT principles](https://www.hamamatsu.com/eu/en/product/optical-sensors/pmt/about_pmts.html)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
