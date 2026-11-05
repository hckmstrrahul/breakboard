# Grid previews

Final assembled views for the infinite collection, rendered from its actual 3D models. Each device has Light and Dark WebPs in **768 × 768** and **2048 × 2048** sizes. Responsive image selection keeps dense grids lightweight and larger tiles sharp.

Run `npm run render:grid-previews` to regenerate all devices, or `npm run render:grid-previews -- --ids=esp32,hdd` for a subset. Chrome must be installed. The script renders through `collection-renderer.js` with square framing, so materials, lighting and camera match the live hover view. It regenerates `index.js` for the complete catalogue.

The grid uses these images for its entire idle state. It loads a live model only for hover or keyboard focus. The small dropdown thumbnails remain in [previews](../previews/README.md). Both image sets are embedded in the standalone HTML.

Model sources and reuse terms remain those listed in the [project attribution](../../README.md#attribution) and each device's evidence record.
