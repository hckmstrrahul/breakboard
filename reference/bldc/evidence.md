# T-MOTOR MN2212 V2.0 KV920 — evidence lock

Retrieved 2026-11-05. Device ID: `bldc`. Reference configuration: **T-MOTOR MN2212 V2.0, KV920, 9N12P**, without propeller, propeller adaptor or ESC. The model locks the KV920 specification table and named dimension drawing rather than mixing the site's other motor variants.

## Primary references

1. [T-MOTOR / LIGPOWER MN2212 V2.0 product page](https://www.ligpower.com/product/mn2212-v2-motor-navigator-type.html), **KV920** table: configuration 9N12P; motor Ø27.5 × 26.5 mm; shaft Ø4 mm; stator Ø22 × 13 mm; 400 mm 20 AWG cable. The table also quotes 142 mΩ motor resistance; this value is not used to imply a complete electrical motor model.
2. [Manufacturer dimension drawing, MN2212-draw-0604-v1](https://www.ligpower.com/images/202606/MN2212-draw-0604-v1.jpg). SHA-256 `4397cca255a1e5b97bf90362e19d32e9472b6dee54776043f308d8ce0daaf21e` (157,827 bytes). Overall axial span 32.6 mm; body 26.5 mm; shaft projections 3.5 mm output and 2.6 mm rear; six top windows; four base windows; opposing base mount-hole spans 16 mm and 19 mm; M2.5 mounting designation.
3. [Manufacturer product photograph, 1739415015747435222](https://www.ligpower.com/images/202502/goods_img/1739415015747435222.jpg). SHA-256 `369f69caf01f5d09932fb02327aa92c1e747e4998f1307284e66263cc97c6270` (21,174 bytes). Supports black bell, machined silver top/base and visible copper-winding finish.
4. [Portescap, BLDC motor design](https://www.portescap.com/en/products/brushless-dc-motors/bldc-motor-design). Supports the generic role of permanent-magnet rotor and stationary wound stator; does not establish MN2212 internal dimensions.

**Source discrepancy:** the product page includes unrelated `MN4112` marketing text and another KV headline. These are not treated as authoritative for the model. The explicit **MN2212 V2.0 KV920 table**, matching named drawing, and corresponding product photograph are the selected configuration. Hidden geometry remains representative. There is no claim of a serialized specimen or unpublished manufacturing revision.

Manufacturer images/drawings are linked, not copied into the repository or mapped onto the model. Geometry and text markings are original. No redistribution license is assumed for linked source imagery.

## Evidence inventory

| Feature | Status | Implementation / limit |
| --- | --- | --- |
| Body and axial envelope | Documented | Ø27.5 × 26.5 mm body; 32.6 mm shaft span including projections. |
| Shaft diameter | Documented | 4 mm. |
| Stator dimensions | Documented | Ø22 × 13 mm ferromagnetic stator. Copper loops project beyond the lamination stack. |
| Stator / rotor count | Documented | Nine teeth/slots and twelve alternating rotor poles, six pole pairs. |
| Mounting centers | Documented | Four M2.5 mounting locations at x=±8,z=0 and x=0,z=±9.5 mm. Visible holes use a representative tapped-bore diameter; no thread profile is claimed. |
| Top and bottom openings | Documented / photo-estimated | Six real top apertures and four real base apertures; outline and rib widths are reconstructed from drawing/photo. |
| Bell finish and silver machined surfaces | Photo-estimated | Dark cylindrical barrel, silver top/base, restrained metal materials. |
| Rotor magnet sections | Representative | Twelve curved pieces with small adhesive gaps; counts are documented, profile/thickness/adhesive are not. |
| Stator tooth shape and lamination layers | Representative | Nine real teeth, open central bore, pole shoes and a reduced set of layer seams. Production lamination count is unknown. |
| Windings | Representative | Twelve visible copper turns per tooth; actual turn count, gauge, phase winding map and star/delta termination are not specified by the selected sources. Three repeating phase groups explain operation without claiming the factory winding schedule. |
| Bearings / retaining clip | Representative | Two support bearings with modeled races, cages and eight balls each; bearing series, ball count and retainer profile are not established. |
| Phase leads | Documented / representative | Three 20 AWG leads; actual stated cable length is 400 mm. The modeled lead length is deliberately shortened and called out in the inspector. |

## Interaction and coordinates

The body bottom is y=0, top y=26.5, output-shaft tip y=30 and rear-shaft tip y=-2.6 mm. The bell, twelve magnets, shaft and retaining clip rotate together around the same y axis. The stator, copper coils, leads and base stay fixed. Bearings are shown without bearing-ball motion because the bearing specification is unknown.

Speed command and direction control the rotating mechanism. Displayed rotation runs at **1/60 of commanded speed**, continuously stated in the note/readout. The electrical-frequency readout is command RPM / 60 × 6 pole pairs; it is an explanatory relationship, not a motor-control measurement. Phase-current shading is illustrative and follows rotor electrical angle. Zero RPM holds position. Play in exploded view does not animate mismatched assemblies. Pause holds the current angle; Reset returns angle zero and the default speed/direction. Reduced motion keeps a static pose.

Twelve restrained arrows above the air gap rotate with the alternating rotor poles. They illustrate radial field directions, not field strength or a solved flux map; they hide outside assembled Play and when a component is selected or isolated.

The bell fades through the shared cutaway system so copper turns, teeth and magnets remain visible during operation. Speed control does not imply the achievable RPM under a particular load, voltage, torque or ESC firmware. No thermal, saturation, switching-loss, PWM or bearing-load simulation is claimed.
