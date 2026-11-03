# BeagleBone Black Rev C teardown evidence

Intended use: interactive educational teardown in the existing Three.js viewer, desktop and mobile. All view presets derive from the same millimetre model. Exploded positions explain functional groups, not a safe physical desoldering procedure. The source itself is `src/beaglebone.js`.

| Feature group | Evidence classification | Source / implementation |
| --- | --- | --- |
| Board envelope and corner radii | Supplied dimensions | Official dimensioned drawing, saved as `dimensions.jpg`: 3.400 × 2.150 in; R0.250 at power/Ethernet end and R0.500 at USB end. Model uses 86.36 × 54.61 mm and 6.35 /12.7 mm radii. |
| Four mounting holes | Supplied locations; diameter reconstructed | Drawing coordinates .575 /3.175 in long-axis and .125 /2.025 vs .250 /1.900 in transverse. Hole diameter3.175 mm is representative, not tolerance-certified. |
| PCB thickness and layers | Supplied specification | Official mechanical page: .062 in thick,6 layers. |
| Cape headers P8/P9 | Supplied electrical count / pitch; reconstructed position | Two2×23 female headers,92 total contacts at2.54 mm pitch. Socket cavities and through holes exist. Bank positions reconstructed against the dimensioned footprint and product photograph. |
| AM3358, DDR3L, eMMC, LAN8710A, TPS65217C, TDA19988 | Supplied identity/function; photograph-derived placement | BeagleBoard system reference and official top photo. BGA/QFN envelopes, marking detail and heights are reconstructed, not CAD-derived. |
| Top RJ45, USB-A and5V barrel jack | Photograph-derived visible geometry | Official top photo. Open port interiors are representative reconstructions. Counts of8 RJ45 and4 USB-A contacts are preserved. |
| Underside Mini-B, micro-HDMI and microSD | Photograph-derived visible geometry | Official bottom photo. Metal shells, cavities and contacts reconstructed. No card inserted. |
| Three switches and status LEDs | Photograph-derived visible geometry | S1 reset/S2 boot/S3 power and four user LED positions follow visible board layout. |
| SMD components | Photograph-derived approximate placement | Representative visible passive fields and supporting packages; one selectable group. No claim of complete BOM count or electrical values. |
| Silkscreen | Reconstructed markings | Key product/interface labels recreated as text, no arbitrary trace texture. |
| Copper routes, chip internals, buried PCB layers | Hidden/unspecified | Omitted. |

Sources:
- https://docs.beagleboard.org/boards/beaglebone/black/ch09.html
- https://docs.beagleboard.org/boards/beaglebone/black/ch10.html
- https://docs.beagleboard.org/boards/beaglebone/black/ch04.html
- Official photos: https://docs.beagleboard.org/_images/DSC00481.webp and https://docs.beagleboard.org/_images/DSC00484.webp
- Official drawing: https://docs.beagleboard.org/_images/image88.jpg

The official mechanical-page prose contains an inconsistent conversion (3.5 ×2.15 inches described as86.36 ×53.34 mm). The dimensioned drawing explicitly gives3.400 ×2.150 inches, so this reconstruction follows the drawing rather than that prose.

Reference documents and photos © BeagleBoard.org Foundation, CC BY-SA4.0. The reconstructed BeagleBone geometry is distributed under CC BY-SA4.0 with attribution. Reference images are used to verify the geometry, not embedded as surface textures.

Rebuild: `npm run build`. Functional checks: `npm run check`, plus the board checks in `scripts/check-collection.mjs` when integrated. Maker checked14 nonempty selectable groups, finite geometry,86.36 ×54.61 envelope, poses at0/.5/1, isolation/X-ray and floor clearance. Root performs assembled/exploded browser review; independent maker-checker assigned to another agent.

Independent checker corrections: replaced approximate quadratic corner curves with true circular arcs; corrected LAN8710A/TPS65217C/TDA19988 from gull-wing leads to flush QFN pads; underside8-pin packages now use two rows of4 SOIC leads. Checker: maker_jetson_orangepi.

Second checker placement correction: the three underside SOIC8 bodies (U4/U6/U8 in the photograph) are now placed at photo-calibrated local bottom-view coordinates(-29.5,-10),(1.3,-16.4),(35.3,-12.7) mm. The underside group flips localZ for the top-view board coordinate system. Their electrical identities remain unspecified. Checker: maker_pico_nano; root assembled/exploded visual pass recorded.
