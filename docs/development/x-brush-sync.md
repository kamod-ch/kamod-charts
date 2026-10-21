# X brush and synchronized time windows (Prompt 07)

## Brush overview

`LineChartWithXBrush` stacks a main chart (controlled `xDomain`) and a compact overview. The overview uses the full data extents; `CartesianXBrush` selects the window.

```tsx
<LineChartWithXBrush data={rows} xKey="t" xScale="time" xBrush series={[...]} />
```

Handles support pointer drag and keyboard (arrow pan, Alt+arrow resize). Overview line data uses segment-preserving min/max downsampling (`overviewPointBudget`, default 320).

## Shared X domain

`useSynchronizedCartesianXDomain` keeps one viewport in timestamp/numeric space for multiple charts:

```tsx
const sync = useSynchronizedCartesianXDomain({ initialXDomain });
const a = sync.createChartViewportHandlers({ data: dense, xKey: "t", xScale: "time", peerExtents: [sparseExtents] });
<LineChart xDomain={a.xDomain} onXViewportChange={a.onXViewportChange} ... />
```

**Extents policy:** user gestures clamp to `resolveSynchronizedXExtents` — intersection of all registered chart extents when it exists, otherwise the union (charts with gaps or mismatched sampling still share the same logical window).

`setXDomain` from the parent does not re-emit `onXViewportChange` (no controlled feedback loops).

Brush, zoom/pan (`xViewportInteraction`), and trailing window buttons should all call the same `setXDomain` / `onXViewportChange` path.
