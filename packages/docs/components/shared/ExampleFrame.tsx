import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@kamod-ch/ui";
import { cn } from "@kamod-ch/ui/lib/utils";
import type { ComponentChildren, JSX } from "preact";
import { CodePreview } from "./CodePreview";

type ExampleFrameProps = {
  title?: string;
  description?: string;
  badges?: string[];
  preview: ComponentChildren;
  code: string;
  class?: string;
  id?: string;
};

export function ExampleFrame({
  title,
  description,
  badges = [],
  preview,
  code,
  class: className,
  id,
}: ExampleFrameProps): JSX.Element {
  return (
    <section
      id={id}
      class={cn(
        "scroll-mt-[calc(var(--docs-header-height)+1rem)] overflow-visible rounded-xl border border-border bg-card",
        className,
      )}
    >
      {(title || description || badges.length > 0) && (
        <header class="space-y-2 border-b border-border px-4 py-4 sm:px-5">
          {title ? <h3 class="text-base font-semibold text-foreground">{title}</h3> : null}
          {description ? <p class="text-sm text-muted-foreground">{description}</p> : null}
          {badges.length > 0 ? (
            <div class="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
        </header>
      )}
      <Tabs defaultValue="preview" class="w-full">
        <div class="flex items-center justify-between border-b border-border px-3">
          <TabsList class="h-10 bg-transparent p-0">
            <TabsTrigger
              value="preview"
              class="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--brand)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
              class="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--brand)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" class="m-0 overflow-visible p-4 sm:p-5">
          <div class="docs-chart-frame min-h-[220px] w-full">{preview}</div>
        </TabsContent>
        <TabsContent value="code" class="m-0 p-0">
          <CodePreview code={code} class="rounded-none border-0" />
        </TabsContent>
      </Tabs>
    </section>
  );
}
