# NeoMatrix 8×8 evidence

Target: Adafruit NeoPixel NeoMatrix 8×8 RGB, **v2 WS2812B revision**, not the later SK6812 RGBW design. Interactive millimetre-scale educational model, PNG export through the existing viewer.

| Feature group | Evidence | Treatment |
| --- | --- | --- |
| Board outline and holes | Supplied dimensions/geometry: [official EAGLE repository](https://github.com/adafruit/Adafruit-NeoPixel-8x8-Matrix), `Adafruit_NeoMatrix_8x8 v2.brd` | Exact 71.12 × 71.12 mm outline and twelve Ø2.8 mm mounting holes. |
| 64 pixels, support components, input/output pads | Supplied PCB coordinates and footprints | Preserve centers, rotations, 8.89 mm pixel pitch, four-terminal WS2812B footprint and 2.54 mm input/output contact pitch. |
| Copper and printed artwork | Supplied visible-layer EAGLE artwork | Rasterized at 2048²; copper is suppressed in anatomy to keep the drawing legible. |
| LED package | Photograph/footprint reconstruction | 5 × 5 mm 5050 white case with optical cup; height and cup profile are representative. No invented die, driver silicon or bond-wire details. |
| Board thickness | Unspecified in PCB file | Assumed 1.6 mm; called out in the model's accuracy note. |
| Color pattern | Illustrative | Play drives each of 64 materials independently; not a physical brightness, protocol or power simulation. |

## Rebuild

Run from the repository root:

```sh
curl -L 'https://raw.githubusercontent.com/adafruit/Adafruit-NeoPixel-8x8-Matrix/master/Adafruit_NeoMatrix_8x8%20v2.brd' -o reference/neopixel/matrix-v2.brd
python3 reference/neopixel/extract-layout.py
```

The script writes `src/neopixel-layout.json`. `src/neopixel.js` builds all views from that inventory.

Source hardware and adapted geometry are **CC BY-SA 3.0**, © Adafruit Industries. See `LICENSE.txt`. No optional headers or diffuser are shown as fitted hardware; input/output pads remain attached to the board.

## Verification

Checked finite geometry, all five selectable groups, assembled/half/full separation, isolation and floor clearance. Visually inspected assembled, exploded, anatomy and Play captures in Chrome WebGL at 1000 × 900, with no browser errors. Counted 64 independent pixel materials and twelve mounting holes; checked the source pitch, connector pads and component positions.
