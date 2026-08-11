import type { ComponentChildren } from "preact";
import { useChartContext } from "./chart-context";

export interface PlotAreaProps {
  children?: ComponentChildren;
  class?: string;
}

export const PlotArea = <TDatum,>({ children, class: className }: PlotAreaProps) => {
  const { plotArea } = useChartContext<TDatum>();

  return (
    <g
      class={className}
      data-kamod-chart-plot=""
      transform={`translate(${plotArea.x} ${plotArea.y})`}
    >
      {children}
    </g>
  );
};
