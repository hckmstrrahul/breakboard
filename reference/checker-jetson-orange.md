# Maker–checker record: Jetson, Orange Pi, Pico and Nano

## Jetson / Orange Pi maker verification

The Jetson/Orange Pi maker independently checked source evidence and rendered both assembled models in Chrome against the supplied NVIDIA assembly and Xunlong top/underside images. The final browser pass confirms black female GPIO housing, silver open external receptacles, a black DC jack, four blue USB 3 tongues on Jetson, and the original blue Orange Pi 5 arrangement with its 26-pin header, three USB-A sockets, two USB-C sockets and full-size HDMI.

The separate Pico/Nano maker identified these corrections, which are implemented:

- Orange Pi RK806: QFN-68, 7 × 7 mm, 0.35 mm pitch, with short perimeter terminals, following the original Rockchip datasheet.
- Orange Pi SPI NOR: SOIC-8 with four leads on each of two sides and an approximately 7.6 mm lead span.
- Orange Pi processor marking: single-line `RK3588S`, avoiding an unsupported newline in the canvas helper.
- Jetson heatsink marking: reduced width so the decal remains within the supplied 57.8 mm heatsink envelope.
- Jetson external connectors: closed vendor envelope geometry replaced with open receptacles; reconstructed interiors and retained CAD exterior dimensions are explicitly distinguished in the evidence and app.

An initial checker suggestion to color upper Jetson GPIO posts gold was withdrawn after checking that J12 is a female receptacle in both the official carrier image and the CAD. The black housing and cavities are retained; underside tails use a gold finish.

Final geometry checks used the production builders and Three.js, stubbing only Canvas2D text drawing. Both boards pass finite vertices and valid indices, nonempty selectable groups, exact group offsets at 0/25/50/75/100% separation, clearance above y = −19.2 mm, isolation and batched X-ray visibility.

| Board | Selectable groups | Meshes before batching | Final triangles |
| --- | ---: | ---: | ---: |
| Jetson Orin Nano Super | 15 | 30 | 309,538 |
| Orange Pi 5 | 13 | 104 | 337,554 |

Jetson retains 1,740 source shapes / 267,668 source triangles. The 107 optional SSD shapes are omitted; 73 closed external-port shapes are replaced by reconstructed open receptacles. Triangle totals above include these reconstructed ports and printed decals.

## Independent checker review of Pico / Nano

The Jetson/Orange Pi maker acted as a separate checker for the Pico/Nano maker. Reviewed sources were the official Pico 2 W datasheet, Figure 3 mechanical drawing and Appendix B component locations, plus the original Arduino `NanoV3.3.brd` and official front/back photographs. Both assembled browser renders were inspected. No blocking discrepancies were found.

- Pico 2 W: 21 × 51 × 1 mm outline, 40 contacts at 2.54 mm pitch and 17.78 mm row spacing, four Ø2.1 mm holes, three SWD pads, RP2350A QFN-60 and the documented radio position below the shield agree with the official drawings. The model correctly avoids substituting a non-wireless Pico 2 STEP assembly. Omitted antenna copper, representative heights and connector interiors are disclosed.
- Nano V3.3: the original EAGLE source confirms VQFN-32 at R225, underside FT232RL at MR0 and LM1117 at MR270. Two 15-pin downward strips, 15.24 mm row spacing, 2.54 mm pitch, 43.18 × 17.78 mm CAD outline and unpopulated ICSP holes agree with the source. The different 45 × 18 mm nominal product envelope is explained in the app.

Independent geometry checks pass for both: ten populated groups, finite coordinates, 0/25/50/75/100% poses, floor clearance, isolation and X-ray. Checked counts were 88,276 triangles for Nano and 121,248 for Pico 2 W. Heights, minor shell construction and silkscreen reconstruction remain educational approximations rather than manufacturing tolerances.

## Independent checker review of BeagleBone Black

Compared the source to the official dimensioned drawing and top/underside photographs. Rev C identities, 512 MB DDR3L, 4 GB eMMC, AM3358, 92 cape contacts, two 2 × 23 female banks at 2.54 mm pitch, top USB-A/RJ45/DC and underside Mini-B/micro-HDMI/microSD placement agree with the references. The four asymmetric hole positions and 0.062-inch board thickness agree with the drawing/page. The drawing's 3.400 × 2.150-inch envelope takes precedence over the inconsistent metric conversions in the adjacent prose, as disclosed in the model.

The checker found two corrections, now implemented by the Beagle maker: true circular quarter-arcs replace quadratic corner curves for the specified 6.35 / 12.7 mm radii; LAN8710A, TPS65217C and TDA19988 use short QFN terminals rather than long QFP leads. Generic underside eight-pin packages now have four leads on each of two sides. The package checks are supported by [Microchip LAN8710A](https://www.microchip.com/en-us/product/LAN8710A), [TI TPS65217](https://www.ti.com/product/TPS65217) and the NXP HVQFN64 package dimensions alongside the photographed package outlines.

After these changes, independent production-builder checks pass: 14 groups, 67 meshes before batching, 326,770 triangles; finite coordinates, five separation positions, floor clearance, isolation and batched X-ray visibility. No source/layout blocker remains. Root integration performs the final rendered review.

## Independent checker review of STM32 Nucleo-F401RE

Compared the implementation with ST-authored UM1724 Rev14, particularly Figure 5, the product rendering, clock population in §6.7 and the jumper defaults in §5.1 / Table 8. The 70 × 82.5 mm envelope, 76 male morpho contacts, 32 female Arduino contacts, 48.26 mm bank spacing, 4.064 mm digital-header gap and 2.54 mm pitch agree with the source. The model correctly distinguishes the STM32F401RET6 LQFP64 target from the STM32F103CBT6 LQFP48 debugger and the debugger's Mini-B connector. It includes X1 and the C-03 LSE X2 while leaving target HSE X3 unpopulated. Three hole centers and breakaway slots agree with the reference within their disclosed image-derived precision.

The checker found a functional jumper-state error, now corrected by the Nucleo maker: the normal USB-powered configuration leaves JP1 open and places JP5 over the center/right pair, pins 2–1 for U5V. JP6 and the two CN2 shunts remain fitted. Before correction, a fitted JP1 and the left JP5 pair represented a different power configuration. This is documented in the Nucleo evidence record.

After correction, independent production-builder checks pass: 11 groups, 43 meshes, 211,884 triangles; finite coordinates and valid indices, five separation positions, floor clearance, isolation and X-ray visibility. Header-count metadata and the digital gap are also checked. No source/layout blocker remains; root integration handles the final browser render.
