# RFC 0001: `@kamod-ch/charts` Architecture

Status: Proposed  
Phase: 0  
Date: 2026-08-11

## Scope

This RFC defines the initial architecture for `@kamod-ch/charts`, a Preact-native SVG chart library. Phase 0 intentionally does not implement runtime chart components.

## Repository audit

Current repository path: `/home/watzak/master/kamod/kamod-charts`.

Findings:

- The repository directory is empty at the start of Phase 0.
- No `AGENTS.md` applies to this repository path.
- No local `package.json`, lockfile, TypeScript config, build config, or test config exists yet.
- The directory is not currently a Git repository.
- Nearby Kamod repositories use:
  - `pnpm` as package manager.
  - ESM packages with `type: "module"`.
  - Preact with TypeScript strict mode.
  - `jsx: "react-jsx"` and `jsxImportSource: "preact"`.
  - Oxlint and Oxfmt as required quality tools.
  - Workspace layout with `packages/*` for libraries and documentation.
- `kamod-ui` already exposes a simple Card-like `Chart` UI component. The charts package must avoid relying on it and must document naming clearly.

## Proposed package layout

Use a pnpm workspace even if the first package is the only package:

```text
.
├── docs/
│   ├── adr/
│   └── rfc/
├── packages/
│   └── charts/
│       ├── src/
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── vitest.config.ts
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── tsconfig.base.json
```

Rationale:

- Matches existing Kamod monorepo conventions.
- Leaves room for later docs/examples packages without changing package identity.
- Keeps the publishable package at `packages/charts` with repository directory metadata.

## Public API model

The package exposes a high-level API and a composable low-level API.

High-level API example:

```tsx
<LineChart
  data={data}
  xKey="date"
  series={[{ key: "revenue", label: "Umsatz", color: "var(--chart-1)" }]}
  height={320}
  showGrid
  showLegend
  tooltip
/>
```

Composable API example:

```tsx
<Chart data={data} height={320}>
  <Grid />
  <XAxis dataKey="date" scale="time" />
  <YAxis />
  <LineSeries dataKey="revenue" />
</Chart>
```

Initial public type direction:

```ts
export type ChartPrimitiveValue = string | number | Date;
export type ChartNullableValue<T extends ChartPrimitiveValue = ChartPrimitiveValue> =
  | T
  | null
  | undefined;

export type DataAccessor<TDatum, TValue = ChartPrimitiveValue> =
  | Extract<keyof TDatum, string | number>
  | ((datum: TDatum, index: number) => TValue);

export type NumericDataAccessor<TDatum> = DataAccessor<TDatum, number | null | undefined>;
export type DomainDataAccessor<TDatum> = DataAccessor<TDatum, ChartNullableValue>;

export interface ChartSeries<TDatum> {
  id: string;
  label?: string;
  value: NumericDataAccessor<TDatum>;
  color?: string;
  hidden?: boolean;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ChartOrientation = "vertical" | "horizontal";

export interface ChartInteraction<TDatum> {
  datum: TDatum;
  seriesId: string;
  index: number;
  value: number | null;
  x: number;
  y: number;
  nativeEvent?: PointerEvent | KeyboardEvent;
}
```

Notes:

- Public APIs avoid D3-specific types.
- `keyof TDatum` accessors support normal object data.
- Callback accessors support computed and nested values.
- Nullable values are explicit and handled by series-level options such as `connectNulls`.
- Series IDs are stable user-facing identifiers and are not inferred from labels.
- Orientation is a first-class option for bar-like charts.

## Internal architecture

Planned `packages/charts/src` structure by phase:

```text
core/             Chart root, context, layout, SVG surface, responsive sizing, shared types
scales/           D3-backed scale factories and domain inference with public wrappers
axes/             Preact-rendered axes and ticks
primitives/       Grid, legend, tooltip, crosshair, reference lines, dots, labels
series/           Low-level SVG series components
charts/           High-level chart components
interaction/      Pointer, keyboard, hit testing, selection helpers
animation/        Reduced motion and path/value interpolation
accessibility/    Titles, descriptions, data tables, live region helpers
theme/            CSS tokens and palette helpers
```

Files should be created only when a phase needs them.

## Build and test strategy

Phase 1 should initialize:

- Root `package.json` with pnpm package manager and workspace scripts.
- `pnpm-workspace.yaml` with `packages/*`.
- `tsconfig.base.json` with strict Preact JSX settings.
- `packages/charts/package.json` using ESM, peer dependency on `preact`, and direct modular D3 dependencies.
- `tsup` or Vite library build. Existing Kamod libraries commonly use `tsup`; for subpath exports with many entries, `tsup` is a good fit. If Vite is required later for CSS handling, it can be adopted with an ADR update.
- Vitest with jsdom for component tests and render-to-string tests for SSR determinism.
- Oxlint and Oxfmt scripts.

Minimum scripts:

```json
{
  "build": "pnpm -r build",
  "typecheck": "pnpm -r typecheck",
  "lint": "oxlint .",
  "lint:fix": "oxlint --fix .",
  "format": "oxfmt .",
  "format:check": "oxfmt --check .",
  "test": "pnpm -r test",
  "check": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build"
}
```

## Dependency policy

Runtime package dependencies should be limited to the modular D3 packages actually required by implemented phases:

- `d3-array`
- `d3-format`
- `d3-interpolate`
- `d3-scale`
- `d3-shape`
- `d3-time-format`

`preact` is a peer dependency and dev dependency for tests/builds.

Forbidden runtime imports:

- `react`
- `react-dom`
- `preact/compat`
- full `d3`
- `d3-selection`
- imperative `d3-axis` rendering

## Export strategy

Target public exports after implementation:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./line": {
    "types": "./dist/charts/line-chart.d.ts",
    "import": "./dist/charts/line-chart.js"
  },
  "./area": {
    "types": "./dist/charts/area-chart.d.ts",
    "import": "./dist/charts/area-chart.js"
  },
  "./bar": {
    "types": "./dist/charts/bar-chart.d.ts",
    "import": "./dist/charts/bar-chart.js"
  },
  "./pie": {
    "types": "./dist/charts/pie-chart.d.ts",
    "import": "./dist/charts/pie-chart.js"
  },
  "./scatter": {
    "types": "./dist/charts/scatter-chart.d.ts",
    "import": "./dist/charts/scatter-chart.js"
  },
  "./core": {
    "types": "./dist/core/index.d.ts",
    "import": "./dist/core/index.js"
  },
  "./theme.css": "./dist/theme/tokens.css"
}
```

The exact paths must be verified against generated build output before release.

## SSR and responsive strategy

- Fixed dimensions render deterministically on server and client.
- Responsive charts accept `initialWidth` and `height`.
- Server renders with `initialWidth` and never reads browser APIs.
- Client hydration starts with the same width to avoid mismatches.
- After hydration, a guarded `ResizeObserver` measures the container.
- Resize updates are batched via `requestAnimationFrame` when available.
- No unguarded access to `window`, `document`, `ResizeObserver`, `matchMedia`, or DOM measurements.

## Accessibility strategy

Baseline requirements from Phase 1 onward:

- SVG `role="img"` by default for standalone charts.
- Optional accessible name and description.
- SSR-stable `<title>` and `<desc>` IDs.
- One controlled focus target for chart-level keyboard interaction rather than one tab stop per point.
- Empty state that is visually and semantically clear.

Later phases add:

- Data table alternative.
- Keyboard navigation among points/series/segments.
- Live region for active data point announcements.
- High contrast and non-color-only differentiation.
- Reduced-motion aware animations.

## Theme strategy

`packages/charts/src/theme/tokens.css` should define semantic tokens and avoid hardcoded component colors:

```css
:root {
  --chart-1: var(--primary);
  --chart-2: var(--color-blue-500);
  --chart-3: var(--color-emerald-500);
  --chart-4: var(--color-violet-500);
  --chart-axis: var(--muted-foreground);
  --chart-grid: color-mix(in oklab, var(--border) 70%, transparent);
  --chart-tooltip-background: var(--popover);
  --chart-tooltip-foreground: var(--popover-foreground);
  --chart-tooltip-border: var(--border);
}
```

Additional tokens should be semantic, e.g. `--chart-reference-line`, `--chart-focus-ring`, `--chart-empty-foreground`.

## Performance boundaries

Initial target:

- Up to 500 points: fully interactive SVG.
- Up to 2,000 points: usable SVG with marker reduction and throttled pointer updates.
- Above 2,000 points: warn in development and default to reduced markers/interactions where appropriate.
- Above 10,000 points: document downsampling/Canvas roadmap before promising full interactivity.

Implementation principles:

- Memoize scales and paths.
- Use stable keys derived from series IDs and datum IDs/indexes.
- Avoid global context updates on every pointer move.
- Batch pointer and resize work with `requestAnimationFrame`.
- Use binary search for sorted time series in Phase 6/7.
- Evaluate Delaunay/quadtree later only when needed.

## Risks

- Public API can become too broad too early. Mitigation: expose stable core types in Phase 1, chart-specific options only when chart types are implemented.
- Hydration mismatches from responsive sizing. Mitigation: initial width contract and SSR tests.
- Transitive React in docs/test tooling. Mitigation: runtime dependency checks and import scans before release.
- D3 type leakage. Mitigation: internal wrappers and public type tests.
- Accessibility for dense SVG charts. Mitigation: chart-level focus and data-table alternative rather than per-point tab stops.

## Phase 1 acceptance criteria

Phase 1 is accepted when:

- Root and package configuration exist and follow pnpm/Kamod conventions.
- `@kamod-ch/charts` builds as ESM with type declarations.
- Public generic core types and accessor normalization exist.
- `Chart`/`ChartRoot`, chart context, SVG surface, plot area layout, margin calculation, and empty state exist.
- Fixed dimensions SSR deterministically.
- Responsive mode uses `initialWidth` on server and guarded `ResizeObserver` after hydration.
- Stable accessibility IDs are generated without hydration mismatches.
- Basic theme tokens exist and are included in package exports.
- Tests cover accessor normalization, margin/layout, SSR render output, and guarded responsive behavior.
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build` pass.
