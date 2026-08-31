import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kamod-ch/ui";
import { cn } from "@kamod-ch/ui/lib/utils";
import type { ComponentChildren, JSX } from "preact";

type ChartCardProps = {
  title: string;
  description: string;
  kind: string;
  href: string;
  children: ComponentChildren;
  class?: string;
};

export function ChartCard({
  title,
  description,
  kind,
  href,
  children,
  class: className,
}: ChartCardProps): JSX.Element {
  return (
    <Card class={cn("overflow-visible border-border shadow-none", className)}>
      <CardHeader class="gap-3 space-y-0 pb-2">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <CardTitle class="text-base">{title}</CardTitle>
              <Badge variant="secondary">{kind}</Badge>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <a
            href={href}
            class="shrink-0 text-sm font-medium text-[color:var(--brand-hover)] underline-offset-4 hover:underline"
          >
            View example
          </a>
        </div>
      </CardHeader>
      <CardContent class="docs-chart-frame overflow-visible pt-2">{children}</CardContent>
    </Card>
  );
}
