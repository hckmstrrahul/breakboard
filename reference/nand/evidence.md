# BiCS FLASH 8 reference lock

Maker implementation and local checks complete; independent checker review pending.

Reference: Kioxia BiCS FLASH generation 8 **1 Tb TLC**, the 218-word-line CBA/OPS technology reported at VLSI 2023 / IEDM 2023 and described in the manufacturer's **28 March 2024** technical overview. This is a magnified memory-array section bonded to CMOS, not a replica of an unspecified retail BGA package. No public ordering code or silicon stepping is assigned. No dimensions in the magnified diagram will be presented as actual device millimetres.

Primary sources, retrieved 5 November 2026:

- [Generation-8 technical overview](https://www.kioxia.com/en-jp/rd/technology/topics/topics-66.html), dated 28 March 2024, figures 1–3 and cited VLSI/IEDM 2023 work. HTML SHA-256 `539f562c261e1695fe4517332aa2bfd2095ee4ac151e8e63c1c39bbccb8d14b4`; figure-1 cross-section PNG `053ca283d8ad2255bac4f78f37013969325e7e1fb42d66ee57c6b3a697b36931`; OPS diagram `c894384ba08adc23812885a989b0cfbb8ebc5d026ade1feab14becabe3c73930`.
- [BiCS cell structure and fabrication](https://www.kioxia.com/en-jp/rd/technology/bics-flash.html), figures 4–5. HTML SHA-256 `cb57ec02808dc73fc92902241732698ccd62a9aec87d3ac5437275d7fe70f5be`; cell-layer diagram `f603188e54ed58404c2364cb931fe907d53c7bb8840fde97d9c4b00e2e9b9ece`.
- [Manufacturer discussion of CBA](https://www.kioxia.com/en-jp/business/topics/bics-cba-202407.html), 30 July 2024 interview with Kioxia engineers. HTML SHA-256 `fe18bbae018549aa914330c29e9a91c56d6dbf521c725ac5605c41fa349018e1`.
- [Typical 3D NAND program/read/erase structure](https://www.kioxia.com/en-jp/rd/technology/topics/topics-88.html), 18 September 2025, figure 1 and CBA orientation in figure 2. HTML SHA-256 `6f248a01fd6edeeb42e885827a459e2ccf87c1644c44e1f93645c32ffd4b46fe`; figure 1 PNG `0fb25d94d094812a10c58acde2cb264356bb5376d9242dbd346b45dd069f5732`. Only the general operating principle is used; the paper's experimental Schottky source / 96-layer device is **not** attributed to BiCS8.

Documented: 218 word lines in the selected 1 Tb TLC generation; 3 bits per cell; independently fabricated CMOS and array wafers joined by CBA; vertical channels intersect alternating gate/dielectric layers; radial silicon/tunnel-insulator/charge-storage/blocking-insulator/gate relationship; source/drain select gates; bit and word-line selection. The OPS slit lies between active strings rather than passing through a dummy string. The March 2024 configuration is kept separate from later 3.6 Gb/s marketing updates.

Representative: all enlarged dimensions, displayed string count, staircase/contact routing, CMOS floorplan, individual material colors and layer thicknesses. Only a small section is shown; 218 layers are not 218 dies. The physical single-cell geometry is a cutaway, not something separable in ordinary disassembly. Threshold-state ordering, visual pulse duration and charge particles are educational models, with no actual programming voltages, timing, charge population or reliability predictions.

Manufacturer/IEEE/JSAP diagrams remain local research inputs and are not redistributed. The model uses original geometry.


Maker construction: 14 selectable groups, 218 actual gate plates, eight displayed vertical strings (four whole and four front cutaways), radial insulation/storage/channel layers, two select-gate levels, sample staircase contacts and the lower CMOS/direct-bond interface. The source connection meets the channel without overlapping its exposed cylindrical surface. The model contains 282,746 triangles.

The authored memory state contains 218 sample pages of eight cells. A program operation raises the selected page to a chosen ordered threshold; a lower requested state requires block erase. Read compares the selected stored state with an ordered reference. Block erase resets the full sample block. The 2.4-second sequence and sample sizes are explanatory. No bit coding, physical voltage or write endurance is claimed.

Local maker checks cover finite geometry, floor clearance through separation, selection/ghosting/isolation, exact shared anatomy geometry, non-pickable explanatory annotations, pause/reduced motion/reset, page-only programming, rejected threshold lowering, read comparison, block erase and equal final states at 30/60/120 updates per second. Nine actual Three.js captures in dark/light, assembled/exploded, Play, close orbit and X-ray were opened. Proofs remain local at `/tmp/breakboard-proof/nand-maker`; independent review and final integrated browser gates are still pending.
