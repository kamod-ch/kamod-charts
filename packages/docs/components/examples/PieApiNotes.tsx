import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";
import { docsUrl } from "../shared/docs-url";

export function PieApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="Typed PieChart props — innerRadius for donuts, rose for equal-angle layouts, and pie-specific tooltip and legend options."
      items={[
        {
          id: "value-policy",
          label: "Value policy",
          children: (
            <>
              Only finite values strictly greater than zero render as slices. Non-finite, zero, or
              negative entries resolve to <code class={apiNoteCode}>0</code> and are omitted from
              geometry, navigation, and tooltips. When every value is non-positive, pass{" "}
              <code class={apiNoteCode}>emptyContent</code> for a custom fallback.
            </>
          ),
        },
        {
          id: "percentages",
          label: "Percentages",
          children: (
            <>
              <code class={apiNoteCode}>PieSliceContext.percentage</code> is the slice value divided
              by the sum of <em>visible</em> slices. Legend toggles remove hidden keys from that
              total, so percentages in tooltips and announcements stay consistent with what is on
              screen.
            </>
          ),
        },
        {
          id: "inner-radius",
          label: "innerRadius (donut)",
          children: (
            <>
              Set <code class={apiNoteCode}>innerRadius</code> to any pixel value greater than zero
              to open a donut hole. Pair with <code class={apiNoteCode}>centerContent</code> for KPI
              summaries. There is no separate <code class={apiNoteCode}>donut</code> prop — radius
              controls the shape.
            </>
          ),
        },
        {
          id: "rose-vs-pie",
          label: "Pie vs rose",
          children: (
            <>
              A standard pie maps value to <em>angle</em>. Rose (Nightingale) charts keep equal
              angles and map value to <em>radius</em> via <code class={apiNoteCode}>rose</code>.
              Default scaling is <code class={apiNoteCode}>sqrt</code>, which compresses outliers so
              small categories stay readable; use <code class={apiNoteCode}>scale: "linear"</code>{" "}
              only when proportional radius is intentional.
            </>
          ),
        },
        {
          id: "labels-outside",
          label: "Outside labels",
          children: (
            <>
              <code class={apiNoteCode}>labels="outside"</code> enables leader lines and defaults{" "}
              <code class={apiNoteCode}>collision: "shift"</code>. Tune{" "}
              <code class={apiNoteCode}>PieLabelLineOptions</code> for radial and horizontal
              segments, or pass a full <code class={apiNoteCode}>PieLabelOptions</code> object for{" "}
              <code class={apiNoteCode}>minAngle</code>, custom{" "}
              <code class={apiNoteCode}>render</code>, and{" "}
              <code class={apiNoteCode}>collision: "hide"</code>.
            </>
          ),
        },
        {
          id: "legend-tooltip",
          label: "Legend & tooltip",
          children: (
            <>
              <code class={apiNoteCode}>showLegend</code> renders slice toggles keyed by stable
              slice <code class={apiNoteCode}>key</code>. Set{" "}
              <code class={apiNoteCode}>legend.interactive</code> to{" "}
              <code class={apiNoteCode}>false</code> for a read-only legend.{" "}
              <code class={apiNoteCode}>tooltip</code> defaults to off;{" "}
              <code class={apiNoteCode}>true</code> shows value and percentage via{" "}
              <code class={apiNoteCode}>PieTooltipOptions</code>.
            </>
          ),
        },
        {
          id: "color-accessibility",
          label: "Color & categories",
          children: (
            <>
              Do not rely on slice color alone — pair fills with labels, legend text, and tooltips.
              Pie charts work best for roughly three to six categories; beyond that prefer a{" "}
              <a href={docsUrl("/charts/bar")} class="text-foreground underline underline-offset-2">
                BarChart
              </a>{" "}
              or a sorted table for exact comparisons.
            </>
          ),
        },
        {
          id: "locale-format",
          label: "Locale formatting",
          children: (
            <>
              Use <code class={apiNoteCode}>Intl.NumberFormat</code> in{" "}
              <code class={apiNoteCode}>formatValue</code> or{" "}
              <code class={apiNoteCode}>formatPercentage</code> on{" "}
              <code class={apiNoteCode}>PieTooltipOptions</code> (see the Basic example). Slice
              labels accept the same formatters through{" "}
              <code class={apiNoteCode}>PieLabelOptions.render</code>.
            </>
          ),
        },
      ]}
    />
  );
}
