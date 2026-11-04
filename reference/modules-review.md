# Nine-module expansion — 4 November 2026

Added Hamamatsu R928, C12880MA, AMD EPYC 9654, SLAMTEC RPLIDAR A1, a representative eight-digit VFD, a 32 × 32 core-memory plane, FLIR Lepton 3.5, Intel C4004 and Sensirion SPS30. The collection now contains 26 devices. Sensors and Chips join the existing header categories; previous/next buttons wrap within the active category and disable when only one device is available.

## Geometry and evidence

Each module has one inventory and shared geometry across realistic, anatomy, exploded and isolated views. Published dimensions, contact counts and architecture constrain the assemblies. Per-device evidence records link the sources and identify reconstructed details. Sealed optical and sensor interiors are educational reconstructions. Processor surface regions illustrate function, not transistor masks. The VFD and core plane represent documented construction principles rather than a specific manufactured unit.

Visual review corrected cap clearance, diffraction-grating face direction, rotating LiDAR cover registration, VFD grid readability, the parked thermal-calibration shutter and the particle sensor’s open airflow passages. These additions were implemented and reviewed in one pass; no independent agent or physical-hardware review is claimed.

## Interaction and playback

Selecting a component now retains its normal treatment and ghosts other parts in both rendering modes. Clearing selection restores the whole assembly. Models open unselected; selected labels remain available with overview labels off. Isolation retains its existing framing and visibility behavior.

Module playback uses the shared clock, stops on separation and respects reduced motion. Illustrative effects include an electron cascade, spectral paths, chiplet activity, a scan and synthetic point cloud, VFD multiplexing, coincident-current memory addressing, a calibration shutter with synthetic thermal imagery, die activity and particle scattering. Some covers fade only during unselected playback. Selecting a part restores its material.

## Verification

- `npm run check` passes for all 26 devices: inventories, geometry, assembly poses, isolation, anatomy, picking, callout motion, menus, specifications and playback.
- Module checks exercise material restoration, finite animation paths, reduced motion, nine dynodes, twelve CCDs, 64 VFD segments, 1,024 ferrite rings, registered LiDAR rotation, cap clearance and shutter bounds.
- Chrome interaction checks cover all nine additions, Play, selected tags, isolation, anatomy and labels without runtime errors. Grobot’s realistic selection and background deselection were visually inspected.
- Category arrows preserve X-ray, Play and camera choice. Single-device Radio navigation is disabled. A category-strip scroll issue discovered during offline testing was fixed.
- Responsive checks at 390 × 844, 320 × 568 and 844 × 390 found no horizontal overflow; grouped selection and toolbar navigation remain usable. Physical-phone touch and safe-area behavior were not tested.
- The standalone HTML loaded all 26 devices from a local file with Chrome networking disabled and zero HTTP requests.
- Eighteen new 2400 × 2217 px PNGs were exported through Save image and visually inspected. The README gallery now contains 52 actual exports.

The checks establish rendering and interaction behavior, not manufacturing tolerances, electrical correctness or measured sensor performance.
