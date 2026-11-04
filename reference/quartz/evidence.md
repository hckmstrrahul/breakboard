# FC-135 reference lock

Manufacturer: Epson. Configuration: **FC-135 32.768000kHz 12.5 +20.0-20.0**, document **FC-135_E_Ver2.0**. Checked 2026-11-05. The source gives `Q13FC1350xxxx00` and requests contact for ordering details; no unverified ordering suffix is asserted.

Primary sources:
- [FC-135 application note Ver2.0](https://download.epsondevice.com/td/pdf/app/FC-135_en.pdf): configuration, electrical specifications and external drawing.
- [FC-135 product page](https://www.epsondevice.com/crystal/en/products/crystal-unit/fc135.html).
- [Epson quartz-watch history](https://corporate.epson/en/about/history/milestone-products/1969-12-35sq.html): tuning-fork context, **not the FC-135 internal geometry**.

PDF SHA-256: `2804107c86105c1d6f299d59c221ad3a6612936f2894479b7831ebb7860f43a9`. PDF not redistributed.

| Feature | Evidence class | Implementation |
| --- | --- | --- |
| Package | Documented | 3.2 ×1.5 mm; maximum height 0.9 mm. |
| Terminals | Documented | Two gold-plated lands, passive crystal connection. |
| Configuration | Documented | 32,768 Hz, 12.5 pF load, ±20 ppm at +25°C. |
| Lid shape and seam | Drawing-estimated | Inset closure, approximate seam and thickness. |
| Fork, supports, electrodes, cavity | Representative | Opposed tines and anchored base explain operation; exact internal mask and construction are unpublished here. |

All geometry uses actual millimetres. Only motion is enlarged: tine tips move oppositely by at most ±0.045 mm, slowly at 2 Hz (16,384× slower than nominal). The tine bases stay anchored, the tips remain inside the cavity, and electrode strips follow the same deformation.

FC-135 is a passive two-terminal resonator. It contains **no oscillator IC or divider**. The control demonstrates an **external** divide-by-two chain: 32,768 /2^15 =1 Hz. The arithmetic is ideal and omits temperature and loading errors. Reset restores 70% display amplitude, fifteen external stages, zero tine deflection. Reduced motion and separation stop the flexing.

Terminal side plating projects 0.0075 mm beyond the nominal ceramic face to avoid coplanar rendering artifacts; total width remains inside the documented ±0.1 mm package tolerance.
