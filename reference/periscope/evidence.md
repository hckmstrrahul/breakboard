# Folded telephoto module reference lock

Batch-5 maker candidate complete; independent review and integration are pending.

Selected configuration: Samsung Electro-Mechanics **50M 5× Prism Lead Type**, 1/2.5-inch optical format, 0.7 µm pixels, 6P lens, F/2.53, 20.74° field of view, 18.45 mm total track length, 31.76 × 15.4 × 8.55 mm module envelope. This is the left-hand prism-lead specimen on the manufacturer page, not its smaller lens-lead neighbor or a dual-fold 10× module. No public ordering code, PCB revision or silicon stepping is supplied; the source configuration and retrieved page are the available reference lock.

Primary sources, retrieved 5 November 2026:

- [Mobile camera modules](https://www.samsungsem.com/global/product/module/camera-module/mobile-camera-modules.do), “Tele Camera Module — Folded,” first specification column. HTML snapshot SHA-256: `1bd08ea73ca23e274eff4136c134fcfcdbb8feaf5d8fd94f30d26a3f47e866d5`.
- [Manufacturer specimen photograph](https://www.samsungsem.com/resources/images/global/product/mcm_tit_img04.png), left specimen. PNG SHA-256: `6619fb136c10d28a15d7f262f19d9e63e703c58a2c46525416ea8a377e3a1695`.
- [Core camera technology](https://www.samsungsem.com/global/product/module/camera-module/main-core-technology.do): folded optical path and ball-guide actuator principles.

Documented: the specifications above, prism-first folded optical path, two-axis prism-tilt OIS, ball-guide lens-shift autofocus, and stated 30 cm–infinity focus range.

Photo-estimated: casing finish and seams, rectangular entrance opening, flex routing and external proportions not individually dimensioned. The page repeats “Prism Lead Type” in both summary columns, but its labeled photograph and technical table distinguish the two. Only the first column is used.

Representative: six element profiles and spacing, exact optical prescription, coatings, ball count, magnetic actuator geometry, internal carrier and flex detail. No unverified cam path or measured stabilization performance is claimed. Illustrative rays explain the fold and focus direction; they do not constitute a calibrated lens ray trace.

The source photograph and HTML remain local research inputs and are not redistributed. Geometry and surface artwork are original reconstructions.


Implementation: 17 selectable groups expose a real hollow shield and entrance, six separate molded optics, prism and coupled cradle, axial autofocus carriage, four illustrative guide balls, fixed rails/actuators, infrared filter, sensor and flex. The diagram is modeled in millimetres. Focus moves the train away from the stationary sensor for the near scenario; the guide balls travel half the carriage distance. Their nominal surfaces meet the carriage and round rail without overlap. OIS uses the reflection law to choose an ideal compensating prism normal for the two-axis disturbance; the beam-offset readout is geometric illustration, not real stabilized image quality. Pixel count, AF travel, magnetic geometry and optical prescription are not inferred from the public specifications.

Maker verification: checked six-element count, body envelope, actual entrance opening, ordered/nonintersecting lenses throughout focus travel, fixed sensor, guide contacts, compensated/uncompensated ray response, 30/60/120 Hz agreement, finite geometry, pause/reset/reduced motion, separation, selection/ghosting, anatomy and explanatory-effect exclusion. Nine final light/dark assembled/exploded, Play and zoomed orbit/anatomy captures were opened. Final geometry: 74,252 triangles before the viewer's static batching. No independent pass is claimed here.
