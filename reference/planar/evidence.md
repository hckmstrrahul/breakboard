# Audeze LCD-2 Classic planar driver — evidence lock

Retrieved 2026-11-05. Named reference configuration: **LCD-2 Classic, SKU100-LC-1017-00, non-Fazor, 106mm, N50 magnets, nominal70Ω**. This model is the driver module, not the complete headphones.

**Revision limit:** Audeze does not expose an internal manufacturing revision or production CAD for this SKU in the selected sources. The named non-Fazor configuration is locked; unpublished internal dimensions/counts remain explicitly representative. The model is not presented as a serialized specimen teardown.

## Primary references

- [Audeze LCD-2 Classic product page](https://www.audeze.com/products/lcd-2-classic): SKU, transducer size, magnet material, non-Fazor specification, impedance, offset-array description and manufacturer illustrations.
- [Audeze planar-magnetic technology](https://www.audeze.com/blogs/technology-and-innovation/planar-magnetic-technology): conductor carried by the film and distributed driving-force principle.
- [Manufacturer LCD-2 Classic cutaway linked by the product page](https://i.shgcdn.com/a7bc7fa9-bba1-439d-8b34-c891d090fba9/-/format/png/-/preview/3000x3000/-/quality/lighter/). Download SHA-256 `0a8baec409da871c7434ef21f936ef281ee9aa14a3902c5369d05562688ac505`,890,716bytes.
- [Manufacturer exploded illustration linked by the product page](https://i.shgcdn.com/b2053851-684a-4899-ba94-fc8a588d60c1/-/format/png/-/preview/3000x3000/-/quality/lighter/). SHA-256 `c235dd75fc2a7d3bfbab8678ed22cd86d7fff5104a39e36a9c113e5314dcbc88`,5,060,260bytes. It is a stylized architecture illustration, not dimensioned production CAD.

**Discrepancy:** the cutaway image calls its array “Fluxor”; the product specification calls it a proprietary offset array. The model claims N50 and an illustrative offset arrangement, and does not assert Fluxor construction or a particular magnetization recipe. It excludes Fazor waveguides.

Sources are linked, not redistributed or mapped onto the model. The serpentine pattern and surfaces are original procedural geometry.

## Evidence map

| Feature | Evidence level | Model / limitation |
| --- | --- | --- |
| Transducer diameter | Documented | 106mm nominal. |
| N50 / non-Fazor /70Ω | Documented | Exact named product configuration; no Fazor wedges are added. |
| Circular open construction | Photo-estimated | Frame and fastener arrangement follow the manufacturer's illustrations. |
| Two-sided magnet arrangement | Representative | Explains a diaphragm between stationary arrays; six bars on each side are a model choice, not a verified production count. |
| Offset/bar spacing and magnetization | Representative | Fixed, open bar arrays with a small offset; no solved magnetic field or proprietary magnetization claim. |
| Conductor pattern | Representative | Continuous serpentine ribbon follows the film. It is not the production etch mask or inferred from another LCD model. |
| Frame thickness, spacers and hardware | Representative | Proportions/clearances chosen coherently inside an open driver assembly; exact production values unavailable. |
| Film thickness and travel | Representative, enlarged | Anchored perimeter, nearly pistonic center, smooth flexible boundary. Thickness/motion are visible explanatory scale. |
| Termination | Representative | Two contact tabs and flexible leads connect to the two actual ends of the continuous modeled conductor. |

## Behavior

Frequency and relative drive level control the membrane, trace and attached lead ends together; magnet arrays remain fixed. The outer membrane edge stays clamped. Maximum displayed excursion remains clear of both magnet faces. Motion runs at1/400 input frequency and is enlarged, with a normalized2ms waveform in the UI. Zero drive neutralizes movement; Pause holds phase; Reset restores neutral/defaults; reduced motion is static. No SPL, impedance variation, film stress, actual excursion limit or frequency-response prediction is made.
