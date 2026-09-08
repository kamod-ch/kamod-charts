import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";

export function BarApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="Typed BarChart props — no option objects and no React-only patterns."
      items={[
        {
          id: "series-color-vs-fill",
          label: "color vs fill",
          children: (
            <>
              <code class={apiNoteCode}>color</code> is the stable series token for legend and
              tooltip swatches. <code class={apiNoteCode}>fill</code> (string or accessor) paints
              individual bars and may vary per datum without changing legend semantics.
            </>
          ),
        },
        {
          id: "signed-accessibility",
          label: "Signed values",
          children: (
            <>
              Do not rely on bar color alone for positive versus negative meaning. Pair{" "}
              <code class={apiNoteCode}>fill</code> with{" "}
              <code class={apiNoteCode}>valueLabels</code>, tooltips, or explicit{" "}
              <code class={apiNoteCode}>description</code> text so the sign is readable without hue.
            </>
          ),
        },
        {
          id: "grouped-vs-stacked",
          label: "grouped vs stacked",
          children: (
            <>
              <code class={apiNoteCode}>grouped</code> (default) places series side-by-side within
              each category band. <code class={apiNoteCode}>stacked</code> builds cumulative
              segments; tooltips and labels still report raw series values, not stack totals.
            </>
          ),
        },
        {
          id: "max-bar-size",
          label: "maxBarSize",
          children: (
            <>
              Caps bar width on vertical charts and bar height on horizontal charts. Bars stay
              centered inside the category band; hit-testing and motion use the same limited
              geometry.
            </>
          ),
        },
        {
          id: "value-labels",
          label: "valueLabels",
          children: (
            <>
              <code class={apiNoteCode}>true</code> enables auto placement (outside for grouped,
              center/outside for stacks). Pass <code class={apiNoteCode}>BarValueLabelOptions</code>{" "}
              for <code class={apiNoteCode}>position</code>, <code class={apiNoteCode}>format</code>
              , and per-series overrides. On vertical charts, outside sits above positive bars; on
              horizontal charts, outside extends past the bar tip.
            </>
          ),
        },
        {
          id: "reference-areas",
          label: "referenceAreas",
          children: (
            <>
              Semantic <code class={apiNoteCode}>x1</code>/<code class={apiNoteCode}>x2</code>{" "}
              always refer to categories and <code class={apiNoteCode}>y1</code>/
              <code class={apiNoteCode}>y2</code> to values — BarChart maps them to the visible axes
              when <code class={apiNoteCode}>orientation="horizontal"</code>. Areas render behind
              grid and bars and do not affect domains or hit-testing.
            </>
          ),
        },
        {
          id: "bar-datum-context",
          label: "BarDatumContext",
          children: (
            <>
              Fill and label accessors receive <code class={apiNoteCode}>datum</code>,{" "}
              <code class={apiNoteCode}>value</code>, stack bounds, orientation, and an{" "}
              <code class={apiNoteCode}>active</code> flag when the bar is keyboard- or
              pointer-selected.
            </>
          ),
        },
        {
          id: "theme-tokens",
          label: "Theme tokens",
          children: (
            <>
              Prefer <code class={apiNoteCode}>var(--chart-1)</code> …{" "}
              <code class={apiNoteCode}>var(--chart-4)</code> and{" "}
              <code class={apiNoteCode}>var(--chart-reference-area)</code> so fills adapt in light
              and dark themes.
            </>
          ),
        },
      ]}
    />
  );
}
