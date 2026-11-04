# ZED-F9P reference lock

Model: bare u-blox **ZED-F9P-04B-01**, HPG 1.32. No carrier or antenna is included. An external active antenna is required by the real receiver.

Primary source: [UBX-21044850 R05, 21 March 2024](https://content.u-blox.com/sites/default/files/ZED-F9P-04B_DataSheet_UBX-21044850.pdf), retrieved 5 November 2026. SHA-256: `88b3f1a46b64afc50b1b2c84ace29edbe0f3a74ddeb2d5ad02162a0c7c8bda7b`. Pages 10–13 describe blocks/pins; pages 20–21 give dimensions. The PDF remains a local research input; no source image or CAD is redistributed.

Documented: 22 × 17 × 2.4 mm nominal envelope; 54 perimeter contacts and 48 central ground lands; 1.10 mm perimeter pitch and 2.10 mm ground-grid pitch. Pin 2 is RF_IN; RXD2 receives correction data. The block diagram establishes dual-band reception, integrated processing/power management, two SAW paths, TCXO, RTC crystal and flash.

Representative: shield thickness, substrate thickness, internal footprints/placement, passive count, wire bonds and copper routing. The exposed chip regions illustrate functions, not a disclosed die floorplan. Package artwork is newly drawn identification, with no invented serial number.

The interaction is an authored synthetic scenario, not a GNSS solver, RF simulation or accuracy prediction. Satellite count and correction availability drive an illustrative acquisition/convergence sequence. Its colored routes and convergence ring are explanatory overlays; there are no fictional moving parts. Display timing and thresholds are deliberately identified as illustrative. Orbiting the camera never changes satellite visibility.

Additional operation source: [UBX-18010802 R16, 30 October 2024](https://content.u-blox.com/sites/default/files/ZED-F9P_IntegrationManual_UBX-18010802.pdf), retrieved 5 November 2026. SHA-256: `47aa1c77a7363b77c2746088cc97386a9af16758923525c42902d598fc9f5de2`. Page 2 explicitly includes ZED-F9P-04B-01 / HPG 1.32; sections 2.1.2 and 3.1.5 explain differential correction and RTK operation. This supplements the synthetic state explanation without supplying undisclosed internal geometry.

Independent source, contact-pattern and causal checks passed. The top-view pin-one marker was corrected during review. See the [batch 4 review](../../docs/verification/expansion-batch4.md) for final application and browser results.
