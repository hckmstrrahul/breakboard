# ST M27W256 windowed EPROM

Implementation source lock: **M27W256-80F6**, FDIP28W ordering option / FDIP28WB mechanical outline, ST datasheet **April 2006 Rev 3**. The F ceramic window configuration is distinct from opaque B/K/N OTP packages. The -80 speed and industrial 6 temperature code follow table 15; F was available on request in this revision.

## Sources inspected

- [ST M27W256, Rev 3](https://www.st.com/resource/en/datasheet/cd00004936.pdf): pages 5–6 organization and pinout; pages 8–11 program/erase; page 17 package drawing; page 21 ordering. Official URL was readable through the browser text tool; a manufacturer PDF carrying the same revision was downloaded from [this mirror](https://www.ic-components.gr/files/2d/M27W256B-80F6.pdf) because direct ST file transfer failed. The mirror filename contains an additional B that is **not** copied into the model designation: the PDF itself is M27W256. Download SHA-256: `69493a31bba2402e14d06b21059ce5492f9450329828aae3edd7acf62683c8e5`. Pages 6 and 17 were rasterized and inspected.
- [Frohman-Bentchkowsky, US3660819A, 1972](https://patents.google.com/patent/US3660819A/en): primary historical source for an electrically isolated floating charge-storage gate and optical discharge. It is used **only** for the principle. The patent's early PMOS cell, dimensions, voltages and conduction polarity are not assigned to ST's later CMOS part. No undisclosed M27W256 cell layout is claimed.

## Documented and representative geometry

Documented: 28 leads in two rows, 2.54 mm pitch, 33.02 mm first-to-last pin center span; 7.11 mm nominal window; external pin roles. The selected body dimensions 36.92 × 13.21 × 4.24 mm lie within the drawing's 36.50–37.34, 13.06–13.36 and 3.91–4.57 mm ranges. Lead shapes use the published broad shoulder, narrow stem and slight splay, without manufacturing tolerances or tooling detail.

Representative: internal cavity and split heights, frit seam, die dimensions, bond material/count/pad positions, lead fingers, eight visible memory regions and their line pattern. No matching die photograph was found, so these regions are explicitly a functional diagram. Ceramic finish, clear-window tint, lead finish and typography are authored approximations. The transparent lid material is not named in the datasheet and is not asserted to be quartz.

Pinout, viewed from above with notch at the pin-1 end: 1 VPP, 2 A12, 3 A7, 4 A6, 5 A5, 6 A4, 7 A3, 8 A2, 9 A1, 10 A0, 11 Q0, 12 Q1, 13 Q2, 14 VSS, 15 Q3, 16 Q4, 17 Q5, 18 Q6, 19 Q7, 20 /E, 21 A10, 22 /G, 23 A11, 24 A9, 25 A8, 26 A13, 27 A14, 28 VCC.

## Functional scope

The simulator contains 32,768 bytes initialized to FF. Read addresses one byte. Program applies the requested byte with bitwise AND, so only 1→0 changes occur; any requested 0→1 is reported as **Erase required**. Whole-chip UV erasure restores every byte to FF. Neighboring addresses remain unchanged by programming. Reset clears the demonstration. Pause and reduced motion do not execute hidden writes.

Documented hardware read supply is 2.7–3.6 V. The -80 part also guarantees 70 ns at 3.0–3.6 V. Programming uses VPP 12.75 V, VCC 6.25 V and nominal 100 µs pulses; the PRESTO II verification/retry algorithm is not simulated. UV erasure uses the recommended 253.7 nm wavelength and at least 15 W·s/cm² dose. The datasheet describes roughly 15–20 minutes under its specified lamp; the displayed **two-second sequence is explanatory**, not a physical dose or timing prediction.

Color markers, data particles and UV rays are explanatory overlays, excluded from selection and anatomy. Physical silicon and package parts remain stationary during operation. Package separation is an educational cutaway, not a practical disassembly procedure.

## Verification

Maker checks pass: 66,920 source triangles in eight groups, finite geometry, floor/separation, every control boundary, exact material restoration, selection/isolation, shared anatomy, explanatory-overlay picking exclusion, pause, reset, reduced motion and frame-rate-independent completion at 30/60/120 Hz. A dedicated memory check covers programming, unchanged neighboring addresses, the final address, forbidden 0→1 transitions, and bulk erase. All nine assembled/exploded, dark/light, Play and orbit-close-up captures were opened and inspected under `/tmp/breakboard-proof/eprom-maker/`. Independent checker pending. Not registered or published yet.
