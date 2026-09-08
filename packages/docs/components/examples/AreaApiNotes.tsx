import type { JSX } from "preact";
import { ApiNotes, apiNoteCode } from "../shared/ApiNotes";

export function AreaApiNotes(): JSX.Element {
  return (
    <ApiNotes
      title="API notes"
      description="Typed props and defaults for AreaChart — no separate options object."
      items={[
        {
          id: "default-curve",
          label: "Default curve",
          children: (
            <>
              <code class={apiNoteCode}>linear</code> stays the Kamod default for predictable
              dashboards. Choose <code class={apiNoteCode}>monotoneX</code> for a smooth trend (see{" "}
              <strong class="font-medium text-foreground">Basic smooth</strong>).
            </>
          ),
        },
        {
          id: "smooth-curves",
          label: "Smooth curves",
          children: (
            <>
              <code class={apiNoteCode}>monotoneX</code> is Kamod’s smooth X interpolation — similar
              to “spline” or “monotone” options in other chart libraries.
            </>
          ),
        },
        {
          id: "step-curves",
          label: "Step curves",
          children: (
            <>
              <code class={apiNoteCode}>stepBefore</code> and{" "}
              <code class={apiNoteCode}>stepAfter</code> map to step-start and step-end conventions.
              Use <code class={apiNoteCode}>step</code> for centered steps.
            </>
          ),
        },
        {
          id: "markers",
          label: "Markers",
          children: (
            <>
              Enable <code class={apiNoteCode}>showPoints</code> — there is no separate{" "}
              <code class={apiNoteCode}>markers</code> prop. Markers accent finite values and are
              not individual tab stops.
            </>
          ),
        },
        {
          id: "dashed-outlines",
          label: "Dashed outlines",
          children: (
            <>
              Combine <code class={apiNoteCode}>outline</code> with{" "}
              <code class={apiNoteCode}>strokeDasharray</code>. There is no{" "}
              <code class={apiNoteCode}>dashed</code> boolean.
            </>
          ),
        },
        {
          id: "gradients",
          label: "Gradients",
          children: (
            <>
              Pass <code class={apiNoteCode}>fill={'{{ type: "gradient", ... }}'}</code>. Stops use
              CSS <code class={apiNoteCode}>var(--chart-*)</code> tokens and adapt to light and dark
              themes.
            </>
          ),
        },
        {
          id: "stacked-tooltips",
          label: "Stacked tooltips",
          children: (
            <>
              Axis tooltips report each series’{" "}
              <strong class="font-medium text-foreground">raw value</strong>, not cumulative stack
              geometry (<code class={apiNoteCode}>y0</code> / <code class={apiNoteCode}>y1</code>).
            </>
          ),
        },
        {
          id: "typed-props",
          label: "Typed props",
          children: (
            <>
              No <code class={apiNoteCode}>option: any</code> — every prop is typed on{" "}
              <code class={apiNoteCode}>AreaChart</code> and series components.
            </>
          ),
        },
      ]}
    />
  );
}
