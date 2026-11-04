# Devantech SRF04 with Pro-Wave transducers

## Locked configuration

**Devantech SRF04**, manufacturer-published updated `srf1.pdf`, PIC12C508 + ST232CD + LMC6032 + LP311 and May 2003 optional timing-input behavior. The manufacturer does not print a PCB revision code in this evidence; none is invented. The current schematic supersedes the older MAX232/LM1458/LM311 descriptions retained in historical prose. **400ST160 transmitter / 400SR160 receiver** are identified by Devantech's own transducer FAQ and Pro-Wave's package drawing.

Primary sources inspected 2026-11-05:

- [Devantech technical documentation](https://www.robot-electronics.co.uk/htm/srf04tech.htm) and [updated schematic](https://www.robot-electronics.co.uk/files/srf1.pdf), 642803 bytes, SHA-256 `e07510a65f09d1b579a01db18bfe4926b2fc1ca9f6b4a9cd6f326cbe0c4ca5fd`. The PDF itself, not the historical text, establishes installed IC identities.
- [Manufacturer product](https://www.robot-electronics.co.uk/srf04.html): board 43 × 20 × 17 mm nominal module envelope; 40 kHz and 3 cm–3 m nominal range.
- [Devantech transducer FAQ](https://robot-electronics.co.uk/htm/sonar_faq.htm): identifies 400ST/R160 and distinguishes open from sealed transducers.
- [Pro-Wave package/drawing](https://www.pro-wave.com.tw/pdf/T400S16.pdf), 273222 bytes, SHA-256 `bc54265f7953fec9ae81eeb2a0267c6c955c64b92d6266804e9f5e05e2960e0e`. Drawing rendered: Ø16.2±.2, 12.25±.2 long, Ø13.15±.2 mouth, Ø1.0 leads at 10 mm pitch. The web overview rounds length to 12 mm; drawing takes precedence.
- [Pro-Wave open construction](https://www.pro-wave.com.tw/english/products/ut/open.htm): nodal-supported piezo ceramic bender with central conical metal resonator.
- [Board photograph](https://www.robot-electronics.co.uk/images/srf04.jpg), 128243 bytes, SHA-256 `c4957ad8357fb9cc482c22f845008752aeb7c26f9f8e3a437e8905cf391962ab`; [connector view](https://www.robot-electronics.co.uk/images/srf04con.jpg), 54528 bytes, SHA-256 `8851ffafff34ba45e1bd3634bc93f2791f643bebfb879c0d9be6b8b60db0789c`.

| Feature | Evidence kind | Implementation |
| --- | --- | --- |
| Board and two mounting holes | Documented size, photo-estimated locations | 43 × 20 mm FR4, 1.15 mm reconstructed thickness; actual holes for mounting, all four can leads, all five header positions. |
| Can outline / mouth / leads | Documented dimensions | Two Ø16.2 × 12.25 smooth aluminum open cans; Ø13.15 screen opening, two Ø1 leads at 10 mm pitch per can. |
| Woven screen | Photographic structure, estimated pitch | Actual interwoven thin rods with openings, not a texture or solid disc. |
| Piezo / resonator / supports | Documented architecture, representative sizes | Bender flexes around nodal support; cone follows its center, wires terminate at fixed nodal electrodes. Internal dimensions/travel enlarged for legibility. |
| PCB electronics | Documented circuit, photo-estimated placement/packages | PIC12C508, ST232CD, LMC6032, LP311, passives and rear-side traces. No invented internal IC layout. |
| Interface | Documented | +5 V, Echo, Trigger, optional Timing, GND. Timing input left open in the scenario. |
| Wavefronts and target | Explanatory | Target is spatially compressed and excluded from hardware/picking. Actual two-way path uses transmitter/receiver separation and dry-air approximation `331.3 + 0.606 T` m/s. Propagation clock is slowed 300×. |
| Motion / readout | Functional illustration | TX executes 8 cycles at 40 kHz; RX responds only after propagation. Echo output is high for the calculated flight interval after the burst. Mesh carrier phase can alias at screen frame rates and is disclosed; time-of-flight readout stays exact to the chosen scenario. No multipath, atmospheric humidity or empirical threshold calibration. |

Reset reproducibly restores controls/neutral benders. Pause holds mechanical pose; reduced motion and disassembly park benders at rest and suppress continuous activity. Internal features do not claim manufacturing tolerances.

Maker verification: actual browser `/tmp/breakboard-ranging/proof.mjs` (1100 × 1000, both themes, assembled/exploded/Play/closeups), `/tmp/breakboard-ranging/mobile-proof.mjs`, `/tmp/breakboard-ranging/check.mjs`. Root owns integrated build, selector and preview checks; independent checker owns `/tmp/breakboard-proof/batch3`.
