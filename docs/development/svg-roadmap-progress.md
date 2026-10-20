# SVG roadmap progress (prompts 00–10)

Plan: [plans/svg-roadmap-cursor-prompts.md](../../plans/svg-roadmap-cursor-prompts.md) (repo root) · RFC: [rfcs/001-svg-surface-and-export.md](./rfcs/001-svg-surface-and-export.md) · Contract: [implementation-contract.md](./implementation-contract.md)

| Field           | Value                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Commit          | `e55c296` (`ci lint fix`)                                                           |
| Package         | `@kamod-ch/charts` **0.2.0**                                                        |
| Package manager | pnpm **11.17.0**                                                                    |
| Worktree        | `main`; untracked `plans/svg-roadmap-cursor-prompts.md`; modified `plans/README.md` |

## Prompt status

| Prompt | Status       | Notes                                                                                                |
| -----: | ------------ | ---------------------------------------------------------------------------------------------------- |
|     00 | **erledigt** | Befund + RFC 001 + diese Datei                                                                       |
|     01 | **erledigt** | `svgProps`, `svgRef`, Handler-Komposition; siehe [svg-surface-api.md](./svg-surface-api.md)          |
|     02 | **erledigt** | `plotLayers`, root `defs`, opt-in `clipPlotArea`                                                     |
|     03 | **erledigt** | `@kamod-ch/charts/export`; [svg-export.md](./svg-export.md)                                          |
|     04 | **erledigt** | `renderPoint`, `renderBar`, `renderLabel`; [svg-surface-api.md](./svg-surface-api.md)                |
|     05 | **erledigt** | `tickCollision`, truncate/hide/rotate; Tests `tick-collision.test.tsx`                               |
|     06 | **erledigt** | `aspectRatio` in `resolveChartSize` + kartesische Charts                                             |
|     07 | **erledigt** | `chart-chrome-props.ts`, Pie/Donut `class`/`style`/`aspectRatio`; Tests `svg-surface-parity.test.ts` |
|     08 | **optional (offen)** | PNG/Raster — nicht umgesetzt                                                                  |
|     09 | **optional (offen)** | Zoom/Pan-Spike — nicht umgesetzt                                                                |
|     10 | **erledigt**         | CHANGELOG Unreleased; Check-Matrix unten                                                        |

Abhängigkeiten entsprechen der Plan-Tabelle in `plans/svg-roadmap-cursor-prompts.md`.

## Istzustand (Kurz, Stand Prompt 00)

| #   | Behauptung                                                              | Ergebnis                                                                         |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | `ChartSurface` ohne öffentliches SVG-Element / eingeschränkte Attribute | **Bestätigt** — siehe `packages/core/src/core/chart-surface.tsx`                 |
| 2   | Kein öffentliches Layer-/Clipping-Modell                                | **Bestätigt** — Plot als `<g data-kamod-chart-plot>`; Serien/Achsen als Children |
| 3   | Area-Gradients spezialisiert, kein allgemeiner defs-Slot                | **Bestätigt** — `AreaGradientDef` in Serien                                      |
| 4   | Kein öffentlicher SVG-Serializer/Download                               | **Bestätigt** — kein `./export` Export                                           |
| 5   | Keine einheitlichen typisierten Mark-Render-Slots                       | **Bestätigt** — `renderPoint`/`renderBar` fehlen                                 |
| 6   | Achsen-Kollision primär über Rotation                                   | **Bestätigt** — `tickRotation` auf `XAxis`                                       |
| 7   | `ResponsiveContainer` misst nur Breite                                  | **Bestätigt** — feste `height` aus Props                                         |
| 8   | Surface-Props nicht vollständig konsistent                              | **Behoben (07)** — gemeinsame `ChartChromeProps` / `CartesianSurfaceChartProps`  |

## Checks

| Datum      | Command                     | Ergebnis                                 |
| ---------- | --------------------------- | ---------------------------------------- |
| 2026-10-20 | `pnpm typecheck`            | pass (nach 01)                           |
| 2026-10-20 | `packages/core` `pnpm test` | **524** tests, 56 files — pass (nach 07) |
| 2026-10-20 | `pnpm test:exports`         | pass                                     |
| 2026-10-20 | `pnpm check`                | pass                                     |
| 2026-10-20 | `pnpm smoke:consumer`       | pass                                     |
| 2026-10-20 | `pnpm test:browser`         | **7** passed (PlotPointerCapture unter Layern) |
| 2026-10-20 | `pnpm docs:build`           | pass                                     |
| 2026-10-20 | `pnpm size:report`          | pass                                     |

## Nächster Schritt

SVG-Kernprogramm **01–07 + 10** abgeschlossen. Optional **08** (PNG) / **09** (Zoom-Spike) bei Bedarf neu priorisieren; Version bump und npm publish bleiben bewusst außerhalb des Plans.

## Änderungen

**00:** `svg-roadmap-progress.md`, `rfcs/001-svg-surface-and-export.md` (keine Produktions-API).

**01:** `chart-svg-props.ts`, `ChartSurface`/`ChartRoot`, High-Level-Charts + Motion-kompatible Typen; `docs/development/svg-surface-api.md`; Tests `chart-svg-props.test.tsx`.

**02:** `chart-layers.ts`, `chart-clip.ts`, `ChartRoot.plotLayers`, root `defs`, `clipPlotArea`; kartesische High-Level-Charts auf Layer umgestellt; Tests `chart-layers.test.tsx`.

**03:** `src/export/*`, Subpath `@kamod-ch/charts/export`; `serializeChartSvg`, `downloadChartSvg`; Tests `chart-export.test.tsx`, `export-bundle.test.ts`.

**04:** `series/mark-slots.tsx`; `renderPoint` auf `CartesianSeriesConfig`; `renderBar` / `renderLabel`; Tests `mark-slots.test.tsx`.

**05:** `axes/tick-collision.ts`, `AxisTickText`, Props auf kartesischen Charts + `XAxis`/`YAxis`.

**06:** `aspectRatio` auf `ChartDimensionsInput` / `resolveChartSize` / kartesische Charts.

**07:** `charts/chart-chrome-props.ts` (`ChartChromeProps`, `CartesianSurfaceChartProps`); `CommonCartesianChartProps` / Pie / Donut vereinheitlicht; `CircularChartView` durchreicht `class`, `style`, `aspectRatio`; Motion `export type` der Chart-Props; `svg-surface-parity.test.ts`; Doku-Paritätstabelle in `svg-surface-api.md`.

**10:** `CHANGELOG.md` Unreleased; `PlotPointerCapture` unter Layer (Bar-Klicks in Browser); volle Check-Matrix oben.

Öffentliche API (additiv): `svgRef`, `svgProps`, `defs`, `clipPlotArea`, `plotLayers`; `createPlotClipPathId` aus `@kamod-ch/charts/core`; Export-Helfer aus `@kamod-ch/charts/export`.
