# IBM TS2290 and LTO-9 — hardware and representation boundary

Drive lock: **IBM TS2290, machine type 3580 model H9S**, the LTO-9 half-height SAS product. Internal generation is **ULT3580-HH9**. Cartridge lock: **IBM 02XW568 / 3589-653**, the standard green/teal 18 TB LTO-9 data cartridge, not WORM and not LTO-10.

## Primary evidence

- [IBM TS2290 product sheet](https://www.ibm.com/downloads/documents/us-en/10c31775c5d40001), page 2 front photograph and page 3 model/envelope: 213 W × 58 H × 332 D mm, 3580 H9S and 12 Gb/s SAS. Some rate units in this marketing PDF are internally inconsistent, so the demo does not repeat that table’s rate wording.
- [IBM original hardware announcement 121-086, distributor mirror](https://static6.arrow.com/aropdfconversion/9c139ac8d3d58fb2fb272b0296ea3538efbee09f/us-enus121-086-ca.pdf) and [IBM product configuration](https://www.ibm.com/products/flashsystem/pricing/ke-en/products/cd88498015c6f7053c4be84f3f0281d8): 300 MB/s native, 750 MB/s at assumed 2.5:1 compression. These are drive ratings, not the animated playback speed.
- [IBM LTO Tape Drives guide, 9 May 2025](https://www.ibm.com/support/pages/system/files/inline-files/ibm_lto_drives.pdf), printed page 1 model family; printed page 56 / PDF page 60 cartridge drawing; subsequent media section: single reel, side door, leader pin, write-protect switch, contactless LTO-CM and permanent takeup reel. The diagram and leader reattachment illustrations were visually inspected.
- [IBM LTO Ultrium product guide](https://www.ibm.com/downloads/documents/us-en/115dcc7d82b63586): 02XW568 / 3589-653, 1,035 m BaFe tape and 18 TB uncompressed. The guide calls its shell green; the drive guide calls the same generation teal. The model uses a muted teal-green.
- [Fujifilm June 2025 LTO catalogue](https://asset.fujifilm.com/master/jp/files/2025-06/a0cf0d3bbccea2cc42bab640d0865ae6/catalog_lto_002.pdf), table on PDF page 2, visually inspected: standard 102 × 105.4 × 21.5 mm cartridge; LTO-9 column has 12.65 mm width, 5.2 µm tape and 1,035 m length. **The thickness is used as an illustrative same-generation parameter, not an asserted IBM tape measurement.** Fujifilm chemistry or exact manufacturing construction is not attributed to IBM.

## Geometry truth

| Feature | Classification and boundary |
|---|---|
| Exact drive/cartridge identity and published envelopes | Documented. |
| Front bezel proportions, green cartridge cover, memory corner and leader opening | Photograph/diagram-derived; fine dimensions estimated. |
| Single supply reel, fixed takeup reel, door and leader sequence | Documented system architecture. |
| Cartridge bosses, flanges, hub diameter, ribs and springs | Representative hidden detail. |
| Internal drive deck, head, roller coordinates, threader, electronics and cables | **Representative explanatory transport.** This is not an IBM service assembly reconstruction or an assertion of unpublished TS2290 geometry. |
| 20 mm hub radius | Authored representative dimension. |
| Tape span | Continuous tangent lines and wrapped guide arcs; 12.65 mm width. |
| Pack radii | Derived from conserved tape length, including tape outside the two reels. |
| Head stripes / memory antenna / PCB traces | Representative, not manufacturing masks, pinouts or Gerbers. |

## Functional model

The cycle loads the cartridge, opens its side door, threads the leader, transfers the chosen percentage of tape, rewinds, returns the leader, closes the door and ejects. The physical web is one continuous surface, clipped at the actual moving leader during threading. Common tangents and circular guide contact arcs keep the route taut. Pack area satisfies `L = π(Rs² + Rt² − 2 Rhub²) / thickness + external path length` in millimetres.

The full traversal is deliberately accelerated into a 24-second educational cycle. **Visible reel angles are additionally reduced by 1/2000**, uniformly for both reels, to keep their motion readable. This preserves the relative reel surface-speed relationship while making no claim about real loading times, streaming speed or per-frame tape pitch. The differing display scales are stated in the app’s operation note and readout. Radius changes account for the growing and shrinking pack instead of using a constant angular-speed animation.

Inspect cycle seeks to a stable static stage. Transfer target changes the amount wound to the permanent reel; Cycle speed adjusts playback. Pause preserves state, reset returns to the ejected loading pose, and reduced/separated views freeze physical motion. Separating the model is an explanatory disassembly, not an operable transport state.

## Verification

Reference PDFs and selected images were downloaded and inspected in `/tmp/breakboard-storage`. The maker checks route continuity, guide tangency, length conservation, deterministic seeking, pause/reset and actual rendered states. Independent checker owns final release approval. No source photograph is redistributed as model artwork.
