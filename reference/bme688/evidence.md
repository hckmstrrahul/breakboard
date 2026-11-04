# BME688 reference lock

Bosch BME688, technical reference **0 273 017 016**, bare metal-lid LGA. Source **BST-BME688-DS000-03, revision 1.3, February 2024**. Checked 2026-11-05. No carrier board is included.

Primary sources:
- [Manufacturer datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme688-ds000.pdf): package drawing p53; pad assignment p51; metal-oxide response p16–17.
- [Manufacturer product page](https://www.bosch-sensortec.com/en/products/environmental-sensors/gas-sensors/bme688).

PDF SHA-256: `fce73ae028a985b3265ce3dbc17ab5b7bea1ae31b7ea84c6698c7694083e2478`. PDF not redistributed.

| Feature | Evidence class | Representation |
| --- | --- | --- |
| Package / opening | Documented | 3 ×3 ×0.93 mm; Ø0.35 mm vent, 0.9 mm from two edges. |
| Contacts | Documented | Eight 0.4 mm lands; 0.8 mm pitch; clockwise top-view numbering. |
| Cap walls / engraving | Estimated | Hollow metal cover with rounded corners; approximate thickness and identifying print. |
| Four sensing channels | Documented function | Temperature, humidity, pressure and metal-oxide gas response. |
| MEMS and die anatomy | Representative | Die count/placement, diaphragm, comb, heater, sensitive film, thermal region and bond routing are not published BME688 geometry. |

Controls supply synthetic T/RH/P scenarios and a dimensionless gas-exposure scenario. Pressure bends an anchored membrane by up to 0.028 mm; this enlarged motion is explanatory. Humidity and temperature alter material cues. Gas exposure changes the illustrated particle population and a 0–1 illustrative response. The animated sampling/heating cycle does not simulate real heater timings, sensor response times or BSEC algorithms.

The model does **not** measure CO₂, identify arbitrary chemicals, output calibrated VOC concentration, or reproduce a trained gas classifier. Metal-oxide response is broad and depends on gas composition and conditions. Paused phase remains fixed; direct inputs remain inspectable. Reset restores 25°C, 45%RH, 1013 hPa and 25% gas scenario. Reduced motion freezes particles while retaining static input cues.
