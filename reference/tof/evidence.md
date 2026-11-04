# VL53L8CX evidence lock

Exact order code: **ST VL53L8CXV9GC/1**, Optical LGA16 **without shipping liner**. Locked to **DS14161 Rev12, 22 July2025**; outline **DM00891572 rev2.0**. The manufacturer drawing gives3.030mm depth; the feature summary rounds that to3.0mm. Geometry uses3.030mm.

- [ST datasheet Rev12](https://www.st.com/resource/en/datasheet/vl53l8cx.pdf)
- [ST official HTML edition with original embedded figures](https://mp.stmicroelectronics.cn/content/st_com/zh/technical-documents/DS14161.html)
- [ST product details](https://www.st.com/en/imaging-and-photonics-solutions/vl53l8cx.html)
- The standard ST PDF endpoint failed direct download in this environment. Its identical Rev12 document was recovered from the official regional endpoint: `https://mp.stmicroelectronics.cn/resource/en/datasheet/vl53l8cx.pdf`.
- Download SHA-256: `a24f8bbc282bf04e28aa285b80fc165517f70704457a1b9546e8a18adfb3f844`.
- Original manufacturer outline/zone figures were also extracted from its HTML's embedded PNGs and visually inspected. A third-party-hosted Rev11 copy was available to the checker, but Rev12 official figures govern this implementation.

| Feature | Basis | Implementation |
|---|---|---|
| Cap envelope | Documented Fig26 p31 |6.400 ×3.030 ×1.750mm, with0.020mm top recess; outline gate recess1.882mm |
| Substrate | Documented Fig26–27 |6.200 ×2.830 ×0.250mm |
| Contacts | Documented Fig27 p32 |Two rows of seven0.500 ×0.515mm pads at0.750mm pitch, two0.535 ×0.500mm side pads, one2.316 ×1.200mm B4 thermal pad |
| Contact count | Documented Fig4/Table3 and Fig27 |16 perimeter contacts plus separate B4 =17 physical pads. OpticalLGA16 is the manufacturer's package name, not the total metal-pad count |
| Receiver | Documented Fig26 |LEFT aperture Ø0.510mm, optical center at1.46mm from cap left and1.615mm from cap top |
| Transmitter | Documented Fig26 |RIGHT window0.740 ×0.965mm; window center0.030mm right of optical center; optical centers4mm apart |
| Optical lenses | Documented features/description |Two metasurface elements, one per optical channel |
| Receiver coating | Representative |Exploded explanatory coating layer, not a claim of a separate removable OEM filter plate |
| Hidden die layout, driver geometry, wires | Representative |Published VCSEL/driver/SPAD/ranging functions with explanatory internal placement, wire counts and routing |
| Microstructure | Representative, enlarged |Visible16 ×16 detector pattern is NOT the real SPAD count.8 ×8 denotes reporting zones; each zone aggregates detectors |
| Top marking | Drawing location, pattern representative |L8 and A1 index location; code block uses a decorative illustrative pattern, never claimed to be a valid factory code |
| Materials and hidden wall thickness | Photo/drawing estimated |Opaque molded cap, green substrate, coated optics and fine metal bonds |

## Depth scenario and zone mapping

A fixed8 ×8 synthetic field contains a background plane and a nearer rectangular foreground target. Controls set background distance100–4000mm, foreground offset0–2000mm, row/column0–7, width1–4zones and native inspection zone0–63. The foreground is clamped to20mm and clips at the field boundary. Width counts both rows and columns. No reflectance, ambient-light or probabilistic-ranging accuracy claim is made.

Figure22 shows native IDs0–7 on the receiver's bottom row,56–63 on its top row. Figure23 explicitly states that receiver optics invert both axes: **native0 sees the upper-right scene corner**. `getDepthMap()` returns corrected scene rows top-to-bottom and columns left-to-right. Mapping is:

```
sceneRow = floor(nativeZone /8)
sceneColumn =7 −(nativeZone %8)
nativeZone = sceneRow*8 +(7 −sceneColumn)
```

The selected native zone's depth, nearest/farthest range and axial-equivalent round-trip time all derive from the same64-value array. The [ST engineer explanation of VL53L8CX distance output](https://community.st.com/imaging-sensors-49/vl53l8cx-distance-matrix-138858) confirms that its firmware converts radial range to perpendicular distance. Equal depths on a perpendicular plane are therefore intentional. The explicitly labeled axial-equivalent light time is `2 *distance_mm /299.792458` nanoseconds. At1500mm it reads10.007ns. This is the ideal on-axis equivalent, not the longer actual off-axis corner ray or measured photon histogram. It does not mistake nanoseconds for the displayed animation duration.

The3D target grid is an explanatory overlay with compressed height3.55–4.85 model units, not a scale-faithful scene floating millimeters above the package. The visible2.4second pulse journey and infrared colors are illustrative. The package's physical scale is unchanged. The permanent operation note discloses compressed distance and slowed colored light.

Pause freezes pulse phase; direct target edits still update the static grid and numeric outputs. Reduced motion suppresses moving photons while preserving static ranges. Separation and component selection/isolation hide optical overlays; they never enter anatomy inventory or picking (`explanatoryEffect`). Reset restores the original1500mm/850mm scene and hides the target until Play or direct input.

## Maker verification

- Node syntax, geometry build, every attribute finite, all control endpoints/reset: passed;125 meshes after batching before final small cap refinements.
- Actual assembled, exploded and Play renders inspected; receiver separation was widened after initial inspection to reveal the small lens/coating clearly outside the cap silhouette.
- Dark/light assembled, exploded and Play plus390 ×580 mobile states rendered with zero page errors; inspected at `/tmp/motion-final-tof-{dark,light,mobile}-{assembled,exploded,play}.png`.
- Pause, reduced-motion stability, selection-overlay gating, native0→scene(row1,column8), axial-equivalent light time,20mm near clamp and field-edge target clipping passed. Independent checker gate remains required before publication.
