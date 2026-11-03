# STMicroelectronics NUCLEO-F401RE — model evidence

Educational 3D teardown of the classic white/blue **MB1136 NUCLEO-F401RE**, represented in its C-03-style clock configuration. The integrated ST-LINK section is present; this is not a later Nucleo board with USB-C or Micro-B.

| Feature | Evidence | Representation and limits |
| --- | --- | --- |
| PCB envelope | ST UM1724 Rev14 Figure5 | 70 × 82.5 mm, including the lower tab. 1.6 mm thickness assumed. |
| Breakaway section | Manufacturer drawing and product rendering | Upper ST-LINK section with milled slots and narrow PCB bridges. Slot widths and exact bridge coordinates are image-derived, not manufacturing tolerances. The PCB remains one part. |
| ST morpho | UM1724 §6.12 and Figure5 | Two 2×19 male headers: 76 positions on 2.54 mm pitch; outer columns 63.50 mm apart. Long posts visible from either face. |
| Arduino Uno V3 | Figure5 and §6.11 | 10+8+8+6 female contacts, 2.54 mm pitch, 48.26 mm between banks, 4.064 mm D8/D7 gap. Actual socket openings. |
| Target processor | ST product specification and manual | STM32F401RET6, Cortex-M4F, 84 MHz, 512 KB flash, 96 KB SRAM. LQFP64, 10×10 mm body with 64 leads. Center photo-derived. |
| Debugger | UM1724 §§6.2/6.9 | Separate STM32F103CBT6 in LQFP48. Mini-B USB, six-position SWD, serial pins and two fitted CN2 jumpers. |
| Clock population | UM1724 §§6.7.1/6.7.2 | X1 debugger crystal; X2 32.768 kHz LSE populated for C-03; target HSE X3 left empty as documented. ST-LINK MCO is the default target high-speed reference. |
| USER / RESET | UM1724 §6.5, reference rendering | Blue B1 connected to PC13, black B2 target reset. Body dimensions/heights reconstructed. |
| Power | UM1724 §§6.3/6.6, manufacturer drawing | 3.3 V regulation, JP5 supply selection and JP6 current link. Package outlines photo-derived; exact regulator BOM is not claimed. |
| White PCB and blue artwork | Manufacturer rendering and Figure5 | Code-drawn labels and simplified ST mark, rather than a photograph texture. No invented trace routing. |
| Mounting holes | Manufacturer drawing | Three visible bores, centers digitised; Ø3.2 mm diameter estimated from drawing. Not tolerance-certified. |
| SMD | Manufacturer drawing | Visible sampled clusters grouped as one part. Fine package dimensions/heights representative; exact passive count and values not claimed. |
| Underside | Manual and limited drawing evidence | Header tails and spare-jumper positions represented. Fine underside passives and hidden PCB layers omitted. |

## Sources and local references

- [STMicroelectronics NUCLEO-F401RE product page](https://www.st.com/en/evaluation-tools/nucleo-f401re.html)
- [ST UM1724 official manual URL](https://www.st.com/resource/en/user_manual/dm00105823-nucleo-f401re-user-manual-stmicroelectronics.pdf). Direct download was unavailable during this session.
- [ST-authored UM1724 Rev14 archived by UNSW](https://webcms3.cse.unsw.edu.au/files/36a49249be66c1b00456439cf7c0fdac4f49d727b91f1a2923218cb1a3fcc627): valid original PDF downloaded as `um1724.pdf`, text as `um1724.txt`.
- `mechanical.png`: Figure5 on PDF page15. `product.png`: ST's rendering extracted from manual page1. The rendering is reference-only; no manufacturer raster is distributed inside the application.

`src/nucleo.js` reconstructs geometry in millimetres. Silver connector metal intentionally replaces the bronze tint in the reference rendering, consistent with the actual plated steel Mini-B receptacle.

Maker checks: correct 70×82.5 mm PCB bounds; 76 male morpho and 32 female Arduino contacts; all 11 groups populated; finite geometry; exact poses at 0/25/50/75/100%; isolation, X-ray and floor clearance passed. Before batching: 43 meshes, 21 distinct materials, 211,884 triangles. Independent source/geometry review and browser review handled separately by checker/root.

Independent checker correction: USB-powered default now leaves JP1 open, fits JP5 over pins 1–2 (U5V, center/right pair in the top view), and keeps JP6 fitted, following UM1724 §5.1 and power-selection table. Two CN2 SWD shunts remain fitted. Checker: maker_jetson_orangepi.
