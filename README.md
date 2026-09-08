<p align="center">
  <img src=".github/assets/logo-kamod-charts-dark.svg#gh-light-mode-only" alt="Kamod Charts" width="280" />
  <img src=".github/assets/logo-kamod-charts-light.svg#gh-dark-mode-only" alt="Kamod Charts" width="280" />
</p>

# Kamod Charts

Preact-native, SVG-first chart components for dashboards and data apps. High-level charts for common cases, composable primitives when you need full control.

<p align="center">
  <a href="https://www.npmjs.com/package/@kamod-ch/charts"><img src="https://img.shields.io/npm/v/@kamod-ch/charts" alt="npm version" /></a>
  <a href="https://github.com/kamod-ch/kamod-charts/actions/workflows/gh-pages.yml"><img src="https://github.com/kamod-ch/kamod-charts/actions/workflows/gh-pages.yml/badge.svg" alt="Docs deploy" /></a>
  <a href="https://github.com/kamod-ch/kamod-charts/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/kamod-ch/kamod-charts" alt="license" /></a>
</p>

**[Docs](https://kamod-ch.github.io/kamod-charts/)** · **[Gallery](https://kamod-ch.github.io/kamod-charts/)** · **[npm](https://www.npmjs.com/package/@kamod-ch/charts)** · **[GitHub](https://github.com/kamod-ch/kamod-charts)** · **[Issues](https://github.com/kamod-ch/kamod-charts/issues)**

## Why Kamod Charts?

Most chart libraries target React, ship heavy runtimes, or wrap D3 in ways that fight your renderer. Kamod Charts is built for Preact apps that want SVG in the DOM with a small, typed surface:

- **Preact-native** — SVG is rendered by Preact, not by D3 selection APIs.
- **Modular D3** — scales, shapes, and formatters only; no `d3-selection` or full `d3` bundle.
- **Tree-shakeable** — import `@kamod-ch/charts/line` (~400 B) instead of the full package when you only need one chart.
- **Accessible** — keyboard navigation, live regions, and an optional data-table alternative.
- **SSR-safe** — responsive sizing and tooltips avoid unguarded browser APIs during render.

## Chart types

| Chart   | Import                     | Notes                                    |
| ------- | -------------------------- | ---------------------------------------- |
| Line    | `@kamod-ch/charts/line`    | Axis tooltips, time/linear/band X scales |
| Area    | `@kamod-ch/charts/area`    | Stacked or grouped, outline option       |
| Bar     | `@kamod-ch/charts/bar`     | Vertical/horizontal, grouped, stacked    |
| Pie     | `@kamod-ch/charts/pie`     | Donut, labels, segment click             |
| Scatter | `@kamod-ch/charts/scatter` | Nearest-point tooltips                   |

Optional animated variants live under `@kamod-ch/charts/motion` and keep Motion as an external peer.

## Quick start

```bash
pnpm add @kamod-ch/charts preact
```

Import theme tokens once in your app stylesheet:

```css
@import "@kamod-ch/charts/theme.css";
```

```tsx
import { LineChart } from "@kamod-ch/charts/line";

const data = [
  { date: new Date("2026-01-01"), revenue: 1200, costs: 800 },
  { date: new Date("2026-01-02"), revenue: 1500, costs: 900 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="date"
      xScale="time"
      series={[
        { key: "revenue", id: "revenue", label: "Revenue", color: "var(--chart-1)" },
        { key: "costs", id: "costs", label: "Costs", color: "var(--chart-2)" },
      ]}
      height={320}
      initialWidth={640}
      responsive
      showGrid
      showLegend
      tooltip
    />
  );
}
```

Browse the [live docs](https://kamod-ch.github.io/kamod-charts/charts/line) for tooltips, formatters, motion, and playground examples.

## Composable API

Use primitives when you need custom layout or mixed series:

```tsx
import { Chart, Grid, LineSeries, ReferenceLine, Tooltip, XAxis, YAxis } from "@kamod-ch/charts";

<Chart data={data} xKey="date" xScale="time" height={320}>
  <Grid yDomain={[0, 2000]} />
  <XAxis />
  <YAxis domain={[0, 2000]} />
  <LineSeries dataKey="revenue" />
  <ReferenceLine y={1000} label="Target" />
</Chart>;
```

## Tooltips and legends

High-level charts accept `tooltip` as a boolean or structured options:

```tsx
<BarChart
  grouped
  showLegend
  tooltip={{
    mode: "nearest",
    formatValue: (value) => (value == null ? "–" : `${value} €`),
  }}
  /* ... */
/>
```

See [Bar chart docs](https://kamod-ch.github.io/kamod-charts/charts/bar) for horizontal orientation and reference-line semantics.

## Subpath exports

| Subpath                              | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `@kamod-ch/charts/line` … `/scatter` | High-level chart components            |
| `@kamod-ch/charts/core`              | `Chart`, `ResponsiveContainer`, layout |
| `@kamod-ch/charts/series`            | Low-level series primitives            |
| `@kamod-ch/charts/primitives`        | Grid, legend, tooltip, crosshair       |
| `@kamod-ch/charts/axes`              | `XAxis`, `YAxis`                       |
| `@kamod-ch/charts/accessibility`     | `DataTable`, `buildChartDescription`   |
| `@kamod-ch/charts/performance`       | Downsampling helpers                   |
| `@kamod-ch/charts/motion`            | Animated chart wrappers (optional)     |
| `@kamod-ch/charts/theme.css`         | Semantic chart tokens                  |

## Theming

Charts read CSS variables such as `--chart-1` … `--chart-4`, `--chart-grid`, and tooltip tokens. They align with [Kamod Themes](https://www.npmjs.com/package/@kamod-ch/themes) and [Kamod UI](https://www.npmjs.com/package/@kamod-ch/ui) out of the box:

```css
@import "@kamod-ch/themes/default.css";
@import "@kamod-ch/charts/theme.css";
```

## Requirements

- **Preact** `>= 10.29`
- **Node** `>= 20` for development tooling
- ESM bundler (Vite, Rolldown, etc.) — the package is ESM-only
- Optional: `@kamod-ch/motion` and `motion` for `@kamod-ch/charts/motion`

## Runtime policy

- Preact only — no React, React DOM, or `preact/compat` in the library.
- D3 is computation-only (`d3-scale`, `d3-shape`, …).
- Static chart entries do not import Motion; use `@kamod-ch/charts/motion` when you need data animations.

## Monorepo layout

| Path            | Role                                        |
| --------------- | ------------------------------------------- |
| `packages/core` | Publishable npm package `@kamod-ch/charts`  |
| `packages/docs` | PreactPress documentation site              |
| `docs/`         | Release checklist, ADRs, bundle-size report |

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm docs:dev
```

Release gates and publish steps are documented in [`docs/release-checklist.md`](docs/release-checklist.md).

## License

MIT — see [LICENSE.md](LICENSE.md).
