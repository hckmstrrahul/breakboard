# ICM-42688-P evidence lock

Exact device: TDK InvenSense **ICM-42688-P**, 14-lead NiAu LGA. Locked before detailed geometry to **DS-000347 revision 1.9, 2024-11-12**. The plan's v1.5 URL now fails; the current manufacturer product page advertises v1.9. The primary document is served from TDK's own CDN.

- [TDK datasheet v1.9](https://d17t6iyxenbwp1.cloudfront.net/s3fs-public/2026-06/DS-000347%20ICM-42688-P%20v1.9.pdf?VersionId=XL060vOv88u6zsKx9dkBVJEyV452m0eq)
- [TDK product page](https://www.invensense.tdk.com/en-us/products/6-axis/icm-42688-p)
- Download SHA-256: `9c6b57b0a2e45cf0251dd2423878573bd4da46e0cc2faa93dc558c28af51300a`.

| Feature | Basis | Implementation |
|---|---|---|
| Package | Documented, §10.2 pp54–55 | 3.0 × 2.5 × 0.91 mm; 0.85–0.97 mm allowed thickness |
| Substrate | Documented reference dimension | 0.105 mm including terminal seating layer |
| Contact geometry | Documented drawing | Four each on opposing left/right edges plus three each on the other edges; fourteen total; 0.5 mm pitch; 0.25 × 0.475 mm; NiAu |
| Index and marking | Documented, §11 p56 | Pin-one dot; I428P part marking. XXXXXX/YYWW explicitly placeholder lot/date patterns, not a fabricated serial number |
| MEMS/CMOS architecture | Documented, §1.2 and §4.6–4.7 | MEMS bonded to companion CMOS; capacitive acceleration and vibratory Coriolis sensing |
| Six separated MEMS cells | Representative | Deliberate explanatory arrangement, not a verified ICM-42688-P floorplan or die photograph |
| Proof masses, combs, folded flexures, perforations | Representative | Geometric explanation with enlarged electrode clearance and travel; no calibrated microscopic scale claim |
| Wafer cap and mold slice | Representative | Explanatory disassembly of bonded/molded packaging, not a serviceable removable cover |
| CMOS colored regions | Representative | Functional blocks, not an invented transistor-level layout |

## Behavior and coordinate convention

Device X is model +X, device Y is model −Z, and device Z is model +Y, preserving a right-handed system. Pin-one orientation follows §10.1 figure16. Camera orbit never enters the behavior calculation.

The controls specify independent idealized scenarios; they are not a rigid-body trajectory integration. Roll about X and pitch about Y supply gravity projection. Linear acceleration components are additional body-frame inputs:

```
aX = −sin(pitch) + linearX
aY = sin(roll) cos(pitch) + linearY
aZ = cos(roll) cos(pitch) + linearZ
```

Flat stationary therefore reads (0,0,+1)g. Positive 90° pitch reads (−1,0,0)g; positive 90° roll reads (0,+1,0)g. Angular-rate readouts retain the explicit signed inputs in degrees/second. They are independent of the static gravity scenario rather than silently integrating into attitude.

Acceleration masses deflect opposite specific force. For each differential gyroscope, masses are driven in opposition at a **2 Hz display frequency**, with perpendicular sense displacement proportional to signed rate and 90° out of phase with drive displacement. Coriolis sign is `drive velocity × angular rate`: X uses model +Y drive / −Z sense, Y uses model +Y drive / −X sense, Z uses model +X drive / +Z sense. This is qualitative, not a hardware transfer function. Rod flexures retain both anchors through rigid-span articulation, allowing X-ray geometry to stay aligned.

Pause freezes phase. Reduced motion stops drive/sense animation. Direct acceleration and tilt edits remain statically inspectable. Separation stops driven animation. Reset restores all inputs and pose, including a default +90°/s Z-rate example. Axis arrows are explicitly flagged `explanatoryEffect` and never enter physical inventory/picking.

## Maker verification

- Node syntax/build and every geometry attribute finite: passed, 318 renderable meshes after assembly batching.
- Signed flat/90° pitch checks passed; full control/pose checks run before final checker handoff.
- Actual Three.js dark assembled/exploded/Play renders inspected at `/tmp/imu-{assembled,exploded,play}.png`.
- Dark/light assembled, exploded and Play plus390 ×580 mobile states rendered with zero page errors; inspected at `/tmp/motion-final-imu-{dark,light,mobile}-{assembled,exploded,play}.png`.
- Pause, reduced-motion stability, selection-overlay gating, positive90° roll/pitch signs and reset checks passed. Independent checker gate remains required before release.
