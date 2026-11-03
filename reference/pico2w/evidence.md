# Raspberry Pi Pico 2 W reconstruction

Intended use: interactive educational teardown in the existing web application, assembled/exploded, orbit, top/front, isolated parts and PNG export. Bare board variant without fitted GPIO headers; millimetre geometry, not a manufacturing drawing.

| Feature | Evidence | Treatment |
| --- | --- | --- |
| 21 × 51 × 1 mm PCB, four Ø2.1 mm mounting holes | Supplied dimensions: [official Pico 2 W datasheet](https://datasheets.raspberrypi.com/picow/pico-2-w-datasheet.pdf), mechanical drawing Figure 3 | Exact outline and hole spacing (11.4 × 47 mm); 0.5 mm corner rounding estimated. |
| 40 contacts, 2.54 mm pitch, 17.78 mm row spacing, Ø1 mm drills | Same official mechanical drawing | Exact through-hole centers and count; edge castellations cut into PCB and plated. Pad edge shape is reconstructed. |
| Three SWD pads | Figure 3 and product photo | 2.54 mm pitch, right-of-center position, retained on PCB. |
| RP2350A, flash, regulator, radio and all modeled passives | Official Appendix B, Figure 12 component locations | Centers digitised from the saved `components.png` render, with a 21 mm scale across 343 px; approximate placement precision 0.1–0.2 mm. Silkscreen and visible finish checked against Figure 1 photograph. |
| RP2350 QFN60 and wireless chip below shield | Official functional description and component diagram | RP2350 7 × 7 mm with 60 perimeter contacts; CYW43439 position from Appendix B. No silicon die or hidden traces invented. |
| Metal shield | Official product photograph and SH1 outline in Figure 12 | Hollow five-sided shell reconstructed; top height and seam detail estimated. |
| USB, BOOTSEL, crystal, passives | Official product photograph and footprint diagram | Correct locations and functional identities. Shell interior, lead bends and package heights representative. |
| PCB traces and licensed antenna geometry | Not supplied as usable wireless-specific CAD | Not fabricated. The antenna region remains part of the PCB rather than becoming a fictitious removable part. |
| STEP model | Datasheet §1.1 links the **Pico 2** STEP model, not a faithful wireless-board assembly | Not imported as Pico 2 W. Explicitly recorded to prevent an inaccurate reuse of non-wireless geometry. |

Reference files: original datasheet.pdf, text extraction, and rendered photo/mechanical/component pages. Reference imagery is not embedded in the web model.

Rebuild: geometry is parameterised in `src/pico2w.js`; run `npm run build`.

Maker verification: all 10 groups contain geometry, all vertices finite, assembled/half/full exploded poses follow offsets, parts stay above the app floor, selection/isolation/X-ray visibility work. Root checker independently reviews documentation and rendered views.
