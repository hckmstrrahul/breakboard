# PW6C reference lock

Selected **HBK / HBM 1-PW6CMR/20KG-1**, 20 kg C3 Multi Range, standard **four-wire 0.35 m** version. Do not mix this with optional six-wire or aligned-output 2 mV/V variants.

Primary evidence:

- [PW6C datasheet B01994](https://www.hbm.com/fileadmin/mediapool/hbmdoc/technical/B01994.pdf), current **B01994 09 E00 04 / 29 August 2024**. 204781 bytes; SHA-256 `7d02514aa955ccbffe048d41631f72969d2278b17f3d9047cd427e94dd4a5b7a`. Pages 1 and 4 visually inspected for dimensions and mounting direction; pp. 2, 3 and 5 for sensitivity, wiring and order code.
- [Official 1.5–30 kg CAD](https://www.hbm.com/fileadmin/mediapool/files/stp/PW6C/pw6c_a_1kg5_30kg.zip), linked by [HBK product page](https://www.hbm.com/3027/pw6c-single-point-load-cell-for-static-applications/). ZIP 154843 bytes SHA-256 `7a230f7ddaeac64b488963d5b8fa0bf98f8adc8fa9cea0043d8f55acc06f969e`; included `pw6c_a_1kg5_30kg.stp`, 862844 bytes, SHA-256 `e18bf4c280a63e95e575225a2ca214eaeccb402c2ad2ade3c66fb385ad55e756`. STEP header dated 2022-08-22. This shared mechanical body explicitly spans the selected 20 kg version.
- [HBK double-bending beam principle](https://cloud.hbkworld.com/en/knowledge/resource-center/articles/how-does-a-bending-beam-load-cell-work): two beams, rigid end coupling, S deformation, parallel load-end translation, opposite strain regions.
- [HBK Wheatstone bridge explanation](https://www.hbm.com/index.php?L=0&id=6768): four strain gauges connected as a bridge.

| Feature | Evidence class | Implementation |
| --- | --- | --- |
| Spring body | Manufacturer CAD | Actual monolithic body, machined double-beam opening, four through bores and countersinks; 130 × 25.4 × 22 mm. The CAD represents M6 bores without a helical thread mesh. |
| Hole pattern | Documented | 106 mm longitudinal pitch, 15 mm transverse pitch; centers 12 mm from ends and 5.2 mm from edges. |
| Body mesh | Source-derived | `src/loadcell-body-data.js` contains CAD faces 0–4, 308–331 and 337–352, converted to world coordinates (−CAD Y, CAD Z + 11, −CAD X), rounded to .0001 mm and tessellated with .08 mm linear tolerance / .15 rad angular tolerance. Long central triangles are subdivided for visible elastic motion; no external CAD runtime required. Original fused label and cable geometry omitted, recreated separately. The end plane beneath the removed fused label is closed with a planar cap; it is not an actual rectangular opening. |
| Surface protection | Documented material / representative thickness | Silicone rubber. Thin visible coatings add .37 mm beyond the nominal CAD body surfaces; exact factory coating thickness unpublished. |
| Four foil gauges | Representative hidden arrangement | Two upper/lower pairs in opposite curvature zones. Fine serpentine grids, bond pads and route positions illustrate a full active bridge; they are not claimed as the actual concealed PW6C gauge map. |
| Electrical wiring | Documented external colors / representative internals | Blue excitation +, black excitation −, white signal +, red signal −; shield to body. Actual hidden compensation components are not invented. |
| Cable | Documented length / arbitrary pose | 350 mm centerline in an open spiral; diameter, fanout and connector internals are estimated. |
| Mount / force arrow | Explanatory overlay | The cable end is fixed and load applied to the opposite end, as the mounting drawing requires. Not counted as delivered physical inventory. |

The model uses 20 × 9.80665 = 196.133 N as full scale and nominal 2.2 mV/V at 5 V, hence ±11 mV raw bridge output at ±full load. The specified ±0.2 mV/V sensitivity spread is disclosed by the source but not simulated. Tare subtracts a user-defined force-equivalent electrical offset and never relaxes the spring. Negative input reverses deflection and signal. Optional load cycling runs at 0.4 Hz for inspection.

Visible deformation is an **enlarged kinematic S bend**, with zero slope at both rigid ends and fixed cable-side geometry. All foil grids, protective sheets and representative interconnects share the same deformation field. It is not an FEA solution. Datasheet says actual nominal displacement is less than .5 mm; the illustrated 3.2 mm at full scale is a display quantity, not a measured compliance claim. Pause freezes pose; Reset starts unstrained at the cycle origin. Separation exposes neutral layers and disables operation.

Bridge node assignment (positive downward force): A = left-upper tension, B = right-upper compression, C = left-lower compression, D = right-lower tension. Exc+ / blue joins A.1–C.2; signal− / red A.2–B.1; Exc− / black B.2–D.1; signal+ / white D.2–C.1. This alternates strain signs around the bridge and gives positive differential output. Four 350 Ω representative arms vary by ±0.0022 × load/full-scale; the exact factory resistance and compensation are unpublished (datasheet permits 300–500 Ω).

X-ray contours use physical creases extracted from the original, unsubdivided CAD surface and co-deformed by the same warp. Long crease segments are subdivided by binary subdivision to ≤12 mm in the bend direction. Interior triangle subdivision needed for deformation is not a machined crease, so it does not become a false drawing line. Other elastic components use their rest crease topology, with each endpoint warped identically to the surface. This avoids per-frame topology reconstruction while keeping outlines registered.
