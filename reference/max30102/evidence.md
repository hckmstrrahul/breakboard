# MAX30102 reference lock

Selected bare sensor: **Analog Devices / Maxim MAX30102EFD+**, 14-contact OESIP, no carrier board. Datasheet **19-7740 Rev 1, October 2018**. The package drawing currently linked from ADI's exact product entry is **21-1048 Rev F** (not the obsolete Rev B embedded in early distributor copies).

Primary evidence:

- [MAX30102 datasheet Rev 1](https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf): pp. 1–4, 8–9 and 31. Body 5.6 × 3.3 × 1.55 mm, integrated cover glass, fourteen pins at 0.8 mm pitch, separate 660 nm red and 880 nm IR emitters, photodiode active area 1.38 × 0.98 mm, eighteen-bit ADC, current range 0–50 mA, red then IR sequencing and pin functions. PDF read through browser source extraction; direct local download was unavailable during modelling.
- [ADI exact product / package link](https://www.analog.com/en/products/MAX30102.html).
- [21-1048 package drawing](https://mds.analog.com/api/public/content/olga_21-1048.pdf): visually inspected current Rev F, 128390 bytes, SHA-256 `0fc5d5e9b078036afd2f516e0092dd896171311e49ac7b0a5bbaa589b47a369f`.

| Feature | Evidence class | Implementation |
| --- | --- | --- |
| Body envelope | Documented | 3.3 X × 1.55 Y × 5.6 Z mm; substrate / body / glass individually separable. |
| Lands | Documented | Fourteen .7 × .3 mm lands, .8 mm pitch, row centers 2.4 mm apart. Thin land height is illustrative. |
| Optical openings | Documented | Receiver 1.97 × 2.75 mm centered Z −.822; LED 1.97 × 1.094 centered Z +1.64. True open apertures. Corner radii estimated from drawing. |
| Glass | Documented outline | 0.20 mm nominal thickness, footprint 0.10 mm inside package perimeter. Tint and index treatment illustrative. |
| Detector active rectangle | Documented size | 1.38 × .98 mm; representative position within receiver die. |
| Receiver die / emitters | Representative hidden assembly | Plain receiver die and two separate LED dies. No transistor layout or assertion of exact production die count. |
| Internal bonds / walls | Representative | Hollow outer shell and central optical divider; bonds clear the cavity walls. Metal/polymer surface treatment is illustrative. |
| Tissue and light paths | Explanatory overlay | Excluded from physical anatomy / picking. Purple is false-color IR, not visible 880 nm emission. |

Play alternates red, dark, IR, dark slots. Durations are expanded independently for an understandable optical sequence; this does **not** purport to render microsecond pulse timing. A synthetic pulse changes absorption and therefore reflected returns. LED current scales both channels; zero current and absent tissue remove their return. Modulation zero makes the AC waveform flat. The readouts use relative optical quantities, never a fabricated calibrated ADC or clinical SpO2 estimate. A five-second waveform shows synthetic red-channel AC modulation. Pause freezes simulation phase, Reset restores defaults, and separation removes optical operation. Physical package components do not move.

Maker browser proof: light/dark assembled, exploded, operating and close orbit in `/tmp/breakboard-sensing`; numeric and mobile checks are recorded with the final batch review.
