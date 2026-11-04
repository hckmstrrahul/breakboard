# Collection maker–checker review

Completed 2026-11-04. Scope: six new boards, Pi grouping/material corrections, and a simpler interface across the nine-board collection.

## Roles and evidence

Three makers worked on separate modules. A different maker checked each new board against primary-source drawings, CAD or manufacturer photographs. Root integrated the collection and reviewed browser renders. Cross-check findings: [checker-jetson-orange.md](checker-jetson-orange.md).

| Board | Evidence | Groups | Triangles |
| --- | --- | ---: | ---: |
| Jetson Orin Nano Super | [Jetson](jetson/evidence.md) | 15 | 309,538 |
| Pico 2 W | [Pico](pico2w/evidence.md) | 10 | 121,248 |
| Arduino Nano V3.3 | [Nano](nano/evidence.md) | 10 | 88,276 |
| Original Xunlong Orange Pi 5 | [Orange Pi](orangepi5/evidence.md) | 13 | 337,554 |
| BeagleBone Black Rev C | [BeagleBone](beaglebone/evidence.md) | 14 | 326,770 |
| White/blue NUCLEO-F401RE MB1136 | [Nucleo](nucleo/evidence.md) | 11 | 211,884 |

## Hardware findings resolved

- Jetson: retained official carrier/cooler/support geometry; omitted optional example SSD; replaced closed external connector envelopes with open receptacles. Checked female GPIO housing, silver shells, blue USB3 tongues, DisplayPort profile and label bounds. Module internals remain a documented mechanical envelope.
- Pico: rejected the linked nonwireless STEP as a wireless-board replica. Used the wireless mechanical drawing/component locations. Bare castellated board, shielded radio and 40 contact positions; unknown antenna routing omitted.
- Nano: native V3.3 EAGLE coordinates/rotations, both faces, VQFN processor, underside FT232RL, 30 downward header contacts and empty ICSP footprint.
- Orange Pi: original 100×62 mm blue RK3588S board and 26-pin header; corrected QFN68 PMIC and SOIC8 leads. No 5B wireless/eMMC or 5 Plus geometry substituted.
- BeagleBone: official asymmetric outline/holes, true circular radii, 92 female contacts, corrected QFN/SOIC geometry and underside placement. Drawing/prose dimension discrepancy disclosed.
- Nucleo: correct white/blue F401RE revision, silver Mini-B, 76 morpho and 32 Arduino contacts, 4.064 mm digital gap, blue USER/black RESET, breakaway slots and empty X3. Corrected JP1 open / JP5 U5V / JP6 fitted defaults.
- Pi: one SMD group retaining all small-package solids; silver USB shell with gold electrical contacts retained.

## Automated verification

`npm run build` and `npm run check` pass after final corrections. Vite reports an advisory about the large Three.js/application bundle; production build succeeds.

- All nine unique routes, metadata, group inventories and explanatory specifications.
- Finite vertices, valid indices, exact 0/25/50/75/100% poses, floor clearance and assembly reset.
- Every part isolated; X-ray and batch visibility; accessory toggles.
- Source envelope/pitch/retained-CAD checks; extra PCB bounds checks where builders expose a single PCB mesh. Custom-outline builders received separate maker/checker dimension checks.
- Pi/Jetson loading from decoded gzip, raw gzip and offline base64; missing/malformed responses.
- Standalone HTML embeds fonts, JavaScript and both CAD payloads.

## Browser and interface review

Coverage: desktop 1728×963, compact 864×482, mobile 390 px and 320×800. All six additions reviewed assembled/exploded against reference material; Nucleo also reviewed from top. Pi grouping/material corrections reviewed. No horizontal overflow or clipped controls at 320 px; full explanations remain available.

Functional coverage: board selection; search/no-result recovery; component selection; isolation/X-ray; separation; camera views; tour start/pause/keyboard interruption; reset; source dialog; hide/show UI and Escape focus restoration. Export produced a real 2400×1590 PNG. Geometry tests exercise every part on all nine boards. Console review found no application errors; an unrelated wallet extension emitted an injection error.

### Consolidated interface audit

| Domain | Changes and verification | Result |
| --- | --- | --- |
| Writing | Removed marketing introductions, edition labels, redundant counters and repeated callouts; retained technical descriptions/specifications/sources | Pass |
| Layout | Native picker, one selected label, collapsible lists/specifications, responsive inspector | Pass at reviewed widths |
| Accessibility | Named controls, visible focus, keyboard camera/picker, live heading, empty state, reduced motion, inert hidden UI | Pass in keyboard/DOM review |
| Typography | Responsive titles, 16 px mobile fields, full wrapping without truncated explanations | Pass |
| Color | Measured muted text 4.95:1, accent 5.15:1, input boundary 3.41:1 on actual backgrounds | Pass for measured pairs |
| UI polish | Neutral metals, restrained controls, loading/retry state, selection and 2400 px export | Pass |

Resolved: overflowing component list, truncated mobile prose, three-board keyboard assumption, tour overriding keyboard selections and focus remaining in hidden controls. No known blocking finding remains in the reviewed scope. This targeted review is not a formal screen-reader or WCAG certification.

## Limits

CAD is used where available. Other models combine verified envelopes/interfaces with photo-derived placement and representative detail. Evidence records and in-app dialogs identify estimates. Educational explosion does not imply soldered packages are user-removable.

Browser security policy rejected directly opening `file://.../dist/breakboard.html`. No workaround was used. Offline embedded assets passed loader/HTML tests; browser review used the local Vite app.

## Follow-up: surface selection and segmented navigation

The user's intermittent callout report exposed a gap in the initial selection review: it checked the selected group but not whether the pointer stayed on the exact clicked piece within that group.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH, resolved | `src/scene.js`, `src/selection.js` | Raycast hit point discarded in favor of fixed group anchor | Store the exact hit in group-local coordinates; project it every rendered frame | Labels follow the clicked piece through separation and orbit |
| HIGH, resolved | `src/main.js`, `src/style.css` | Label clamping displaced its dot; label overlay intercepted clicks | Independently constrain text, retain exact SVG leader origin, and pass pointer events through | Pointer stays attached and cannot steal adjacent clicks |
| MEDIUM, resolved | `src/scene.js`, `src/selection.js` | Drag returning to its origin could select a part | Track maximum movement; cancel on touch cancellation, secondary pointers and right-button pan | Camera gestures do not accidentally select |
| Requested change | `src/main.js`, `src/style.css` | Dropdown and footer row | Nine-segment radio control with roving keyboard focus and horizontal mobile scrolling; footer removed | Direct board switching and less chrome |

Sources remain accessible from Model sources; Hide interface moved into the viewer tools. Verified Home/End/arrow navigation, a single tab stop, selected segment visibility, no page overflow at 320/390 px, and clean-mode Escape focus restoration. Live browser clicks before/after orbit matched the SVG pointer origin to numerical precision; labels do not intercept pointer events. Regression checks cover two distinct surfaces within one group, batched pick proxies, hidden groups, exploded coordinates, multiple camera positions, viewport-edge layout and drag/touch cancellation. Full build and collection checks pass, including `scripts/check-selection.mjs`.

UI-polish verdict: Approve for the reviewed states; no outstanding interaction or polish findings from this follow-up.

## Follow-up: appearance, Jetson loading and unified specifications

- Added persistent Light / Dark / System controls, including keyboard selection and live system preference handling. Dark mode uses a deep muted gray-green background (`#111d17`); overlays, guides and PNG export follow the resolved appearance. Hardware materials retain their original colors.
- Bundled the compressed Jetson CAD with the application, removing the late asset request that could fail on board selection. Production and standalone payload checks verify all 1,920 source shapes and 267,668 CAD triangles with fetch disabled; the standalone file includes this payload once.
- Merged board facts into the existing component specification rows. Semantic mappings suppress repeated facts while preserving distinct component clocks and every original component specification. The Uno processor now shows Clock, Flash / SRAM, Package, Digital I/O and Analog inputs exactly once.
- Unified assembly controls with the header segmented style, placed automatic space before the separation slider, matched Save image to other outlined buttons, and removed Model sources and its dialog. Source evidence remains in this repository.

Validation: `npm run build` and `npm run check` pass, including the new interface regressions. Native Chrome review covered fresh Jetson loading, light/dark switching, persisted dark preference after reload, keyboard appearance selection, and the 320 px layout. System preference changes and denied storage were exercised in automated tests. A fresh browser reload showed no console errors; remaining warnings were from a browser extension.

Measured dark-theme contrast: primary text 14.09:1, muted text 8.34:1 on the page and 7.07:1 on raised surfaces, selected accent 5.49:1, control boundaries 4.60:1 on the page and 3.90:1 on raised surfaces. A real 2400 × 2328 PNG export was checked for the exact dark background RGB (17, 29, 23). At 320 px, appearance/export controls fit and assembly controls wrap without clipping.

## Follow-up: Untitled UI, cool dark appearance and live operation

The official Untitled UI MCP supplied the public button, button-group, utility-button, input, slider and tabs components. Their presentation is adapted to the existing semantic HTML; the retrieved sources and decisions are in [untitled-ui/README.md](untitled-ui/README.md). Official icons replace the hand-drawn control icons. The original light palette and warm accent remain. The earlier green dark palette is superseded by neutral cool charcoal `#14171c`.

Guided tour and its narration are removed. Play assembles the board before activity begins; fans accelerate gently, identified indicators illuminate and two subtle illustrative signal paths connect functional assemblies. Pi's impeller remains separate from its shroud; Jetson's moving impeller is source solid 273, separated from the two stationary fan bodies without changing the CAD triangle count. Play preserves isolation, connections disappear when their context is hidden, and changing separation stops activity. Pause settles power and fan motion; reset and board switching clear operation state. Offscreen/hidden pages do not advance playback, and reduced motion uses a still powered view. The path overlay is an explanation, not a netlist or measured electron speed.

The anatomy skill is applied as a Figure treatment of the existing models: many original solids, four-tone surface shading, fine geometric contours, one restrained selection accent and shared world coordinates. The inventory is the existing nine board part lists and their constituent CAD/package solids. X-ray reuses the exact existing geometry and transforms instead of constructing separate approximate shapes; the GPU provides depth ordering within the context and selected-assembly passes. Selected-through-shell picking follows that same order. Surface anchors also track rotating hardware. Isolation and X-ray compose without bringing back hidden assemblies. This is anatomy of the modeled structure, not a claim to unknown buried copper, die layouts or omitted packages. The SVG kit's standalone geometry/line audit is not applicable to this shared WebGL geometry; matrix/geometry identity and visibility are tested directly.

`npm run build` and `npm run check` pass. New operation regressions cover all nine boards, actual LED counts, movable/stationary geometry, assembly gating, stop/reset, signal terminals, reduced motion, anatomy transforms at 0/50/100% separation, and combined isolation/X-ray. Existing CAD dimensions, inventory, full pose, selection, asset loading and theme tests also pass. Browser review covered both appearance palettes, Jetson playback, fan isolation with X-ray, light X-ray, and 320 px mobile toolbar/specification layout. Selected board tabs now stay visible after resizing. A fresh browser console showed no application errors; browser-extension warnings remain.

Measured cool-dark contrast: primary text 15.02:1; muted text 8.10:1 on the page and 7.30:1 on surfaces; input boundaries 3.83:1 on surfaces; primary Play label 8.01:1 in dark and 6.16:1 in light.

Final visual check: Pi blower playback retains its stationary silver housing while the impeller and hub marking rotate. Isolated X-ray export produced a real 2400 × 2217 PNG; the image was opened and inspected for complete geometry, fine contours, a neutral cool background and the absence of interface overlays. Developer tools/device emulation were closed after review.

## Follow-up: complete ESP32 separation and click-away anatomy

ESP32 previously merged its USB connector, bridge, regulator, buttons, indicator and carrier SMD packages into the stationary PCB group. The crystal and module SMD packages also stayed attached to the module substrate. These now have separate selectable groups and explosion offsets: 14 groups total, with small packages grouped by their carrier or module PCB. PCB artwork, plated contacts and the printed antenna stay with their substrates. Geometry is unchanged: all 118,786 triangles and the sorted assembled world-space vertex hash match the pre-change model. Component roles follow the [Espressif DevKitC guide](https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html); existing estimated geometry and illustrative hidden placement remain estimates. Assembly trails follow actual part anchors. Playback now uses the USB → bridge → processor anchors.

Clicking empty canvas space clears selection and its callout, shows board-level specifications, and disables Isolate until a component is selected. X-ray stays enabled and draws every visible component with opaque anatomy surfaces and contours in one depth-tested pass. Selecting a component restores solid anatomy for that component and ghosted context for the rest. Clearing an isolated selection returns the whole board; normal isolate, orbit, separation, playback and export behavior remain available.

Validation: `npm run build` and `npm run check` pass. Regression checks verify bare ESP32 substrates, clearance for all newly separated groups, their actual raycast selection at assembled/default/maximum separation, exact assembly restoration, and full-anatomy → selected/ghost → full-anatomy transitions for every board at 0/50/100% separation. Native Chrome review confirms ESP32 floating components, whole-model anatomy after a blank-space click, USB reselection with ghosted context, and the assembled Raspberry Pi in full anatomy with no selected label.

## Follow-up: anatomy outlines and original surface graphics

The anatomy renderer previously omitted every textured mesh. It now retains all 86 existing artwork layers across the nine boards, using their original textures, UVs, geometry and world transforms. Printed labels, logos, symbols, pin names and PCB artwork become monochrome ink. The ESP32's three opaque PCB artwork textures declare their solder-mask background so only their markings appear over the anatomy fill. No new branding or hidden construction was invented. Artwork remains depth-tested, fades with ghosted context, hides with isolation, and follows the moving fan label.

The former 28-degree contour threshold produced zero edges for the rounded ESP32 shield and packages. A 20-degree threshold restores their real bevel boundaries; higher-contrast, unlit ink keeps the fine strokes legible in both themes. No triangulation wireframe or behind-surface overlay was added.

Validation: production and standalone builds and all nine-board checks pass. Added regressions cover complete artwork inventory, original texture/UV/geometry identity, registered transforms at multiple separation settings, isolated/ghosted visibility, moving rotor markings, and nonempty outlines on rounded ESP32 packages. Native Chrome review covered the complete exploded ESP32, a close-up of its shield wordmark/text/symbols in light and dark themes, and the assembled Uno's dense original PCB graphics and package labels.

## Follow-up: quieter PCB artwork and whole-board X-ray entry

The earlier monochrome conversion gave copper routing the same visual weight as printed silkscreen. Uno and Nano PCB textures now identify their copper paint color; the anatomy ink pass excludes that routing while retaining printed labels, logos, pad graphics and component contours. The normal material still uses the full original artwork. Turning on X-ray clears the component selection to show the whole model in anatomy by default. An explicitly isolated part keeps its isolation; subsequent component selection still ghosts the rest, and clicking empty space restores the complete anatomy view. Production/standalone builds and the nine-board check suite pass.

## Follow-up: preserve viewer modes across board tabs

Board switching retains the session's X-ray flag, playback flag and selected 3D/Top/Front camera view. It clears board-specific selection/isolation and applies the retained camera to the new board before rendering. Active playback starts the incoming board assembled, including ESP32, whose usual initial view is exploded. X-ray starts the incoming board in complete anatomy, without inheriting a component ID from the previous board. Pending loads and retries leave these mode preferences intact; Reset still explicitly restores the defaults. Controls are enabled before their state is synchronized so Isolate remains disabled when no part is selected.

Validation: build and nine-board checks pass. Native Chrome review confirmed Jetson → Uno retaining X-ray, Pause and Top; Uno → ESP32 retaining X-ray, Pause and Front with separation at 0%; and ESP32 → Nano retaining paused playback, X-ray off and 3D. The ESP32 screenshot confirms the camera itself uses Front, matching its active control.

## Follow-up: overview tags and compact callouts

Clearing selection now shows tags for all active component groups when labels are enabled. Selecting a component restores its single surface-anchored tag; disabling labels hides both tags and leaders. Overview tags use the same 24 px offset as selected labels, with local packing to avoid overlap instead of extending every line to the viewer edges. Dense boards reserve enough height for their labels. Disabled accessories remain excluded. The divider beneath the header is removed, and Isolate/X-ray sit beside the assembly tabs at content width.

Validation: production/standalone build and nine-board checks pass. Targeted layout checks cover 14 and 47 tags, narrow and wide viewports, crowded anchors, bounds, overlap, unchanged anchor points and the short callout offset. Native Chrome review confirmed all 14 ESP32 tags after clicking empty canvas, label visibility toggling, returning to one selected tag, compact connectors, and all 47 Uno tags in whole-board anatomy.

## Follow-up: nearby overview labels and breakboard naming

The two-column packing still pushed crowded tags far below the board. Overview labels now search nearby space around each projected component anchor, with collision avoidance and short leaders. Required viewer height follows label area instead of the length of two stacked columns. Labels render above leader lines. Uno's small packages use their printed reference codes in the overview; selected labels and accessible names retain full component names. Pi's overview tags are abbreviated without changing its component inventory or selected explanations.

Regression checks project real anchors for all nine boards in assembled and exploded states, across 3D, Top and Front views at 320, 800 and 1260 px widths. They verify complete tag coverage, viewport bounds, no label overlaps, unchanged anchor positions and desktop leaders shorter than 220 px. Native Chrome review confirms compact whole-board anatomy labels on Uno, Pi and Orange Pi Front, plus full Uno component names after selection. The app, package, documentation and standalone output are named **breakboard**; the previous appearance storage key is read only to migrate existing preferences.


## Follow-up: readable Uno names and selective subsystem labels

Uno overview labels now retain component types alongside their board references, such as `C4 · CAPACITOR`, `RN2 · RESISTOR NETWORK` and `U1 · 5 V REGULATOR`. Their leaders have at least 24 px clearance and can extend farther into nearby space. Other boards keep their compact packing. All 47 Uno labels remain present.

All nine inventories were reviewed. ESP32, Pi and Jetson already expose their main functional assemblies; routine small packages remain grouped. Nine additional callouts now identify existing modeled geometry:

| Board | New selectable groups | Evidence |
| --- | --- | --- |
| Pico 2 W | User LED; SWD debug pads | Official datasheet §§3.8–3.9 and component-location drawing. Pads stay on the PCB. |
| Arduino Nano | F1 USB resettable fuse; D1 USB power diode | NanoV3.3 EAGLE references, values and underside footprints. |
| STM32 Nucleo | Communication, user and power LEDs | ST UM1724 §6.4. |
| Orange Pi 5 | Debug UART header; 5 V fan connector | Manufacturer’s annotated top photograph (V1.3.2), retained locally; original Pi 5 manual. |
| BeagleBone Black | Serial debug header; power/user LEDs | Official connector documentation and component-side photograph. |

Before/after checks matched the sorted assembled world-space vertex hashes (rounded to 0.0001 mm) and triangle counts on all five changed boards. No geometry was added or removed. Existing full-pose, isolation, anatomy and playback checks pass, including unchanged indicator counts. Label layout checks cover all nine boards in three cameras, two assembly states and three viewport widths. Native Chrome accessibility inspection confirms all 47 Uno labels have readable component names and no intersecting boxes; icon bounds confirm 6 px gaps, previously 2 px. The browser title is exactly `breakboard`. Pixel screenshot review could not be repeated because the browser capture connection failed and the desktop fallback lacks screen-recording permission.

Board dimensions move from the introduction into the specification list. Existing equivalent outline/envelope rows suppress the new row, and all board/component combinations are checked for exactly one size. The first specification divider is removed. Sharing metadata now supplies an explicit title, description and existing public Pi image; actual social crawler previews remain dependent on deployment and crawler caching.


## Expansion: seven devices and grouped menus

Added Portenta X8, Dalibor Farny R Nixie tube, Adafruit NeoMatrix 8×8 v2, TI DLP6500FYE, Raspberry Pi HQ Camera (CS), a representative 42 mm hybrid stepper and HackRF One r10. Three maker passes built the electronics, optics and mechanisms; the integration/checker pass reviewed actual application renders and exercised the shared controls.

Corrections found during review: camera optics clipping at full separation; unreadably small DLP scale labels; overlapping Nixie cathodes; smooth-glass contours missing from anatomy; stepper winding/iron clearance; and HackRF headers incorrectly treated as unpopulated. Final source evidence lives beside each model's reconstruction record. Motor internals, Nixie electrode details and DLP magnified support geometry remain explicitly illustrative. DLP pitch and ±12° tilt, Nixie contact pattern, exact PCB placements and supplied Portenta solids retain their documented values.

The header groups devices in pill menus under Boards, Displays, Optics, Motion and Radio. Menu buttons support arrows, Home/End, type-ahead, Escape and outside dismissal. Closing a menu does not reset viewer state. Mobile uses the same grouped inventory in its native picker. New Play behaviors include single-cathode selection, a pixel wave, 1.8° shaft steps, 16 enlarged mirrors tilting ±12°, and parallel light rays through the lens-free camera mount.

Verification: all sixteen devices loaded from the standalone local file in Chrome with networking disabled and zero HTTP requests. Browser tests covered mode persistence across each new device, tags off initially, selected tags, isolation, complete anatomy labels, Play, grouped mobile selection and no console errors. Existing geometry, pose, picking, callout, theme and operation checks were extended to the new inventory. Fourteen new 2400 × 2217 px light-mode gallery exports pair realistic and anatomy views. Desktop and emulated mobile review does not replace physical-phone testing.

## Addition: Grobot / Anchor revision B

Grobot joins Motion as a 22-group assembly. The supplied revision B hardware inventory sets the module choices and front-panel arrangement. Official Waveshare STEP files provide 281 UPS circuit-board solids, five holder solids and 39 LCD solids. Manufacturer dimensions constrain the BAK cells and SG90; the matching AYWHP photograph guides the dual-USB-C, 44-contact controller. The voice-kit modules, speaker, enclosure, mounts, controls and harness retain their documented reconstruction limits. Four filaments make two working red/green bars; the third tray and six reserved driver positions remain unpopulated. [Evidence and sources](grobot/evidence.md).

This addition was checked through source comparison, geometry checks and browser inspection in the same implementation pass; it did not receive a separate agent or physical-hardware review. Corrections during inspection included the UPS orientation, cell centres, microphone port alignment, servo badge surface, component separation, floor height and dedicated front/top camera positions. Automated checks cover imported PCB dimensions, cell clearance, cut-through fascia apertures, the common servo/anchor axis, filament count and bounded ±30° motion. They do not establish manufacturing tolerances, thermal safety or electrical correctness.

Realistic and anatomy captures were inspected in assembled and exploded states, with separate checks for Play, front/top cameras, isolation and selected labels. Header alignment and responsive layouts passed at 1600, 1280, 1024, 800 and 390 px widths. The new brand subline and smaller social icons remain visible at phone width. The full model suite passes for all 17 devices, and all 17 load from the standalone HTML with networking disabled and no HTTP requests. Two 2400 × 2217 px light-mode exports were saved through the app and visually reviewed. No private Grobot project files, service settings, purchase records or portfolio data were copied into the repository.
