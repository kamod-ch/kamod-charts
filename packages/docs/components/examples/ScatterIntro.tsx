import type { JSX } from "preact";
import { apiNoteCode } from "../shared/ApiNotes";
import { CopyButton } from "../shared/CopyButton";

const scatterImport = 'import { ScatterChart } from "@kamod-ch/charts/scatter";';

export function ScatterIntro(): JSX.Element {
  return (
    <section class="not-prose my-6 overflow-hidden rounded-xl border border-border bg-muted/30">
      <div class="space-y-2 px-4 py-4 sm:px-5">
        <p class="text-sm leading-relaxed text-muted-foreground">
          Scatter charts plot numeric x/y pairs as markers. Kamod supports fixed radii, bubble
          sizing via <code class={apiNoteCode}>sizeKey</code>, categorical fills with legend
          toggles, and reference annotations that render behind or above markers without affecting
          hit-testing.
        </p>
      </div>
      <div class="flex flex-col gap-3 border-t border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <code class="font-mono text-sm text-[color:var(--brand)]">{scatterImport}</code>
        <CopyButton value={scatterImport} />
      </div>
      <dl class="grid gap-px border-t border-border/60 bg-border/60 sm:grid-cols-2">
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Static bundle</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Import from <code class={apiNoteCode}>@kamod-ch/charts/scatter</code> for charts without
            the motion runtime. SSR markup is stable before interaction.
          </dd>
        </div>
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Bubble &amp; category modes</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Use <code class={apiNoteCode}>sizeKey</code> for area-scaled bubbles and{" "}
            <code class={apiNoteCode}>categoryKey</code> for per-category colors. Prefer one Y
            series when coloring by category.
          </dd>
        </div>
      </dl>
    </section>
  );
}
