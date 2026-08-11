import type { ChartInteraction } from "../core";

export interface LiveRegionProps<TDatum> {
  interaction?: ChartInteraction<TDatum> | null;
  format?: (interaction: ChartInteraction<TDatum>) => string;
}

export const LiveRegion = <TDatum,>({ interaction, format }: LiveRegionProps<TDatum>) => (
  <div
    data-kamod-chart-live-region=""
    aria-live="polite"
    aria-atomic="true"
    style={{
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)",
    }}
  >
    {interaction
      ? format
        ? format(interaction)
        : `${interaction.seriesId} ${interaction.index + 1}: ${interaction.value ?? "–"}`
      : ""}
  </div>
);
