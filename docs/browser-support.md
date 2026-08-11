# Browser support

Supported baseline:

- Modern evergreen browsers with SVG support.
- Node.js >= 20 for build/test tooling.
- SSR environments without `window`/`document`.

Used browser APIs:

- `ResizeObserver` only after mount and guarded.
- `requestAnimationFrame` only after mount/event paths and guarded.
- `matchMedia` only behind guards for reduced motion.

CSS features:

- CSS custom properties.
- `color-mix()` for grid token fallback in modern browsers.
