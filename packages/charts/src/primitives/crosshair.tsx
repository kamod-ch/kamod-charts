import { useChartContext, type ChartInteraction } from "../core";

export interface CrosshairProps<TDatum> {
  interaction?: ChartInteraction<TDatum> | null;
  /** Plot-relative width. Defaults to the chart plot area width from context. */
  width?: number;
  /** Plot-relative height. Defaults to the chart plot area height from context. */
  height?: number;
  color?: string;
}

export const Crosshair = <TDatum,>({
  interaction,
  width,
  height,
  color = "var(--chart-axis)",
}: CrosshairProps<TDatum>) => {
  const { plotArea } = useChartContext();
  const resolvedWidth = width ?? plotArea.width;
  const resolvedHeight = height ?? plotArea.height;

  if (!interaction) {
    return null;
  }

  return (
    <g data-kamod-chart-crosshair="" aria-hidden="true">
      <line
        x1={interaction.x}
        x2={interaction.x}
        y1={0}
        y2={resolvedHeight}
        stroke={color}
        stroke-dasharray="3 3"
      />
      <line
        x1={0}
        x2={resolvedWidth}
        y1={interaction.y}
        y2={interaction.y}
        stroke={color}
        stroke-dasharray="3 3"
      />
    </g>
  );
};
