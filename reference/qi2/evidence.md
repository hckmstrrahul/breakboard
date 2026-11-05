# Qi2 transmitter and receiving assembly — evidence lock

Retrieved 5 November 2026. Educational reconstruction in millimetres; this is a charger plus an extracted phone back-glass assembly, not a complete phone or a fabricated standalone receiver board.

## Reference configuration

**Transmitter:** Apple MagSafe Charger **A2580**, 1 m 2024 model, Hong Kong retail specimen dissected by ChargerLAB on **22 October 2024**, assembled in Vietnam. Its visible main PCB marking is **820-02833-06 / 2410 08**. No unpublished firmware or silicon stepping is inferred from that marking.

**Interface lock:** Wireless Power Consortium **Qi ID 14294**, certified **9 September 2024**, **Qi version 2.0.1, Magnetic Power Profile, 15.0 W potential load power**. The A2580 also supports proprietary higher-power MagSafe modes with later iPhones; this model explicitly demonstrates the 15 W Qi2 MPP configuration, not Qi2 25 W / v2.2.1.

**Receiver:** the **iPhone 15 Pro rear-glass/charging assembly** photographed in iFixit guide **166397**, step 19, snapshot last updated **1 May 2026**. Apple specifies Qi2 charging up to 15 W for this phone. The guide does not expose a regional phone identifier, coil factory revision or receiver IC stepping; none is asserted. The relevant back assembly is shared across the variants listed by iFixit; a different phone's motherboard is not substituted. This is a documented compatible transmitter/phone combination, not a claim of a laboratory-tested matched evaluation-board pair.

## Primary references

- [WPC certified A2580, Qi 14294](https://jpsapi.wirelesspowerconsortium.com/products/qi/14294).
- [Apple iPhone 15 Pro specifications](https://support.apple.com/en-gb/111829): Qi2 / MagSafe 15 W, magnet array and alignment magnet.
- [Apple MagSafe use and compatibility](https://support.apple.com/en-us/105047).
- [ChargerLAB first-hand A2580 teardown, 22 October 2024](https://www.chargerlab.com/teardown-of-apple-25w-magsafe-charger-hk-a2580/).
- [iFixit first-hand back-glass removal, guide 166397](https://www.ifixit.com/Guide/iPhone+15+Pro+Back+Glass+Replacement/166397), step 19. Inspection photo SHA-256 `1bcb7f730343eed51d0de86a413fcb0f047ce9c6ca1e621e97884ab0ee7a87b0`.
- [Apple dimensional drawing, dated 2023-10-10, current copyright 2026](https://developer.apple.com/download/files/accessories/dimensional-drawings/iphone-15-pro.pdf), sheet 1 exterior/camera geometry; sheet 2 charging-center and keep-out. The 57.50 mm keep-out circle is **not** mislabelled as a physical coil diameter.
- [Apple FCC grant BCGA2580, 9 September 2024](https://fccid.io/BCGA2580): 127.7 and 360 kHz modes. The illustration uses the MPP 360 kHz mode. Confidential schematics/BOM are not accessed or inferred.

## Feature evidence

| Feature | Classification | Scope |
| --- | --- | --- |
| A2580 exterior | Measured by first-hand source | Ø55.5 × 4.45 mm, aluminum shell, white contact face, braided cable and USB-C plug. Cable is shortened in the model for compact inspection, rather than claimed full length. |
| Main PCB identity | Observed | 820-02833-06 / 2410 08 visible in the source. Round board, central STWTA1A1 power IC, STWTD1A0 controller, crystal, two inductors, three MOSFETs marked 96 and surrounding passives. Coordinates and package dimensions are photo-estimated; unidentified markings stay unidentified. |
| Coil, ferrite, carrier, copper back foil | Observed construction / estimated dimensions | Single flat Litz-wire power winding, black ferrite backing, plastic retaining frame and copper shielding. Winding pitch/turn count and constituent strand count are approximate visible reconstructions, not a manufacturing winding specification. |
| Contact-face shielding and communication winding | Observed / simplified | Patterned copper shielding and separate fine communication winding are visible under the cover. The etched slit pattern is simplified and the small winding count is not asserted. |
| Transmitter magnets | Observed assembly, individual count unresolved | Perimeter magnetic alignment array retained in its covered carrier. No invented number or pole orientation of hidden individual magnets is asserted. |
| USB-C electronics | Observed / photo-estimated | Separate small PCB in steel protection sleeve, two main ICs, oscillator, inductor and potting. Readable source codes include 3GK07 and TI CP3100A1; unpublished circuit is not reverse-engineered. |
| Receiver rear-glass outline and cameras | Documented envelope / photo-estimated glass section | Apple phone envelope 146.61 × 70.60 mm, three camera surround diameters 16.20 mm; model back-glass edge inset/thickness and supporting metal are estimated. It is not a full camera or phone teardown. |
| Receiver location | Documented | Center at 35.30 mm from left and 74.98 mm from phone top in Apple sheet 2. Outer magnet carrier and lower alignment bar placement are scaled from the source photograph. |
| Receiver coil and shielding | Observed envelope / representative hidden cutaway | The source shows the covered circular receiver, flex and surrounding magnetic assembly. Hidden copper spiral turns, wire section, ferrite thickness and adhesive stack are representative, not measured internal anatomy. |
| Receiver flex | Observed outline / estimated contacts | Flex exits toward the logic-board connector and extends to flash/microphone features. Its contact count and microscopic routing are not claimed. The rectifier/controller resides on the omitted phone logic board; no fictitious receiver PCB is added to the back glass. |
| Alignment demonstration | Representative qualitative model | X/Z translation and additional gap alter a qualitative strong/reduced/weak alignment state. No measured efficiency, charging time, field strength, thermal limit or precise shutdown threshold is claimed. |
| Electrical animation | Representative | Alternating coil excitation and an explanatory receiver-to-rectification indication show roles. The 360 kHz carrier is displayed at 0.8 Hz; the requested load and 15 W certification limit do not imply measured delivered power. |

## Rights

Evidence photographs, FCC exhibits and manufacturer drawings are linked, not embedded or redistributed. The geometric reconstruction and simplified markings are original. No Apple logo, Qi certification logo or claim of certification of this visual model is used.

## Maker checks

Finite geometry, all control extrema, reset, pause/reduced-motion/separated gating and 30/60/120 Hz cadence pass. Off-center drag preserves the grab point and translates all five receiver groups together. Qualitative alignment falls with offset and gap, excitation-off removes the illustrative induced signal, and numeric load readouts remain requested values rather than predicted delivered power. The ferrite center patch clears its surrounding annulus; magnet support surfaces are seated; the USB-C opening is open; winding terminal leads meet their actual endpoints and receiver solder pads bridge to the flex.

Desktop light/dark and mobile assembled/exploded/Play images were individually inspected, along with both-theme anatomy and the maximum offset/gap pose. Anatomy retains the application’s established opaque physical inventory and omits explanatory effects. The hidden receiver winding and response curve remain explicitly representative. Independent checker review and actual-app shared pointer integration follow the maker freeze.
