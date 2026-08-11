import type { ChartInteraction } from "../core";

export interface CrosshairProps<TDatum> {
  interaction?: ChartInteraction<TDatum> | null;
  width: number;
  height: number;
  color?: string;
}

export const Crosshair = <TDatum,>({
  interaction,
  width,
  height,
  color = "var(--chart-axis)",
}: CrosshairProps<TDatum>) => {
  if (!interaction) {
    return null;
  }

  return (
    <g data-kamod-chart-crosshair="" aria-hidden="true">
      <line
        x1={interaction.x}
        x2={interaction.x}
        y1={0}
        y2={height}
        stroke={color}
        stroke-dasharray="3 3"
      />
      <line
        x1={0}
        x2={width}
        y1={interaction.y}
        y2={interaction.y}
        stroke={color}
        stroke-dasharray="3 3"
      />
    </g>
  );
};
