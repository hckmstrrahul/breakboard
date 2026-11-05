# RealSense D455 — evidence lock

## Selected hardware

Original D455 **K83122-110**, product code 82635DSD455 / material 999WCT, BMI085 configuration. This is not D455f, D456 or D457 and is not the earlier K83122-100/BMI055 configuration. Exterior drawing **MD0645501 Rev 02**. D450 stereo module K83121-100/101; D4 V3 functional architecture.

Primary manufacturer sources read:

- [D400 family datasheet, Revision 023, March 2026, document 337029-017](https://www.realsenseai.com/wp-content/uploads/2026/03/RealSense-D400-Series-Datasheet-Mar-2026.pdf), especially pp38,41,48,51,64,69,134,136,142. The printed document revision and number differ; both are retained verbatim.
- [Official CAD index](https://dev.realsenseai.com/docs/cad-files/): camera archive `/download/41950` contains distinct D455_Solid.SLDPRT and D455f_Solid.SLDPRT; module archive `/download/41956` contains D450_Module.SLDPRT. Files were downloaded; these SolidWorks files were not tessellated or treated as a hidden assembly source.
- [RealSense SDK projection guide](https://github.com/realsenseai/librealsense/wiki/Projection-in-RealSense-SDK-2.0): pinhole projection and calibrated intrinsics distinction.

## Feature truth

| Feature | Status | Implementation |
|---|---|---|
| 124 ×29 ×26 mm enclosure | Documented | Rev02 drawing nominal envelope. |
| 95 mm stereo baseline | Documented | Optical X centers −47.5/+47.5; no animated baseline. |
| Four optical centers | Documented | Right stereo −47.5; RGB −11.5; projector +10; left stereo +47.5, as viewed from the front. |
| Two M4 bores, 95 mm centers; bottom 1/4-20 and USB | Documented centers / representative thread detail | Genuine apertures, not dark disks. |
| D450 119.5 ×17.4 ×10.53 mm | Documented outline | PCB/stiffener/ears and optical stations separate. PCB layer thickness and hidden contours are estimated. |
| OV9782 1280×800, f/2, 1.93 mm nominal, 90° HFOV | Documented role/specification | Fixed optical axes; representative glass/die geometry. |
| D4/BMI085/ISP/flash/regulation | Documented roles | Representative behind-shell placement and discretes. This is not a released D455 placement file or an assertion that a stock D4 board fits in this arrangement. |
| Flex and 50-contact interface | Documented interface / representative route | Two visible 25-contact rows; routed ribbon is explanatory reconstruction. |
| Window transmission, lens prescriptions | Representative | No claimed glass prescription, coating stack or factory transmission. |

## Functional model

The optics are stationary. Play moves an explanatory checker target and displays two **non-hardware image panels**. A rectified pinhole model uses width1280, cx640 and **nominal fx640 px**, inferred from90° HFOV; it is not device calibration. With B=.095 m and target depth Z, disparity d=fxB/Z and inferred depth fxB/d. Image-space target X=Ztanθ. The viewed-front world X axis is the opposite of camera image X, so visual target motion is mirrored into the model’s front-facing coordinate system. Target range is compressed for display; numeric calculations use real meters. The projector supplies stereo texture; no time-of-flight measurement is claimed.

Controls: depth0.6–6m; bearing±20°; optional±12° sweep. Pause freezes target and samples. Manual controls work paused. Reset restores2m/0°/sweep and phase0. Explanatory objects are tagged and excluded from anatomy/picking and hide when separated, selected or isolated. Reduced motion freezes the demonstration.

## Verification

Maker rendered actual shared Three.js stage in dark/light, assembled/exploded/Play and close view, with no browser errors. Numerical and mobile checks are recorded in `/tmp/breakboard-optics`; independent checker owns release approval. Renderer images are verification artifacts, not a source of hardware truth.
