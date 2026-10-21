# X viewport (`xDomain`)

Line and area charts with `xScale="linear"` or `xScale="time"` accept a controlled `xDomain` viewport. Categorical charts (`point` / `band`) ignore `xDomain`.

## Chart props

| Prop         | Default            | Description                                              |
| ------------ | ------------------ | -------------------------------------------------------- |
| `xDomain`    | inferred from data | `[min, max]` numbers or dates for the visible X window   |
| `yAutoscale` | `data`             | `visible` restricts Y inference to rows inside `xDomain` |

Full data rows are still passed to series renderers so lines can clip correctly at window edges. Tooltip indices remain original row indices.

## Pure helpers

Exported from `@kamod-ch/charts`:

- `inferContinuousXDomainFromData`
- `normalizeChartXDomain`
- `clampXViewportDomain`
- `panXViewportDomain`
- `zoomXViewportDomain`
- `createTrailingTimeWindowDomain`

See `packages/core/tests/x-viewport.test.ts` and the docs example `LineViewportDemo` (5/15/60 minute buttons).

## Interaction (Prompt 06)

Enable on line/area charts:

```tsx
<LineChart xViewportInteraction={{ wheelZoom: "modifier" }} onXViewportChange={(domain) => { ... }} />
```

- Drag on the chart surface to pan (pointer capture).
- **Alt + wheel** zooms around the cursor (`wheelZoom: "modifier"`, default).
- **R** resets; **Alt+Arrow** pans; **Alt +/-** zooms; **Escape** cancels an active pan.
- Tooltips pause while panning.

Gestures reuse the viewport helpers above (no duplicate scale math).
