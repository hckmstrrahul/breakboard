# TI IWR6843ISK PROC073D

## Locked revision

**IWR6843ISK, PCB PROC073D, assembly 001_IWR, Rev D.** Not IWR6843ISK-ODS (PROC075), not AOP, and not the older Rev C population visible in parts of the user guide. Exact released fabrication, pick-and-place and BOM drive the reconstruction.

Primary evidence downloaded and inspected 2026-11-05:

- [TI IWR6843ISK product](https://www.ti.com/tool/IWR6843ISK), identifies standard ISK 3 TX / 4 RX and design-file links.
- [SWRR164D package](https://www.ti.com/lit/zip/SWRR164), 75136068 bytes, SHA-256 `2c0d46888eb5b31c7f751eb0b24c7616ae949a03b899c97e15743ea4e7b154b9`. Used `xWR6843ISK_Schematic_Assembly_BOM/Rev_D/IWR/`: `PROC073D(001_IWR)_Assy.PDF`, matching schematic/BOM, and `3D_Step/PROC073D.step`.
- [SWRC355D fabrication package](https://www.ti.com/lit/zip/SWRC355), 124310741 bytes, SHA-256 `75fc43c8374bb7dcab7defa6469ae719a2d7f87ce690b242afb60a95b936e5a5`. Used `xWR6843ISK_DesignFiles/Rev_D/Fabrication Drawing/PROC073D_FabNotes.PDF`, `Pick and Place/PROC073D_PnP.xlsx`, Gerber and drill files.
- [SWRU546E EVM guide](https://www.ti.com/lit/ug/swru546e/swru546e.pdf), 7837854 bytes, SHA-256 `5bbe8c836521fda796f207e71fd78a39c7505403ae9536b7bf1d031a9a031c3b`. Figures 3-8/3-9 establish series-fed arrays, three patches per channel, half-wavelength RX spacing and middle TX elevation. **Guide's Rev C board population is not copied.**

Source inconsistencies are resolved using the selected revision: the Rev D BOM's stale heading says IWR6843ISK-ODS and U1 description says IWR1843, but its file path, assembly drawing, PROC073 identity and U1 PartNumber `IWR6843QAGABL` establish the actual ISK variant. U4 is `LP87524JRNFRQ1`, not the LP87702 listed for Rev C in the guide. S1 `218-6LPST` is six-way. J1 and J6 are populated; J2 is DNP. J3, Q1 and Q2 are fitted. All zero-quantity BOM entries are excluded.

| Feature | Evidence kind | Implementation |
| --- | --- | --- |
| PCB outline / stack | Released dimensions / supplied CAD | 55 × 68.4561505 mm (displayed 68.46); exact CAD outline Y −7.8318601…60.6242905 and notch X14.13618. Fabrication thickness 57.37 mil / 1.457198 mm, eight copper layers. STEP thickness 1.46558 differs slightly; fabrication table takes precedence. |
| Mounting / ground holes | Released drill coordinates | Eight Ø3 mm holes and one Ø2.032 mm ground hole. PTH barrels and annuli are separate real geometry. |
| Placement / population | Released PnP plus BOM | `src/radar-layout.js` contains 350 populated placements (including board label). Positions/rotations are source-derived; package shapes are simplified. Metric package aliases are normalized to real chip dimensions. |
| Antenna layout | Documented and reconstructed | 4 RX / 3 TX, 3 patches per channel, 2.5 mm RX horizontal pitch and middle TX elevated 2.5 mm. RF ground has open clearance channels so feeds do not short to ground. Fine feed bends, exact clearances and via pitch remain reconstructed, not RF fabrication artwork. |
| U1 and fine-pitch contacts | Package identity documented; surface geometry reconstructed | Intact FCBGA package with 161 visible solder balls and actual standoff. Ball arrangement is representative of the package envelope, not a guaranteed pinout map. Hidden semiconductor layout omitted. |
| USB / two Samtec sockets | Documented identity and position; reconstructed shells | True open Micro-USB mouth with five fingers. J1/J6 each expose 60 contacts. Unpopulated J2 has pads only. |
| Target and RF packets | Explanatory only | Separate tagged overlay, independent of physical anatomy/picking. Target range/angle set actual readout and compressed display position. Packets/chirp are independently slowed cues rather than literal nanosecond propagation. |
| FMCW illustration | Explicit scenario, not device performance claim | 60–63 GHz over 60 µs → 50 MHz/µs slope. Delay `2R/c`; beat `slope × delay`. TX cycles through three channels. No fabricated Doppler, CFAR probability or field-solver accuracy claim. |

The module is physically stationary during operation; only explanatory targets/packets move. Pause freezes phase/readouts. Reduced motion freezes the overlay and disassembly/selection hides it. Reset restores controls and repeatable phase. Approximate hidden package mechanics are not claimed as exact production internals.

Reconstruction route: parse XLSX PnP cells and XLS BOM, join by designator, discard zero-quantity options, export compact array with physical coordinates. Build physical packages from that array. Maker browser proof `/tmp/breakboard-ranging/proof.mjs` renders assembled/exploded/Play in light/dark and closeups; mobile `/tmp/breakboard-ranging/mobile-proof.mjs`; numeric behavior and real-aperture checks `/tmp/breakboard-ranging/check.mjs`. Root owns integration/build/preview regeneration. Independent checker uses `/tmp/breakboard-proof/batch3`.

The nonzero BOM additionally lists H1–H16: four washers, four nuts, four 5 mm M3 standoffs and four 16 mm M3 screws. These supplied mounting-kit pieces are intentionally omitted from the bare-board view; 350 rendered designators refers to populated board placements, not the complete accessory kit.
