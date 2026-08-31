# Plan 002: Select line and scatter tooltip targets from their real plotted positions

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. Stop rather than improvising when a STOP condition occurs. When done, update this plan's row in `plans/README.md` unless a reviewer owns the index.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 85f905c..HEAD -- packages/charts/src/interaction packages/charts/src/charts/cartesian-interaction.ts packages/charts/src/charts/line-chart.tsx packages/charts/src/charts/scatter-chart.tsx packages/charts/tests
> git diff -- packages/charts/src/interaction packages/charts/src/charts/cartesian-interaction.ts packages/charts/src/charts/line-chart.tsx packages/charts/src/charts/scatter-chart.tsx packages/charts/tests
> ```
>
> This plan includes uncommitted interaction work not represented by commit `85f905c`. Compare the live files with the excerpts below and preserve all user changes.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-align-cartesian-scales.md`
- **Category**: bug, perf, tests
- **Planned at**: commit `85f905c`, 2026-08-25

## Why this matters

Current pointer selection assumes every datum occupies an equal fraction of the plot width. That is wrong for irregular time/numeric domains and especially wrong for scatterplots, where the nearest point depends on both X and Y and may belong to a different series. The result is a tooltip and active marker that visibly jump to a datum the pointer is not near. This plan makes selection use the same projected coordinates as rendering while retaining keyboard navigation.

## Current state

Relevant files:

- `packages/charts/src/interaction/pointer.ts` — pointer-coordinate conversion and equal-index helper.
- `packages/charts/src/interaction/hit-testing.ts` — already contains a correct squared-distance scan for `CartesianPoint[]`, but high-level scatter does not use it.
- `packages/charts/src/charts/cartesian-interaction.ts` — projects an indexed datum to plot/surface coordinates.
- `packages/charts/src/charts/line-chart.tsx` and `scatter-chart.tsx` — currently call equal-index hit-testing on every pointer move.
- `packages/charts/src/charts/cartesian-active-layers.tsx` — consumes `activeIndex` and `activeSeries`; do not duplicate tooltip rendering here.

Current equal-spacing assumption:

```ts
// packages/charts/src/interaction/pointer.ts:29-38
export const getNearestIndexByX = (
  plotX: number,
  plotWidth: number,
  pointCount: number,
): number => {
  if (pointCount <= 1 || plotWidth <= 0) return 0;
  return Math.min(Math.max(Math.round((plotX / plotWidth) * (pointCount - 1)), 0), pointCount - 1);
};
```

Current callers:

```ts
// packages/charts/src/charts/line-chart.tsx:67-70
const nextPlot = resolvePlotAreaFromSize(size.width, size.height);
const position = getPointerPosition(event, nextPlot);
setActiveIndex(getNearestIndexByX(position.plotX, nextPlot.width, data.length));
```

```ts
// packages/charts/src/charts/scatter-chart.tsx:65-68
const nextPlot = resolvePlotAreaFromSize(size.width, size.height);
const position = getPointerPosition(event, nextPlot);
setActiveIndex(getNearestIndexByX(position.plotX, nextPlot.width, data.length));
```

Existing reusable distance convention:

```ts
// packages/charts/src/interaction/hit-testing.ts:13-18
const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
if (distance < nearestDistance) {
  nearest = point;
  nearestDistance = distance;
}
```

## Commands you will need

| Purpose       | Command                                                                                                | Expected on success |
| ------------- | ------------------------------------------------------------------------------------------------------ | ------------------- |
| Focused tests | `pnpm --filter @kamod-ch/charts exec vitest run tests/hit-testing.test.ts tests/interactions.test.tsx` | exit 0; all pass    |
| Package tests | `pnpm --filter @kamod-ch/charts test`                                                                  | exit 0              |
| Typecheck     | `pnpm typecheck`                                                                                       | exit 0              |
| Lint/format   | `pnpm lint && pnpm format:check`                                                                       | exit 0              |

## Scope

**In scope**:

- `packages/charts/src/interaction/pointer.ts`
- `packages/charts/src/interaction/hit-testing.ts`
- `packages/charts/src/interaction/index.ts`
- `packages/charts/src/charts/cartesian-interaction.ts`
- `packages/charts/src/charts/line-chart.tsx`
- `packages/charts/src/charts/scatter-chart.tsx`
- `packages/charts/tests/hit-testing.test.ts` (create)
- `packages/charts/tests/interactions.test.tsx`

**Out of scope**:

- Scale/domain behavior; Plan 001 must already have stabilized it.
- Tooltip styling, collision handling, formatter APIs, and ARIA behavior.
- AreaChart, BarChart, and PieChart interaction.
- Animation, downsampling, spatial indexes, quadtrees, and new dependencies.
- `packages/charts/dist/**`, docs, and lockfiles.

## Git workflow

- Preserve the dirty worktree; never run reset, checkout-on-file, clean, or stash without operator approval.
- Suggested branch after preservation: `advisor/002-correct-cartesian-hit-testing`.
- Suggested commit if requested: `fix: use plotted positions for chart hit testing`.
- Do not push or open a PR without explicit instruction.

## Steps

### Step 1: Add pure hit-testing regressions

Create `packages/charts/tests/hit-testing.test.ts`. Test pure helpers without jsdom where possible.

Required cases:

1. Irregular numeric X positions such as `[0, 10, 1000]`; a pointer near the projected second point selects index 1 even though equal-index math would select another index.
2. Irregular Date values with the same property.
3. Null/undefined/NaN Y values do not become selectable scatter candidates.
4. Scatter candidates with similar X but different Y select the nearest Euclidean point.
5. Multiple scatter series can return both the selected datum index and selected series index.
6. Empty data returns `null`, not index 0.

The helper result for multi-series scatter should use an explicit shape such as `{ index, seriesIndex, distanceSquared }`; do not encode two dimensions into a tuple without names.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/hit-testing.test.ts` → new tests fail only because the new helpers are not implemented yet.

### Step 2: Implement projected-position helpers

Add pure helpers in `cartesian-interaction.ts` or `interaction/hit-testing.ts` that:

- Construct/project coordinates using the scale contract from Plan 001.
- Skip unprojectable X values for line selection.
- Skip points with invalid X or Y for scatter selection.
- Return `null` for no valid candidate.
- Use squared distance; no square root is necessary.
- Preserve original datum indexes even when invalid points are skipped.

For line/axis mode, compare absolute projected X distance only. For scatter/nearest mode, compare squared X/Y distance across every visible series. Deterministic ties should prefer the lower series index, then lower datum index, and this rule must be tested.

Do not use DOM queries to find circle coordinates at runtime; calculate from data and shared scale helpers.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/hit-testing.test.ts` → all pure tests pass.

### Step 3: Switch LineChart to real projected X selection

Replace `getNearestIndexByX(position.plotX, width, data.length)` in `LineChart` with the projected-X helper. If no valid point exists, set `activeIndex` to `null`.

Keep keyboard navigation index-based. Ensure pointer handling does not activate a missing/null point just because its array index is nearest. If pointer hover is intended only when `tooltip` is enabled, do not attach or execute pointer hit-testing when `tooltip` is false; keyboard focus/navigation must continue to work.

**Verify**: add an irregular-time-series interaction test and run `pnpm --filter @kamod-ch/charts exec vitest run tests/interactions.test.tsx` → tooltip text and active marker correspond to the visually nearest X datum.

### Step 4: Switch ScatterChart to 2D, multi-series selection

Use `position.plotX` and `position.plotY` to choose the nearest valid point across all visible series. Update `activeIndex` and `activeSeriesIndex` together from one result so the active marker, tooltip anchor, and selected series cannot disagree.

After legend toggles, ensure a now-invalid `activeSeriesIndex` is clamped/reset before hit-testing. Hiding all series should produce no candidate and no tooltip.

**Verify**: add tests with two series sharing X values but separated vertically; pointer Y must select the correct series. Run `pnpm --filter @kamod-ch/charts exec vitest run tests/interactions.test.tsx` → all pass.

### Step 5: Retire the equal-index helper from high-level continuous charts

If `getNearestIndexByX` remains useful for an explicitly index-spaced API, keep it exported and document that constraint. Otherwise remove it and its export after confirming no callers remain.

**Verify**: `rg -n "getNearestIndexByX" packages/charts/src` → either zero matches, or only the definition/export plus a clearly index-spaced caller; LineChart and ScatterChart must not appear.

### Step 6: Run all quality gates

**Verify**:

```sh
pnpm --filter @kamod-ch/charts test
pnpm typecheck
pnpm lint
pnpm format:check
```

→ all commands exit 0.

## Test plan

- New pure tests in `tests/hit-testing.test.ts` for irregular numeric/time X values, invalid values, empty input, 2D selection, multiple series, and tie-breaking.
- Extend `tests/interactions.test.tsx` with at least one LineChart irregular-X case and two ScatterChart cases (Y-sensitive selection and series visibility).
- Use `fireEvent.pointerMove` as in existing tests, but mock `getBoundingClientRect()` and define a meaningful SVG viewBox/client rectangle so coordinates are not accidentally based on jsdom's zero-size fallback.
- Assert selected tooltip text, active series ID, active datum index, and marker—not just tooltip existence.

## Done criteria

- [ ] LineChart selection uses projected X values, not `pointCount` spacing.
- [ ] ScatterChart selection uses projected 2D distance across visible series.
- [ ] Empty/invalid candidates produce no tooltip.
- [ ] Active series index remains valid after legend changes.
- [ ] New hit-testing and interaction regression tests pass.
- [ ] `pnpm --filter @kamod-ch/charts test`, `pnpm typecheck`, `pnpm lint`, and `pnpm format:check` exit 0.
- [ ] No docs, dependencies, lockfiles, or `dist/` files are modified.
- [ ] `plans/README.md` status is updated.

## STOP conditions

Stop and report if:

- Plan 001 is not complete or rendered and interaction coordinates still use different scale contracts.
- Correct scatter selection would require a performance index for the expected dataset sizes; report dataset constraints rather than introducing a dependency.
- The current product intent explicitly requires axis-mode selection for ScatterChart rather than nearest-point selection.
- Existing uncommitted line/scatter interaction work differs materially from the excerpts.
- A focused verification fails twice.

## Maintenance notes

- Linear scans are appropriate for current small/medium datasets. If large scatter datasets become a target, benchmark first and add a spatial index as a separate plan.
- Downsampling must preserve original indexes or provide an index mapping for interaction.
- Plan 003 will build configurable `axis` versus `nearest` modes on top of these helpers; keep them pure and independently testable.
