# RPLIDAR A1 — evidence and reconstruction

A belt-driven optical head sweeps through 360° to measure its surroundings.

## Supported construction

96.8 × 70.3 × 55 mm overall envelope; rotating 360° triangulation head, separate laser and receiver, external motor and belt. 8,000 samples/s is the stated maximum, not the animation speed.

## Reconstruction limits

Overall envelope, rotating triangulation architecture and sample-rate specification follow SLAMTEC documentation. The motor, belt and aperture arrangement are reconstructed from product appearance; internal PCB, bearing, optical mounts and fastener details are representative. The displayed scan is a synthetic example, not live ranging or a physical ray-trace.

All geometry is generated locally in [the model builder](../../src/lidar.js) from one component inventory. Realistic, anatomy, selected, isolated, assembled and exploded views share those exact meshes. These are educational assemblies, not manufacturing drawings or instructions for physically opening sealed devices.

## Play

Illustrative scan & sample returns · slowed rotation. Covers marked as explanatory cutaways fade only during unselected realistic playback; selecting a part restores its normal material. Effects share the app clock, stop with separation, and use a still powered state under reduced motion. No measured optical, electrical or thermal output is claimed.

## Sources

- [SLAMTEC · RPLIDAR A1](https://www.slamtec.com/en/lidar/a1)
- [SLAMTEC · A1 specifications](https://www.slamtec.com/en/lidar/a1spec)

## Verification

Geometry, inventory, full separation range, material restoration, isolation, anatomy registration, finite animation paths and reduced motion are exercised by `npm run check`. Browser review covers assembled/exploded views, Play, labels, selection, isolation and both rendering treatments. The light-mode pairs in [the README gallery](../../README.md#light-mode-gallery) are actual 2400 px exports. No independent sub-agent review or SVG-only audit is claimed for this addition.
