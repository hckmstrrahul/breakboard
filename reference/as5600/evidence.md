# AS5600 adapter reference lock

Manufacturer: ams. **AS5600-SO_EK_AB**, operation manual **Rev 1.3, 2014-12-02**, illustrated PCB **AS5600-SO_AB_V2**. Reference magnet **AS5000-MD6H-1**. Checked 2026-11-05.

Primary sources:
- [Adapter operation manual](https://look.ams-osram.com/m/4f8342513a447495/original/AS5600_UG000254_2-00.pdf): setup, magnet selection, board drawing and photograph.
- [AS5600 datasheet v1-06](https://look.ams-osram.com/m/7059eac7531a86fd/original/AS5600-DS000365.pdf): SOIC-8, pin assignments and angle conversion. Search index exposes manufacturer document; direct URL retrieval can intermittently fail.
- [AS5600-ASOM material declaration](https://look.ams-osram.com/m/ac8ac6cd85c2ee89/original/MDF_191240003_AS5600-ASOM_MD000325_1-00.pdf): package material family, not internal routing.

Manual PDF SHA-256: `569b715972dda99e447c733d751f4051677910c54dfd25c887e375a445f6144b`. PDF not redistributed.

| Feature | Evidence class | Implementation |
| --- | --- | --- |
| Adapter outline | Documented | 22 ×28 mm; four Ø2.6 mm holes, centers 18 ×11 mm. |
| Header | Documented / estimated | 2 ×4 contacts at 2.54 mm pitch; installed pin length estimated. |
| Magnet and gap | Documented | Ø6 ×2.5 mm diametric magnet; model gap 1.5 mm within 0.5–2.5 mm range. |
| Board thickness, components, traces | Photo-estimated / representative | 1 mm board; approximate placement, explanatory routing. |
| Chip interior | Representative | Functional Hall/processing regions and bonds; no claim of exact die floorplan. |
| Pole markings | Explanatory overlay | N/S do not represent production markings. |

The angle input wraps 360° to 0°, and ideal raw output is floor(angle/360 ×4096). Negative playback speed wraps through zero. This omits measured sensor error/noise. Reset restores 30° and 30°/s; paused control changes update the magnet immediately. Playback stops during separation or reduced motion. The kit has no mechanical shaft or motor model.
