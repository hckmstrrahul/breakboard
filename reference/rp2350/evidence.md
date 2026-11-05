# Raspberry Pi RP2350B A4 — evidence record

## Locked configuration

**RP2350B0A4**, **QFN-80**, using **RP2350 Datasheet Release 8**, build **2026-10-01**, document version **80d627281ed5**. A4 is the metal revision announced by Raspberry Pi on 29 July 2025. This is RP2350B, without in-package flash; it is not RP2354B.

Primary sources:

- [RP2350 manufacturer datasheet](https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf): §3.9 architecture selection, §3.10 memory, PIO chapter and §14.2 QFN-80 package; Figure 149, printed page 1326.
- [Raspberry Pi A4 revision announcement](https://www.raspberrypi.com/news/rp2350-a4-rp2354-and-a-new-hacking-challenge/).
- [Raspberry Pi RP2350 product specifications](https://www.raspberrypi.com/products/rp2350/).

The public Aedan Cullen die imagery was researched but depicts an earlier A2 specimen. It is **not used or reproduced** as A4 imagery. No physical A4 floorplan or die measurements are claimed.

## Feature classification

| Feature | Evidence | Implementation |
| --- | --- | --- |
| Package | Documented | 10 × 10 mm QFN-80, 0.850 mm nominal height. Mold is sectioned for inspection. |
| External contacts | Documented | 80, twenty per side; 0.400 mm pitch; nominal 0.200 mm width, 0.400 mm length. Matte-tin appearance. |
| Exposed pad | Documented | 3.400 × 3.400 mm nominal. |
| Top mark and pin-1 mark | Documented configuration and drawing | RP2350B0A4, with top-left pin-1 marker. Lot/date identifiers are omitted rather than invented. |
| Internal die dimensions and thickness | Representative | Displayed 4.5 × 3.85 mm outline fits the physical package but is not a source measurement. |
| Paddle upper surface, adhesive, pad ring and bonds | Representative | Their exact A4 geometry/count is not published by the package reference. Eighty illustrative wire routes connect the eighty external destinations without claiming the production bond count. |
| Four physical CPU alternatives and two sockets | Documented architecture, representative layout | One Cortex-M33 or Hazard3 is selected for each socket; inactive alternatives are dimmed and described as held in reset/clock gated. |
| Memory macros | Documented counts, representative geometry | Eight 64 kB and two 4 kB SRAM banks = 520 kB. Visible cell textures do not represent literal SRAM bit count. |
| PIO macros | Documented counts, representative geometry | Three PIO blocks, four state machines per block = twelve. |
| Peripheral blocks and bus traces | Documented functions, representative locations | Clock, OTP, USB, ADC and interconnect illustrated as regions of one die, not separate silicon chips. |
| GPIO map | Documented top-view pinout | Every GPIO 0–47 maps to its actual QFN-80 pin, including ADC-capable GPIO 40–47. |

## Architecture contract

There are two processor sockets. Each chooses Arm Cortex-M33 or Hazard3 independently; mixed combinations are supported but require separate program images. Only two processors are active at once. The `ARCHSEL` value is sampled on processor reset, so changing either UI architecture selector resets the teaching sequence. It does not imply live hot-swapping.

This demo assumes the default unsecured OTP configuration. Secure boot disables RISC-V; no override of that restriction is implied. As documented for A3 onward, the old `CRIT0_ARM_DISABLE` path has no effect. The model does not expose a fictional four-active-core mode or a secure-boot/RISC-V combination.

## PIO behavior

A selected block/state machine runs the explicit two-instruction loop:

```
SET pins, 1 [delay]
SET pins, 0 [delay]
```

Both SET operations take one execution cycle plus `delay` additional cycles. With a 150 MHz source and integer divider `D`, output frequency is:

`150,000,000 / [D × 2 × (delay + 1)]` Hz.

The square wave has a 50% duty cycle. For the default divider 1000 and delay 7, the result is 9375 Hz. The numeric output frequency responds to the controls; each output period is displayed in two seconds so it can be followed visually. The current SET state, physical package destination and selected PIO block/state machine are reported. There is no CPU throughput, transistor switching, actual clock lock or electrical timing-performance simulation. Output is logic level, not a specified loaded voltage.

Pause, reduced motion and separation stop automatic phase progression. Inputs can inspect both instructions while paused. Reset restores both Cortex-M33 sockets, PIO0 / SM0, GPIO0 (pin 77), divider 1000, delay 7 and the high instruction. Explanatory packet paths and pin highlighting are excluded from physical selection/anatomy inventory and disappear while inspecting a component.

## Validation and source snapshot

- `node --check src/rp2350.js`.
- `/tmp/logic-check.mjs`: finite geometry, all control endpoints, independent PIO frequency arithmetic, GPIO map coverage, mixed architecture, pause/reduced/separation/reset.
- `/tmp/logic-proof.mjs`: actual Three.js assembled/exploded/Play renders in both themes and at 390 × 580.
- Runtime exports `buildRP2350`, `RP2350_BOARD`, standard `behavior` plus `getWaveform`.

Downloaded manufacturer PDF SHA-256: `a638d6780da919162660691bfa02c6dcf7c2a0b6e9f18e2d7519c80b664a2e39`.

Intended use: an educational package teardown and architecture demonstration; internal region placement is not a physical A4 die analysis or manufacturing drawing.

### Render and routing verification

Inspected isolated core alternatives, full operating die, both-theme anatomy/normal close-ups and all eighteen overview states. Automatic framing includes a margin at 390 px width. The demo selects `GPIOBASE = 16` for GPIO 32–47 (otherwise 0), reflecting the documented PIO limit of 32 addressable GPIOs per block at a time. The selected destination remains its actual QFN pin; no 48-bit simultaneous PIO bus is implied.
