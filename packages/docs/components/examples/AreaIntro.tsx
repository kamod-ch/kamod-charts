import type { JSX } from "preact";
import { apiNoteCode } from "../shared/ApiNotes";
import { CopyButton } from "../shared/CopyButton";

const areaImport = 'import { AreaChart } from "@kamod-ch/charts/area";';

export function AreaIntro(): JSX.Element {
  return (
    <section class="not-prose my-6 overflow-hidden rounded-xl border border-border bg-muted/30">
      <div class="space-y-2 px-4 py-4 sm:px-5">
        <p class="text-sm leading-relaxed text-muted-foreground">
          Area charts use the same cartesian model as line charts, but emphasize filled magnitude
          under the curve.
        </p>
      </div>
      <div class="flex flex-col gap-3 border-t border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <code class="font-mono text-sm text-[color:var(--brand)]">{areaImport}</code>
        <CopyButton value={areaImport} />
      </div>
      <dl class="grid gap-px border-t border-border/60 bg-border/60 sm:grid-cols-2">
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Static bundle</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Import from <code class={apiNoteCode}>@kamod-ch/charts/area</code> for charts without
            the motion runtime.
          </dd>
        </div>
        <div class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
          <dt class="text-sm font-medium text-foreground">Animation</dt>
          <dd class="text-sm leading-relaxed text-muted-foreground">
            Motion helpers live behind <code class={apiNoteCode}>@kamod-ch/charts/motion</code> when
            you need enter or update transitions.
          </dd>
        </div>
      </dl>
    </section>
  );
}
