# Nine-module expansion — 4 November 2026

Historical review notes: device counts describe the catalogue at each review date. The [current project README](../README.md) documents the active 65-device collection.

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
- Chrome interaction checks cover all nine additions, Play, selected tags, isolation, anatomy and labels without runtime errors.
- Category arrows preserve X-ray, Play and camera choice. Single-device Radio navigation is disabled. A category-strip scroll issue discovered during offline testing was fixed.
- Responsive checks at 390 × 844, 320 × 568 and 844 × 390 found no horizontal overflow; grouped selection and toolbar navigation remain usable. Physical-phone touch and safe-area behavior were not tested.
- The standalone HTML loaded all 26 devices from a local file with Chrome networking disabled and zero HTTP requests.
- Eighteen new 2400 × 2217 px PNGs were exported through Save image and visually inspected. The README gallery now contains 52 actual exports.

The checks establish rendering and interaction behavior, not manufacturing tolerances, electrical correctness or measured sensor performance.

## Follow-up: mobile sheets and close-up surfaces

The phone picker, controls and component browser now use modal bottom sheets with natural content height, a 90% viewport cap and a draggable resize handle. Native dialog focus containment, backdrop dismissal and Escape leave the viewer state intact. Theme controls remain at the right of the header; social links move below the subtext only at compact widths. Previous/next targets use the same rounded treatment as the utility buttons. Labels use sentence case with technical identifiers preserved.

Core-memory tiers have more space at full separation. The 4004 has a shorter lid, exposed ceramic shoulders, tapered leads and continuous white-gray procedural mottling. Stepper playback uses 100 steps per second (30 rpm) and makes its outer shell and end bells translucent, retaining solid internal poles and windings.

The surface audit found coplanar passive end caps and PCB edge contacts, plus printed artwork participating in shadow passes. Ceramic passive bodies now end inside their caps; coplanar plating uses a depth offset without changing the board envelope. Printed artwork receives a consistent depth offset and does not cast shadows after selection changes; it still receives shadows from the hardware. Close-up orbit captures were inspected for ESP32, Nano, Pi 5, Jetson and the 4004. These checks cover the shared rendering causes and sampled Chrome views, not every GPU or browser.

Responsive browser checks cover 320, 390, 600 and 800 px headers, modal resizing, selection, backdrop/Escape dismissal, category switching and restoration of the desktop controls. Physical-phone touch feel, browser chrome and safe-area behavior still need device verification.

## Follow-up: hover navigation and inline controls

Desktop device menus use a 70 ms hover intent, immediate category switching, a 160 ms exit grace period for crossing the gap, and interruptible opacity/transform transitions (160 ms entry, 100 ms exit). Hover does not move keyboard focus. Keyboard opening and dismissal are immediate; reduced motion removes the spatial transition. Preview rows use 80 px images on desktop and retain 56 px images in the mobile picker.

Mobile Controls is now an inline accordion inside the viewer. Opening it reallocates the viewer height once, then reveals the content with opacity/transform only; the WebGL canvas is not resized on every animation frame. The model remains interactive above a scrolling controls region, with no backdrop or modal focus restriction. Device and component selection retain their bottom sheets. Browser checks cover rapid hover changes, gap crossing, interrupted closing, keyboard/reduced motion, compact portrait and landscape sizes, playback preservation and desktop restoration. Physical-device touch behavior remains unverified.
