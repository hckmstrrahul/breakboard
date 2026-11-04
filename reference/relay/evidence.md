# Omron G2R-1 DC12 — evidence lock

Retrieved 2026-11-05. Device ID: `relay`. Reference configuration: **Omron G2R-1, standard PCB-terminal SPDT, 12 VDC coil**. No socket, diode, indicator, high-sensitivity coil, sealed `-E` case or two-pole `G2R-2` is implied.

## Primary references

1. [Omron G2R PCB power relay datasheet, K013-E1-24](https://files.omron.eu/downloads/latest/datasheet/en/k013_g2r_pcb_power_relay_datasheet_en.pdf), final imprint **0125 (0207)**, ©2007–2025. The downloaded PDF has SHA-256 `536b3e85cf7738e2c0b4405f5d55176d3df66499fdf6b4b01dca853330074952` (5,214,486 bytes). Standard DC coil table: printed page 4. G2R-1 dimension drawing, PCB drilling and bottom-view terminal arrangement: printed page 9.
2. [Omron, relay operating principles](https://components.omron.com/sg-en/products/basic-knowledge/relays/basics). Supports electromagnet/armature/contact roles; it does not establish this specimen's hidden dimensions.

Manufacturer documentation and images are linked, not redistributed. The model is original procedural geometry; no manufacturer drawing or photograph is embedded as a texture. Manufacturer marks are text identifying the reference.

## Evidence inventory

| Feature | Status | Implementation / limit |
| --- | --- | --- |
| Nominal case envelope | Documented | 28.8 × 12.7 × 25.3 mm. Manufacturer maxima: 29 × 13 × 25.5 mm. |
| PCB lead projection | Documented | 4 mm below the base. |
| Five terminal centers | Documented | Bottom-view drawing: 7.5 mm row spacing; coil-to-common longitudinal distance 20 mm; NC and NO offset 3.5 mm either side of common. The model uses x/z millimetres relative to the centered case. |
| Terminal function | Documented | Coil 1/5; common 4; NC 2; NO 3. |
| Coil rating | Documented | Standard DC12: 12 VDC, 275 Ω, 43.6 mA at 23 °C. A different variant's 278 Ω / 43.2 mA table is deliberately not used. |
| Clear rectangular case, black base, vertical coil, right-side contact assembly | Photo-estimated | Manufacturer illustration establishes the broad arrangement. Clear-wall thickness, ribs and finish are reconstructed. |
| Copper winding | Representative | 52 visible helical turns; wire gauge/turn count are reduced for inspectability and are not a resistance-accurate winding design. |
| Bobbin, iron core, folded yoke | Representative | Functional material roles and connected magnetic circuit; unpublished tooling dimensions are not asserted. |
| Armature, spring and insulating pusher | Representative | An articulated arm drives a vertical insulating pusher. Its upper pivot remains on the arm; its lower face meets the moving contact. Travel is enlarged and slowed for explanation. |
| Contact supports, flexible leaf, contact alloy | Representative | Common root stays attached. End faces physically meet NC at rest and NO when actuated; the intermediate state is open. No contact alloy or exact production linkage is claimed. |
| Coil routing | Representative | Two separate wires run beside the bobbin to its winding ends; they do not claim a factory lead-routing pattern. |

## Interaction and coordinates

The case bottom is y=0; the documented case top is y=25.3. The view operates in millimetres. The cover, terminal base, winding, bobbin, pole core, yoke, armature, spring, moving contact, fixed contacts and coil terminals separate as individual assemblies.

Play cycles between coil on and off every 1.8 seconds. This is a slowed mechanism demonstration, not the relay's specified operate/release time. Setting Automatic cycle to Manual makes Coil command explicitly place the mechanism at either endpoint even while paused. Pause preserves the instantaneous mechanical pose. Reset restores the unpowered NC position and default controls. Reduced motion uses static endpoint states. The current readout is the datasheet's nominal 43.6 mA, not a computed transient or simulated load circuit.

The clear cover fades during operation through the shared cutaway system. No arcs, contact erosion, coil heating, bounce, high-voltage clearances or safety ratings are simulated.
