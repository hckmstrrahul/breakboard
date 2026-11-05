# Murata SF2124E SAW filter

Status: evidence locked; maker and independent checker gates passed. The interior is a **representative cutaway**, not an attributed production die image.

## Reference lock

- **Murata SF2124E**, six-terminal **SM3030-6**, datasheet revision **8/29/19** (29 August 2019), copyright December 2014. This is the legacy ceramic part, not a modern I.H.P. SAW resin package.
- [Manufacturer datasheet, distributor mirror](https://www.mouser.com/datasheet/2/281/sf2124e-1359164.pdf), pages 1–4. Local downloadable [matching 2019 mirror](https://xonstorage.z8.web.core.windows.net/pdf/murata_sf2124e_apr22_xonlink.pdf), SHA-256 `c96065ad7597515778f48aee61e724f4d8a96ce9117fa125b1b061fdc9cd50ae`.
- [Murata SAW technology overview](https://corporate.murata.com/en-us/technology/technology-applications/saw), operating principle only. Its modern resin encapsulation and I.H.P. stack are **not** attributed to this older ceramic part.
- [Murata PZT application manual](https://dicasdozebio.com/wp-content/uploads/2022/03/murata-pztapplicationmanuala.pdf), printed page 80, Figure 88: input/output interdigital transducers, piezoelectric substrate, edge absorbers and lead wires. SHA-256 `d69fbb36b1e6cac94de34d6bd5f61153b56905f575e016cb2af9e01ddbb3b69a`. No revision date is asserted for the mirrored manual. It establishes a general transversal-filter construction, **not SF2124E's proprietary topology**.

Retrieved 5 November 2026. The downloaded 2022 RFM/Akoustis reissue was rejected as the primary lock; the selected 2019 Murata drawing was opened separately. No incompatible electrical limits from the 2013, 2015, 2017 or 2022 editions are combined.

## Evidence map

| Feature | Class | Model treatment |
|---|---|---|
| Package outline | Documented | 3 × 3 × 1.25 mm nominal; six bottom lands, larger pin-1 land, edge recesses and nominal 0.9 mm ceramic body height follow page 4. Small corner radii/recess diameter are estimated from the drawing. |
| Contact pattern | Documented | Six contacts: input 2, output 5, grounds 1/3/4/6. The model adopts the indicated orientation, rather than presenting arbitrary interchangeable port placement. |
| Finish | Documented | Alumina body, nickel-plated lid and gold-over-nickel pads. Plating thickness is represented by finish, not multiplied physical shells. |
| Lid text | Documented identifier | `646`, pin-1 dot and literal `YWWS` date/shift placeholder; no invented specimen serial. Text placement is reconstructed. |
| Cavity/seal/die attach | Representative | Authored wall thickness, substrate size and seam. They are inspectable solids with a real cavity. |
| Acoustic substrate | Representative | Its piezoelectric role is documented generally; crystal composition, crystal cut, layered construction and die size are undisclosed for this part. |
| Electrodes | Representative | Two visible 40-finger combs use an enlarged 14 µm display pitch. Counts, pitch, metallization, bus routing and topology are not SF2124E production facts. |
| Bonds/absorbers | Representative | General Figure 88 arrangement; four authored internal bonds and absorber strips are unverified for this part. External port identities remain correct. |

## Operation

Frequency, input level and optional sweep control a teaching signal. The synthetic symmetric response is `L = min(60, 2.1 + 10 log10(1 + ((f − 2441.8)/55)^8)) dB`; voltage gain is `10^(−L/20)`. The 2.1 dB typical insertion-loss anchor comes from the selected datasheet; the curve shape, bandwidth parameter, rejection and phase are **not fitted or measured S-parameters**. There is no claim of reproducing the vendor response graph or production tolerance.

Automatic sweep traverses 2200–2700 MHz over eight seconds. Colored wave lines, vertical displacement and the output marker are explanatory overlays, excluded from physical anatomy and picking. The actual electrode solids stay fixed. Display oscillation is 1.2 Hz, with enlarged displacement; no physical surface-wave velocity is inferred from the model's finger pitch. Pause, reduced motion and separation freeze the sequence; reset restores the center frequency, input level and manual mode.

## Rights and verification

The shipped model uses original procedural geometry and text. Referenced photographs, PDF diagrams and plots are linked, not redistributed. Manufacturer names identify the selected hardware. The reference PDFs remain local.

Maker checks passed for finite geometry, all separation stops, actual nominal case bounds, pin identities, state reset, pause/reduced motion, zero input, center loss, out-of-band attenuation, waveform response and 30/60/120 Hz sweep agreement. Nine actual-renderer captures were opened in both themes, assembled/exploded, Play, three close-up orbit angles and X-ray. A buried signal fanout was rerouted to avoid emerging through a terminal recess; shadows use the model-sized fitted volume. Independent numerical, source and rendered application review passed; see [batch 8 verification](../../docs/verification/expansion-batch8.md).
