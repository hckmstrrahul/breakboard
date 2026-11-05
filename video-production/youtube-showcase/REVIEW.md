# Final review — Inside the hardware

Reviewed 5 November 2026. Source application revision: `078c6460e0c3e3ab430b2ca96b286929d37ef4ef`. Only the `video-production/` folder was added; the viewer and models were unchanged.

## Deliverables

| File | Dimensions | Size | Frames |
| --- | --- | --- | --- |
| breakboard-inside-the-hardware-4k.mp4 | 3840 × 2160 | 101.0 MB | 5250 |
| breakboard-inside-the-hardware-1080p.mp4 | 1920 × 1080 | 32.9 MB | 5250 |

Both videos run 175 seconds at 30 fps, 16:9. H.264 High profile, progressive 4:2:0, SDR Rec.709 tags, fast-start MP4. AAC stereo, 48 kHz.

## Checks completed

- All 10,500 delivered video frames decoded without an error. Both audio streams decoded successfully.
- Video and audio durations match. Each video has exactly 5,250 frames.
- 63 sampled final frames cover all six hero devices, seven inspection/operation states per hero, sixteen montage devices, the opening, three collage angles, and the ending. Source-render contact sheets were also inspected.
- Labels follow actual component anchors. Overlap in the Raspberry Pi callouts was corrected. No clipped physical components or cropped label text were observed in the reviewed samples. Ground shadow at the lower crop was softened.
- Ghosting, isolation and X-ray use the application's selection/anatomy rendering. Play uses the existing operation code and fixed simulation steps.
- Browser playback passed for both resolutions, with zero dropped frames in the sampled 45-frame playback checks. The local preview and resolution switching work.
- Dark-surface colour was corrected after an initial transfer conversion visibly darkened the image. Final browser screenshots retain the intended dark palette.
- Compression spot check: the full twenty-second Raspberry Pi 5 segment, cropped to the 3D region, scored SSIM **0.998935** against the native capture. This is a compression check, not an engineering-accuracy score.
- The delivered AAC mix measures **−18.00 LUFS integrated** and **−5.40 dBTP**, with no clipping. Audio checks cover signal levels, duration and decoding; no separate human listening sign-off is claimed.

## Scope of visual accuracy

The film presents the current authored models. It is not a new independent validation of their engineering internals. Source revisions and limitations remain in `source-inventory.json`; the six featured scenes show short model-basis notes, and the YouTube description identifies representative cutaways and illustrative operation. No physical silicon activity is presented as a measured process.

## Evidence

- `review/checks.json`: encoding, timing, audio measurements, hashes and all review timestamps.
- `review/contact-*.png`: decoded frame contact sheets.
- `review/4k-detail.png`: native-resolution detail sample.
- `review/playback-check.json` and `review/browser-color-check.png`: browser validation.
- `exports-youtube/checksums.sha256`: delivery checksums.

The soundtrack is an original procedural composition; its source and provenance are included. No upload or publication was performed.
