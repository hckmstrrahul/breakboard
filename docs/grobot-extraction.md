# Grobot project split

On 5 November 2026, Grobot moved intact from breakboard to the existing sibling `grobot` project. Breakboard now contains **65 electronics teardowns**. All forty expansion devices remain included.

The Grobot project owns the original model source, grouped Waveshare CAD, evidence/import scripts, supplier notice, both assembled previews, gallery exports and dedicated regression checks. Its independent Three.js viewer retains the same device, materials, wiring, motion, anatomy, selection, navigation controls, mobile panels and image export. The user selected grobot branding.

The extraction used breakboard **e404912**. Ten rendered states—assembled, exploded, anatomy, Play and Play anatomy, in both themes—were compared before removing Grobot here. All ten before/after PNG pairs were byte-identical. The original model source and CAD hashes also match. The Grobot project retains those proofs and the complete source provenance.

Its previous SVG prototype is archived locally as `archive/rev-b-svg/`. Its new `output/index.html`, `output/index-dark.html` and `output/grobot.html` are the portable Three.js application. Complete project documentation and seven skill packs accompany the independent source. No new Grobot remote repository or hosting URL was created.

In breakboard, the Grobot builder, CAD payload, previews, active gallery entry, evidence files and dedicated test were removed. The historical original-device list remains intact, with an explicit moved-device list used by current catalogue checks. Historical 66-device expansion reports describe the release before this split and should not be interpreted as the current catalogue count.

The full retained-device regression suite, production build and 65-device catalogue/130-preview/130-gallery gate passed. The standalone app loaded and exercised all 65 models with networking disabled in Chrome **156.0.8078.80**, Firefox **157.0** and WebKit **27.2**, including operation, selection, anatomy, reset, both thumbnail themes and 2400 px PNG export.

The resulting `dist/breakboard.html` is **23,448,518 bytes**, SHA-256 `f05418034fda5bbcd6247e11e0cb674c02466ec07dd6bef5df1b362a0c2f9dc0`. Grobot's independent offline file is **2,495,284 bytes** and passed the same three browser engines.
