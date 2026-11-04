# Sony / Prophesee IMX636-AAMR-C reconstruction

## Configuration and source lock

- **IMX636-AAMR-C**, ceramic LGA156. Locked to the manufacturer's **2024 product brief** and Sony's **9 September 2021** architecture announcement; public documents expose no silicon stepping.
- [Prophesee 2024 product brief](https://www.prophesee.ai/wp-content/uploads/2024/09/IMX636-AAMR-C-Product-Brief-2024.pdf), 2 pages. SHA-256: `25051887163bd8b34366d18c323f73f279197ecdcc8cffa97b8bcfa62ad0343d`. Full datasheet is available by request; undisclosed mechanical dimensions are not asserted exact.
- [Sony 9 September 2021 announcement](https://www.sony-semicon.com/en/news/2021/2021090901.html). HTML snapshot SHA-256: `a8fb7b1ce77741da9933c186a51132b3b1feefc0233392962790c64bb47f5fba`. Documents 13 × 13 mm ceramic package, B&W array, Cu-Cu pixel-over-logic stack and nominal natural-log contrast threshold 25%.
- [Prophesee product page and photographs](https://www.prophesee-cn.com/event-based-sensor-imx636-sony-prophesee/).
- [Front photo](https://www.prophesee-cn.com/wp-content/uploads/2025/08/IMX-636-Front_Web.png), SHA-256 `4178eae2670c0edf891d75ca4db951dad4acc2e9505a1057208572453ae67245`.
- [Back photo](https://www.prophesee-cn.com/wp-content/uploads/2025/08/IMX-636-Back_Web.png), SHA-256 `9bb353f8b2f20a4247dbb7492fb8bcf29855d78fd1485d2bd8b45cfe9b43b56d`.

## Evidence classification

| Feature | Basis | Model treatment |
|---|---|---|
| Ceramic width / depth | Documented | 13 × 13 mm |
| Height, cavity, wall, glass and die outline | Photo-estimated / representative | About 1.25 mm height; not released dimensions |
| Active array | Documented 1280 × 720 at 4.86 µm | Derived active area 6.2208 × 3.4992 mm |
| Optical color filter | Documented B&W | No Bayer array; interference colors are material appearance |
| LGA contact count | Documented 156 | Exactly 152 round pads plus four corner pads |
| Contact layout | Counted from manufacturer back photograph | 14-column × 15-row grid with central opening and corner replacements; estimated 0.8 mm pitch and Ø0.5 mm rounds |
| Corner pads | Manufacturer photo | Four approximately 1.6 mm squares; one chamfered index corner |
| Purple ceramic, gold seal, four-sided bonds | Manufacturer photo | Silhouette/materials preserved; wire number, routing and gold alloy not asserted exact |
| Pixel above logic, Cu-Cu bond | Documented | Two chips and interconnection sheet |
| Bond microstructure, circuit floorplan, internal regions | Representative | Enlarged patterns; no actual transistor or Cu contact count claim |

Contact count derivation: four top/bottom rows of ten = 40; four full rows of fourteen = 56; seven middle rows of eight side contacts = 56; four corners = 4. Total **156**. These are physical contacts, with no fabricated electrical pin assignment.

## Causal event model

A 32 × 18 demonstration grid samples a synthetic rectangular target, corresponding to 40 × 40 native pixels per display cell. Target/background intensity ratio, size, position, movement speed and log threshold are explicit controls. Cell intensity uses overlap area at the target boundary. Each cell stores a log-intensity reference. If `abs(log(I) - reference) >= C`, it emits the corresponding ON or OFF count, then advances its reference by that whole number of signed thresholds. It is **not a conventional frame animation**: unchanged brightness produces zero new events.

Default `C = 0.25 ln` follows Sony's nominal natural-log contrast. This is not falsely interpreted as exactly a 25% linear intensity increment. Native output is x, y, timestamp and polarity; displayed coordinates are representative native cell centers, while timestamps and persistence use slowed demonstration seconds. Event counts are coarse demo counts, not native sensor throughput. Threshold changes rebase the demonstration instead of producing retroactive events. Brightness ratio 100% removes contrast and makes target motion produce no new events.

The brief quotes typical latency but this model makes no latency simulation claim. Sony's sub-100 µs condition refers to a 9 × 9 ROI at 1000 lux; it must not be generalized to all native pixels. Noise, dead time, anti-flicker, sensor calibration, gain mismatch and event-rate filtering are omitted.

Pause freezes time, motion and event accumulation. Reduced motion stops automatic target travel but explicit inputs still update static events. Separation/selection/isolation suppress explanatory scene and event overlays. Reset restores defaults, zeros counters and initializes log references without an artificial startup flash.

## Validation

Finite geometry and all-control-extrema passed. Causal checks passed: stationary scene produces zero events; brightening produces only ON, darkening only OFF; moving target produces both signs; pause freezes readouts; reduced motion adds no automatic events; equal target/background brightness yields no motion events. Final dark/light/mobile assembled, exploded and Play renders completed and were inspected with zero page errors. Separation/selection/isolation gates and reset passed. The 576 display cells use one instanced mesh, leaving 31 meshes total. The visual target clips to the same scene boundary used by the cell intensity calculation. Independent checker review pending.

Rebuild: import the exported `EVENTCAMERA_BOARD` from `src/eventcamera.js` and call `build()`. Standard app controls provide assembled, exploded, Play and X-ray views. Maker proof command: `node /tmp/imaging-proof.mjs` against the local Vite server; proof images are `/tmp/imaging-final-eventcamera-{dark,light,mobile}-{assembled,exploded,play}.png`. These temporary paths are review artifacts, not shipped assets.

### Refresh-rate-independent demonstration sampling
The causal intensity model advances on a fixed 1/120 s accumulator while playing. The 64-sample waveform therefore spans 0.533 s at every renderer refresh rate. This is an authored display simulation, not an IMX636 latency or event-rate specification. Paused direct input still samples immediately.
