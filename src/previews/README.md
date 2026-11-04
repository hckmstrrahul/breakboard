# Device picker previews

Each device has two original **192 × 192 px WebP renders**, one for Light and one for Dark. Both use the actual assembled model, default 3D angle, shared lighting and materials. The camera fits visible model bounds with consistent padding; playback, labels, separation and the ground ring are off.

Run `npm run render:previews` after changing a model or adding a device. This starts a temporary local Vite server, renders every entry in `BOARD_LIST` through Chrome, and regenerates these images and `index.js`. Chrome must be installed; Playwright is a development dependency. The renderer closes its browser and server when finished.

The dropdowns and mobile device sheet share these assets. Light, Dark and System appearance all select the matching render. The standalone build embeds the WebPs so previews also work offline.
