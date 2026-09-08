import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";
import { docsUrl } from "../shared/docs-url";

export function DonutApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="DonutChart is the ratio-first preset for rings and semicircles. Import from @kamod-ch/charts/donut for a tree-shakeable entry."
      items={[
        {
          id: "donut-vs-pie",
          label: "DonutChart vs PieChart",
          children: (
            <>
              Use <code class={apiNoteCode}>DonutChart</code> when the hole size should scale with
              plot size via <code class={apiNoteCode}>innerRadiusRatio</code>.{" "}
              <a href={docsUrl("/charts/pie")} class="text-foreground underline underline-offset-2">
                PieChart
              </a>{" "}
              keeps pixel <code class={apiNoteCode}>innerRadius</code> for legacy callers and
              supports <code class={apiNoteCode}>rose</code>. For a permanent filled pie, prefer
              PieChart.
            </>
          ),
        },
        {
          id: "inner-radius-ratio",
          label: "innerRadiusRatio",
          children: (
            <>
              Ratio of the resolved outer radius, clamped to{" "}
              <code class={apiNoteCode}>[0, 0.95]</code>. Default{" "}
              <code class={apiNoteCode}>0.68</code> matches UIpkge{" "}
              <code class={apiNoteCode}>thickness={0.32}</code> because{" "}
              <code class={apiNoteCode}>1 - 0.32 = 0.68</code>. Set{" "}
              <code class={apiNoteCode}>0</code> for a filled disc (see Filled example).
            </>
          ),
        },
        {
          id: "variants",
          label: "variant full / half",
          children: (
            <>
              <code class={apiNoteCode}>full</code> renders a closed ring with default outside
              labels. <code class={apiNoteCode}>half</code> uses the upper semicircle, reserves
              space below the baseline for center totals, and pairs best with{" "}
              <code class={apiNoteCode}>labels="none"</code>.
            </>
          ),
        },
        {
          id: "center-priority",
          label: "Center content priority",
          children: (
            <>
              <code class={apiNoteCode}>centerContent</code> wins over{" "}
              <code class={apiNoteCode}>formatTotal</code>, which wins over automatic{" "}
              <code class={apiNoteCode}>showTotal</code>. Pass a render function to receive{" "}
              <code class={apiNoteCode}>DonutCenterContext</code> with{" "}
              <code class={apiNoteCode}>total</code> (visible slices) and{" "}
              <code class={apiNoteCode}>grandTotal</code> (all positive slices).
            </>
          ),
        },
        {
          id: "angles",
          label: "padAngle & cornerRadius",
          children: (
            <>
              <code class={apiNoteCode}>padAngle</code> is in radians (d3 convention). Default{" "}
              <code class={apiNoteCode}>Math.PI / 90</code> ≈ 2°. Convert degrees with{" "}
              <code class={apiNoteCode}>(degrees * Math.PI) / 180</code>.{" "}
              <code class={apiNoteCode}>cornerRadius</code> rounds outer arc corners;{" "}
              <code class={apiNoteCode}>activeOffset</code> expands the focused slice (default{" "}
              <code class={apiNoteCode}>3</code> px).
            </>
          ),
        },
        {
          id: "legend-tooltip",
          label: "Legend & tooltip",
          children: (
            <>
              Defaults are <code class={apiNoteCode}>showLegend=false</code> and{" "}
              <code class={apiNoteCode}>tooltip=false</code> — opt in explicitly. Legend toggles
              update <code class={apiNoteCode}>total</code> but not{" "}
              <code class={apiNoteCode}>grandTotal</code>. Tooltips reuse{" "}
              <code class={apiNoteCode}>PieTooltipOptions</code>.
            </>
          ),
        },
        {
          id: "values-responsive",
          label: "Values & responsive SSR",
          children: (
            <>
              Only finite values strictly greater than zero become slices. Use{" "}
              <code class={apiNoteCode}>emptyContent</code> when every value is non-positive. Pair{" "}
              <code class={apiNoteCode}>responsive</code> with{" "}
              <code class={apiNoteCode}>initialWidth</code> for stable SSR markup before
              ResizeObserver measures the container.
            </>
          ),
        },
        {
          id: "import-path",
          label: "Focused import",
          children: (
            <>
              <code class={apiNoteCode}>
                import {"{ DonutChart }"} from "@kamod-ch/charts/donut"
              </code>{" "}
              avoids cartesian chart entry modules. Root{" "}
              <code class={apiNoteCode}>@kamod-ch/charts</code> re-exports the same component and
              types.
            </>
          ),
        },
      ]}
    />
  );
}
