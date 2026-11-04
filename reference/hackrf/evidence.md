# HackRF One evidence

Target: Great Scott Gadgets HackRF One **r10**, board without its outer case, with the four documented expansion headers and no optional RF shield. Interactive educational reconstruction in millimetres, with assembled/exploded/anatomy views and PNG export.

| Feature group | Evidence | Treatment |
| --- | --- | --- |
| PCB outline, recesses, drill holes | Supplied geometry: [official KiCad hardware](https://github.com/greatscottgadgets/hackrf/tree/main/hardware/hackrf-one) | Preserve the 120 × 75 mm outline, SMA edge recesses, USB slots, six mounting holes and all published through-hole pad positions. |
| All 437 footprints | Supplied coordinates and contact shapes | Preserve position, rotation and pad dimensions. Body heights and lead bends are representative package envelopes. |
| Main chip identities | Official KiCad values; [revision documentation](https://hackrf.readthedocs.io/en/stable/list_of_hardware_revisions.html) | r10 uses MAX2837 and Si5351C; do not mix with r9's MAX2839/Si5351A. |
| PCB artwork and copper | Original KiCad visible layers | Draw source traces with restrained contrast; omit buried copper and suppress routing in anatomy. |
| RF/clock SMA, USB and switches | Footprints plus standard package construction | Reconstructed open shells, threads, dielectric and contacts; internal proportions estimated. SMA sockets are female with a center socket, not a male pin. |
| RF shield and additional development headers | [Official RF shield documentation](https://hackrf.readthedocs.io/en/stable/rf_shield_installation.html) | Show unpopulated pads. The optional RF shield and extra development headers are not fitted. P9, P20, P22 and P28 are modeled as fitted female headers, per the [official expansion interface](https://hackrf.readthedocs.io/en/stable/expansion_interface.html) and manufacturer photographs. |
| Signal flow and LED activity | Illustrative functional diagram | No RF output, receive processing or physical circuit simulation. |

Fitted expansion headers: P9 is 2 × 8 (16 contacts), P20 is 2 × 11 (22), P22 is 2 × 13 (26), and P28 is 2 × 11 (22): four female headers and 86 contacts in total. Their pads remain on the board during separation; the four connector bodies move as one selectable expansion group. Other debug/test header pads remain unpopulated.

The KiCad project variables identify r10, dated 2023-12-09. Board thickness 1.6116 mm is the KiCad stackup including mask; source README describes nominal 1.6 mm. The canvas source uses `x = X − 120`, `z = Y − 137.5`, with package rotations retained.

## Rebuild

Run from the repository root:

```sh
curl -L 'https://raw.githubusercontent.com/greatscottgadgets/hackrf/main/hardware/hackrf-one/hackrf-one.kicad_pcb' -o reference/hackrf/hackrf-one.kicad_pcb
curl -L 'https://raw.githubusercontent.com/greatscottgadgets/hackrf/main/hardware/hackrf-one/hackrf-one.kicad_pro' -o reference/hackrf/project.json
python3 reference/hackrf/extract-layout.py
```

The project JSON records the r10/date variables; the extractor reads only the PCB. The derived source is `src/hackrf-layout.json`; `src/hackrf.js` reconstructs package bodies from footprint families. If upstream advances the design, compare revision, footprint counts and dimensions before replacing the checked r10 data.

Copyright 2012–2023 Great Scott Gadgets. Source and adaptations use **CERN-OHL-P-2.0**; see `LICENSE.txt`. Modified 2026-11-04: extracted coordinates, visible artwork and pad geometry, grouped functional parts, reconstructed package envelopes, added illustrative separation and motion. All downloadable source data retains this notice through `public/licenses/hackrf-one.txt`.

## Verification

Checked finite geometry, every selectable group, assembled/half/full separation, isolation and floor clearance. Visually inspected assembled, exploded, anatomy and Play captures in Chrome WebGL at 1000 × 900, with no browser errors. Checked the four fitted headers, three female SMA sockets, outward-facing Micro-USB opening, six indicators and grouped small components against official drawings/photos.
