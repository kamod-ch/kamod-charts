import type { JSX } from "preact";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { LineChart } from "./line-chart";
import type { ChartXViewportDomain } from "./x-viewport";
import type { LineCurve } from "../series";

export interface SparklineProps<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  width?: number;
  height?: number;
  /** Accessible name for the sparkline chart surface. */
  label: string;
  /** Short trend description (e.g. “Up 3% in the last hour”). */
  trendSummary?: string;
  connectNulls?: boolean;
  curve?: LineCurve;
  color?: string;
  class?: string;
}

/** Compact line preset — same LineChart layout/scales, minimal chrome. */
export const Sparkline = <TDatum,>({
  data,
  valueKey,
  xKey,
  xScale = "time",
  xDomain,
  width = 160,
  height = 36,
  label,
  trendSummary,
  connectNulls = true,
  curve = "linear",
  color = "var(--chart-1)",
  class: className,
}: SparklineProps<TDatum>): JSX.Element => {
  return (
    <div class={className} data-kamod-sparkline="">
      <LineChart
        data={data}
        xKey={xKey}
        xScale={xScale}
        xDomain={xDomain}
        width={width}
        height={height}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        showGrid={false}
        showLegend={false}
        tooltip={false}
        connectNulls={connectNulls}
        curve={curve}
        title={label}
        description={trendSummary}
        series={[{ key: valueKey, id: "spark", color, label }]}
      />
    </div>
  );
};
