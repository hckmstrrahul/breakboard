# RDK-942 GaN USB-C supply — evidence lock

Retrieved 5 November 2026. Interactive educational reconstruction in millimetres; not a manufacturing or mains construction drawing.

## Locked reference

Power Integrations **RDK-942**, populated **DER-942 / RD-942 RevB** PCB as photographed and drawn in **RDR-942 revision 1.0, 11 November 2022**, 99 pages. The source alternates RDR/DER/RD prefixes; the model retains the photographed `RD-942 RevB` board marking. No commercial plastic adapter enclosure is invented for this open reference board.

- [PI report, official PDF](https://www.power.com/sites/default/files/documents/rdr-942_65w_usb_pd_3_pps_power_supply_innoswitch4-pro_powigan_clampzero.pdf). SHA-256 `74ae83c6173ad4158c6bc0399d8322149f4fb37c7c5a603451118b24e0b02688`.
- [PI design page](https://www.power.com/design-support/rdr-942-65w-usb-pd-3-3pt3v-21v-pps-power-supply-innoswitch4-pro-powigan-clampzero-injoinic-ip2726s-controller).
- [PI kit](https://www.power.com/design-support/design-kits/rdk-942-reference-design-kit).
- [Ferroxcube EQ25 product specification, 2021, manufacturer PDF mirrored by distributor](https://ferrite.ru/upload/iblock/74a/ha8mfryjafszckqrc0fvp0a6vu9gy133/EQ25.pdf). SHA-256 `9380dcbede8fb06c70b60cd862434bcb9c588ae9b51b43ffc9bd8c68deef2ca9`.

- [PI InnoSwitch4-Pro family datasheet, Rev G January 2024](https://www.power.com/sites/default/files/documents/innoswitch4-pro_family_datasheet.pdf), p50 package drawing, SHA-256 `9b42ea473bfe1e86e696fd7e4ee1b91cada7ffa45a466f1b1c12cd10d370719b`. The later family drawing establishes the retained InSOP-T28D package dimensions, not a claim that the 2022 board uses a later silicon revision.
- [PI ClampZero datasheet, Rev G July 2022](https://www.power.com/sites/default/files/documents/clampzero-data-sheet.pdf), p14 MinSOP-16A drawing.

## Evidence map

| Feature | Classification | Basis and implementation limits |
| --- | --- | --- |
| PCB outline, stack | Documented | Report p8, p16: 2.44 × 2.10 inches = 61.976 × 53.340 mm; FR4 1.6 mm, two layers, 2 oz copper. Overall quoted height 0.83 inch is a rounded assembly measurement. |
| Placement, isolation slot and major copper regions | Documented artwork / photo-estimated coordinates | RevB artwork figs 7–8 and populated figs 1–4. Coordinates reconstructed from drawing, not imported Gerbers. Tiny fillets, solder menisci and copper widths are estimated. No conductive teaching route crosses the isolation slot. |
| BOM and unpopulated positions | Documented | Electrical BOM pp17–18, including absent R1/R2/R18. Only fitted parts represented. Small package bevels are representative. |
| Topology | Documented | Isolated active-clamp flyback, no PFC: INN4373F-H341 InnoSwitch4-Pro, CPZ1075M ClampZero, IP2726S PD controller; Q2 synchronous rectifier, Q3 VBUS switch. No optocoupler is invented: control uses FluxLink inside U2. |
| Input network | Documented | F1, RT1, RV1, C1, L1; bridge BR1; C2 18 µF and horizontal C3 100 µF at 400 V, L2 68 µH. Package sizes from BOM and photographs. C3’s BOM description says 16 × 32 mm, while its listed part suffix specifies 16 × 30; the model uses the latter nominal can length and does not claim an independently measured tolerance. |
| L1 common-mode choke | Documented winding / estimated lead dress | p19: ferrite 9 mm OD, 5 mm ID, 3 mm height; two 14-turn windings, #25 AWG, one triple-insulated and one double-coated; 810 µH nominal. |
| EQ25 transformer core | Documented nominal dimensions | 3C95 EQ25; each half 25 × 18 × 8 mm, central post Ø11 mm, window height 5.15 mm per half. Gap selected for 575 µH, not independently specified; no invented gap value. |
| Transformer winding sequence | Documented counts / estimated exact wire positions | pp20–29: WD1 24 turns #24 AWG (13+11 layers); WD2 bias 9 turns #33; WD3 shield1 12 turns of two #33 strands interleaved with WD2; WD4 secondary 5 turns of four #24 TIW strands, wound as two paired layers; WD5 secondary bias 2 turns #38 TIW; WD6 shield2 11 turns three #33 strands; WD7 primary completion 11 turns #24. Primary total 35, main secondary 5. |
| Bobbin, polyester insulation, core ground lead | Documented roles / estimated surfaces | EQ25-V six-pin bobbin modified by removing pins 1–2. Both secondary flange exits are real 4 mm openings; pin-side notches are reconstructed. The continuous WD1 layer crossover and WD1-to-WD7 continuation, separate secondary strand ends, shield pin-5 connections/open ends and core ground lead are modeled. 3M 1350F tape, 1 mil; interlayer shells retain radial clearance and exterior tape is slightly enlarged for stable visibility. Not a creepage certification. |
| Package bodies and leads | Documented nominal geometry | U2 InSOP-T28D: 10.80 × 9.40 mm body, 20 physical leads with the missing isolation-side leads and wide combined lead. U1 MinSOP-16A: 9.00 × 5.67 mm body, 12 physical leads including the wide lead. Small bends and solder are reconstructed. |
| IC internals | Omitted | Package markings and placement only; no unsupported silicon cutaway. |
| Conversion overlay | Representative | Slowed pedagogical primary-storage / secondary-delivery / clamp-reset cycle. Not a SPICE solution, measured switching waveform or fixed real switching frequency. Actual controller changes frequency and peak current. |
| Output negotiation | Documented capability / illustrative time | Five fixed PDOs 5/9/12/15 V at 3 A and 20 V at 3.25 A; PPS 3.3–21 V at 3 A, 20 mV steps. Attach begins at 5 V, then requested contract becomes active. Display transition timing is authored. Load is a percentage of allowed current, not an overload model; no invented efficiency curve. |

## Rights

Manufacturer documents and photographs are linked for evidence only, not redistributed. Geometry, winding curves and simplified markings are authored; source artwork is not used as a bitmap. No safety certification is asserted for the model or reference prototype.

## Maker validation

Finite geometry, control extrema, reset, paused/reduced-motion/separated gating and 30/60/120 Hz cadence pass. Numeric checks verify every fixed PDO, PPS endpoints/20 mV steps, initial 5 V negotiation, detach and ideal V × I load. The source BOM has 78 fitted electrical components plus the L/N test points; root metadata records all 80 identifiers and actual winding centerline endpoints. Sampled conductor paths avoid the core and bobbin solid regions. The checker’s triangle-distance audit also passes 3,706 conductor samples with full wire radius after excluding intentional nickel pin contacts. Windings terminate on exposed metal above the molded pin bosses; the core ground intentionally contacts ferrite.

Desktop light/dark and mobile assembled/exploded/Play images were individually inspected, including both-theme anatomy, underside electronics and the normal-material winding reveal. The application’s established anatomy mode keeps physical covers opaque and omits teaching effects; selection exposes individual interiors. This is deliberately not an electrical CAD or validated winding-manufacture model. Independent checker review follows the maker freeze.
