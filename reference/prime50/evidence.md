# Canon EF 50mm f/1.8 STM — evidence and reconstruction

## Configuration lock

The May 2015 **Canon EF 50mm f/1.8 STM**, Camera Museum product **ef451**. This is neither the EF 50mm f/1.8 II nor the RF 50mm lens. Canon does not publish a production mechanical revision for this public configuration. Mechanical photographs are kept to one consistent first-hand disassembly specimen: YossyHeim's article below, uploaded in 2019. Its serial number is not established; no serial-specific claim is made.

1. [Canon Camera Museum: specifications and optical diagram](https://global.canon/en/c-museum/product/ef451.html).
2. [Canon's optical construction image](https://global.canon/ja/c-museum/wp-content/uploads/2015/11/ef451-lens-construction.png).
3. [First-hand disassembly specimen](https://ameblo.jp/ayumuhito12/entry-12531671308.html). Rear bayonet/PCB, front filter rim, optical cell and aperture inspected in images 2, 3, 5 and 7. This is a primary observation of the physical specimen, not a generic lens illustration.
4. [Canon Asia product description](https://asia.canon/en/pro-imaging/ef50mm-f-1-8-stm/main/product): gear-type STM.

Snapshot hashes, 5 November 2026:

- Canon HTML: `a56868ff5099fb82e1a08c10f7fea10f1cc356be58867fd37d070086885a9e69`
- Canon construction PNG: `551c43375d556659ad076c64d2fcceed885bb60a61407e4fbf7b55a18feee44f`
- Disassembly HTML: `648afe2591a9fe40a0862d5632e7c2f6082bc1598604622638c5d8a71059397d`

## Feature classification

| Feature | Evidence | Implementation and limits |
| --- | --- | --- |
| Ø69.2 mm × 39.3 mm at infinity, 160 g, 49 mm filter | Documented by Canon | Envelope refers to the infinity configuration; focusing extends the front unit. Bayonet protrusions extend behind the mounting face. Weight is not simulated. |
| Six elements in five optical groups | Documented construction diagram | Six actual glass meshes; the second and third share a cemented interface and stay together in the exploded view. Glass thicknesses/curvatures are proportional reconstructions, not an optical prescription. |
| Seven circular aperture blades; f/1.8–22 | Documented by Canon | Seven independent rigid leaves pivot around fixed pins; their overlapping rectangular blanks and drive ring are representative, not production blade outlines. A thin cover hides their outer overlap. Their clear aperture scales with reciprocal f-number. |
| 0.35 m minimum focus | Documented | Near-focus control maps 0% to infinity and 100% to 0.35 m. The displayed stroke is a separate authored mechanism, not a measured focus-distance-to-travel law. |
| Metal EF mount and eight contacts | Visible in selected specimen | Mount lugs and contacts reconstructed proportionally. Thread, screw and lug dimensions are estimated. |
| Satin barrel, narrow ribbed focusing ring, AF/MF switch | Manufacturer and specimen photographs | Silhouette/proportions estimated within the published envelope. Rib count and surface finish are illustrative. |
| Green annular PCB and orange flex | Specimen photos | Board opening and routing style photo-derived. IC types, passives, board traces and flex conductor count are representative. |
| Gear-type STM | Documented by Canon | Small motor, meshing reduction wheels and lead screw explain the technology. Their exact placement, tooth count, lead pitch and nut are representative. Motor wheel turns opposite its mating screw wheel with the displayed pitch-radius ratio. |
| Moving optical carriage | Specimen shows extending optical cell | Coherent guides, support rings and traveling nut are authored, not a production service reconstruction. The 0–12 mm travel is disclosed as representative. |
| Optical coatings and ray paths | Representative | Glass tint and interference-like highlights are illustrative. Rays describe throughput only; no aberration or calibrated focal-plane prediction. |

## Behavior and geometric policy

- Aperture and focus inputs work while paused. Play sweeps between the open/infinity state and chosen targets in a deliberately slow six-second cycle; `Play sweep` can hold the selected settings instead.
- A paused cycle freezes its current position. Reset restores the default input values and static pose. Reduced motion disables autonomous cycling. Exploded views preserve the current static mechanism and hide the explanatory rays; selection/isolation also hides rays.
- Relative light is the ideal aperture-area ratio `(1.8 / f-number)^2`, not measured lens transmission.
- The iris's full opening and minimum opening are intentionally nonzero, including at f/22. Leaf shapes are rigid throughout travel. Their mounting planes are staggered to avoid coplanar rendering.
- Glass elements are closed surfaces; the bonded pair uses a thin, visible-spacing cement interface to avoid z-fighting. Microscopic coating thickness is not claimed.
- All moving ancestors are marked `dynamic` before assembly batching. Optical rays are marked `explanatoryEffect` and are excluded from physical anatomy/picking.

## Rebuild and proof

Source: `src/prime50.js`, export `PRIME50_BOARD`. The neighboring zoom model imports only the shared geometry helpers exported by this file; no application registration is performed here.

```sh
npm run dev -- --host 127.0.0.1 --port 4287
node /tmp/optics-proof.mjs
```

Proof script creates the actual WebGL scene with Chrome/Metal and renders assembled, 100% exploded and Play states at 1000×800 in dark/light themes, and 390×580 mobile. Proof files: `/tmp/optics-final-prime50-{dark,light,mobile}-{assembled,exploded,play}.png`. A separate Node inspection checks finite geometry, six physical glass meshes, control extrema, pause/reduced-motion behavior and reset. Independent checker review remains the release gate.

### Checker correction: focus gear interference
The first box-tooth approximation interfered during rotation and was rejected. The final representative gearbox uses involute 20° pressure-angle profiles, module 0.3 mm, 12/14 teeth, 3.9 mm center distance, matched initial phase and opposite 14:12 angular ratio. A small 0.024 mm tooth-thickness allowance provides visual clearance. Independent-tooth SAT sweeps over 181 input steps found no tooth-to-tooth overlap; a 721-step point/edge distance sweep also checks both root cylinders. These authored gear dimensions explain motion; they are not Canon service measurements.
