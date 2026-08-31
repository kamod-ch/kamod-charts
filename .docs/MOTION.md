# Motion integration contract

Status: Phase 1 complete. This document is the implementation contract for
optional data animations in `@kamod-ch/charts`. It was written before the
`./motion` adapter and before any chart markup behavior changed.

Source of truth for the animation engine is the packed public API of
`@kamod-ch/motion` (`0.1.0`), not its source tree and not `motion/react`.

## Inventory

| Surface      | Current rendering                                                                                                                | Stable identity today                                                      | Animate?                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Line         | One `<path d>` plus optional `<circle>` per defined point. React keys on `point.index`.                                          | Series: `id` or string/number `key`. Points: domain `x` value.             | Yes — path reveal on first enter; geometric path/point transition on update. |
| Area         | One filled `<path d>` per series. Stacked area is one path per stack layer.                                                      | Same as line. Stacked layer key is series id.                              | Yes — same policy as line, including stacked layers.                         |
| Bar          | High-level `BarChart` draws marks from `resolveBarGeometry`. Composable `BarSeries` draws its own paths and keys on array index. | Series: `getSeriesId`. Bar: `seriesId + category` (`x` domain / band key). | Yes — enter/update/exit against the value baseline (`0` or stack `y0`).      |
| Pie / Donut  | `d3-shape` arcs. Slice keys on `segment.data.index`. Labels are `<text>`.                                                        | Slice: `labelKey` value, uniquified if duplicated.                         | Yes — `startAngle` / `endAngle` / `innerRadius` / `outerRadius`.             |
| Scatter      | `<circle>` per defined point, keyed on `point.index`.                                                                            | Series id + domain `x` (and `y` when `x` collides).                        | Yes — `cx` / `cy` / `r` / `opacity`.                                         |
| Axes         | Preact-rendered ticks and labels.                                                                                                | Tick domain values.                                                        | No — tick motion harms reading during updates.                               |
| Grid         | Static lines from the same scales as axes.                                                                                       | Line domain values.                                                        | No — decorative; skip.                                                       |
| Tooltip      | HTML overlay, `aria-hidden`. Position from the active datum.                                                                     | Active `index` + `seriesId`.                                               | Position stays instant. Displayed numbers may tween.                         |
| Legend       | HTML toggles.                                                                                                                    | Series id.                                                                 | No — interaction chrome, not data geometry.                                  |
| Live region  | Polite `aria-live` of the active datum.                                                                                          | Same as tooltip.                                                           | No interpolated announcements. Final values only.                            |
| Value labels | Optional bar labels; pie slice labels; tooltip rows.                                                                             | Same as the parent mark.                                                   | Yes — `@kamod-ch/motion/value` for displayed numbers only.                   |

## Stable keys

Animations and list reconciliation must not use the array index when a domain
key exists.

| Kind            | Key                                                       | Fallback                                                      |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| Series          | `series.id` or string/number `series.key` (`getSeriesId`) | `series-${index}` for function accessors without `id`         |
| Cartesian point | `${seriesId}::${domainKey(xValue)}`                       | `::index:${index}` when `x` is null/invalid                   |
| Bar             | `${seriesId}::${category}`                                | category already falls back to `String(index)`                |
| Pie slice       | `domainKey(label)`                                        | `slice-${index}`                                              |
| Scatter         | `${seriesId}::${domainKey(x)}`                            | append `::${domainKey(y)}` or `::index:${index}` on collision |

`domainKey` serializes dates as ISO, finite numbers as `n:${value}`, and
non-empty strings as `s:${value}`. Duplicate keys in one series are uniquified
with `#${occurrence}` so React keys stay stable for a given row identity, not
for a shifting index.

## Enter / update / exit

### Line and area

- **Enter (first paint of a series path after hydration):** keep the final `d`
  in Preact markup. Reveal with SVG `pathLength` `0 → 1`. Do not replay this
  reveal on later data updates.
- **Update:** interpolate matched points by domain key in pixel space, then
  rebuild `d` from the interpolated points. New points appear at their target
  coordinates (opacity/radius enter). Removed points fade out. This is a
  geometric transition, not a second full-path reveal.
- **Exit (series or stacked layer removed):** fade opacity to `0`, then unmount.
- **Points:** enter `opacity 0 → 1` and `r 0 → target`; update `cx`/`cy`/`r`;
  exit `opacity → 0`.

### Bar

- **Enter:** grow from the value baseline. Vertical: `height → 0` at the zero
  (or stack `y0`) line. Horizontal: `width → 0` at that baseline. Negative
  values grow away from zero, not from the chart edge.
- **Update:** interpolate `x`, `y`, `width`, `height` from the previous
  displayed geometry.
- **Exit:** shrink back to the same baseline, then unmount.

### Pie / donut

- **Enter:** collapse to the mid-angle (`startAngle = endAngle = mid`) and
  `outerRadius` from `0` (inner radius stays at the donut hole).
- **Update:** interpolate `startAngle`, `endAngle`, `innerRadius`, `outerRadius`
  for slices matched by label key. Rebuild the arc path from those values.
- **Exit:** collapse angles to mid and radius to `0`, then unmount.
- Sort order may change slice position; identity follows the label key, not the
  visual neighbor.

### Scatter

- **Enter:** `opacity 0 → 1`, `r 0 → target` at the target position.
- **Update:** `cx`, `cy`, `r`.
- **Exit:** `opacity → 0`.

### Tooltip, axes, grid, legend

- Axes, grid, legend, and tooltip placement do not animate.
- Tooltip and bar/pie numeric labels may tween through `animateNumber`.
- The live region always announces the committed datum value, never in-between
  frames.

## Engine mapping

Use only packed `@kamod-ch/motion` subpaths. Do not import `Motion`,
`Presence`, `@kamod-ch/motion/motion`, `@kamod-ch/motion/presence`,
`@kamod-ch/motion/hybrid`, or `motion/react`.

| Need                            | Engine               | Import                                                      |
| ------------------------------- | -------------------- | ----------------------------------------------------------- |
| Path reveal (`pathLength`)      | SVG / mini           | `@kamod-ch/motion/svg` → `animateSvg` / `useAnimateSvg`     |
| Scatter `cx`/`cy`/`r`/`opacity` | SVG / mini           | `@kamod-ch/motion/svg`                                      |
| Bar/pie/line geometry clocks    | Value                | `@kamod-ch/motion/value` → `animateNumber`                  |
| Tooltip / label numbers         | Value                | `@kamod-ch/motion/value` → `useAnimateNumber`               |
| Reduced motion policy           | Hook                 | `@kamod-ch/motion/hooks/use-reduced-motion`                 |
| Path `d` morph                  | Not in SVG keyframes | Drive `t` with Value, interpolate points, set `d` in Preact |
| Hybrid (`motion` full engine)   | Not used             | Would pull the hybrid runtime for no extra capability       |

`SvgKeyframes` has no `d`, `width`, or `height`. Geometry transitions therefore
stay on the Value clock plus the existing `d3-shape` / `d3-interpolate` helpers
in `@kamod-ch/charts/animation`. Mini/SVG is reserved for attributes the packed
SVG API actually accepts.

## Export architecture

**Decision: optional `./motion` subpath inside `@kamod-ch/charts`.**

Reasons:

- The package already ships focused subpaths (`./line`, `./animation`,
  `./accessibility`). A sibling `./motion` matches that pattern.
- A separate adapter package would duplicate versioning and docs for a thin
  wrapper around the same chart components.
- The static baseline must not load Motion. Root `@kamod-ch/charts` and
  `@kamod-ch/charts/line` (and the other chart entries) stay free of
  `@kamod-ch/motion` and `motion`.
- `@kamod-ch/charts/animation` remains the motion-free helper surface
  (`interpolateValue`, `shouldAnimate`, local `prefersReducedMotion`).

`@kamod-ch/motion` and `motion` are optional peer dependencies. They are
required only when the application imports `@kamod-ch/charts/motion`.

Static high-level charts accept `animate` in their public types. Without a
`MotionConfig` (or a `./motion` chart wrapper that provides one) the prop is a
no-op. That keeps one prop name across the library without shipping the
runtime in the static graph.

## Public API

```ts
type ReducedMotionPolicy = "user" | "always" | "never";
type ChartMotionEasing = "easeOut" | "easeInOut" | "linear";
type ChartMotionPreset = "default";

interface ChartAnimateOptions {
  enabled?: boolean;
  duration?: number; // seconds, Motion convention
  easing?: ChartMotionEasing;
  preset?: ChartMotionPreset;
  reducedMotion?: ReducedMotionPolicy;
}

type ChartAnimate = boolean | ChartAnimateOptions;
```

- `animate` / `MotionConfig` are the only public knobs. There is no passthrough
  of `KamodTransition`, `SvgKeyframes`, or other Motion types.
- Defaults when motion is active: `enabled: true`, `duration: 0.35`,
  `easing: "easeOut"`, `preset: "default"`, `reducedMotion: "user"`.
- Disable with `animate={false}` or `animate={{ enabled: false }}`.
- `reducedMotion: "user"` follows `prefers-reduced-motion` after mount.
  `"always"` skips animation. `"never"` animates even if the user prefers
  reduce.
- `preset` is reserved for a single shared default. Additional presets are not
  exposed until more than one chart type needs a distinct named curve.

`MotionConfig` supplies defaults for descendant charts and installs the
animated series slots. Charts exported from `@kamod-ch/charts/motion` wrap
themselves in `MotionConfig` so `animate` defaults to on.

`AnimatedValue` is exported from `./motion` for labels and custom tooltips. It
tweens the displayed number; callers must keep `aria-live` / `LiveRegion` on
the committed value.

## Runtime rules

1. **SSR** renders the final geometry in the Preact markup (`d`, `cx`, `cy`,
   arc path, bar path). No browser APIs.
2. **Hydration** uses that same markup. Animation starts in `useLayoutEffect`
   after hydrate, so the first client VDOM matches SSR.
3. **Reduced motion** leaves the final geometry in place and skips clocks,
   path reveal, and number tweens.
4. **Decorative-only changes** (grid, axes, legend, tooltip placement, hover
   emphasis) do not animate.
5. **Interaction stays on data, not display.** Hit-testing, keyboard index,
   tooltip anchor, and live-region text use the committed dataset and scales,
   never interpolated frames.
6. **Replacement:** a new data or layout target stops the in-flight clock and
   retargets from the current displayed geometry. Unmount stops all controls.
7. **Resize during animation** is a layout retarget, not a path reveal.
8. **No React, no `motion/react`, no Motion / Presence components.**

## Performance

- Datasets above ~500 points already suppress line markers (`showPoints: "auto"`).
  Motion keeps that rule and does not animate hidden markers.
- Large path updates use one Value clock per series, not one WAAPI per point,
  except scatter / bar / pie marks that already exist as discrete elements.
- Applications that stream high-frequency data should set `animate={false}` or
  downsample first (`@kamod-ch/charts/performance`).

## Measured bundle impact

From `pnpm size:report` after this change (`docs/bundle-size.md`):

| Entry                     |   Bytes | Motion runtime                                                                              |
| ------------------------- | ------: | ------------------------------------------------------------------------------------------- |
| `@kamod-ch/charts/line`   |     406 | no — static source graph has zero `@kamod-ch/motion` imports                                |
| `@kamod-ch/charts/motion` |  34 401 | yes — imports `@kamod-ch/motion/svg`, `/value`, and `hooks/use-reduced-motion` as externals |
| Package JS/CSS total      | 158 123 | includes the optional motion entry and shared static chunks                                 |

The static line/area/bar/pie/scatter files only import the motion-free slots
context. `@kamod-ch/motion` stays an optional peer.

## Tests required

- Initial render equals the static final geometry.
- Data update: enter / update / exit by stable keys, not index.
- Rapid successive updates replace the running clock.
- Unmount stops timers / WAAPI without updates after unmount.
- SSR string equals first client render; no hydration markup drift.
- `reducedMotion: "always"` and `prefers-reduced-motion: reduce` show the
  final state.
- Keyboard and tooltip still track the committed datum; live region is not
  flooded with tween frames.
- Empty, single-point, negative, and mixed/null series.
- Plot resize while a clock is running retargets to the new layout.
- Static entry (`@kamod-ch/charts/line` and root) bundle must not contain
  `@kamod-ch/motion` or `motion/mini`.
