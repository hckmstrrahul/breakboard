# Sony KES-400A optical pickup

Interactive Three.js reconstruction, assembled / exploded / operating, desktop and mobile. Units are millimetres. Intended for explanation and inspection, not manufacture, calibration or repair alignment.

## Specimen lock and sources

**Sony KES-400A**, photographed label **1216 / 060905 / 6138**, from Leslie Wright and Sam Goldwasser's original PS3 pickup dissection. The same publication supplies the compatible two-rail PS3 optical deck photograph. The article calls the deck “KES-400AAA”; the original-parts distributor assembly name is **KEM-400AAA**. We retain this distinction instead of inventing a Sony service revision.

- [First-hand dissection and exact labeled photographs](https://www.repairfaq.org/sam/Blu-ray/site1/index.html).
- [Optical component inventory, experiments and microscope observations](https://www.repairfaq.org/sam/Blu-ray/site1/optics.html).
- [Sam Goldwasser's measured pickup overview](https://www.repairfaq.org/sam/opickup.htm), figure 4: 75 mm long / 30 g.
- [Original Sony replacement-parts catalog, MCM](https://datasheet.octopart.com/72-6771-MCM-Electronics-datasheet-21213336.pdf): KEM-400AAA assembly includes KES-400A. A distributor catalog, not a manufacturer dimensional drawing.
- [Sony's three-wavelength pickup announcement](https://www.sony.com/en/SonyInfo/News/Press/200409/04-050E/) supplies manufacturer technology context only; it does **not** establish this specimen's dimensions or silicon revision.
- [Sony patent US20060067196A1](https://patents.google.com/patent/US20060067196A1/en) supports the LCD wavefront-correction interpretation, not a verified production prescription.

No publicly accessible Sony mechanical drawing was recovered for this exact pickup. The source labels, first-hand measured length and photograph-derived geometry are the honest lock; a fictional manufacturer tolerance sheet is not implied.

| Feature group | Evidence type | Model treatment |
| --- | --- | --- |
| KES-400A label, irregular casting, two guide bushings, black shield, connectors | Observed in exact specimen photographs | Proportional reconstruction with real optical openings. |
| Pickup 75 mm length | First-hand measured dimension, not manufacturer drawing | Preserve 75 mm casting span. |
| Deck ≈104 × 150 mm, rails, spindle support, screw drive | Photo-scaled | Dimensions explicitly estimated; one compatible photographed layout. |
| Three laser emitters in one can, one monitor photodiode, five pins | Direct dissection and determined pinout | Exact package / emitter / pin counts; internal locations estimated. |
| 405 nm / red 650–660 nm / 780 nm | Direct dissection text (red is given as 650 and 660 in different sections) | Show approximate red range instead of false precision. |
| Main / side-beam grating D | Observed optic, explained role | Visible engraved lines are representative; microscopic groove pitch not claimed. |
| Small BD cube F, larger CD/DVD cube G | Observed, inspected | Two distinct physical cubes and appropriate return branches. |
| Two detector arrays B/C and return optics E/H | Observed arrays and three associated small optics | BD negative elliptical lens; CD/DVD cylindrical lens plus grating; detector segmentation representative. |
| Variable collimator I, micro-stepper, lead screw, flag | Dissected mechanism; motor ≈6 mm long | Preserve topology and measured motor length. ±1 mm stroke, screw pitch and exact guide dimensions representative. |
| ≈4 mm LCD J | Direct observation; patent-informed function | Representative concentric / divided electrodes; no exact voltage or compensation map. |
| Negative meniscus doublet K | Direct inspection; focal length estimated by authors | Two bonded layers; surface curvatures representative and stay together. |
| Turning mirror L | Observed | 45° modeled reflection plane joins horizontal and vertical axes. |
| Wave plate M | Observed, retardance uncertain in author experiments | Named wave plate; no unsupported quarter-wave assertion. |
| One aspheric objective N and separate circular diffractive optic | Disassembled and microscope-inspected | Separate geometry attached to one moving carrier. Lens profile is approximate. |
| Zone plate ≈48 ring pairs | Author microscopy estimate, dimensions uncertain by at least ±25% | 48 visible ring pairs; relief increased to .012 mm for inspection. No exact optical phase profile asserted. |
| Four fine suspension wires, coils and fixed poles | Photo-derived topology / estimated dimensions | Focus and fine tracking move lens and coils; endpoints follow carrier. |
| Reference disc / colored beam paths | Explanatory overlay | Excluded from physical parts inventory and hidden for separation or selection. |

## Behavior and limitations

Track selects a radial position; Play scans ±18% around the selected track over eight seconds. All pickup parts and the lead nut move together; the fixed guide shafts and motor remain on the deck. The 33 mm stroke and 2 mm lead pitch are coherent authored dimensions, not a measured drive timing law.

Focus ±0.6 mm and fine tracking ±0.4 mm are enlarged inspection motions. The microscope-scale travel, working distance and actual servo bandwidth are **not** claimed. Collimator control moves its lens and nut ±1 mm with matching 0.7 mm pitch screw rotation. The three disc formats choose the emitter and the appropriate return detector. The Gaussian return-strength indicator drops with focus/tracking offsets; it is an illustrative scalar, not a calibrated RF eye pattern, astigmatic error signal or optical simulation. Colored lines show common outward path and the distinct reflected return route. They do not model beam splitting coefficients, birefringence, chromatic correction or diffraction.

Pause freezes phase; paused input changes remain inspectable. Reduced motion disables autonomous scanning. Reset restores defaults and pose. Camera orbit is not physical input.

## Snapshot / reproducibility

Downloaded 2026-11-05 into `/tmp/breakboard-storage-reference`; linked photographs are not redistributed in app assets.

- `bluray-optics.html` SHA256 `14620f911dcf82b93002cacf5bc76126f0dfa5c4c5a84cc4d774754c472877b3`.
- `kes400a-t.jpg` SHA256 `d556af566e8c91fd9a1ffadcb2df4a11780142d6ee41d9685c05bea4e15856cb`.
- `kes400ap-t.jpg` SHA256 `b9823e734e76ffea739411b1f4d84094d34e0aa535e88ddfb2aa2dadcc145879`.

Maker proof uses `/tmp/storage-proof.mjs` against the actual runtime. Dark/light assembled, exploded and Play screenshots at 1000×800 and mobile 390×580; frames `/tmp/storage-final-bluray-*.png`. Finite geometry, control boundaries, lead/nut correspondence, pause, reset, reduced motion and independent checker review are required before integration.

Maker checks completed: `/tmp/storage-check.mjs` validates finite attributes, every control endpoint, pause / reduced motion / separation gating, reset, format-dependent detector selection and focus-dependent return strength. Both guide bushings have real bores; the objective carrier has a real central aperture; the collimator nut remains on its screw at both endpoints. Rigid detail is locally batched inside each moving pickup group, leaving objective, collimator, screw and suspension motion independent. Final narrow-screen framing was widened to preserve the deck and reference disc. `fitShadows: true` uses shared full-assembly shadow bounds. Dark/light/mobile and close-up/X-ray renders were inspected without browser errors.

### Independent guide-corridor correction

All perimeter ribs crossing either guide now pass below the shaft corridor. The fixed-to-nut connector passes beneath the left guide, and the lead-screw nut has a real 1.28 mm bore around the screw. Independent axial rays at the three bearing centers find no casting obstruction; this checks the casting as well as the already hollow bushings.
