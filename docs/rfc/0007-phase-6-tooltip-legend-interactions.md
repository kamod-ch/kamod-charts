# RFC 0007: Phase 6 Tooltip, Legend, and Interactions

Status: Implemented  
Phase: 6  
Date: 2026-08-11

## Implemented scope

Phase 6 adds the first shared interaction layer for cartesian high-level charts.

Implemented:

- Shared pointer helpers:
  - `getPointerPosition`
  - `getNearestIndexByX`
- `Tooltip` HTML overlay primitive.
- `Legend` primitive with toggle callbacks.
- `Crosshair` SVG primitive.
- `LiveRegion` primitive for screenreader announcements.
- `Chart` overlay slot for HTML elements above SVG.
- Pointer move/leave wiring for `LineChart` and `ScatterChart`.
- Keyboard-active point state now feeds tooltip/live-region/crosshair state.
- Legend-driven series hiding for `LineChart` and `ScatterChart`.
- Standalone tests for tooltip, legend, crosshair, live region, and legend toggling.

## Public exports added

No new package subpaths were needed. Existing exports now include:

- `Tooltip`
- `Legend`
- `Crosshair`
- `LiveRegion`
- pointer helpers from `@kamod-ch/charts/interaction`

## Design notes

- HTML overlays are rendered as siblings after the SVG inside the chart container, not inside SVG.
- The chart container is positioned relative so tooltip overlays are SSR-safe and do not require portals or `document` access.
- Pointer calculations happen only in event handlers and use the event target's bounding rect; no browser measurement occurs during SSR.
- Legend state is local to high-level Line/Scatter charts in this phase. A controlled external visibility model is deferred.
- Pointer nearest-x behavior currently maps x-position to data index. Series-specific exact hit-testing and scatter nearest-point integration are deferred.

## Deferred scope

Deferred to later phases:

- Viewport collision detection for tooltip placement.
- Touch-specific affordances beyond pointer events.
- Shared tooltip across all high-level chart types.
- Controlled/uncontrolled selection API.
- Pie tooltip/legend integration.
- Legend integration for Area/Bar.
- Full nearest-point ScatterChart hit-testing via quadtree/Delaunay.

## Acceptance criteria mapping

- HTML Tooltip over SVG: implemented by `Tooltip` overlay and `Chart.overlay`.
- Nearest-X Tooltip: implemented for Line/Scatter via pointer x to nearest index.
- Shared Tooltip: current active series/index model supplies shared interaction data; multi-series shared rows are deferred.
- Custom Tooltip: `Tooltip` accepts render-prop children.
- Crosshair: implemented and wired for Line/Scatter when tooltip is enabled.
- Touch support: pointer events are used as the common input surface.
- Series Legend and hide/show: implemented for Line/Scatter.
- Keyboard behavior: existing chart keyboard navigation now feeds active interaction state.
- Live Region: implemented as `LiveRegion` and wired for Line/Scatter.

## Phase 7 entry criteria

Before Phase 7, the package is green for:

```sh
pnpm check
```

Phase 7 should deepen accessibility, animation, and performance rather than broaden chart types.
