# Grobot — open brass frame

Interactive educational assembly for breakboard, rendered in the existing realistic and anatomy views. Proposed open frame: approximately 122 × 100 × 80 mm (W × D × H). This is a hardware-grounded concept, not a measured finished product or manufacturing drawing.

The supplied Grobot revision B project establishes the component inventory. The user’s handcrafted brass-frame photographs guide a new open layout; they are styling references, not dimensional evidence or substitute hardware. Only hardware facts are carried into this public project; private project files, purchase/delivery records, portfolio information and service configuration are not copied.

| Feature | Evidence and treatment |
| --- | --- |
| UPS HAT (D) circuit board | Official Waveshare STEP: original outline, holes, component packages and connectors; 281 solids. 56 × 85 mm board. |
| Dual-cell holder | Five original STEP solids, including contact springs. Reoriented as a rigid assembly above the perfboard. |
| BAK N21700CG-50 cells | Manufacturer nominal Ø21.25 × 70.50 mm; two individually selectable reconstructed sealed cells. Replace the STEP's generic cell envelopes. 3.6 V / 5 Ah each, 1S2P / 36 Wh nominal. |
| HAT accessories | Vendor stacking studs and acrylic base omitted because the open frame uses its own mounts. |
| Waveshare 1.47-inch LCD | All 39 solids from official STEP. 22 × 38.5 mm PCB, 17.39 × 32.35 mm active area, 172 × 320 pixels, ST7789V3. Screen content is a labelled fictional demo. |
| AYWHP ESP32-S3 N16R8 | Specified by the supplied project. Reconstructed from the matching listing photographs: dual USB-C, 2 × 22 headers, shielded module, regulator, bridge, RGB LED and BOOT/RESET. The reserved 28 × 69 mm carrier envelope remains unmeasured. Listing pin diagrams disagree with the photographed board; no invented pin mapping or clone circuit claim. |
| TowerPro SG90 | Manufacturer 23 × 12.2 × 29 mm envelope and photographs. Blue case, seams, mounting ears, output boss, shaft, lead and label reconstructed. Sealed motor, feedback and gears are not invented. |
| Servo pointer | A proposed perforated single-arm horn, retaining screw and small brass tip replace the anchor and guard. The horn seats on the original servo output axis. Play illustrates a slow ±30° command, not measured feedback. |
| Brass structure | Ø3 mm bent stock forms two rounded open hoops and four ties. Small brackets, insulating washers and silver solder fillets expose the construction. These new frame dimensions and joints are proposed; the frame is not an electrical conductor. |
| Perfboard | Custom 120 × 98 × 1.6 mm FR-4 carrier with actual through-holes and isolated copper annuli on a 2.54 mm grid. Two 22-contact socket rows line up with the controller. A pad-per-hole concept, not a routed PCB or solderless breadboard. |
| Filaments | Four 40 mm filaments: two red and two green, paired into two exposed vertical pairs. Continuous filaments, not NeoPixels. No third pair is fitted. Nominal cross section reconstructed from the inventory listing. |
| Filament mounts | Eight proposed insulating end clips and solder terminals replace the covered trays. Four filaments retain their original 40 mm length. |
| INMP441 | TDK 4.72 × 3.76 × 1 mm bottom-port package. Reconstructed 16 × 14 mm breakout reservation. Acoustic opening goes through the PCB to the bottom port. Kit board dimensions remain unverified. |
| MAX98357A | Documented I²S class-D amplifier family. Reconstructed 20 × 20 mm breakout reservation with input header and speaker terminal. Exact kit footprint remains unverified. |
| Speaker | Project's Ø40 × 10 mm reserved envelope, with reconstructed frame, magnet and cone. Diameter, impedance and power of the delivered kit unit remain unverified. Play moves only the cone and dust cap by an illustrative ±0.45 mm at 3 Hz; this slow visual demonstration is not an audio waveform or a measured excursion. |
| Driver carrier | Six empty channel positions, explicitly reserved. No particular MOSFET, resistor or protection part is presented as selected. |
| Power, push-to-talk, mute | Required controls represented by provisional physical packages, identified in the inspector. Electrical selection remains open. |
| Visible wiring | Proposed insulated power pairs and signal bundles connect exposed module ports and carrier terminals. Pad-aligned jumpers and solder tails show the construction. Not a verified netlist or production harness; no invented GPIO numbering. No battery interconnect is drawn in series. |
| Open mounting layout | No shell, lid or fascia. UPS and holder rotate together above the perfboard; the controller lies beside them, LCD and controls face forward, speaker faces upward. UPS standoffs use original STEP hole axes: native x −61.5/−3.5, y 3.5/52.5 mm. LCD tabs use its four original insert axes. Fit, tolerances, RF performance, battery removal and thermal validation remain open. |

## References

- [Waveshare UPS HAT (D) documentation](https://www.waveshare.com/wiki/UPS_HAT_%28D%29) and [official STEP archive](https://files.waveshare.com/wiki/UPS-HAT-D/UPS-HAT-D%203D%20Drawing.zip).
- [Waveshare LCD documentation](https://www.waveshare.com/wiki/1.47inch_LCD_Module), [official STEP archive](https://files.waveshare.com/upload/c/c5/1_47inch_lcd_module_asm-221122.zip), and [LCD datasheet](https://files.waveshare.com/upload/9/99/1.47inch_LCD_Datasheet.pdf).
- [TowerPro SG90](https://towerpro.com.tw/product/sg90-7/).
- [BAK N21700CG-50 manufacturer datasheet](https://www.bakpower.com/uploads/cpxl_table1_en/N21700CG-50_en.pdf).
- [AYWHP controller listing](https://www.amazon.in/dp/B0DG8L1YW9); product photograph is the appearance reference, not its conflicting generic pin diagram.
- [Espressif ESP32-S3 DevKitC-1](https://www.espressif.com/en/products/devkits/esp32-s3-series/esp32-s3-devkitc-1) for module family; not used to assert the clone PCB is identical.
- [TDK INMP441 datasheet](https://invensense.tdk.com/wp-content/uploads/2015/02/INMP441.pdf).
- [Analog Devices MAX98357A](https://www.analog.com/en/products/max98357a.html).
- [OceanLabz module-family reference](https://www.oceanlabz.com/posts/esp32-s3-expansion); its expansion board, screen and pin map are not substituted for the project inventory.

## Rebuild and proof

Tessellate the downloaded STEP files with `import-step.py <input.step> <output-prefix>` in an environment containing `cadquery-ocp`; use prefixes `ups` and `lcd`. Run `node reference/grobot/package-cad.mjs <folder-with-tessellations>` to rebuild `public/models/grobot.json.gz`. The grouped source inventory records all included solids. The asset retains its original source coordinates; `src/grobot.js` rigidly repositions each module for the open frame without scaling its geometry.

Run `npm run build` and `npm run check`. Browser proofs cover assembled/exploded, realistic/anatomy, all component selections and isolation, Play/pause, front/top/3D, mobile layout, PNG export and the offline file. No SVG-only kit audit is claimed for the Three.js model.
