# SVG monitoring baseline (Prompt 00)

Analyse-Referenz: [kamod-charts-svg-analyse-cursor-prompts.md](./kamod-charts-svg-analyse-cursor-prompts.md) · geprüfter Analyse-Commit: `001ad79c65c5ece59cb9fae287331a9eaae8b050`.

| Field                       | Value                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Checkout (aktuell)**      | `001ad79c65c5ece59cb9fae287331a9eaae8b050` (identisch mit Analyse-Commit)                                                                                    |
| **Package**                 | `@kamod-ch/charts` **0.2.0** (`packages/core/package.json`)                                                                                                  |
| **Workspace**               | `kamod-charts`, pnpm **11.17.0**                                                                                                                             |
| **Branch**                  | `main` (clean bis auf untracked/formatierte Prompt-Datei)                                                                                                    |
| **Verwandter älterer Plan** | [svg-roadmap-progress.md](./svg-roadmap-progress.md) — **andere** Prompt-Nummerierung (Surface/Export 01–10); nicht mit Monitoring-Prompts 00–11 verwechseln |

## Ausgangsprüfung `pnpm check` (2026-10-20)

| Step                               | Ergebnis                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `pnpm typecheck`                   | pass                                                                       |
| `pnpm lint`                        | pass                                                                       |
| `pnpm format:check`                | pass (nach `pnpm format` auf `kamod-charts-svg-analyse-cursor-prompts.md`) |
| `pnpm test`                        | pass — **524** tests, **56** files (`packages/core`)                       |
| `pnpm build`                       | pass                                                                       |
| `scripts/test-package-exports.mjs` | pass                                                                       |

Nicht in `pnpm check` enthalten (für Prompt 11): `pnpm test:browser`, `pnpm smoke:consumer`, `pnpm docs:build`, `pnpm bench:browser`.

## Feature-Matrix (Monitoring-Prompts)

Legende: **vorhanden** · **teilweise** · **fehlt** · **zu bestätigen** (Hypothese / Regressionstest nötig)

| Bereich                                                  | Status                          | Pfade / Hinweise                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SVG-Surface (`svgRef`, `svgProps`, Handler)              | **vorhanden**                   | `packages/core/src/core/chart-surface.tsx`, `chart-svg-props.ts`, `charts/chart-chrome-props.ts`                                                         |
| Layer / Clipping (`plotLayers`, `clipPlotArea`, `defs`)  | **vorhanden**                   | `chart-layers.ts`, `chart-clip.ts`, `ChartRoot`                                                                                                          |
| `aspectRatio` / responsive sizing                        | **vorhanden**                   | `resolveChartSize`, kartesische + Kreis-Charts                                                                                                           |
| Render-Slots (`renderPoint`, `renderBar`, `renderLabel`) | **vorhanden**                   | `series/mark-slots.tsx`, `charts/types.ts`                                                                                                               |
| SVG-Export (serialize / download)                        | **vorhanden**                   | `packages/core/src/export/*`, Subpath `@kamod-ch/charts/export`, `docs/development/svg-export.md`                                                        |
| Export: lokale vs. Vorfahren-Token                       | **zu bestätigen** (P0-Verdacht) | `export/serialize.ts` — Aufwärtsiteration überschreibt gesammelte Custom Properties                                                                      |
| Export: `all-computed` Modus                             | **teilweise**                   | Sammelt nur `--*` Custom Properties (`serialize.ts`); reguläre berechnete SVG-/Text-Stile fehlen                                                         |
| Achsen-Kollision (`tickCollision`)                       | **teilweise**                   | `axes/tick-collision.ts`, `tests/tick-collision.test.tsx`; Y-Achse / hide / Randticks **zu bestätigen** (P1)                                             |
| High-Level `yDomain`                                     | **vorhanden**                   | `CommonCartesianChartProps` in `charts/types.ts`                                                                                                         |
| High-Level kontrolliertes `xDomain` / Viewport           | **fehlt** (High-Level)          | Kein `xDomain` auf `CommonCartesianChartProps`; nur Low-Level (`series/*`, `primitives/*`, `Grid`)                                                       |
| Viewport-Modell (Zoom/Pan/Brush)                         | **fehlt**                       | Kein dediziertes Modul im `packages/core/src`-Baum                                                                                                       |
| Zoom / Pan / Brush UI                                    | **fehlt**                       | —                                                                                                                                                        |
| Streaming-Puffer / Live-Demo                             | **fehlt**                       | —                                                                                                                                                        |
| Crosshair-Sync (X-Wert)                                  | **teilweise**                   | `use-synchronized-cartesian-selection.ts`, `cartesian-sync.ts` — Zeitfenster/Domain-Sync nicht                                                           |
| Min/Max-Downsampling                                     | **vorhanden**                   | `performance/downsample-min-max.ts`, `downsample.ts`, Tests `downsample-min-max.test.ts`                                                                 |
| Segmenterhalt bei Lücken (null/NaN)                      | **zu bestätigen** (P0)          | `downsampleMinMax` filtert ungültige Y in Zeilen 33–38 — Lücken können verschwinden                                                                      |
| Browser-Benchmark                                        | **teilweise**                   | `scripts/browser-benchmark.mjs`, `packages/browser-fixture/src/BenchmarkFixture.tsx`, `docs/performance/browser-benchmarks.md`                           |
| Benchmark-Messprotokoll                                  | **fehlt / fehlerhaft**          | `markUpdated` direkt nach `setData` (Zeile 42 Fixture); Runner maskiert fehlende Updates als `0` (Runner Zeile 54); Bar ~24 Zeilen (Fixture Zeile 59–61) |
| Annotationen High-Level                                  | **teilweise**                   | Line: lines/areas/points; Area: nur `referenceLines`; Bar: lines/areas; Scatter: voll; `referenceSegments` nur Scatter (`types.ts`)                      |
| Sparkline-Preset                                         | **fehlt**                       | —                                                                                                                                                        |
| PNG/CSV Export                                           | **fehlt**                       | Optional Prompt 12                                                                                                                                       |
| Canvas-Renderer                                          | **fehlt** (bewusst)             | —                                                                                                                                                        |

## Subpath-Exports (Kern)

Siehe `packages/core/package.json` `exports`: `.`, `./export`, `./core`, `./performance`, `./axes`, Chart-Einträge (`./line`, `./area`, …), `./motion`, etc.

## Empfohlene Umsetzungsreihenfolge (Monitoring-Dokument)

1. **00** Baseline (diese Datei) — erledigt
2. **01–04** Benchmarks, Downsampling-Lücken, Export, Achsen
3. **05–08** Viewport, Zoom/Pan, Brush/Sync, Annotationen
4. **09–11** Streaming, Demo, Abschluss + Canvas-Entscheidung
5. **12–13** nur bei expliziter Auswahl

## Abnahme Prompt 00

- [x] Matrix mit Pfaden und Commit-ID
- [x] `pnpm check` mit echten Ergebnissen
- [x] Keine neuen Chartfeatures in diesem Schritt
- [x] Folgeprompts 01–11 als offen markiert (siehe [svg-monitoring-progress.md](./svg-monitoring-progress.md))
