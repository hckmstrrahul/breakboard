# Infinite collection

The circular four-square button next to the device categories opens `#grid`. Models start assembled and stay still. Hovering or focusing a tile opens it into an exploded view and rotates that model; leaving returns it to the original assembled pose. Click, tap, Enter or Space opens the full device viewer. The header button or Escape returns to the previous individual viewer.

The grid repeats all 65 registered models vertically. Captions use uppercase JetBrains Mono. The Density slider changes the number of columns, preserves the first visible model and remembers the chosen count where local storage is available; its range adapts to the viewport (up to eight columns on desktop and three on a typical phone). Arrow keys move between tiles and scroll the next tile into view. Touch opens the device directly, without a hover requirement. Reduced motion shows the exploded preview immediately and keeps it stationary. Light, Dark and System use the existing appearance controls.

## Rendering and scrolling

`infinite-grid.js` virtualizes DOM buttons, keeping two extra rows above and below the viewport. Native scrolling uses a tall plane with a middle origin. Near either boundary it recenters by a multiple of the catalogue length, preserving the sequence and pixel offset. Column changes preserve the first visible device. The header measures the brand, tabs and actions: everything stays on one row when it fits; otherwise the tabs move to a left-aligned second row while the brand and actions stay on the first. Phone layouts keep their device picker. `collection-layout.js` owns the wrap and index rules.

Each tile owns a final assembled WebP, a canvas used only during hover/focus, and its caption. The browser scrolls these together. Static tiles never switch from a small thumbnail to a freshly rendered canvas, and scrolling does not build models or draw WebGL frames. The general opaque button-hover background is explicitly overridden for these tiles.

`src/grid-previews/` contains 768px and 2048px images for each device in both themes. The browser chooses a resolution through `srcset` and the actual tile size. Both sizes come from `collection-renderer.js`, using the same materials, lighting, default camera and square framing as the hover preview. The image uses `object-fit: contain`; live camera framing accounts for this at every tile aspect ratio, preserving the assembled pose when switching between them. These assets are separate from the small device-picker thumbnails.

The offscreen WebGL renderer is created on the first hover or keyboard focus. Only the selected model loads; its assembled image remains visible until the model is ready. The tile then renders its explosion and turntable at up to 30 fps. Leaving assembles the model and restores the same static image. Scrolling immediately restores static images, cancels pending hover work and leaves native image scrolling in charge. There is no animation loop while idle.

The hover GPU cache retains up to four built models. Removing a virtual tile releases its canvas backing store. Theme changes select the corresponding WebPs; density changes update image sizes and live framing. Device pixel ratio for live previews is capped at 2. Static images use their supplied resolution. The standalone build embeds both resolutions and themes for offline use.

Regenerate the images with `npm run render:grid-previews`, or use `npm run render:grid-previews -- --ids=esp32,hdd` after changing selected models. Chrome must be installed. The script also rebuilds the image manifest. Save image stays in the desktop header but is disabled while the collection is open, preserving the header's layout. Category dropdowns remain within the visible tab bar's horizontal bounds.

The 30-second film uses the same low-level renderer with its own deterministic clock, automatic turntables and assembly timing. The webpage's static/hover interaction does not change the exported video.

## Verification

Run `npm run check:grid` with Chrome installed. The test reproduces the GaN hover, checks that its background stays transparent and its canvas changes while adjacent models remain still, confirms return to the original assembled image, and checks click/keyboard/touch navigation to the full viewer. It also checks all 65 static previews, no idle model builds or frames, bounded hover caches, native wheel scrolling, tile/image alignment, repetition boundaries, reduced motion, themes and desktop/mobile layouts. Evidence is written to `video-production/infinite-grid-film/review/` (ignored generated files).

Run `npm run build` for the updated portable HTML. Desktop Chrome viewport emulation does not establish physical-phone GPU performance or touch behavior; those need an actual device check.
