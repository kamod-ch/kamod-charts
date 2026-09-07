# Plan 004: Deliver tooltip and legend parity for AreaChart and BarChart

> **Executor instructions**: Execute in order, run every verification, and stop on any STOP condition. Update the status in `plans/README.md` when complete unless a reviewer owns it.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 85f905c..HEAD -- packages/core/src/charts packages/core/src/series packages/core/tests packages/docs/components/examples packages/docs/charts packages/docs/data/props.ts
> git diff -- packages/core/src/charts/area-chart.tsx packages/core/src/charts/bar-chart.tsx packages/core/src/charts/types.ts packages/docs/components/examples/BarExamples.tsx
> ```
>
> `packages/docs/` and cartesian tooltip helpers are currently untracked at commit `85f905c`. This plan assumes Plans 001–003 have been applied on top of that work. Stop if they have not.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/001-align-cartesian-scales.md`, `plans/002-correct-cartesian-hit-testing.md`, `plans/003-build-production-tooltip-api.md`
- **Category**: bug, direction, tests, docs
- **Planned at**: commit `85f905c`, 2026-08-25

## Why this matters

`CommonCartesianChartProps` advertises `showLegend` and `tooltip` to Line, Scatter, Area, and Bar, but AreaChart and BarChart silently ignore them. The documentation already renders Bar examples with both props, creating a public promise that does not work. This plan gives Area and Bar the same options/context contract as Line/Scatter, including grouped and stacked bars, while avoiding a third independent interaction implementation.

## Current state

Relevant files:

- `packages/core/src/charts/types.ts` — Area/Bar inherit common `showLegend` and `tooltip` props.
- `packages/core/src/charts/area-chart.tsx` — destructures neither prop and has no overlay/interaction state.
- `packages/core/src/charts/bar-chart.tsx` — ignores both props and computes bar geometry inline inside nested maps.
- `packages/core/src/charts/cartesian-active-layers.tsx` — shared Line/Scatter active overlay after Plans 001–003.
- `packages/core/src/primitives/legend.tsx` — established HTML legend/toggle behavior.
- `packages/docs/components/examples/BarExamples.tsx` — currently promises unsupported behavior.

API promise:

```ts
// packages/core/src/charts/types.ts:21-35
export interface CommonCartesianChartProps<TDatum> {
  // ...
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: boolean; // becomes boolean | options in Plan 003
}
```

Area currently stops at grid/axes/series:

```tsx
// packages/core/src/charts/area-chart.tsx:39-54
<Chart ...>
  {showGrid ? <Grid ... /> : null}
  <XAxis dataKey={xKey} scale={xScale} />
  <YAxis domain={yDomain} />
```

Bar geometry is currently embedded in rendering:

```ts
// packages/core/src/charts/bar-chart.tsx:179-195
const raw = readY(datum, index);
const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
// ...
const x = horizontal ? Math.min(scaledStart, scaledEnd) : categoryPosition + groupOffset;
const y = horizontal ? categoryPosition + groupOffset : Math.min(scaledStart, scaledEnd);
const barWidth = horizontal ? Math.max(Math.abs(scaledEnd - scaledStart), minBarSize) : bandSize;
const barHeight = horizontal ? bandSize : Math.max(Math.abs(scaledEnd - scaledStart), minBarSize);
```

Broken docs promise:

```tsx
// packages/docs/components/examples/BarExamples.tsx:72-83
<BarChart
  // ...
  showLegend
  tooltip
  grouped
/>
// code: <BarChart grouped showLegend tooltip ... />
```

## Commands you will need

| Purpose         | Command                                                                                              | Expected on success    |
| --------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| Focused tests   | `pnpm --filter @kamod-ch/charts exec vitest run tests/area-bar.test.tsx tests/interactions.test.tsx` | exit 0                 |
| All tests       | `pnpm --filter @kamod-ch/charts test`                                                                | exit 0                 |
| Workspace types | `pnpm typecheck`                                                                                     | exit 0, including docs |
| Docs type/build | `pnpm --filter @kamod-ch/charts-docs typecheck`                                                      | exit 0                 |
| Lint/format     | `pnpm lint && pnpm format:check`                                                                     | exit 0                 |

Do not run the docs build if it writes unwanted generated files without first checking `git status`; its `dist/` is ignored, but preserve the worktree.

## Scope

**In scope**:

- `packages/core/src/charts/area-chart.tsx`
- `packages/core/src/charts/bar-chart.tsx`
- `packages/core/src/charts/types.ts`
- `packages/core/src/charts/cartesian-active-layers.tsx` (only to generalize reusable context; do not fork it)
- `packages/core/src/charts/bar-geometry.ts` (create if needed)
- `packages/core/src/series/area-series.tsx`
- `packages/core/src/series/stacked-area-series.tsx`
- `packages/core/tests/area-bar.test.tsx`
- `packages/core/tests/interactions.test.tsx`
- `packages/docs/components/examples/AreaExamples.tsx`
- `packages/docs/components/examples/BarExamples.tsx`
- `packages/docs/charts/area.mdx`
- `packages/docs/charts/bar.mdx`
- `packages/docs/data/props.ts`

**Out of scope**:

- Horizontal axis orientation and horizontal reference/grid semantics; Plan 005 owns those.
- PieChart tooltips/legend.
- New tooltip option types or placement behavior; consume Plan 003 exactly.
- Bar animation, drag/brush selection, portals, or new dependencies.
- `dist/`, lockfiles, and unrelated docs components.

## Git workflow

- Do not discard current docs or tooltip changes.
- Suggested branch after preservation: `advisor/004-add-area-bar-interaction-parity`.
- Suggested commit if requested: `feat: add area and bar chart interactions`.
- Do not push or open a PR without instruction.

## Steps

### Step 1: Write failing public-behavior tests

Extend `tests/area-bar.test.tsx` and/or `tests/interactions.test.tsx` with:

- AreaChart tooltip appears on pointer/keyboard interaction and contains formatted values using Plan 003 options.
- AreaChart legend toggles one series without removing unrelated series.
- Grouped BarChart pointer selects the exact bar/series and displays category plus value.
- Stacked BarChart selects the stack segment, not merely the whole category.
- Bar legend hides one series and recomputes grouping/stacking/domain correctly.
- Pointer leave and Escape dismiss overlays.
- Hidden/all-hidden series do not leave an invalid active interaction.

Use realistic mocked bounding rectangles as established in Plan 003. Assertions must include active datum index, series ID, content, and visible series count—not only element existence.

**Verify**: focused tests fail because Area/Bar do not yet implement the behavior.

### Step 2: Reuse the shared active state/context for AreaChart

Integrate the same interaction state, keyboard handler, legend pattern, and tooltip options/context used by LineChart. Do not copy the old LineChart body wholesale; extract a shared hook/helper if Area would otherwise duplicate scale projection and active-series normalization.

For non-stacked areas, axis mode should show all visible values for the selected X. For stacked areas, default axis mode still reports original per-series values, not cumulative `y0/y1`, unless the tooltip context explicitly provides both as additional metadata without replacing the raw value.

Hiding a series must recompute the domain and clamp/reset active series. Hiding all series must leave axes in a safe fallback state and suppress tooltip/crosshair.

**Verify**: Area-focused interaction and legend tests pass.

### Step 3: Extract pure BarChart geometry

Before adding hit-testing, move high-level bar rectangle calculations into a pure `resolveBarGeometry`-style helper in `charts/bar-geometry.ts` (or a comparably named file). Each returned item must include:

- original datum and index,
- series config/ID and series index,
- raw finite value or explicit missing marker,
- stack start/end where applicable,
- plot-relative `x`, `y`, `width`, and `height`,
- an anchor coordinate suitable for the tooltip,
- category display/raw value.

Use this same geometry array for rendering and pointer hit-testing. Do not maintain one rectangle formula in JSX and another in interaction code. Preserve grouped, stacked, vertical, horizontal, negative, `minBarSize`, and radius behavior. Missing/non-finite values should not become selectable zero bars unless existing documented semantics explicitly require zero substitution.

**Verify**: existing bar rendering/click tests pass before interaction is added, plus new pure geometry tests for grouped/stacked/negative values.

### Step 4: Add BarChart pointer and keyboard interaction

Pointer selection should first test containment in actual rectangles. If no rectangle contains the pointer, select nothing unless Plan 003's explicit axis mode requests nearest category behavior. For axis mode, choose the nearest category and report all visible series values. For nearest mode, report the exact bar/stack segment.

Keyboard navigation must traverse selectable category/series combinations deterministically, skip missing bars, and keep Enter/Space click behavior compatible with `onBarClick`. Do not create nested focusable SVG bars in this plan; retain chart-level keyboard navigation.

Feed a normalized Plan 003 tooltip context into the shared overlay. Bar anchors should normally use top-center for positive vertical bars, bottom-center for negative vertical bars, and end-center for horizontal bars.

**Verify**: grouped, stacked, negative, and horizontal interaction tests pass. Horizontal axis correctness may still be deferred, but hit geometry must match rendered bars.

### Step 5: Add legend parity without duplicated state rules

Use the `Legend` primitive and the same stable ID rules as Line/Scatter. Require or strongly guard against duplicate derived IDs. Toggling must:

- update visible series,
- recompute y/value domain,
- recompute grouped/stacked geometry,
- clamp active series,
- hide tooltip when its selected series disappears.

Area and Bar should not silently accept `showLegend` without rendering a legend after this step.

**Verify**: tests toggle first, middle, last, and all series; no stale tooltip remains.

### Step 6: Correct and expand documentation

Update Area and Bar examples so every advertised interaction is real. Include one custom formatter/options example, one grouped bar tooltip, and concise notes for stacked semantics and keyboard navigation. Update `docs/data/props.ts` to describe `boolean | options`, mode defaults, and chart support.

Do not claim Pie support. Do not include props that are accepted only by TypeScript but ignored at runtime.

**Verify**: `pnpm --filter @kamod-ch/charts-docs typecheck` → exit 0; `rg -n "showLegend|tooltip" packages/docs/components/examples/BarExamples.tsx packages/docs/components/examples/AreaExamples.tsx` shows examples backed by tests.

### Step 7: Run all non-mutating gates

**Verify**:

```sh
pnpm --filter @kamod-ch/charts test
pnpm typecheck
pnpm lint
pnpm format:check
```

→ all exit 0.

## Test plan

- Extend `area-bar.test.tsx` for rendering, geometry, click callbacks, grouped/stacked/negative behavior, and legends.
- Extend `interactions.test.tsx` for pointer/keyboard tooltip behavior and dismissal.
- Required Area cases: single/multi series, stacked, hidden series, all hidden, formatter.
- Required Bar cases: grouped, stacked, vertical, horizontal geometry, negative values, missing values, exact segment selection, axis mode, nearest mode, legend recomputation.
- Follow the public behavior style of existing tests; avoid broad snapshots.

## Done criteria

- [ ] AreaChart and BarChart no longer silently ignore `tooltip` or `showLegend`.
- [ ] Both consume the same public tooltip options/context as Line/Scatter.
- [ ] Bar rendering and hit-testing use one pure geometry source.
- [ ] Grouped and stacked bar tests identify the correct datum and series.
- [ ] Legend toggles recompute domains/geometry and clear stale interaction.
- [ ] Docs advertise only implemented behavior and workspace typecheck passes.
- [ ] All package tests, typecheck, lint, and format checks pass.
- [ ] No lockfile, dependency, `dist/`, PieChart, or horizontal-axis file is modified.
- [ ] `plans/README.md` status is updated.

## STOP conditions

Stop and report if:

- Plans 001–003 are not complete or expose incompatible tooltip contracts.
- Correct bar hit-testing cannot share geometry with rendering.
- Supporting horizontal interaction requires changing axes; keep geometry support but defer axis changes to Plan 005.
- Duplicate/missing series IDs cannot be resolved without a public breaking change.
- Docs source differs materially from the cited untracked package.
- A verification fails twice.

## Maintenance notes

- Reviewers should scrutinize stacked negative segments, all-series-hidden state, and callback index/series identity.
- Any future animation must animate the shared geometry and ensure hit-testing reflects the visible, not only final, rectangle.
- Pie tooltip parity remains intentionally separate and should not reuse Cartesian types blindly.
