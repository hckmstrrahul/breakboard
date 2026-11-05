# Seagate ST31000528AS reconstruction

Intended use: interactive assembled / exploded / operating Three.js model, desktop and mobile; not a service or manufacturing drawing. Units are millimetres.

## Hardware lock

Seagate Barracuda 7200.12 **ST31000528AS**, 1 TB, PN **9YP154-521**, firmware **JC4A**, PCB **100535537 REV A**. Mechanical specimen: Cheadle Data Recovery, 21 February 2019, [head-assembly swap](https://www.cheadledatarecovery.co.uk/2019/02/head-assembly-swap-seagate-st31000528as/). Manufacturer specification: [100529369 Rev H, August 2010](https://www.seagate.com/staticfiles/support/disc/manuals/desktop/Barracuda%207200.12/100529369h.pdf). A [separate Payam / Donor Drive Parts Rev A board](https://donordriveparts.com.au/products/seagate-st31000528as-100535537-rev-a-9sl154-044-1906-pcb-for-sale) supplies visible PCB proportions; its firmware/part-number variant is not substituted for the mechanical specimen.

| Feature | Evidence classification | Treatment |
| --- | --- | --- |
| 101.6 × 146.99 × 26.1 mm maximum envelope | Manufacturer dimensions, manual pp.4,11 | Preserve outer chassis dimensions. Small raised label/fastener relief is not a tolerance drawing. |
| 2 disks / 4 physical heads / 7200 RPM / 32 MB / SATA 3 Gb/s | Manufacturer, p.4 | Exact counts/rated readouts. Legacy ATA logical 16 heads are not physical heads. |
| Black casting, silver lid, flex loop, filter, copper moving coil | Features visible in selected specimen | Reconstructed proportions and mechanical contacts. |
| Platter Ø95 mm, 1.27 mm thickness, axial stack and actuator pivot | Photo-estimated | Explicitly estimated; not service dimensions. |
| Contact-start-stop inner landing zone | First-hand Cheadle account | Park near spindle before spin-down; no outer ramp. |
| Large head comb, tall spindle tool, platter mask in photographs | Recovery fixtures, identified by article | Excluded from drive model. |
| PCB 100535537 Rev A | Specimen revision plus separate matching-revision photograph | Board outline and major package proportions; no claim of identical IC substitutions. |
| Low-profile disk clamp and six-screw pattern | Obscured by recovery fixture | Representative retention assembly; exact production clamp is not asserted. |
| Motor stator, preamp / circuit traces | Hidden or unspecified | Representative construction; no exact pole, transistor or firmware layout claim. |
| Four sliders at disk surfaces | Count documented; microscopic geometry representative | 0.18 mm operating air gap enlarged for inspection. Landed slider face touches inner band without penetrating disk. |
| Magnetic tracks / data | Microscopic, unspecified | No invented actual track count; a small explanatory read marker only. |

## Behavior

Spindle command controls run/park. Head command selects park/seek/read; track controls radius and head selects one of four surfaces. Play first moves to the inner landing zone, then slows the spindle and lands the heads. Spin-up lifts the illustrated clearance and waits for speed before seeking. At rated speed the visible rotor turns 1.2 rev/s, **100× slower than 7200 RPM**. Two-second spin ramps, four-second seek sweeps, 25–45 mm data radii and 21 mm landing radius are authored teaching values, not recorded firmware timings or disk formatting. Paused direct inputs select static poses; camera orbit is never a physical input. Reduced motion stops autonomous changes. Reset restores default input and pose. Explanatory read marker is hidden during separation, selection and isolation.

## Source snapshot

Downloaded 2026-11-05 for inspection; linked images are not redistributed as product textures and customer serial numbers are not copied.

- Manufacturer PDF SHA256 `4dc5b29b4e52a8ae85513f0e283e57061e5d40aa541119c34a9dd7f2f52960aa`.
- Cheadle `ST31000528AS-Head-Assembly.jpg` SHA256 `dd7718bd7a6d87b8aa20c3db33418826d0b1eed3ba3e319c588d9f45247d5fab`.
- Payam component-side PCB photograph SHA256 `d6335e64321c6e94c22d557938de55a96112c6c669cb047e33bdb227d66fdfd8`.

## Verification

Maker proof imports `HDD_BOARD` through the actual `createScene` runtime and renders dark/light assembled, exploded and Play at 1000×800, plus 390×580 mobile. Script `/tmp/storage-proof.mjs`; frames `/tmp/storage-final-hdd-*.png`. Source/geometry/causal checks and independent checker signoff are required before integration.

Maker checks completed: `/tmp/storage-check.mjs` validates finite mesh attributes, every control endpoint, pause / reduced motion / separation gating and reset. Park→stop reaches the inner landing radius before zero RPM; spin-up→read reaches 7200 RPM. Actual slider world bounds were checked for all four heads at five track targets: 0.18 mm operating gap and zero penetration when parked. The spacer touches the two disk faces and the clamp seats on the upper disk. Final mobile framing was widened after the first proof exposed edge cropping. `fitShadows: true` uses the shared full-assembly shadow bounds. Dark/light/mobile images and close-up orbit/X-ray views were visually inspected; no browser errors.

### Independent-review corrections

The inner landing-zone finish is now a flush annulus of the platter, with the same top and bottom planes as the adjacent recording annuli. It is not a raised duplicate ring. Independent surface rays at all four parked sliders agree with their contact faces to floating-point tolerance; operating flight clearance remains an explicitly enlarged 0.18 mm. Kinematics use a fixed 1/240 s teaching step, including seek targets, parking and spindle ramps, so identical elapsed input produces identical poses at 30 and 120 Hz display rates. This sampling interval is an implementation detail, not the physical controller bandwidth.

Side mounting details were revised to real blind recesses after the independent envelope/edge audit: the cast side walls have openings around the seated metal annuli, with cast backs closing the bores. No ring face overlays a coplanar solid wall, and the assembled width remains 101.6 mm. End walls finish at ±73.495 mm. Cover steel uses a 0.025 target playback opacity, label artwork fades to zero, and the embossed rim is narrow geometry rather than a second full cover slab. The label declares its background color for clear anatomy lettering.
