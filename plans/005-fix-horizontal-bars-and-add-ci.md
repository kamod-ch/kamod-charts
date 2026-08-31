# Plan 005: Correct horizontal BarChart coordinates and enforce release gates in CI

> **Executor instructions**: Follow each step and verification gate. Stop on the listed conditions instead of improvising. Update the plan status in `plans/README.md` when complete unless a reviewer owns the index.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 85f905c..HEAD -- package.json pnpm-lock.yaml packages/charts/src/axes packages/charts/src/primitives/grid.tsx packages/charts/src/primitives/reference-line.tsx packages/charts/src/charts/bar-chart.tsx packages/charts/tests docs/release-checklist.md .github
> git diff -- package.json packages/charts/src/axes packages/charts/src/primitives/grid.tsx packages/charts/src/primitives/reference-line.tsx packages/charts/src/charts/bar-chart.tsx packages/charts/tests docs/release-checklist.md
> ```
>
> The plan was written against a dirty worktree. Preserve current package-script, docs, tooltip, and generated-file changes. Do not regenerate or normalize the lockfile merely to add CI.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-align-cartesian-scales.md`, `plans/004-add-area-bar-interaction-parity.md`
- **Category**: bug, dx, tests
- **Planned at**: commit `85f905c`, 2026-08-25

## Why this matters

Horizontal BarChart rotates its rectangle geometry but still renders a categorical X axis and numeric Y axis, so bars, ticks, grid, and reference lines describe different coordinates. Existing tests only assert that a horizontal bar exists, allowing the bug through. Separately, this release-candidate package documents strong local gates but has no CI workflow to enforce them. This plan corrects the orientation contract, adds semantic tests, and runs the existing release gates on every change without publishing anything.

## Current state

Relevant files:

- `packages/charts/src/charts/bar-chart.tsx` — horizontal rectangle geometry and currently orientation-agnostic axes/grid/references.
- `packages/charts/src/axes/x-axis.tsx`, `y-axis.tsx`, `axis-scale.ts` — declarative axis components; `useAxisScale` already supports band/point on either orientation internally.
- `packages/charts/src/primitives/grid.tsx` — public Y types are restricted to numeric/time despite internal scale support.
- `packages/charts/src/primitives/reference-line.tsx` — selects an X or Y scale independently.
- `packages/charts/tests/area-bar.test.tsx` — current horizontal test checks only element existence.
- `package.json` — has `check`, `test:exports`, `size:report`, and docs scripts.
- `docs/release-checklist.md` — requires checks before publication.
- `.github/workflows/` — absent.

Current mismatch:

```tsx
// packages/charts/src/charts/bar-chart.tsx:81-95
{showGrid ? <Grid xKey={xKey} xScale={xScale} yDomain={yDomain} /> : null}
<XAxis dataKey={xKey} scale={xScale} />
<YAxis domain={yDomain} />
<Bars
  // ...
  horizontal={isHorizontal}
/>
```

```ts
// packages/charts/src/charts/bar-chart.tsx:143-159
const categoryScale = createBandScale({
  domain,
  range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
});
const valueScale = createLinearScale({
  domain: yDomain,
  range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
});
```

Weak existing test:

```ts
// packages/charts/tests/area-bar.test.tsx:87-102
const stackedHorizontal = renderToString(<BarChart orientation="horizontal" ... />);
expect(stackedHorizontal).toContain("data-kamod-chart-bar");
```

Existing gate:

```json
// package.json:25
"check": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && node scripts/test-package-exports.mjs"
```

## Commands you will need

| Purpose          | Command                                                                                               | Expected on success |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------- |
| Focused tests    | `pnpm --filter @kamod-ch/charts exec vitest run tests/area-bar.test.tsx tests/axes-grid-ssr.test.tsx` | exit 0              |
| Types/tests      | `pnpm typecheck && pnpm test`                                                                         | exit 0              |
| Lint/format      | `pnpm lint && pnpm format:check`                                                                      | exit 0              |
| Docs check       | `pnpm --filter @kamod-ch/charts-docs typecheck`                                                       | exit 0              |
| CI syntax sanity | `node -e "import('node:fs').then(fs=>console.log(fs.existsSync('.github/workflows/ci.yml')))"`        | prints `true`       |

Full build/export/size gates modify tracked `packages/charts/dist/**` and `docs/bundle-size.md`. Run them only after the operator approves generated-file updates or in a clean disposable CI checkout.

## Scope

**In scope**:

- `packages/charts/src/axes/y-axis.tsx`
- `packages/charts/src/axes/axis-scale.ts` only if needed for public type alignment
- `packages/charts/src/primitives/grid.tsx`
- `packages/charts/src/primitives/reference-line.tsx`
- `packages/charts/src/charts/bar-chart.tsx`
- `packages/charts/src/charts/types.ts` only for reference-line orientation semantics
- `packages/charts/tests/area-bar.test.tsx`
- `packages/charts/tests/axes-grid-ssr.test.tsx`
- `packages/docs/charts/bar.mdx`
- `package.json` only if a non-mutating CI/check script is needed
- `docs/release-checklist.md`
- `.github/workflows/ci.yml` (create)

**Out of scope**:

- Tooltip positioning/API and bar geometry/hit-testing from Plans 003/004.
- Redesigning vertical BarChart.
- Publishing, NPM tokens, release automation, GitHub releases, or write permissions.
- Committing generated `dist/`, docs build output, or lockfile churn.
- Adding a visual-test framework or browser dependency; recommend separately after CI baseline.

## Git workflow

- Preserve the existing dirty worktree. Do not reset or regenerate the lockfile.
- Suggested branch after preservation: `advisor/005-fix-horizontal-bars-and-add-ci`.
- If commits are requested, use two logical commits: `fix: align horizontal bar axes` and `ci: enforce chart quality gates`.
- Never publish, push, or open a PR without explicit operator instruction.

## Steps

### Step 1: Add semantic horizontal-axis tests

Strengthen `area-bar.test.tsx` before production changes. For a horizontal BarChart with categories `Jan/Feb/Mar` and numeric values:

- Assert the X axis is linear/numeric: its tick labels are numeric and positions span plot width.
- Assert the Y axis contains category labels and positions span plot height.
- Assert a known bar endpoint aligns with the numeric X scale.
- Assert category center aligns with the corresponding Y tick/scale position.
- Add negative and stacked values.
- Assert vertical orientation remains unchanged.

Add or extend `axes-grid-ssr.test.tsx` to prove `YAxis` can render a band/point categorical domain after its public types are broadened.

Do not rely only on serialized string presence; parse transforms/coordinates and use `toBeCloseTo`.

**Verify**: focused tests fail under the old horizontal-axis implementation while existing vertical tests still pass.

### Step 2: Make YAxis and Grid types match internal scale capabilities

`useAxisScale` already handles `band` and `point` regardless of orientation. Broaden `YAxisProps` and `GridProps` narrowly so Y can accept categorical accessors, `ScaleKind`, and string domains. Keep existing numeric/time calls source-compatible.

Avoid duplicating XAxis implementation. If shared domain/accessor aliases improve safety, add them in an existing core/scales type module without exposing raw D3 scale types.

Ensure TypeScript can infer a string category accessor without casts at BarChart call sites.

**Verify**: `pnpm typecheck` and categorical YAxis tests pass.

### Step 3: Render orientation-correct axes and grid

In `BarChart`, branch declaratively by orientation:

- Vertical: keep categorical/band X and numeric Y.
- Horizontal: render numeric/linear X with `domain={yDomain}` and categorical/band Y using `xKey` and the category domain.
- Vertical grid lines for horizontal charts must come from the numeric X scale.
- Horizontal grid lines, if shown, must come from category positions or be disabled deliberately and documented; they must not come from a numeric Y scale.

Keep the scale/domain contract from Plan 001. Do not reintroduce `nice` divergence between bars and axes.

**Verify**: focused horizontal and vertical coordinate tests pass.

### Step 4: Align reference-line semantics

Preserve coordinate semantics rather than data-role semantics:

- `referenceLine.x` denotes a value on the horizontal axis and renders a vertical line.
- `referenceLine.y` denotes a value on the vertical axis and renders a horizontal line.

For horizontal BarChart, numeric thresholds therefore use `x` with the numeric value domain. If category-aligned `y` references are supported, broaden `CartesianReferenceLine.y`/`ReferenceLineProps.y` to string safely and test it; otherwise document the supported subset and do not silently map numeric `y` thresholds to the category axis.

Update `packages/docs/charts/bar.mdx` with one horizontal example and clear reference-line semantics.

**Verify**: tests assert a horizontal numeric threshold's line X coordinate equals the numeric axis position; docs typecheck exits 0.

### Step 5: Add a read-only GitHub Actions CI workflow

Create `.github/workflows/ci.yml` with:

- triggers for `push` and `pull_request`,
- `permissions: contents: read`,
- Ubuntu runner and maintained Node 20 setup,
- pnpm version derived from `packageManager` (`pnpm@11.17.0`) or Corepack,
- dependency caching through the Node/pnpm setup,
- `pnpm install --frozen-lockfile`,
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`,
- `pnpm build` followed by `node scripts/test-package-exports.mjs`,
- `pnpm docs:build`,
- bundle report generation in the disposable checkout.

For the generated bundle report, either compare `docs/bundle-size.md` with the committed expected report via `git diff --exit-code -- docs/bundle-size.md`, or explicitly upload/report it without committing. Choose one documented behavior. Do not put secrets into CI and do not add publishing steps.

If build output is intentionally committed, add a CI assertion for generated drift only after confirming deterministic chunk filenames in a clean checkout. Otherwise do not fail CI on `packages/charts/dist/**` hash churn.

**Verify**: inspect workflow syntax and run every listed shell command locally only if generated-file mutation is approved; otherwise execute them in a temporary clean worktree or leave full execution to CI and report that constraint.

### Step 6: Reconcile release documentation

Update `docs/release-checklist.md` to list CI success as a required gate while retaining explicit maintainer publication approval and NPM-auth handling. If `package.json` gains a `ci` script, compose existing commands rather than duplicating divergent command strings.

Do not weaken the current quality gates to make CI faster.

**Verify**: `rg -n "CI|pnpm check|test:exports|size:report" docs/release-checklist.md package.json .github/workflows/ci.yml` → all required gates are represented.

### Step 7: Run non-mutating quality gates and inspect scope

**Verify**:

```sh
pnpm --filter @kamod-ch/charts exec vitest run tests/area-bar.test.tsx tests/axes-grid-ssr.test.tsx
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
git status --short
```

→ commands exit 0; status shows only pre-existing changes plus this plan's in-scope files.

## Test plan

- `area-bar.test.tsx`: numeric horizontal X ticks, category Y ticks, bar/axis alignment, vertical regression, stacked positive/negative, and reference threshold.
- `axes-grid-ssr.test.tsx`: categorical YAxis and orientation-correct Grid SSR.
- Do not add snapshots as the only evidence.
- CI itself verifies workspace typecheck, lint, format, tests, package build/exports, docs build, and bundle reporting.

## Done criteria

- [ ] Horizontal BarChart uses numeric X and categorical Y axes matching bar geometry.
- [ ] Grid and reference lines use the same orientation-specific scale/domain.
- [ ] Vertical BarChart behavior remains covered and unchanged.
- [ ] YAxis/Grid public types support required categorical Y usage without D3 types.
- [ ] `.github/workflows/ci.yml` exists with read-only permissions and no publishing/secrets.
- [ ] CI includes frozen install, typecheck, lint, format, tests, build/export, docs build, and bundle report handling.
- [ ] Release checklist requires successful CI and explicit maintainer publication approval.
- [ ] Non-mutating local gates pass.
- [ ] No unintended lockfile or generated-output changes are introduced.
- [ ] `plans/README.md` status is updated.

## STOP conditions

Stop and report if:

- Plan 004's extracted bar geometry is absent or differs from rendered geometry.
- Orientation correctness requires changing established `referenceLine.x/y` coordinate semantics.
- The docs package cannot build on Node 20 despite the repository claiming Node `>=20`; report compatibility rather than silently changing the runtime baseline.
- Deterministic generated-output checks cannot be made reliable because tsup chunk hashes vary in clean identical builds.
- Adding CI requires credentials, write permissions, publishing, or repository settings unavailable in code.
- A verification fails twice.

## Maintenance notes

- Reviewers should inspect horizontal negative bars and category tick centering visually in a real browser.
- If CI runtime becomes high, add caching or job parallelism later; do not remove gates first.
- Browser tooltip/visual regression tests remain a recommended follow-up after this CI baseline, not part of this plan.
