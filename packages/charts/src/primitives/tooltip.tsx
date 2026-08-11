import type { ComponentChildren } from "preact";
import type { ChartInteraction } from "../core";

export interface TooltipProps<TDatum> {
  interaction?: ChartInteraction<TDatum> | null;
  visible?: boolean;
  children?: (interaction: ChartInteraction<TDatum>) => ComponentChildren;
}

export const Tooltip = <TDatum,>({
  interaction,
  visible = Boolean(interaction),
  children,
}: TooltipProps<TDatum>) => {
  if (!interaction || !visible) {
    return null;
  }

  return (
    <div
      data-kamod-chart-tooltip=""
      role="status"
      style={{
        position: "absolute",
        left: `${interaction.x}px`,
        top: `${interaction.y}px`,
        transform: "translate(8px, -100%)",
        pointerEvents: "none",
        background: "var(--chart-tooltip-background)",
        color: "var(--chart-tooltip-foreground)",
        border: "1px solid var(--chart-tooltip-border)",
        borderRadius: "0.375rem",
        padding: "0.375rem 0.5rem",
        fontSize: "0.75rem",
      }}
    >
      {children ? children(interaction) : `${interaction.seriesId}: ${interaction.value ?? "–"}`}
    </div>
  );
};
