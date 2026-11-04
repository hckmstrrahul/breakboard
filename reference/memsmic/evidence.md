# Infineon IM73A135V01 — evidence lock

Retrieved 2026-11-05. Exact reference: **IM73A135V01 / PG-LLGA-5-2**, analog differential, bottom-port, sealed-dual-membrane microphone. Datasheet **V1.20, 2021-07-07**. This is not a PDM microphone or a dual-backplate design.

## Primary references

- [Infineon IM73A135 datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-im73a135-datasheet-en.pdf), Figure 1/page 2 SDM block diagram, Figure 12/page 11 outline/pinout, electrical tables. Download SHA-256 `c45dffc1cd10abcca82df0fd62f502564e5c5b67e69324756e06286228e0993a`, 2,526,561 bytes.
- [Infineon microphone technology](https://www.infineon.com/products/sensor/mems-microphones): two membranes and a stationary charged stator form the SDM sensing architecture.
- [Scientific Reports, Acoustically semitransparent nanofibrous meshes appraised by high signal-to-noise-ratio MEMS microphones](https://pmc.ncbi.nlm.nih.gov/articles/PMC11420236/), Figure 2 and SDM discussion. This is a primary published study of **IM72D128**, used only to explain shared SDM/package architecture, never as an IM73A135 die-layout photograph.
- [Infineon patent application US20220279270A1, Figure 8c / paragraphs 79–80](https://patents.google.com/patent/US20220279270A1/en): mechanically coupled membranes, stationary stator and sealed cavity. A generic architecture reference, not proof of the production die mask.

Images/PDFs are linked, not redistributed. No source photograph, die mask or drawing is used as a model texture.

## Evidence map

| Feature | Evidence level | Model / limitation |
| --- | --- | --- |
| Package | Documented | 4 × 3 × 1.2 mm nominal; drawing maximum height 1.28 mm. Substrate nominal 0.25 mm. |
| Acoustic port | Documented | Bottom port Ø0.6 mm, center 1.32 mm from the nearest short edge. Open through the substrate. |
| Contact geometry | Documented | Four 0.7 × 0.4 mm rectangular pads plus ground annulus OD2 / ID1.2 mm; centers and spacing follow Figure 12. |
| Pin roles | Documented | 1 OUT+, 2 VDD, 3 OUT−, 4/5 GND. |
| Type code | Documented | I73A03; no fictitious serial/date code. |
| Sensing architecture | Documented | Two moving membranes around one fixed stator; lower membrane faces the bottom port. |
| Internal die layout and dimensions | Representative | Silicon frame, circular active area, etched profiles, ASIC outline and pad locations are not claimed as a verified IM73A135 die image. |
| Membrane/stator spacing | Representative, enlarged | Layer gaps are enlarged within the package for inspection; they are not micrometre-scale fabrication dimensions. |
| Stator holes and coupling posts | Representative | True perforations and four posts through separate holes. Counts/pitch are explanatory. |
| ASIC and bonds | Representative | Plain die and looped gold interconnects; no invented transistor floorplan. |

## Behavior

Pressure RMS and frequency control the two coherently flexing membranes while their edges remain fixed and the stator stays stationary. Motion runs at 1/400 input frequency with enlarged displacement; it is not a compliance or resonance model. Zero pressure returns to neutral. Pause holds phase; reduced motion remains static; Reset restores neutral and default controls. Exploded inspection neutralizes membrane motion.

The optional UI waveform shows normalized differential output over a **2 ms input time window**; its phase advances at the stated slowed display rate. The RMS output readout uses nominal −38 dBV/Pa sensitivity at 1 kHz (12.589 mV/Pa). It does not predict off-frequency response, noise, overload, acoustic leakage or transient behavior.
