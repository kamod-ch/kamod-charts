import type { ComponentChildren, JSX } from "preact";

export type ApiNoteItem = {
  id: string;
  label: string;
  children: ComponentChildren;
};

type ApiNotesProps = {
  title?: string;
  description?: string;
  items: ApiNoteItem[];
};

const inlineCode =
  "rounded-md bg-background px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground ring-1 ring-border/60";

export function ApiNotes({ title = "API notes", description, items }: ApiNotesProps): JSX.Element {
  return (
    <section
      id="api-notes"
      class="not-prose scroll-mt-24 overflow-hidden rounded-xl border border-border bg-muted/30"
    >
      <header class="border-b border-border bg-background/50 px-4 py-4 sm:px-5">
        <h3 class="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p class="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </header>
      <dl class="grid gap-px bg-border/60 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} class="space-y-1.5 bg-muted/30 px-4 py-4 sm:px-5">
            <dt class="text-sm font-medium text-foreground">{item.label}</dt>
            <dd class="text-sm leading-relaxed text-muted-foreground">{item.children}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export { inlineCode as apiNoteCode };
