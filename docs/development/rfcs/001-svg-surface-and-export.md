# RFC 001: SVG surface, layers, and export

Status: **Accepted** (design for prompts 01–07)  
Date: 2026-10-20  
Baseline commit: `e55c296`

## Summary

Extend Kamod Charts with additive, typed control of the root `<svg>`, an explicit internal layer order with optional plot clipping, tree-shakeable SVG serialization/download, custom mark render slots, deterministic axis label overflow handling, and optional aspect-ratio-based responsive height—without new runtime dependencies in the static chart core.

## Goals

- Controlled access to the rendered `<svg>` via `svgRef` and `svgProps`.
- Stable per-instance IDs for `defs`, `clipPath`, gradients, and `url(#id)` references (SSR + hydration).
- Opt-in plot clipping that does not clip axes, outside labels, or tooltips.
- Standalone SVG export via `@kamod-ch/charts/export`, isolated from Motion.
- API parity across Cartesian, Pie/Donut, and Motion wrappers where semantically valid.

## Non-goals (this RFC)

- PDF/Office export, headless browser rendering, foreignObject-based marks.
- DOM measurement (`getBBox`, canvas) on SSR or initial render for tick layout.
- Full zoom/pan product API (see optional RFC 002 / prompt 09).

---

## 1. `svgProps` and `svgRef`

### Decision

Introduce shared types on the chart surface path (`ChartSurface`, `ChartRoot`, high-level charts):

```ts
import type { JSX, Ref } from "preact";

/** User-controlled native SVG attributes and handlers (additive API). */
export type ChartSvgProps = {
  "aria-label"?: string;
  preserveAspectRatio?: string;
  focusable?: "true" | "false" | "auto";
  /** User data-* only; Kamod `data-kamod-*` remain internal. */
  [key: `data-${string}`]: string | number | boolean | undefined;
  onClick?: JSX.MouseEventHandler<SVGSVGElement>;
  onPointerDown?: JSX.PointerEventHandler<SVGSVGElement>;
  onFocus?: JSX.FocusEventHandler<SVGSVGElement>;
  onBlur?: JSX.FocusEventHandler<SVGSVGElement>;
};

export interface ChartSurfaceSvgOptions {
  /** Ref to the root chart `<svg>` (same element as `ChartSurface` renders). */
  svgRef?: Ref<SVGSVGElement>;
  /** Spread after Kamod-controlled attributes; cannot override protected keys. */
  svgProps?: ChartSvgProps;
}
```

`ChartSurfaceProps` extends `ChartSurfaceSvgOptions`. `ChartRootProps` and `CommonCartesianChartProps` / circular chart props extend the same options.

### Protected attributes (Kamod-owned, never user-overwritable)

Applied **after** `svgProps` spread (user values for these keys are ignored in development with a one-time `console.warn` in non-production builds; silently dropped in production):

| Attribute                                     | Reason                                    |
| --------------------------------------------- | ----------------------------------------- |
| `id`                                          | Chart instance + ID prefix for defs/clips |
| `width`, `height`, `viewBox`                  | Layout contract                           |
| `xmlns`                                       | Valid SVG document                        |
| `role`, `aria-labelledby`, `aria-describedby` | A11y wiring to `<title>` / `<desc>`       |
| `data-kamod-chart-surface`                    | Internal selector                         |

`title` / `description` chart props remain the supported way to set accessible name/description; users must not pass conflicting `aria-labelledby` via `svgProps` (not in `ChartSvgProps`).

### Event handler composition

For each event present on both Kamod and `svgProps` (`onKeyDown`, `onPointerMove`, `onPointerLeave`, plus user-only `onClick`, `onPointerDown`, `onFocus`, `onBlur`):

1. Invoke the **internal** handler first (chart interaction).
2. Invoke the **user** handler unless `event.defaultPrevented` is true after step 1.

User handlers run at most once. Internal handlers are not skipped when the user handler calls `preventDefault()` unless documented otherwise for a specific event (none initially).

### Open question

| Question                                                         | Recommendation                                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Allow `class`/`style` only on chart props vs also in `svgProps`? | Keep `class`/`style` on existing chart props only; do not duplicate in `svgProps`. |

---

## 2. Layer model and `clipPlotArea`

### Target DOM order (inside root `<svg>`)

1. `<defs>` — chart-local (gradients, clips, user `defs` slot)
2. Background / grid (if any)
3. **Clipped group** (only when `clipPlotArea === true`) — data series paths/areas/bars/scatter marks
4. **Unclipped plot content** — active marks, reference geometry that must extend past plot edge
5. Axes (ticks + labels)
6. Plot pointer capture rect (unchanged hit target semantics)
7. Annotations outside plot (if not in series)
8. HTML `overlay` sibling **outside** `<svg>` (unchanged)

Circular charts: no `clipPlotArea`; pie slices and outside labels stay unclipped.

### `clipPlotArea`

```ts
export interface ChartClippingOptions {
  /**
   * When true, clip data marks to the computed plotArea rect.
   * Default: false (backward compatible).
   */
  clipPlotArea?: boolean;
}
```

Clip ID: `${rootId}-plot-clip` using existing `rootId` from `useId()` / `id` prop.

```xml
<clipPath id="{rootId}-plot-clip">
  <rect x="{plotArea.x}" y="{plotArea.y}" width="{plotArea.width}" height="{plotArea.height}" />
</clipPath>
```

Clip rect uses **SVG root coordinates** (plotArea already includes margin offset in current layout).

### `defs` slot

```ts
export interface ChartDefsSlot {
  /** Rendered once under root `<defs>`, merged with internal defs (gradients, clips). */
  defs?: ComponentChildren;
}
```

User children are SSR-safe Preact nodes. Kamod renders internal defs first, then user `defs`, so user can reference Kamod-generated IDs in documentation examples.

### Open question

| Question                                                    | Recommendation                                                                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Migrate free-form `Chart` children to layers automatically? | No silent migration; document that low-level `Chart` children remain author-ordered; high-level charts own layer structure. |

---

## 3. Export module (`@kamod-ch/charts/export`)

### Entry point

New package export path (no new npm package):

```json
"./export": {
  "types": "./dist/export/index.d.ts",
  "import": "./dist/export/index.js"
}
```

### API

```ts
export interface SerializeChartSvgOptions {
  /** Embed matched CSS custom properties from computed styles. Default: "kamod-tokens". */
  embedStyles?: "none" | "kamod-tokens" | "all-computed";
  backgroundColor?: string; // default: transparent (omit rect)
  /** Extra inline styles on cloned root only. */
  inlineStyle?: Record<string, string>;
}

export function serializeChartSvg(
  svgElement: SVGSVGElement,
  options?: SerializeChartSvgOptions,
): string;

export interface DownloadChartSvgOptions extends SerializeChartSvgOptions {
  /** Revoke object URL delay ms after click. Default: 60_000 */
  revokeDelayMs?: number;
}

export function downloadChartSvg(
  svgElement: SVGSVGElement,
  filename: string,
  options?: DownloadChartSvgOptions,
): void;
```

### SSR / browser boundary

- Module import must not touch `window`, `document`, `XMLSerializer`, `URL`, or `Blob`.
- `serializeChartSvg` uses `XMLSerializer` when called; throws clear `Error` in non-browser environments.
- `downloadChartSvg` creates object URL, triggers download, schedules revoke.

### Clone rules

- Deep-clone `svgElement`; never mutate the live DOM.
- Preserve `xmlns`, `viewBox`, `width`, `height`, internal `defs`, `clipPath`, gradients, and `url(#id)` references (IDs unchanged).
- Fonts, external images, and linked stylesheets: document limitations (CSP, CORS); export may be incomplete without inlined resources.

### CSS variables

Default `embedStyles: "kamod-tokens"` copies `--kamod-*` (and documented theme tokens) from `getComputedStyle` on the SVG root and ancestors up to `document.documentElement`, inlined on the clone. `"all-computed"` is opt-in for advanced users.

---

## 4. Render slots (marks and labels)

```ts
export interface PointRenderContext<TDatum> {
  datum: TDatum;
  index: number;
  seriesId: string;
  seriesLabel?: string;
  value: number | null;
  x: number;
  y: number;
  color: string;
  opacity: number;
  active: boolean;
  hidden: boolean;
}

export type RenderPoint<TDatum> = (context: PointRenderContext<TDatum>) => ComponentChildren;

export interface BarRenderContext<TDatum> extends BarDatumContext<TDatum> {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

export type RenderBar<TDatum> = (context: BarRenderContext<TDatum>) => ComponentChildren;
```

Defaults reproduce current geometry. Custom marks must not break keyboard focus or tooltip anchoring: hit testing continues to use the existing invisible capture geometry unless the custom mark includes an equivalent interactive target (document limitation for arbitrary paths).

Motion: same slot types; if a motion slot cannot honor a custom mark, motion chart docs state the restriction explicitly.

---

## 5. Axis tick collision

```ts
export type TickCollisionStrategy = "none" | "hide" | "rotate" | "truncate";

export interface TickCollisionOptions {
  tickCollision?: TickCollisionStrategy;
  /** Max characters for truncate; SSR-safe heuristic (no DOM measure). */
  maxTickLabelLength?: number;
  /** Optional max width in px for truncate (character-width estimate). */
  maxTickLabelWidth?: number;
}
```

Default: `none` (current behavior). `tickRotation` remains supported and combines with `rotate` strategy when both set (explicit rotation wins).

Truncated ticks: visible text shortened; full label in `<title>` on tick text (one per tick, not duplicated aria-live).

---

## 6. Aspect ratio and responsive height

```ts
export interface ChartAspectRatioOptions {
  /**
   * width / height. Used when responsive width is set and height is omitted.
   * Mutually exclusive with explicit numeric `height` on responsive charts.
   */
  aspectRatio?: number;
}
```

Priority (responsive mode):

1. Explicit `width` + `height` → fixed size (unchanged).
2. `responsive` + `height` → current behavior (width from observer).
3. `responsive` + `aspectRatio` → height = width / aspectRatio (clamped).
4. `preserveAspectRatio` via `svgProps` affects **presentation** only; internal layout still uses computed width/height.

SSR: `initialWidth` + derived height from `aspectRatio` when applicable.

---

## 7. Surface API parity matrix (target after prompt 07)

| Capability           | Cartesian HL | Pie/Donut              | Motion wrappers |
| -------------------- | ------------ | ---------------------- | --------------- |
| `class`, `style`     | yes          | **add**                | same types      |
| `svgProps`, `svgRef` | yes          | yes                    | yes             |
| `defs`               | yes          | yes (patterns/markers) | yes             |
| `clipPlotArea`       | yes          | N/A (documented)       | cartesian only  |
| `aspectRatio`        | yes          | yes                    | yes             |
| Export via `svgRef`  | yes          | yes                    | yes             |

---

## 8. Optional raster export (prompt 08)

Separate subpath `@kamod-ch/charts/export/png` or functions in `export` gated by separate file:

```ts
export function renderChartToPngBlob(
  svgElement: SVGSVGElement,
  options?: PngExportOptions,
): Promise<Blob>;
```

Must call `serializeChartSvg` internally; no duplicate SVG logic.

---

## 9. Migration

- All new props optional; defaults preserve current rendering.
- `clipPlotArea` default `false`.
- No removal of existing props in 01–07.
- Type-only additions to Pie/Donut for `class`/`style`/`svgProps`/`svgRef` are additive.

---

## 10. Validation of prompt order 01–10

| Prompt | Blocked by current code? | Notes                               |
| ------ | ------------------------ | ----------------------------------- |
| 01     | No                       | Surface is the right seam           |
| 02     | No                       | Plot `g` exists; clip is additive   |
| 03     | No                       | No export yet                       |
| 04     | No                       | Series components are localized     |
| 05     | No                       | `XAxis`/`YAxis` own tick rendering  |
| 06     | No                       | `resolveChartSize` centralizes size |
| 07     | No                       | Motion re-exports chart components  |
| 08     | Yes (03, 07)             | Optional                            |
| 09     | Yes (02, 04, 07)         | Optional spike                      |
| 10     | Yes (01–07)              | Verification only                   |

---

## Appendix: reference locations

- `packages/core/src/core/chart-surface.tsx` — root SVG
- `packages/core/src/core/chart.tsx` — plot group + capture rect
- `packages/core/src/core/responsive-container.tsx` — width-only observer
- `packages/core/src/charts/types.ts` — high-level props
- `packages/core/src/series/area-series.tsx` — inline `<defs>` for gradients
- `packages/core/src/axes/x-axis.tsx` — `tickRotation`
