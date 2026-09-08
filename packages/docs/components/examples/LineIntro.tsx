import type { JSX } from "preact";
import { apiNoteCode } from "../shared/ApiNotes";
import { CopyButton } from "../shared/CopyButton";

const lineImport = 'import { LineChart } from "@kamod-ch/charts/line";';

export function LineIntro(): JSX.Element {
  return (
    <section class="not-prose my-6 overflow-hidden rounded-xl border border-border bg-muted/30">
      <div class="space-y-2 px-4 py-4 sm:px-5">
        <p class="text-sm leading-relaxed text-muted-foreground">
          Line charts share Kamod’s cartesian model with area and scatter charts. Style lines per
          series, stack cumulative totals, and annotate thresholds with reference lines, areas, and
          points — all through typed props.
        </p>
      </div>
      <div class="flex flex-col gap-3 border-t border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <code class="font-mono text-sm text-[color:var(--brand)]">{lineImport}</code>
        <CopyButton value={lineImport} />
      </div>
      <dl class="grid gap-px border-t border-border/60 bg-border/60 sm:grid-cols-2">
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Static bundle</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Import from <code class={apiNoteCode}>@kamod-ch/charts/line</code> for charts without
            the motion runtime.
          </dd>
        </div>
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Series styling</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Per-series props on <code class={apiNoteCode}>LineSeriesConfig</code> override
            chart-level defaults for stroke width, dash patterns, and markers.
          </dd>
        </div>
      </dl>
    </section>
  );
}
