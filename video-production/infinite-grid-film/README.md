# Breakboard · Infinite grid film

A 30-second, 16:9 continuous scroll through all 65 actual Breakboard models. Every object rotates; deterministic staggered timing opens and closes selected models. There are no scene cuts or feature panels. A small brand mark and device names keep the hardware central.

## Deliverables

Generated outputs live separately in **`exports-infinite-grid/`**:

- `breakboard-infinite-grid-4k.mp4` — native 3840 × 2160, 30 fps, H.264, AAC stereo.
- `breakboard-infinite-grid-1080p.mp4` — 1920 × 1080 Lanczos downsample, optimized H.264, same audio.
- `preview.html`, thumbnail, YouTube title and description.
- Original score WAV, synthesis provenance, capture manifest and verification report.

The previous showcase production remains in `../youtube-showcase/`. This folder is the shorter replacement requested for the grid concept.

## Picture plan

Five columns, 350 logical px per row, scrolling upward at 160 px/s for 30 seconds. Turntables rotate at 0.29 rad/s with staggered starting angles. A seeded index selects three fifths of the tiles for a smooth 0.95-second explode transition, a hold, and 0.95-second reassembly. This timing occurs as a model passes the visible middle of the grid. All 65 models appear fully in frame; the capture manifest records coverage and fully exploded appearances. The sequence repeats naturally beyond the catalogue boundary. Brief opening and closing fades finish the clip.

`src/render.mjs` uses the app's shared scissored collection renderer, the same board builders and real assembled/exploded poses. It fits each model for the full turntable orbit. Geometry is loaded before recording each deterministic frame, so loading placeholders never enter the video. WebCodecs records native 4K H.264; FFmpeg produces upload-ready masters with fast start, 4:2:0 pixel format and Rec.709 metadata. Display-referred capture values are preserved; there is no scene-linear transfer conversion that crushes the dark background.

## Music

“Objects in Motion” is an original, deterministic, 30-second arrangement of the project's synthesized score: soft tine keys, warm pads and sparse bass/percussion at 96 BPM. All sound is generated from oscillators and seeded noise in `src/music.mjs`, with no external recordings. The export targets −18 LUFS with a −1.5 dBTP ceiling and a gentle final fade. The provenance JSON documents the seed and arrangement.

## Reproduce

From the repository root, with dependencies installed, Chrome and FFmpeg available:

```sh
node video-production/infinite-grid-film/src/capture.mjs --proof
node video-production/infinite-grid-film/src/capture.mjs
node video-production/infinite-grid-film/src/music.mjs
node video-production/infinite-grid-film/src/finish.mjs
node video-production/infinite-grid-film/src/verify.mjs
```

Review stills and machine-readable checks are in `review/`. `cache/`, `review/` and `exports-infinite-grid/` are ignored by Git; scripts, timing, manifests and documentation are retained. No uploads or publishing are performed.

The video inherits each model's documented hardware revision and accuracy limits. Unpublished chip interiors and hidden structures may be representative reconstructions, as identified in the source evidence and the app's Model notes.
