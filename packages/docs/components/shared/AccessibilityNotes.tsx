import type { ComponentChildren, JSX } from "preact";

type AccessibilityNotesProps = {
  title?: string;
  items: string[];
  children?: ComponentChildren;
};

export function AccessibilityNotes({
  title = "Accessibility",
  items,
  children,
}: AccessibilityNotesProps): JSX.Element {
  return (
    <section class="not-prose mt-6 space-y-3 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <h3 class="text-base font-semibold text-foreground">{title}</h3>
      <ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {children}
    </section>
  );
}

type ResponsivePreviewProps = {
  children: ComponentChildren;
  label?: string;
};

export function ResponsivePreview({
  children,
  label = "Resize the container — the chart follows available width.",
}: ResponsivePreviewProps): JSX.Element {
  return (
    <div class="space-y-3">
      <p class="text-sm text-muted-foreground">{label}</p>
      <div class="docs-chart-frame w-full max-w-full resize-x overflow-auto rounded-xl border border-dashed border-border bg-background p-3">
        <div class="min-w-[16rem]">{children}</div>
      </div>
    </div>
  );
}
