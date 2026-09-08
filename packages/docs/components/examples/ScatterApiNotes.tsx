import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";

export function ScatterApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="ScatterChart sizing, categories, tooltips, and reference annotations."
      items={[
        {
          id: "point-radius",
          label: "pointRadius vs pointSize",
          children: (
            <>
              <code class={apiNoteCode}>pointRadius</code> sets a fixed marker radius in pixels when{" "}
              <code class={apiNoteCode}>sizeKey</code> is not used.{" "}
              <code class={apiNoteCode}>pointSize</code> is a legacy alias with identical behavior —
              prefer <code class={apiNoteCode}>pointRadius</code> in new code. Values are radii, not
              diameters.
            </>
          ),
        },
        {
          id: "size-key",
          label: "sizeKey & sizeScale",
          children: (
            <>
              <code class={apiNoteCode}>sizeKey</code> maps a numeric field to pixel radius through{" "}
              <code class={apiNoteCode}>pointRadiusRange</code> (default{" "}
              <code class={apiNoteCode}>[4, 18]</code>). <code class={apiNoteCode}>sizeScale</code>{" "}
              defaults to <code class={apiNoteCode}>"sqrt"</code> so bubble area grows with the data
              value — a perceptually fair default for counts and volumes. Use{" "}
              <code class={apiNoteCode}>"linear"</code> when radius itself should track the value.
              Override the domain with <code class={apiNoteCode}>sizeDomain</code> when needed.
            </>
          ),
        },
        {
          id: "invalid-size",
          label: "Invalid size values",
          children: (
            <>
              Missing, negative, non-finite, or null size values are excluded from rendering and
              hit-testing. The point keeps a safe fallback radius internally but stays invisible
              when <code class={apiNoteCode}>sizeKey</code> is active.
            </>
          ),
        },
        {
          id: "categories",
          label: "categoryKey & categories",
          children: (
            <>
              With <code class={apiNoteCode}>categoryKey</code>, legend items represent categories
              (not Y series). Category IDs are stable encodings of string/number values —{" "}
              <code class={apiNoteCode}>1</code> and <code class={apiNoteCode}>"1"</code> differ.
              Unknown or null categories render with a neutral missing style and can be hidden via
              the legend. Declare colors in <code class={apiNoteCode}>categories</code> or let Kamod
              assign theme tokens in first-seen order.
            </>
          ),
        },
        {
          id: "scatter-point-context",
          label: "ScatterPointContext",
          children: (
            <>
              Tooltips receive <code class={apiNoteCode}>scatterPoint</code> on{" "}
              <code class={apiNoteCode}>CartesianTooltipContext</code> with raw{" "}
              <code class={apiNoteCode}>xValue</code>, <code class={apiNoteCode}>yValue</code>,{" "}
              <code class={apiNoteCode}>sizeValue</code>, category fields, and resolved{" "}
              <code class={apiNoteCode}>color</code>. Use{" "}
              <code class={apiNoteCode}>tooltip.render</code> for fully custom markup; default
              tooltips append size when present and use category labels in category mode.
            </>
          ),
        },
        {
          id: "reference-segments",
          label: "referenceSegments",
          children: (
            <>
              Diagonal segments connect explicit <code class={apiNoteCode}>start</code> and{" "}
              <code class={apiNoteCode}>end</code> coordinates projected through the same scales as
              markers. Kamod renders the segment you provide — it does not compute regression or
              trend statistics. Use precomputed endpoints from your analytics layer.
            </>
          ),
        },
        {
          id: "reference-areas-points",
          label: "referenceAreas & referencePoints",
          children: (
            <>
              Shade acceptable bands with <code class={apiNoteCode}>referenceAreas</code> or mark
              outliers and SLA thresholds with <code class={apiNoteCode}>referencePoints</code>.
              Annotations are <code class={apiNoteCode}>aria-hidden</code>, ignore pointer events,
              and do not affect domains or bubble hit-testing.
            </>
          ),
        },
        {
          id: "responsive-ssr",
          label: "SSR & responsive",
          children: (
            <>
              Pair <code class={apiNoteCode}>responsive</code> with{" "}
              <code class={apiNoteCode}>initialWidth</code> so the first server render matches your
              layout width before <code class={apiNoteCode}>ResizeObserver</code> measures the
              container. Tooltips and crosshair stay absent in SSR output until interaction.
            </>
          ),
        },
        {
          id: "reduced-motion",
          label: "Reduced motion",
          children: (
            <>
              Static <code class={apiNoteCode}>@kamod-ch/charts/scatter</code> has no enter/update
              animation. Import from <code class={apiNoteCode}>@kamod-ch/charts/motion</code> when
              you need transitions and pass <code class={apiNoteCode}>animate</code> or wrap with{" "}
              <code class={apiNoteCode}>MotionConfig reducedMotion="user"</code> to respect OS
              settings.
            </>
          ),
        },
      ]}
    />
  );
}
