import { Badge } from "@kamod-ch/ui";
import { cn } from "@kamod-ch/ui/lib/utils";
import type { JSX } from "preact";
import { CopyButton } from "./CopyButton";

type CodePreviewProps = {
  code: string;
  language?: string;
  class?: string;
  title?: string;
};

export function CodePreview({
  code,
  language = "tsx",
  class: className,
  title,
}: CodePreviewProps): JSX.Element {
  return (
    <div
      class={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        className,
      )}
    >
      <div class="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div class="flex items-center gap-2">
          {title ? <span class="text-sm font-medium">{title}</span> : null}
          <Badge variant="secondary" class="font-mono text-[0.7rem]">
            {language}
          </Badge>
        </div>
        <CopyButton value={code} />
      </div>
      <pre class="m-0 overflow-x-auto p-4 text-[0.8125rem] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
