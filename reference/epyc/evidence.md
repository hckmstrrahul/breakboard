# EPYC 9654 — evidence and reconstruction

Twelve compute chiplets surround a central I/O die in a 96-core server processor.

## Supported construction

Twelve eight-core CCDs and a central I/O die; 96 cores and 384 MB total L3. Substrate envelope follows the 72 × 75.4 mm SP5 description in AMD PPR 55901. Die sizes and surface regions are illustrative.

## Reconstruction limits

The twelve-CCD/central-IOD architecture and core/cache counts follow AMD documentation. SP5 substrate size follows AMD PPR 55901. Die footprints, surface functional regions, capacitors, thermal interfaces and lid recess are illustrative reconstructions. The 6096-contact underside is not synthesized from an invented grid. Play is an explanatory fabric diagram, not measured activity.

All geometry is generated locally in [the model builder](../../src/epyc.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative fabric traffic · heat spreader fades during Play. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [AMD · Architecture overview](https://www.amd.com/content/dam/amd/en/documents/epyc-technical-docs/tuning-guides/58015-epyc-9004-tg-architecture-overview.pdf)
- [AMD · EPYC 9004 series datasheet](https://www.amd.com/content/dam/amd/en/documents/products/epyc/epyc-9004-series-processors-data-sheet.pdf)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
