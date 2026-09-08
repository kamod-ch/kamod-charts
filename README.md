<p align="center">
  <img src=".github/assets/logo-kamod-charts-dark.svg#gh-light-mode-only" alt="Kamod Charts" width="280" />
  <img src=".github/assets/logo-kamod-charts-light.svg#gh-dark-mode-only" alt="Kamod Charts" width="280" />
</p>

# Kamod Charts

<p align="center">
  Preact-native, SVG-first chart components for dashboards and data applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kamod-ch/charts"><img src="https://img.shields.io/npm/v/@kamod-ch/charts" alt="npm version" /></a>
  <a href="https://github.com/kamod-ch/kamod-charts/actions/workflows/gh-pages.yml"><img src="https://github.com/kamod-ch/kamod-charts/actions/workflows/gh-pages.yml/badge.svg" alt="Documentation build" /></a>
  <a href="https://github.com/kamod-ch/kamod-charts/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/kamod-ch/kamod-charts" alt="MIT license" /></a>
</p>

<p align="center">
  <strong><a href="https://kamod-ch.github.io/kamod-charts/">Gallery</a></strong> ·
  <strong><a href="https://kamod-ch.github.io/kamod-charts/getting-started/">Getting started</a></strong> ·
  <strong><a href="https://kamod-ch.github.io/kamod-charts/api/">API</a></strong> ·
  <strong><a href="https://kamod-ch.github.io/kamod-charts/playground/">Playground</a></strong>
</p>

## Features

- **Built for Preact** — no React, React DOM, `preact/compat`, or D3 DOM manipulation.
- **SVG-first** — charts render as regular, inspectable SVG elements.
- **Typed and composable** — use ready-made charts or assemble your own from primitives.
- **Tree-shakeable** — dedicated subpath exports let you import only the chart or module you need.
- **Accessible** — keyboard navigation, live regions, chart descriptions, and optional data tables.
- **Responsive and SSR-safe** — stable initial dimensions avoid hydration mismatches before `ResizeObserver` runs.
- **Animation is optional** — static imports do not load the Motion integration.

## Installation

```bash
pnpm add @kamod-ch/charts preact
```

Or with npm:

```bash
npm install @kamod-ch/charts preact
```

Import the chart theme once in your application entry point or global stylesheet:

```ts
import "@kamod-ch/charts/theme.css";
```

> `preact` is a peer dependency. The package is ESM-only and requires Preact 10.29 or newer.

## Quick start

```tsx
import { LineChart } from "@kamod-ch/charts/line";
import "@kamod-ch/charts/theme.css";

const data = [
  { month: "Jan", revenue: 28_400, costs: 18_200 },
  { month: "Feb", revenue: 31_200, costs: 19_100 },
  { month: "Mar", revenue: 36_800, costs: 21_400 },
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      xScale="point"
      series={[
        { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
        { key: "costs", label: "Costs", color: "var(--chart-2)" },
      ]}
      height={320}
      initialWidth={640}
      responsive
      showGrid
      showLegend
      tooltip
      title="Monthly revenue and costs"
      description="Revenue and costs from January through March."
    />
  );
}
```

`initialWidth` provides deterministic server-rendered and first-paint markup. With `responsive` enabled, the chart follows its parent after hydration.

## Available charts

| Chart                                                              | Import                     | Highlights                                        |
| ------------------------------------------------------------------ | -------------------------- | ------------------------------------------------- |
| [Line](https://kamod-ch.github.io/kamod-charts/charts/line/)       | `@kamod-ch/charts/line`    | Multiple series, stacking, curves, annotations    |
| [Area](https://kamod-ch.github.io/kamod-charts/charts/area/)       | `@kamod-ch/charts/area`    | Grouped or stacked areas, gradients, outlines     |
| [Bar](https://kamod-ch.github.io/kamod-charts/charts/bar/)         | `@kamod-ch/charts/bar`     | Vertical, horizontal, grouped, and stacked bars   |
| [Pie](https://kamod-ch.github.io/kamod-charts/charts/pie/)         | `@kamod-ch/charts/pie`     | Labels, legends, rose layout, segment interaction |
| [Donut](https://kamod-ch.github.io/kamod-charts/charts/donut/)     | `@kamod-ch/charts/donut`   | Center content, labels, and segment interaction   |
| [Scatter](https://kamod-ch.github.io/kamod-charts/charts/scatter/) | `@kamod-ch/charts/scatter` | Nearest-point tooltips and reference annotations  |

See the [gallery](https://kamod-ch.github.io/kamod-charts/) for complete examples or tune chart props in the [playground](https://kamod-ch.github.io/kamod-charts/playground/).

## Composable API

High-level components cover common use cases. For custom layouts and mixed visualizations, compose the same lower-level building blocks directly:

```tsx
import { Chart, Grid, LineSeries, ReferenceLine, XAxis, YAxis } from "@kamod-ch/charts";

<Chart
  data={data}
  xKey="month"
  xScale="point"
  height={320}
  initialWidth={640}
  responsive
  title="Monthly revenue"
>
  <Grid xKey="month" xScale="point" yDomain={[0, 40_000]} />
  <XAxis />
  <YAxis domain={[0, 40_000]} />
  <LineSeries dataKey="revenue" xScale="point" yDomain={[0, 40_000]} />
  <ReferenceLine y={30_000} yDomain={[0, 40_000]} label="Target" />
</Chart>;
```

## Theming

Kamod Charts uses semantic CSS custom properties, including `--chart-1` through `--chart-4`, `--chart-grid`, and tooltip tokens. Override them in your own theme or combine the defaults with [Kamod Themes](https://www.npmjs.com/package/@kamod-ch/themes):

```css
@import "@kamod-ch/themes/default.css";
@import "@kamod-ch/charts/theme.css";

.dashboard-chart {
  --chart-1: oklch(62% 0.18 250);
  --chart-2: oklch(70% 0.16 155);
}
```

Read the [theming guide](https://kamod-ch.github.io/kamod-charts/foundations/colors-and-themes/) for all supported tokens.

## Optional motion

Install the optional peers only when you need animated chart updates:

```bash
pnpm add @kamod-ch/motion motion
```

Then use the motion entry point:

```tsx
import { LineChart, MotionConfig } from "@kamod-ch/charts/motion";
```

Static imports such as `@kamod-ch/charts/line` remain motion-free. See the [motion guide](https://kamod-ch.github.io/kamod-charts/foundations/motion/).

## Package exports

| Import                                                                 | Purpose                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------- |
| `@kamod-ch/charts`                                                     | Complete public API                               |
| `@kamod-ch/charts/line`, `/area`, `/bar`, `/pie`, `/donut`, `/scatter` | High-level chart components                       |
| `@kamod-ch/charts/core`                                                | Chart container, responsive layout, and context   |
| `@kamod-ch/charts/series`                                              | Low-level series components and geometry helpers  |
| `@kamod-ch/charts/primitives`                                          | Grid, legend, tooltip, crosshair, and annotations |
| `@kamod-ch/charts/axes`                                                | X and Y axes                                      |
| `@kamod-ch/charts/scales`                                              | Scale and domain utilities                        |
| `@kamod-ch/charts/accessibility`                                       | Data table and chart-description helpers          |
| `@kamod-ch/charts/interaction`                                         | Pointer, keyboard, and hit-testing helpers        |
| `@kamod-ch/charts/performance`                                         | Downsampling helpers                              |
| `@kamod-ch/charts/motion`                                              | Animated charts and motion utilities              |
| `@kamod-ch/charts/theme.css`                                           | Default semantic chart tokens                     |

## Requirements

- Preact `>= 10.29.2`
- An ESM-capable bundler such as Vite or Rolldown
- Node.js `>= 20` for development tooling
- Optional: `@kamod-ch/motion` and `motion` for the motion entry point

For supported browsers, see [`docs/browser-support.md`](docs/browser-support.md).

## Development

This repository is a pnpm workspace. The publishable package lives in `packages/core`; the documentation site lives in `packages/docs`.

```bash
pnpm install
pnpm check
pnpm docs:dev
```

Useful commands:

| Command              | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `pnpm test`          | Run package tests                           |
| `pnpm typecheck`     | Check TypeScript types across the workspace |
| `pnpm build`         | Build publishable packages                  |
| `pnpm docs:build`    | Build the documentation site                |
| `pnpm size:report`   | Regenerate the bundle-size report           |
| `pnpm release:check` | Run all release gates                       |

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [`release checklist`](docs/release-checklist.md) before opening a release PR.

## License

[MIT](LICENSE.md) © Klaus Zahiragic
