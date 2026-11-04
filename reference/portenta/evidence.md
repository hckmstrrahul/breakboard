# Portenta X8 evidence

Target: Arduino Portenta X8 ABX00049, an interactive educational reconstruction in millimetres. Default output is the existing Three.js viewer and PNG export, including assembled, exploded and anatomy views.

| Feature group | Evidence | Treatment |
| --- | --- | --- |
| PCB outline, four mounting holes, thickness | Supplied geometry: [Arduino official STEP archive](https://docs.arduino.cc/resources/models/ABX00049-step.zip), `PortentaX8.step` | Preserve 66.04 × 25.4 × 1.57 mm CAD geometry. |
| Packages, solder balls, underside carrier connectors | Supplied geometry: 2,011 STEP solids/shells | Preserve geometry and coordinates; two DF40C-80DP connectors retain all contact geometry. |
| Processor, memory, PMIC, radio, crypto and PHY identities | [Arduino datasheet, front/back topology](https://docs.arduino.cc/resources/datasheets/ABX00049-datasheet.pdf), pages 10–11 | Cross-reference positions and exact package extents; group terminals with their parent package. |
| Materials and package markings | Reconstructed surface treatment | Colors and readable device names are representative; production lot/date/serial markings are omitted. |
| Copper and internal silicon | Hidden / absent from supplied geometry | Not invented or displayed. |
| Separation and Play | Illustrative | Exploded offsets explain soldered assemblies; they are not a nondestructive disassembly guide. Status and signal flow are illustrative. |

All supplied solids are included. The source-group inventory records every original solid's bounds, index and display group. Imported coordinates are transformed once: `x = X − 33.02`, `y = Z + 0.785`, `z = 12.7 − Y`. Underside groups separate downwards so they do not travel through the board.

## Rebuild

1. Download the official ZIP into this folder and extract `PortentaX8.step`.
2. Run `python reference/portenta/import-step.py` from the repository root with `cadquery-ocp` installed.
3. Run `node reference/portenta/package-cad.mjs` from the root.
4. Run the app and open `#portenta`; inspect both sides, every component, assembled, exploded, anatomy and Play.

The tessellation uses 0.08 mm linear / 0.65 rad angular deflection, 499,898 triangles before added markings. The shipped compressed CAD is a reference visualization, not a tolerance-certified manufacturing model. Official source CAD and third-party marks remain attributable to Arduino and the component vendors.

## Verification

Checked finite geometry, all 17 selectable groups, assembled/half/full separation, isolation and floor clearance. Visually inspected assembled, exploded, anatomy and Play captures in Chrome WebGL at 1000 × 900, with no browser errors. Confirmed all 2,011 source solids survive grouping, underside parts separate below the PCB, and source-defined package contacts remain attached to their packages.
