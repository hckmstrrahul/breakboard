# Device images

This directory contains two Light-mode PNG exports for each of the 65 devices:

- `<device>-teardown-light.png`: exploded view with materials.
- `<device>-anatomy-light.png`: the same assembly in X-ray view.

The images come from the application's renderer and are 2400px wide. Each pair shares its camera and separation settings. Exports include the model and scene background; interface controls and component callouts are omitted.

See a selection in the [project gallery](../../README.md#light-mode-gallery), or use **Save image** in the app to export another view. To regenerate the full set, run `node scripts/render-device-proofs.mjs --gallery` with Chrome installed.

Hardware sources, reconstruction limits and reuse terms are documented in the viewer's **Model notes**, [reference records](../../reference/) and [project attribution](../../README.md#attribution).
