# Arduino Nano V3.3 reconstruction

Intended use: interactive educational teardown in the existing web application, assembled/exploded, orbit, top/front, isolated parts and PNG render export. Geometry is in millimetres, not a tolerance-certified manufacturing model.

| Feature | Evidence | Treatment |
| --- | --- | --- |
| Outline 43.18 × 17.78 mm, four Ø1.651 mm holes | Supplied geometry: official NanoV3.3.brd in the [Arduino CAD archive](https://docs.arduino.cc/static/e3c4fe1f9bee7ec63df398422b3257f4/A000005-cad-files.zip) | Exact CAD outline, not the rounded 45 × 18 mm marketing envelope. |
| Copper, pads, component centers/rotations and both mounting sides | Same official EAGLE file | Extracted by `scripts/prepare-nano.py`, mirrored underside placements retained. No fabricated traces. |
| ATmega328P VQFN32, FT232RL underside, regulator, resonator, reset and four LEDs | EAGLE package/library names and values, verified against official [front and back product photographs](https://store.arduino.cc/products/arduino-nano) saved as front.jpg/back.jpg | Footprint envelopes and contact pads preserved; package bodies and lead bends reconstructed. |
| 30 downward header posts, 2.54 mm pitch, 15.24 mm row spacing | EAGLE header footprints and product photographs | Exact contact count/spacing. Plastic spacers below PCB; pin length and chamfers estimated. |
| Six-pad ICSP footprint | Product photographs and J4 footprint | Remains unpopulated, with through-holes and plated pads. No fitted ICSP header invented. |
| Mini-B connector | EAGLE footprint and product photograph | Open silver shell, five contacts, back insulator and shell attachment pads; interior detail and height representative. |
| PCB thickness and package heights | Unspecified in EAGLE layout | PCB assumed 1.6 mm; body heights representative and disclosed in the app. |

License: official hardware and adapted Nano geometry retain CC BY-SA 4.0; original notice is `cad/A00005-cad-files/License.txt`. Product photos are reference-only and are not embedded into the app.

Rebuild: `python3 scripts/prepare-nano.py`, then `npm run build`.

Maker verification: instantiated with Node/Three.js; all 10 groups contain geometry, all vertices finite, assembled/half/full exploded poses match part offsets, minimum height stays above the app floor, isolation and X-ray visibility work. Root checker performs independent source review and browser visual checks.
