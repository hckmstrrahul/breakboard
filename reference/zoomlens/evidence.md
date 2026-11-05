# Nikon AF-S NIKKOR 24–70mm f/2.8E ED VR — evidence and reconstruction

## Exact product and document lock

**F-mount AF-S NIKKOR 24–70mm f/2.8E ED VR**, manufacturer manual **7MA0196C-03**, ©2015 Nikon. This is not the older f/2.8G lens, a non-VR version, or the Z-mount lens. No undocumented serial-specific mechanical revision is claimed.

1. [Nikon product specifications and optical construction](https://imaging.nikon.com/imaging/lineup/lens/f-mount/zoom/normalzoom/af-s_24-70mmf_28e_ed_vr/index.html).
2. [Nikon optical construction image](https://imaging.nikon.com/imaging/lineup/lens/f-mount/zoom/normalzoom/af-s_24-70mmf_28e_ed_vr/img/lensonstruction.jpg).
3. [Nikon manual 7MA0196C-03](https://download.nikonimglib.com/archive4/UAhqz00XSPGD049PYnM86v28kV95/AFS24-70_2.8EEDVR_JP%286C_DL%2903.pdf).
4. [First-hand interview with the Nikon optical/mechanical designers, 22 October 2015](https://dc.watch.impress.co.jp/docs/news/interview/725581.html). The designers explain negative-leading optics, internal focus, VR, electromagnetic diaphragm, glass-fiber-reinforced shell and barrel extension at wide angle. The interview's unrelated Leica/Voigtländer illustrations are **not** evidence for this Nikon's internal construction. No production mechanical cutaway is claimed from that interview.
5. [Nikon patent US20180136444A1, example 1, figures 1–3 and table 1](https://patents.google.com/patent/US20180136444A1/en), published 17 May 2018, priority 30 January 2015. This is a **representative motion reference**, not an established production prescription.

Snapshot hashes, 5 November 2026:

- Nikon manual PDF: `790113eb791f24b75f3da4c63b26b369fe9181c22252e979adb5c328ca046f47`
- Nikon optical diagram: `72ff25331a06dd4cdce6b546501f0e543d29fd88e0a1192bb8fe7d217bf25a50`
- Nikon patent PDF: `959f2fab270173e71e768fbeecda51b61bdc0b2b6542ff73c32107833c251c4b`

## Feature classification

| Feature | Evidence | Implementation and limits |
| --- | --- | --- |
| Ø88 × 154.5 mm nominal, 1070 g, 82 mm filter, 0.75 mm thread pitch | Documented by Nikon | Nominal mounting-face envelope retained. Zoom extension is a representative moving envelope, not a service dimension. Weight is not simulated. |
| 20 elements in 16 optical groups | Documented optical construction | Twenty separate glass meshes. One focus doublet, one rear doublet and one rear triplet remain together (four fewer groups than elements). Glass thickness/profile details are approximate. |
| Two ED, one ED aspherical, three other asphericals, one HRI | Documented | The official diagram locates the ED/aspherical elements. The designer expressly withholds the HRI location; this model does not assign one. Coating colors are illustrative. |
| Nine rounded blades, f/2.8–22, electromagnetic aperture | Documented | Nine rigid overlapping leaves with fixed pivots. Blank profile and linkage are representative. No mechanical F-mount aperture lever is added to this E lens. |
| Internal focus, ring-type SWM | Documented | Five-element G21 focus mapping is **patent-informed representative**, not a verified production group assignment. Axial drive range 0–2 mm is authored. SWM stator, rotor, tooth layout and hidden gearing are representative. |
| Lens-shift VR | Documented | Two-element G32 mapping is **patent-informed representative**. Four coils and the suspended carriage explain orthogonal correction; actual production coil layout, suspension and transfer function are not recovered. |
| Negative-leading zoom, front extension toward wide angle | Documented optical diagram and designer interview | Group trajectories use the related patent's three zoom positions, linearly interpolated and scaled 0.8. That scale is a scene-fit choice, not a measured factory cam scale. |
| Cam carrier and followers | Hidden / representative | Three authored tracks are generated from the same functions that position their followers, retaining mechanical contact across 24–70 mm. Cam windows, bearings and mounting arms are illustrative. |
| F-mount, gasket, switches, grip, scale | Manufacturer photos | Proportional reconstruction. The ten modeled contacts, fastener counts and exact positions are representative; no unverified mechanical drawing is implied. |
| Annular PCB and flexible wiring | Hidden / representative | Explain power/control distribution. No actual chip identity, board route or component value is claimed. |

## Patent mapping and explicit limitations

The patent's optical topology matches the manufacturer's published sequence: G1 has three elements; G21 five; G22 one; G31 three; G32 two; G4 six. Example 1 places focus in G21 and transverse VR in G32. Matching topology does **not** prove that the manufactured lens uses that exact prescription or group law.

The model reads the patent's D7, D18, D20, D30, D39 and D40 gaps at wide/mid/tele and interpolates them. Table focal lengths 24.80, 50.01 and 67.85 mm are mapped to the product control labels 24, 50 and 70 mm. Axial coordinates are scaled 0.8 and placed behind the reconstructed filter ring. This is a coherent explanatory mechanism, not a calibrated optical system. Curvatures are bounded schematic profiles informed by surface signs; no Snell-law tracing, distortion or resolution is computed.

The patent's VR relation `shift = -f × tan(angle) / |coefficient|` is shown using an interpolated 0.45–0.58 coefficient. The physical display travel is **4×** that number to make the moving carriage inspectable; the readout reports the un-enlarged representative value. The source's exact mid coefficient is 0.51; the UI's continuous coefficient interpolation is an explanatory approximation. This is not a measured production correction or CIPA stabilization claim. The support opening allows the enlarged carriage to clear the stationary support at the largest input.

## Behavior and proof

- Zoom, near-focus drive, aperture, shake and VR on/off work as static controls while paused.
- Play animates a slow shake signal. The optional ten-second zoom sweep traverses 24–70 mm. Pause freezes automatic phase, reduced motion removes automatic travel, and reset restores defaults.
- Selection, isolation and separation hide the explanatory photon marker and optical axis, while retaining physical geometry.
- Relative light is the ideal `(2.8 / f-number)^2` ratio, not a measured T-stop.
- Dynamic ancestors are marked before batching; explanatory overlays are excluded from anatomy/picking.

Source: `src/zoomlens.js`, export `ZOOMLENS_BOARD`, sharing only geometry helpers from `src/prime50.js`.

```sh
npm run dev -- --host 127.0.0.1 --port 4287
node /tmp/optics-proof.mjs
```

The real WebGL proof renders assembled, 100% exploded and Play states at 1000×800 in dark/light themes and 390×580 mobile. Files: `/tmp/optics-final-zoomlens-{dark,light,mobile}-{assembled,exploded,play}.png`. Finite geometry and control extrema are checked separately. Independent maker/checker review is required before release.
