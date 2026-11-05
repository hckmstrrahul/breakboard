# Breakboard — Inside the hardware

A 2:55, 16:9 YouTube showcase of the actual Breakboard models. No narration. Six detailed demonstrations, sixteen faster turntable cuts, a sixteen-device rotating collage, and a quiet closing card.

## Folders

- `src/`: deterministic capture, edit, music and verification sources.
- `source-inventory.json`: the model revisions, accuracy notes and references at production time.
- `cache/`: intermediate recordings and score; safe to regenerate.
- `review/`: contact sheets, selected full-resolution frames and machine checks.
- **`exports-youtube/`**: the finished 4K/1080p videos, soundtrack and YouTube copy.

Generated media is ignored by Git. The production sources stay separate from the web application; no device geometry or app interaction code is changed.

## Editorial plan

| Time | Sequence | Purpose |
| --- | --- | --- |
| 00:00–00:05 | Opening with ESP32 | Establish the collection immediately |
| 00:05–00:25 | ESP32 DevKitC V4 | Radio, package and board layers |
| 00:25–00:45 | Raspberry Pi 5 | Familiar computer, active cooling |
| 00:45–01:05 | Seagate hard drive | Disks, head stack and seeking |
| 01:05–01:25 | Canon 50 mm lens | Optical layers and aperture mechanism |
| 01:25–01:45 | Hybrid stepper | Coils, rotor and motion |
| 01:45–02:05 | NeoPixel matrix | Bright, colourful Play payoff |
| 02:05–02:45 | 16 × 2.5-second device cuts | Processors, memory, displays, sensors and power |
| 02:45–02:50 | 4 × 4 turntable collage | Show the breadth of the collection |
| 02:50–02:55 | Closing card | Leave the brand and repository address readable |

Each twenty-second hero begins assembled; labels appear, the device separates, a component is selected with the rest ghosted, the component is isolated, X-ray reveals the model, and the assembly returns for Play. Camera speed eases down during inspection. The cursor moves to projected component coordinates, not arbitrary points. Three callouts at most are shown at once, using the app's label formatter and anchor data.

This is a presentation capture of the actual Three.js scene and operations, with a minimal editorial overlay. It is not a recording of the entire browser interface. X-ray, selection, ghosting, isolation, component poses and Play come from the application. Mechanical speeds and signal flows remain illustrative, as described in each model's source notes.

## Picture and sound

- Native 3840 × 2160 capture at 30 fps; 1920 × 1080 derivative from the same master.
- Dark palette, Inter and JetBrains Mono, existing Breakboard mark.
- H.264 MP4, 4:2:0, progressive, AAC stereo at 48 kHz, fast-start metadata.
- Display-referred capture values are preserved when tagging the SDR delivery as Rec.709. An additional scene-linear transfer conversion was rejected during review because it visibly darkened the UI and black hardware surfaces.
- Original procedural instrumental score: 96 BPM, soft keys, warm pads, sparse bass and light percussion. No sampled recordings, commercial tracks or voice cloning.
- Music phrase boundaries match the five-second intro, twenty-second hero sections and 2.5-second montage cuts. The final chord decays into the end card.
- Encoding reference: [YouTube recommended upload settings](https://support.google.com/youtube/answer/1722171), checked 5 November 2026. Quality-controlled H.264 with 40 Mbps / 8 Mbps ceilings for 4K / 1080p. These mostly dark, uncluttered scenes compress substantially below those ceilings. The native capture is retained in `cache/`.

## Reproduce

Run from the repository root with Node, installed project dependencies, Google Chrome and FFmpeg available:

```sh
node video-production/youtube-showcase/src/capture.mjs --proof
node video-production/youtube-showcase/src/capture.mjs
node video-production/youtube-showcase/src/music.mjs
node video-production/youtube-showcase/src/finish.mjs
node video-production/youtube-showcase/src/verify.mjs
node video-production/youtube-showcase/src/playback-check.mjs
```

Capture supports `--only=01-esp32,02-pi5` and resumes completed segments. Use `--force` to replace a segment. Review proofs before the long render. Keep generated video outside Git; do not upload without a separate publishing instruction.
