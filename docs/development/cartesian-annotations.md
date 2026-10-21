# Cartesian annotations (Prompt 08)

High-level charts share typed `referenceLines`, `referenceAreas`, `referencePoints`, and `referenceSegments` configs. Rendering is centralized in `cartesian-reference-layers.tsx` so Line and Area use the same scale contract (`xKey`, `xScale`, optional `xDomain`, `yDomain`).

## Layer order

| Layer      | Content                                                     |
| ---------- | ----------------------------------------------------------- |
| Clipped    | `referenceAreas`, `referenceSegments`, then grid and series |
| Foreground | `referencePoints` (above series, decorative)                |
| Axes       | `referenceLines` on top of axes                             |

Annotations are `pointer-events: none` and do not expand inferred domains.

## Chart support

| Chart   | Lines | Areas                                                      | Points | Segments |
| ------- | ----- | ---------------------------------------------------------- | ------ | -------- |
| Line    | yes   | yes                                                        | yes    | yes      |
| Area    | yes   | yes                                                        | yes    | yes      |
| Scatter | yes   | yes                                                        | yes    | yes      |
| Bar     | yes   | yes (category vs value via `resolveBarReferenceAreaProps`) | —      | —        |

Bar horizontal orientation maps value-axis references through `x` on `referenceLines` and `y1`/`y2` bands on categories.

## Monitoring examples

- CPU warn threshold: `referenceLines: [{ y: 80, label: "Warn" }]`
- Maintenance window: `referenceAreas: [{ x1, x2, label: "Maint" }]`
- Deployment marker: `referencePoints: [{ x: deployTime, y: value, label: "Deploy" }]`

Use the same data coordinates on Line and Area; with a shared `xDomain`, annotations track zoom/pan and export.
