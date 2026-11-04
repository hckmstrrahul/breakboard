# TI DLP6500FYE — package and magnified mechanism

This is an educational 3D illustration, not a fabrication or manufacturing model. It deliberately uses two scales: a package measured in millimetres at the left, and a permanently labelled 600× mechanism detail at the right. The detail is not a component that physically sits beside the package.

| Feature | Evidence | Treatment |
| --- | --- | --- |
| 35 × 32.2 mm ceramic outline, 2.95 mm substrate, chamfer and locating bores | Supplied dimensions: TI drawing 2511543 revision E, sheets 1–4, appended to [DLP6500FYE datasheet](https://www.ti.com/lit/gpn/dlp6500fye) | Preserve the package dimensions, locating centers, blind round/slot bores (1.865 mm depth), central optical cavity and base thickness. Colors are reconstructed. |
| 350 pins; 1.27 mm grid; Ø0.305 × 1.4 mm pins | Supplied dimensions and population: drawing sheet 4 | Exact 350-pin inventory, with the 14 documented omitted edge positions and the central unpopulated rectangle. Pins are cylinders with braze collars. AA25 is retained because it is drawn mechanically, although the revised electrical table removes it from VOFFSET. |
| Window 21.276 × 14.063 × 1.05 mm and aperture 17.038 × 10.360 mm | Supplied dimensions: drawing sheets 1 and 3 | Preserve envelope, offset, aperture and visible clearance to active array. Glass is translucent in realistic and anatomy views; opaque aperture coating remains separate. Seal meniscus is estimated. |
| Array 1920 × 1080; pitch 7.56 µm; active area 14.5152 × 8.1648 mm | Supplied specifications: datasheet sections 6.10–6.12 | Preserve actual active-area envelope. The package-scale face is continuous reflective material because its true pixel pitch is below normal view resolution. It is not misrepresented by an oversized 4 × 4 grid. |
| Boundary mirrors, 0.1058 mm per edge | Supplied dimensions: drawing sheet 3 | Thin perimeter boundary around the active face. Individual boundary pixels are not resolved. |
| Underside 15 × 10 mm symbolisation pad | Supplied dimensions: drawing sheet 4 | Separate metal pad, grounded as the drawing notes specify. Marking is illustrative product identification, without a fabricated serial number. |
| Magnified 4 × 4 patch, 600× geometric pitch and 92% fill factor | Supplied pitch and fill factor; independently constructed illustration | Pitch 4.536 model mm corresponds to 7.56 µm × 600. Mirror side is derived from the documented fill factor. Permanent text states “600× DETAIL / ILLUSTRATIVE MECHANISM”, including when overlay labels are off. A separate “PACKAGE · 1×” presentation plaque identifies the unscaled package. The plaques are not physical device parts and are outside the specified envelope. |
| Mirror ±12° states about diagonal axis | Supplied behavior: datasheet and [DMD101 introduction](https://www.ti.com/lit/an/dlpa008b/dlpa008b.pdf) | Sixteen diagonal-axis pivots, ±12°, with slowly alternating state in Play. This is intentionally slowed, not a claim about device switching frequency. |
| Torsion beams, support posts, landing features, address electrodes, CMOS plane | Conceptual construction based on DMD101; the DLP6500 fabrication stack is not disclosed | Explicitly illustrative shapes and thicknesses. No claim of exact hinge/yoke topology, transistor positions or buried electrical routing. All detail descriptions and board accuracy notes identify this limitation. |

## Proof and rebuild

- `src/dlp.js` contains the complete offline procedural geometry and pin inventory.
- `npm run build` produces the application and standalone HTML.
- `npm run check` exercises registered geometry and UI contracts.
- Builder checks confirm exactly 350 pins, 16 separate moving mirrors, finite vertices, 10 nonempty selectable groups and floor clearance for 0/25/50/75/100% separation.
- WebGL render inspection covers assembled, exploded and anatomy states at an 800 × 739 px viewport. Mirror transforms are consumed by the common operation controller, preserving selection and anatomy correspondence.

TI source PDFs are not bundled or redistributed. The model and diagrams are independently constructed from dimension/specification facts. TI and DLP names identify the hardware represented.
