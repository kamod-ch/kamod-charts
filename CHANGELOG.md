# Changelog

All notable changes to `@kamod-ch/charts` are documented here.

## 0.1.0 — 2026-09-07

First public release.

### Added

- High-level charts: Line, Area, Bar, Pie, Scatter with responsive sizing and SSR-safe rendering.
- Configurable tooltips with collision-safe placement, formatters, and axis/nearest modes.
- Legend toggling with domain and interaction recomputation on Area/Bar/Line/Scatter.
- Composable primitives: `Chart`, axes, grid, series, reference lines, tooltip, crosshair, live region.
- Accessibility helpers: keyboard navigation, polite live regions, optional `DataTable` alternative.
- Performance helpers: stride downsampling and marker reduction utilities.
- Optional `@kamod-ch/charts/motion` subpath for animated data updates.
- Tree-shakeable subpath exports and `@kamod-ch/charts/theme.css` semantic tokens.
- Documentation site with gallery, chart reference, playground, and API pages.

### Notes

- Requires Preact `>= 10.29`.
- Motion peers are optional; static chart imports stay motion-free.
