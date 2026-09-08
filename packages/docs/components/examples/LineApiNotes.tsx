import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";

export function LineApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="Typed LineChart props — no dashed boolean and no option:any."
      items={[
        {
          id: "line-series-config",
          label: "LineSeriesConfig",
          children: (
            <>
              Each entry in <code class={apiNoteCode}>series</code> extends the cartesian config
              with <code class={apiNoteCode}>strokeWidth</code>,{" "}
              <code class={apiNoteCode}>strokeDasharray</code>,{" "}
              <code class={apiNoteCode}>showPoints</code>, and{" "}
              <code class={apiNoteCode}>pointRadius</code>. Series values win over chart-level
              defaults.
            </>
          ),
        },
        {
          id: "dash-patterns",
          label: "Dash patterns",
          children: (
            <>
              Use <code class={apiNoteCode}>strokeDasharray</code> (e.g.{" "}
              <code class={apiNoteCode}>"6 4"</code>) on the chart or on a series — not a{" "}
              <code class={apiNoteCode}>dashed</code> boolean. Combine solid actuals with a dashed
              forecast line via per-series patterns.
            </>
          ),
        },
        {
          id: "curves",
          label: "Curve values",
          children: (
            <>
              Exported curve names: <code class={apiNoteCode}>linear</code>,{" "}
              <code class={apiNoteCode}>monotoneX</code>, <code class={apiNoteCode}>basis</code>,{" "}
              <code class={apiNoteCode}>step</code>, <code class={apiNoteCode}>stepBefore</code>,{" "}
              <code class={apiNoteCode}>stepAfter</code>. Default is{" "}
              <code class={apiNoteCode}>linear</code>.
            </>
          ),
        },
        {
          id: "stacked-lines",
          label: "Stacked lines",
          children: (
            <>
              Set <code class={apiNoteCode}>stacked</code> to draw each series on cumulative{" "}
              <code class={apiNoteCode}>y1</code>. Axis tooltips still report each series’{" "}
              <strong class="font-medium text-foreground">raw value</strong>; markers and crosshair
              anchor on the stacked position.
            </>
          ),
        },
        {
          id: "reference-areas",
          label: "Reference areas",
          children: (
            <>
              <code class={apiNoteCode}>referenceAreas</code> accept vertical{" "}
              <code class={apiNoteCode}>x1</code>/<code class={apiNoteCode}>x2</code> or horizontal{" "}
              <code class={apiNoteCode}>y1</code>/<code class={apiNoteCode}>y2</code> pairs. Band
              scales include full category bandwidth.
            </>
          ),
        },
        {
          id: "reference-points",
          label: "Reference points",
          children: (
            <>
              <code class={apiNoteCode}>referencePoints</code> mark explicit{" "}
              <code class={apiNoteCode}>x</code>/<code class={apiNoteCode}>y</code> events with{" "}
              <code class={apiNoteCode}>circle</code>, <code class={apiNoteCode}>square</code>, or{" "}
              <code class={apiNoteCode}>diamond</code> shapes. Kamod does not infer peaks — pass
              coordinates from your domain model.
            </>
          ),
        },
        {
          id: "reference-lines",
          label: "Reference lines",
          children: (
            <>
              <code class={apiNoteCode}>referenceLines</code> accept optional{" "}
              <code class={apiNoteCode}>strokeWidth</code> and{" "}
              <code class={apiNoteCode}>strokeDasharray</code>. When omitted, the legacy{" "}
              <code class={apiNoteCode}>"4 4"</code> dash pattern is preserved.
            </>
          ),
        },
        {
          id: "themes",
          label: "Theme tokens",
          children: (
            <>
              Reference fills and markers use{" "}
              <code class={apiNoteCode}>var(--chart-reference-area)</code> and{" "}
              <code class={apiNoteCode}>var(--chart-reference-point)</code> so annotations stay
              readable in light and dark themes.
            </>
          ),
        },
      ]}
    />
  );
}
