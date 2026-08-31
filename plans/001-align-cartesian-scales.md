# Plan 001: Align cartesian series, axes, references, and interaction coordinates

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 85f905c..HEAD -- packages/charts/src/series packages/charts/src/charts/cartesian-interaction.ts packages/charts/src/charts/bar-chart.tsx packages/charts/tests
> git diff -- packages/charts/src/series packages/charts/src/charts/cartesian-interaction.ts packages/charts/src/charts/bar-chart.tsx packages/charts/tests
> ```
>
> This plan was written against commit `85f905c` **plus existing uncommitted tooltip work**. The second command is mandatory because `cartesian-interaction.ts` is currently untracked and several interaction files are modified. Preserve those changes. If the live excerpts do not match the current-state section, stop and report.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug, tests, tech-debt
- **Planned at**: commit `85f905c`, 2026-08-25

## Why this matters

The library currently computes independent scales for plotted series, axes, grid/reference layers, and active tooltip coordinates. Series commonly force D3 `nice: true`, while axes and interaction use the raw domain. For domains such as `[3, 97]`, the plotted series uses `[0, 100]` but the axis and crosshair use `[3, 97]`; markers, ticks, reference lines, and tooltips therefore disagree geometrically. This plan establishes one internal scale contract and locks it down with coordinate assertions before further tooltip work.

## Current state

Relevant files:

- `packages/charts/src/series/cartesian.ts` — creates X/Y scales for line, scatter, and area series.
- `packages/charts/src/series/line-series.tsx`, `scatter-series.tsx`, `area-series.tsx` — request `nice: true`.
- `packages/charts/src/series/bar-series.tsx`, `stacked-area-series.tsx` — independently create `nice: true` value scales.
- `packages/charts/src/charts/bar-chart.tsx` — contains a second high-level bar renderer with another `nice: true` scale.
- `packages/charts/src/charts/cartesian-interaction.ts` — independently reconstructs raw-domain scales for active points.
- `packages/charts/src/axes/axis-scale.ts`, `packages/charts/src/primitives/grid.tsx`, and `reference-line.tsx` — form the existing declarative axis/grid/reference convention. Keep this Preact-owned SVG pattern.

Current mismatch:

```ts
// packages/charts/src/series/line-series.tsx:58-65
const scales = useCartesianScales({
  xKey: resolvedXKey,
  yKey: dataKey,
  xScale,
  xDomain,
  yDomain,
  nice: true,
});
```

```ts
// packages/charts/src/charts/cartesian-interaction.ts:86-90
const xScale = createXScale(data, xKey, xScaleKind, plotWidth);
const yScale = createLinearScale({
  domain: yDomain,
  range: [plotHeight, 0],
});
```

```ts
// packages/charts/src/charts/bar-chart.tsx:155-159
const valueScale = createLinearScale({
  domain: yDomain,
  range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
  nice: true,
});
```

Repository conventions:

- Preact only; no React compatibility layer and no imperative D3 DOM ownership (`CONTRIBUTING.md:10-17`).
- D3 scale modules may perform calculations, but rendered SVG remains declarative.
- Tests use Vitest, `@testing-library/preact`, and explicit DOM attribute assertions; model new render tests after `packages/charts/tests/interactions.test.tsx`.
- Public APIs must remain D3-independent.

## Commands you will need

| Purpose       | Command                                                                                              | Expected on success            |
| ------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------ |
| Focused tests | `pnpm --filter @kamod-ch/charts exec vitest run tests/scales.test.ts tests/scale-alignment.test.tsx` | exit 0; all focused tests pass |
| Package tests | `pnpm --filter @kamod-ch/charts test`                                                                | exit 0; all tests pass         |
| Typecheck     | `pnpm typecheck`                                                                                     | exit 0; no errors              |
| Lint          | `pnpm lint`                                                                                          | exit 0                         |
| Format check  | `pnpm format:check`                                                                                  | exit 0                         |

Do not run `pnpm build` during implementation until the operator confirms that overwriting the currently modified tracked `packages/charts/dist/` tree is acceptable.

## Scope

**In scope**:

- `packages/charts/src/series/cartesian.ts`
- `packages/charts/src/series/line-series.tsx`
- `packages/charts/src/series/scatter-series.tsx`
- `packages/charts/src/series/area-series.tsx`
- `packages/charts/src/series/bar-series.tsx`
- `packages/charts/src/series/stacked-area-series.tsx`
- `packages/charts/src/charts/cartesian-interaction.ts`
- `packages/charts/src/charts/bar-chart.tsx`
- `packages/charts/tests/scales.test.ts`
- `packages/charts/tests/scale-alignment.test.tsx` (create)

**Out of scope**:

- Tooltip content, placement, formatters, or public tooltip types.
- Hit-testing and nearest-point selection; Plan 002 owns that.
- Area/Bar tooltip and legend parity; Plan 004 owns that.
- Axis orientation changes for horizontal bars; Plan 005 owns that.
- `packages/charts/dist/**`, lockfiles, docs, and dependencies.

## Git workflow

- The worktree is already dirty. Do not reset, stash, clean, or overwrite existing changes.
- Use branch `advisor/001-align-cartesian-scales` only if the operator has first preserved the current worktree; otherwise remain on the provided branch.
- Existing commit messages are informal (`gitignore added`, `first commit`), so no conventional-commit requirement exists. If asked to commit, use `fix: align cartesian scale coordinates`.
- Do not push or open a PR without explicit operator instruction.

## Steps

### Step 1: Add regression tests that expose the current disagreement

Create `packages/charts/tests/scale-alignment.test.tsx`. Use finite numeric domains that D3 changes when `nice()` is applied, especially `[3, 97]`, rather than round domains that accidentally mask the bug.

Add at least these tests:

1. A `LineChart` with numeric X values and Y values spanning `3..97`; activate a point by keyboard and assert the active circle's `cx`/`cy` equal the crosshair line coordinates in plot-relative units.
2. A `ScatterChart` equivalent with the same assertion.
3. A composable `Chart` containing `LineSeries`, `XAxis`, `YAxis`, and a `ReferenceLine` at an existing datum; assert the marker and reference coordinate resolve consistently.
4. A Bar or Area regression proving the rendered value scale and matching reference/axis scale share the same domain treatment.

Do not use snapshots as the primary assertion. Parse numeric SVG attributes/transforms and compare with a small tolerance such as `toBeCloseTo(..., 5)`.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/scale-alignment.test.tsx` → at least one new regression fails for coordinate mismatch before production changes.

### Step 2: Define and document the internal scale contract

In `packages/charts/src/series/cartesian.ts`, make the default domain treatment explicit and reusable. The recommended contract for this release is:

- High-level and composable components use the exact supplied/inferred domain by default (`nice: false`).
- A component may only apply `nice` when every visual and interaction layer receives the same resolved domain.
- Active-point helpers must call the same pure scale-construction path or use exactly equivalent options; do not maintain a subtly different copy.

Prefer extracting pure construction helpers from `useCartesianScales` that accept data, accessors, ranges, domains, scale kind, and `nice`, while retaining `useCartesianScales` as the context-reading wrapper. Do not expose D3 scale types through high-level chart props.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/scales.test.ts` → all existing scale tests pass.

### Step 3: Remove internal `nice` divergence

Update line, scatter, area, low-level bar, stacked area, and high-level bar rendering so their defaults follow the scale contract. Eliminate hardcoded `nice: true` calls unless the exact resolved niced domain is shared with axes, grid, reference lines, and interaction.

Update `resolveCartesianActivePoint` to use the same construction helper/options as rendered series. Preserve support for linear, time, point, and band-style categorical X inputs. Avoid changing public prop names or adding a broad new public scale API in this plan.

**Verify**: `rg -n "nice: true" packages/charts/src/series packages/charts/src/charts/bar-chart.tsx packages/charts/src/charts/cartesian-interaction.ts` → no unexplained hardcoded `nice: true` remains. Any remaining match must have a comment and a test proving every layer shares its resolved domain.

### Step 4: Make all alignment tests pass

Run the new tests and inspect actual numeric attributes if any remain red. Fix only scale construction or test setup; do not compensate by adding arbitrary pixel offsets to tooltip/crosshair code.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/scales.test.ts tests/scale-alignment.test.tsx` → all focused tests pass.

### Step 5: Run package quality gates

**Verify**:

```sh
pnpm --filter @kamod-ch/charts test
pnpm typecheck
pnpm lint
pnpm format:check
```

→ every command exits 0.

## Test plan

- New file: `packages/charts/tests/scale-alignment.test.tsx`.
- Required cases: non-round numeric X/Y domains, time domain if pure helper behavior changed, line marker/crosshair alignment, scatter marker/crosshair alignment, and one area/bar/reference alignment.
- Existing patterns: event setup from `tests/interactions.test.tsx`; high-level chart rendering from `tests/line-scatter.test.tsx`; pure scale assertions from `tests/scales.test.ts`.
- Tests must assert coordinates, not merely element existence.

## Done criteria

- [ ] No internally hardcoded `nice: true` can make a series use a different domain from its axis/reference/interaction layers.
- [ ] `tests/scale-alignment.test.tsx` exists with at least four coordinate-based regression cases.
- [ ] Active marker and crosshair coordinates match for line and scatter on a non-round domain.
- [ ] `pnpm --filter @kamod-ch/charts test` exits 0.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm format:check` exit 0.
- [ ] No dependency, docs, lockfile, or `dist/` file is modified.
- [ ] `plans/README.md` status row is updated.

## STOP conditions

Stop and report if:

- The uncommitted `cartesian-interaction.ts` or tooltip-related source no longer matches the excerpts.
- Correct alignment appears to require changing public chart prop semantics rather than internal scale construction.
- Existing consumers/tests demonstrably rely on series being niced while axes are not.
- A fix requires pixel-offset compensation rather than a shared scale/domain rule.
- Any verification command fails twice after a reasonable correction.

## Maintenance notes

- Future `nice`, explicit-domain, zoom, and synchronized-chart features must resolve one domain and share it across all layers.
- Reviewers should specifically compare series, axis, reference-line, and active-point scale options.
- Plan 002 assumes this coordinate contract is stable; do not begin nearest-point work first.
