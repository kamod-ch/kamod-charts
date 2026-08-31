import type { PropRow } from "../../data/props";
import type { JSX } from "preact";

type PropsTableProps = {
  rows: PropRow[];
  caption?: string;
};

export function PropsTable({ rows, caption = "Props" }: PropsTableProps): JSX.Element {
  return (
    <div class="overflow-x-auto rounded-xl border border-border">
      <table class="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption class="sr-only">{caption}</caption>
        <thead class="bg-muted/60">
          <tr>
            <th class="px-3 py-2.5 font-semibold">Prop</th>
            <th class="px-3 py-2.5 font-semibold">Type</th>
            <th class="px-3 py-2.5 font-semibold">Default</th>
            <th class="px-3 py-2.5 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} class="border-t border-border align-top">
              <td class="px-3 py-2.5 font-mono text-[0.8rem] text-foreground">{row.name}</td>
              <td class="px-3 py-2.5 font-mono text-[0.75rem] text-muted-foreground">{row.type}</td>
              <td class="px-3 py-2.5 font-mono text-[0.75rem] text-muted-foreground">
                {row.defaultValue ?? "—"}
              </td>
              <td class="px-3 py-2.5 text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
