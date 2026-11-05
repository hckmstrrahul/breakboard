# Artix-7 FPGA evidence record

Locked hardware: **AMD / Xilinx XC7A35T-1CSG324C**. This is a bare CSG324 package, not a development board, flip-chip package or a generic FPGA die.

## Sources and document lock

- [AMD UG475 v1.20, 13 March 2024](https://docs.amd.com/api/khub/documents/kHyYQ6XzXnQwR2O~gaV~MQ/content): **Figure 4-9, printed/PDF page 263**, specifically Artix-7 CS/CSG324/325 wire-bond chip-scale BGA. Drawing rendered and visually inspected before construction. SHA-256 `8ad92ec9cc50561a9f5f14df6337fc02f715e2ee32153d81d19f355c084397a4`.
- [AMD DS180 v2.6.1, 8 September 2020](https://docs.amd.com/api/khub/documents/2LByHkO~nSZXcei2D55fTg/content): Tables 4 and 5, device resources and device/package combinations. SHA-256 `8222e0f32bc0a22ca63d2241c148249327384cd2f87f0fe0bc2e95cc3d9b6e26`.
- [AMD UG474 v1.9, 1 April 2025, CLB overview](https://docs.amd.com/r/en-US/ug474_7Series_CLB/CLB-Overview): two slices per CLB; four 6-input LUTs and eight flip-flops per slice; configurable LUT function. Its architecture figures are functional diagrams, not the selected device's transistor floorplan.

The earlier generic PK381 package sheet is **not used for height**. The selected Artix-specific drawing supplies 1.36 mm nominal overall height. No invented lot/date code or unverified silicon revision is printed.

## Documented versus representative features

| Feature | Basis | Model treatment |
| --- | --- | --- |
| Package width and depth | Documented 15 × 15 mm | Nominal dimensions |
| Seated height | Documented 1.26 / 1.36 / 1.50 mm min/nom/max | 1.36 mm nominal; ink rises 0.003 mm for stable rendering |
| Ball array | Documented 18 × 18, 324 balls | All 324 contacts, no population omissions |
| Pitch and array span | Documented 0.8 mm, 13.6 mm outside-center span | Exact grid |
| Ball size | Documented 0.45 mm nominal maximum diameter, 0.30 mm seated height | Flattened sphere envelope; solder fillet shape representative |
| Interconnect construction | Drawing explicitly says wire-bond | Bond loops physically meet die and substrate pads |
| Die, adhesive and loop geometry | No exact public dimensions found | 8.6 mm square die and 80-loop subset are representative, not actual die size or wire count |
| Bond metal / routing / substrate layers | Not established for the exact device revision | Representative; no pin-to-pad map or material claim |
| Die pattern | No verified source die image used | Repeated functional texture, explicitly not mask-level circuitry |
| Resource counts | DS180 and UG474 | 33,280 logic cells; 5,200 slices; derived 20,800 LUTs and 41,600 flip-flops; 210 HR I/O in this package |
| Package marking layout | Representative printing | Exact part designation, no fabricated serial identifier |

The mold is modeled as four walls and a roof with a genuine cavity. Lifting the roof is an explanatory destructive cutaway, not a claim that the encapsulant disassembles intact. The substrate, die attach, die, bonds, routing and contact array remain distinct inspectable assemblies. The selected package has no moving hardware.

## Interaction contract

An architectural overlay demonstrates one LUT. Three inputs are exposed; the remaining three of a 6-input LUT are held low. Programs are parity `A xor B xor C`, majority (at least two inputs high), and multiplexer `A ? C : B`. The eight-entry readout enumerates `000` through `111`, with A the most significant input. It is an electrical-function illustration, not a timing or physical placement claim.

Manual controls update output immediately while paused. Auto mode cycles input combinations every 0.8 display seconds during Play. Pause freezes time and sequence; Reset restores parity, manual inputs 1/0/0, auto off and zero phase. Reduced motion, separation, selection and isolation hide explanatory activity; physical parts stay stationary. The overlay has `explanatoryEffect` ownership and never enters hardware picking/anatomy inventory.

## Maker verification

Geometry, logic truth tables, frame-rate independence, pause/reset, reduced motion, actual physical bounds, all ball centers and disassembly clearances are checked by the maker's batch-7 scripts. Browser proofs cover light/dark, assembled/exploded/Play, anatomy, close views and a 390 px viewport. Final results and performance are recorded after the rendered correction pass; the independent checker maintains the release gate.

Maker result (5 November 2026): all 24 function/input combinations pass, the complete 324-ball geometry matches the drawing, the assembled physical envelope and all five separation samples pass, and the automatic input sequence agrees at 30/120 Hz. Real Chrome/Metal renders were inspected at desktop and 390 px in material/anatomy, both themes and assembled/exploded/Play. The mold and bond explosion was opened further after this visual pass. No WebGL/page errors. A 600-frame CPU render loop measured normal p95 0.4 ms and anatomy p95 0.3 ms on the available machine; this is not end-to-end GPU FPS or a physical-phone benchmark.
