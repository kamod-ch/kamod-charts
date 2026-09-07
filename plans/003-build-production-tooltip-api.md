# Plan 003: Provide configurable, collision-safe, and accessible tooltips

> **Executor instructions**: Follow every step and verification gate. Do not improvise past a STOP condition. Update the status row in `plans/README.md` when complete unless a reviewer owns the index.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 85f905c..HEAD -- packages/core/src/core/types.ts packages/core/src/charts/types.ts packages/core/src/charts/cartesian-active-layers.tsx packages/core/src/primitives/tooltip.tsx packages/core/src/primitives/live-region.tsx packages/core/src/theme/tokens.css packages/core/tests
> git diff -- packages/core/src/core/types.ts packages/core/src/charts/types.ts packages/core/src/charts/cartesian-active-layers.tsx packages/core/src/primitives/tooltip.tsx packages/core/src/primitives/live-region.tsx packages/core/src/theme/tokens.css packages/core/tests
> ```
>
> The current tooltip files contain uncommitted work beyond `85f905c`. Preserve it and compare against the excerpts below.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/001-align-cartesian-scales.md`, `plans/002-correct-cartesian-hit-testing.md`
- **Category**: direction, tech-debt, bug, accessibility, tests
- **Planned at**: commit `85f905c`, 2026-08-25

## Why this matters

The current high-level API exposes only `tooltip?: boolean`, hardcodes raw number/date rendering, and places the overlay using chart-independent thresholds (`x > 280`, `y < 48`). Tooltips can overflow small charts, flip unnecessarily on large charts, and cannot meet application-specific formatting needs. The visible tooltip also has `role="status"` while a separate live region announces the same interaction, which can duplicate screen-reader output. This plan keeps `tooltip` boolean compatibility while adding a typed options API, deterministic collision handling, custom content/formatters, and one announcement path.

## Current state

Relevant files:

- `packages/core/src/charts/types.ts` — `CommonCartesianChartProps` currently declares only `tooltip?: boolean`.
- `packages/core/src/core/types.ts` — `ChartInteraction<TDatum>` carries datum, series, index, value, x/y, and optional label.
- `packages/core/src/charts/cartesian-active-layers.tsx` — assembles series values and hardcodes tooltip markup/date formatting.
- `packages/core/src/primitives/tooltip.tsx` — visual HTML tooltip primitive with fixed thresholds and inline styles.
- `packages/core/src/primitives/live-region.tsx` — separate polite live region.
- `packages/core/src/core/responsive-container.tsx` — establishes the positioned container; follow its guarded browser-API convention.

Current public limitation:

```ts
// packages/core/src/charts/types.ts:21-35
export interface CommonCartesianChartProps<TDatum> {
  // ...
  showLegend?: boolean;
  tooltip?: boolean;
}
```

Current placement:

```ts
// packages/core/src/primitives/tooltip.tsx:25-42
const preferBelow = interaction.y < 48;
const preferLeft = interaction.x > 280;
// left/top are interaction coordinates; transform uses the two booleans
```

Current fixed content:

```tsx
// packages/core/src/charts/cartesian-active-layers.tsx:139-145
<span>
  {series.label}: {series.value ?? "–"}
</span>
// single series: `${entry.label ?? entry.seriesId}: ${entry.value ?? "–"}`
```

Duplicate announcement paths:

```tsx
// packages/core/src/primitives/tooltip.tsx:29-31
<div data-kamod-chart-tooltip="" role="status">
```

```tsx
// packages/core/src/primitives/live-region.tsx:9-12
<div data-kamod-chart-live-region="" aria-live="polite" aria-atomic="true">
```

## Commands you will need

| Purpose       | Command                                                                                             | Expected on success              |
| ------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| Tooltip tests | `pnpm --filter @kamod-ch/charts exec vitest run tests/tooltip.test.tsx tests/interactions.test.tsx` | exit 0                           |
| Package tests | `pnpm --filter @kamod-ch/charts test`                                                               | exit 0                           |
| Typecheck     | `pnpm typecheck`                                                                                    | exit 0, including docs consumers |
| Lint/format   | `pnpm lint && pnpm format:check`                                                                    | exit 0                           |

## Scope

**In scope**:

- `packages/core/src/core/types.ts`
- `packages/core/src/charts/types.ts`
- `packages/core/src/charts/cartesian-active-layers.tsx`
- `packages/core/src/charts/line-chart.tsx`
- `packages/core/src/charts/scatter-chart.tsx`
- `packages/core/src/primitives/tooltip.tsx`
- `packages/core/src/primitives/live-region.tsx`
- `packages/core/src/primitives/index.ts`
- `packages/core/src/theme/tokens.css`
- `packages/core/tests/tooltip.test.tsx` (create)
- `packages/core/tests/interactions.test.tsx`

**Out of scope**:

- Area/Bar integration (Plan 004).
- Portal rendering outside the chart container, Floating UI, Popper, or any new runtime dependency.
- Hit-testing algorithms and scale behavior from Plans 001/002.
- Animated tooltip transitions.
- Documentation site edits; Plan 004 updates chart examples after all chart integrations exist.
- `dist/` and lockfiles.

## Git workflow

- Preserve existing dirty and untracked files. Never reset or clean them.
- Suggested branch after operator preservation: `advisor/003-build-production-tooltip-api`.
- Suggested commit if requested: `feat: add configurable chart tooltips`.
- Do not push or open a PR without instruction.

## Steps

### Step 1: Define framework-native public tooltip types

In `packages/core/src/charts/types.ts`, introduce exported generic types with no D3 types:

- `CartesianTooltipMode = "axis" | "nearest"`.
- `TooltipPlacement = "auto" | "top" | "right" | "bottom" | "left"`.
- A public series-value row containing `id`, `label`, optional color, numeric/null value, and the original series config if useful without exposing internals.
- `CartesianTooltipContext<TDatum>` containing the active datum/index, X raw value and display label, active series ID, all visible series values, and anchor coordinates.
- `CartesianTooltipOptions<TDatum>` with optional `mode`, `placement`, `offset`, `render`, `formatValue`, and `formatLabel`.
- `tooltip?: boolean | CartesianTooltipOptions<TDatum>` on common cartesian props.

Use Preact's `ComponentChildren` for render/formatter output. Preserve `<LineChart tooltip />` and `<LineChart tooltip={true} />`. Default mode should be `axis` for LineChart and `nearest` for ScatterChart unless the caller overrides it.

If a formatter returns `null`/`undefined`, render the existing em dash fallback rather than the strings `null` or `undefined`.

**Verify**: `pnpm typecheck` → old boolean consumers and new typed option fixtures compile.

### Step 2: Extract pure placement calculation

In `primitives/tooltip.tsx`, add/export a pure calculation helper or place it in a sibling file if clearer. Inputs must include:

- anchor X/Y in container CSS pixels,
- tooltip width/height,
- boundary width/height,
- requested placement,
- offset and a small boundary padding.

Output must include a concrete placement and clamped left/top coordinates. For `auto`, evaluate top/right/bottom/left, prefer a fully fitting candidate, and otherwise choose/clamp the candidate with least overflow. Do not use fixed chart thresholds.

Add unit cases for every placement, a 320px container with a wide tooltip, all four edges/corners, and a tooltip larger than the boundary.

**Verify**: `pnpm --filter @kamod-ch/charts exec vitest run tests/tooltip.test.tsx` → pure placement cases pass.

### Step 3: Measure safely and render with collision handling

Update `Tooltip` to measure its own element and its nearest `[data-kamod-chart-container]` boundary after mount. Use Preact refs/effects and guarded browser APIs; SSR must still return stable markup without reading `window` or `document` during render.

Important coordinate rule: `ChartInteraction.x/y` are SVG viewBox coordinates. Convert them to container CSS pixels when the rendered SVG size differs from its viewBox. Recalculate after interaction changes and container resize. Reuse `ResizeObserver` only behind the same guards as `responsive-container.tsx`; clean up observers and scheduled frames.

Avoid a visible first-frame jump where practical: initial fallback placement may use transform, then measured coordinates should take over. Keep `pointer-events: none` unless interactive tooltip content is explicitly designed in a later plan.

Move stable visual declarations to `theme/tokens.css` where possible while retaining CSS-variable theming. Do not require application-specific classes.

**Verify**: tooltip tests mock element/container rectangles and assert computed style remains inside each boundary edge.

### Step 4: Wire formatters and custom rendering

Refactor `cartesian-active-layers.tsx` so it creates one `CartesianTooltipContext<TDatum>` and passes it to either the caller's `render` callback or the default renderer.

Default behavior:

- Preserve series color markers.
- Show the formatted X label once.
- Show every visible series in axis mode.
- Show only the selected point/series in nearest mode unless the options explicitly choose axis mode.
- Use `formatValue` and `formatLabel` when provided.
- Fall back to locale-aware but deterministic-enough display (`Intl.NumberFormat`/`Intl.DateTimeFormat`) without hardcoding a project language. Do not construct formatters repeatedly inside every mapped row; cache/module-scope defaults where safe.

The standalone primitive's existing `children(interaction)` API must remain source-compatible. High-level custom rendering uses the richer context.

**Verify**: tests cover boolean compatibility, custom renderer output, number formatter, date/label formatter, multi-series axis mode, and nearest mode.

### Step 5: Keep exactly one screen-reader announcement path

The visual tooltip must not itself be a live region. Remove `role="status"` or mark the visual overlay `aria-hidden="true"` as appropriate. Keep `LiveRegion` as the sole polite, atomic announcement surface and feed it text derived from the same formatted tooltip context.

Do not hide focusable content inside an `aria-hidden` tooltip; this plan keeps tooltips non-interactive. Ensure pointer movement does not create two elements with live-region semantics.

**Verify**: an accessibility test queries the active chart and asserts exactly one element matches `[role="status"], [aria-live]`; expected count is 1.

### Step 6: Complete regression and quality checks

Ensure pointer leave/Escape still clears the tooltip; keyboard navigation still opens it; responsive resize updates coordinates; SSR emits no active tooltip before interaction; and no observer leaks remain after unmount.

**Verify**:

```sh
pnpm --filter @kamod-ch/charts test
pnpm typecheck
pnpm lint
pnpm format:check
```

→ all exit 0.

## Test plan

Create `packages/core/tests/tooltip.test.tsx` modeled on `interactions.test.tsx`, but mock realistic dimensions.

Required tests:

- Pure auto placement at top/right/bottom/left and each corner.
- Clamping in a 320px boundary and when tooltip is larger than boundary.
- SVG viewBox-to-CSS coordinate conversion.
- Boolean API backward compatibility.
- `render`, `formatValue`, and `formatLabel` callbacks receive the expected datum/context.
- Axis versus nearest content.
- Exactly one live region.
- Resize update and observer cleanup.
- SSR without unguarded browser APIs.

## Done criteria

- [ ] `tooltip` accepts `boolean | CartesianTooltipOptions<TDatum>` without breaking existing boolean calls.
- [ ] No hardcoded placement thresholds `interaction.x > 280` or `interaction.y < 48` remain.
- [ ] Tooltip coordinates stay within mocked container bounds at every edge.
- [ ] Custom renderer and label/value formatters are covered by tests.
- [ ] Exactly one live-region announcement surface exists while active.
- [ ] No new runtime dependency is added.
- [ ] Package tests, typecheck, lint, and format checks pass.
- [ ] No docs, lockfile, or `dist/` files are modified.
- [ ] `plans/README.md` status is updated.

## STOP conditions

Stop and report if:

- Plans 001/002 are incomplete or tooltip anchor coordinates are still unreliable.
- Collision safety cannot be achieved inside the chart container without portal behavior for a documented required use case.
- The richer tooltip context would expose D3-specific public types.
- Supporting interactive tooltip content becomes a requirement; that needs separate focus, dismissal, and ARIA design.
- Existing uncommitted tooltip code differs materially from the excerpts.
- A verification fails twice.

## Maintenance notes

- Reviewers should test narrow charts, browser zoom, externally CSS-scaled SVGs, RTL pages, and dark/high-contrast themes manually.
- Portal and interactive tooltip support are intentionally deferred.
- Area and Bar must consume this exact options/context API in Plan 004; do not create chart-specific formatter types later.
