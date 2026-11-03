# Untitled UI controls in breakboard

Retrieved with the Untitled UI MCP `get_component_bundle`: button, button-group, button-utility, input, slider and tabs (v8, public components). The official CLI downloaded the source in this directory. breakboard is framework-free, so the control presentation is adapted to semantic HTML and CSS in `src/style.css`; no React runtime is shipped.

Source decisions: 8 px button corners, 10 px inset segmented groups with 4 px padding, 14 px semibold labels, subtle border/shadow, 40 px controls, inset search icon, round slider handle and consistent hover/focus/disabled states. Existing light colors and warm brand accents are retained; dark surfaces use neutral cool charcoal.

Icons were verified with the MCP `search_icons` tool, then compiled from the official package by `scripts/package-ui-icons.mjs`. The package's usage notice is included in `public/licenses` and the standalone app. These assets are used as part of the app, not distributed as an icon library.
