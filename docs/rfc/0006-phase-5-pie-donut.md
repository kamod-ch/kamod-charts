# RFC 0006: Phase 5 PieChart and DonutChart

Status: Implemented  
Phase: 5  
Date: 2026-08-11

## Implemented scope

Phase 5 adds pie and donut chart support.

Implemented:

- `PieSeries` low-level SVG primitive.
- `PieChart` high-level chart.
- Donut charts via `innerRadius`.
- Segment padding via `padAngle`.
- Rounded segments via `cornerRadius`.
- Optional sorting.
- Internal, external, or disabled labels.
- Active segment rendering.
- Center content.
- Null, zero, and negative value handling.
- Fully empty data falls back to the shared chart empty state.
- No-positive-value data renders a semantic SVG empty message.
- Keyboard navigation between segments:
  - Arrow right/down: next segment.
  - Arrow left/up: previous segment.
  - Home/End: first/last segment.
  - Enter/Space: invoke segment selection callback.
  - Escape: reset active segment to first.
- Segment click callbacks.

## Public exports added

- `@kamod-ch/charts/pie`

Root and `@kamod-ch/charts/series` exports now include `PieSeries`.

## Design notes

- `d3-shape` is used only for pie-angle and arc-path calculation.
- Preact renders every segment, label, and center element.
- Negative and invalid values are clamped to `0`; they do not generate visible segments.
- Empty input data is handled by `Chart`'s shared empty-state behavior.
- Data with no positive values is handled inside `PieSeries`, because the chart has data but no drawable pie total.

## Deferred scope

Deferred to later phases:

- Full legend implementation.
- Tooltip integration.
- Live region announcements for segment changes.
- External callout collision avoidance.
- Controlled active segment state.
- Rich center-content layout helpers.

## Acceptance criteria mapping

- Pie: implemented by `PieChart` with `innerRadius = 0`.
- Donut: implemented by `innerRadius`.
- Segment spacing/rounding: `padAngle` and `cornerRadius`.
- Sorting: `sort` option.
- Labels: `labels="inside" | "outside" | "none"`.
- Active segments: `activeIndex` in `PieSeries`, internal state in `PieChart`.
- Center content: `centerContent` prop.
- Null/zero/negative/empty handling: covered by tests.
- Keyboard navigation: covered by component tests.

## Phase 6 entry criteria

Before Phase 6, the package is green for:

```sh
pnpm check
```

Phase 6 should add the shared interaction model, HTML tooltip, legend, pointer/touch support, and screenreader live region while reusing existing active-point/segment foundations.
