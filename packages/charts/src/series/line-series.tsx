import { curveBasis, curveLinear, curveMonotoneX, line, type CurveFactory } from "d3-shape";
import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";

export type LineCurve = "linear" | "monotoneX" | "basis" | CurveFactory;

export interface LineSeriesProps<TDatum> {
  dataKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  id?: string;
  color?: string;
  strokeWidth?: number;
  curve?: LineCurve;
  connectNulls?: boolean;
  showPoints?: boolean | "auto";
  activeIndex?: number | null;
  class?: string;
}

const resolveCurve = (curve: LineCurve = "linear"): CurveFactory => {
  if (typeof curve === "function") {
    return curve;
  }

  if (curve === "monotoneX") {
    return curveMonotoneX;
  }

  if (curve === "basis") {
    return curveBasis;
  }

  return curveLinear;
};

export const LineSeries = <TDatum,>({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  strokeWidth = 2,
  curve = "linear",
  connectNulls = false,
  showPoints = "auto",
  activeIndex = null,
  class: className,
}: LineSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: dataKey,
    xScale,
    xDomain,
    yDomain,
    nice: true,
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale],
  );
  const path = useMemo(() => {
    const generator = line<(typeof points)[number]>()
      .defined((point) => connectNulls || point.defined)
      .x((point) => point.x ?? 0)
      .y((point) => point.y ?? 0)
      .curve(resolveCurve(curve));

    return generator(points) ?? "";
  }, [connectNulls, curve, points]);
  const shouldShowPoints = showPoints === true || (showPoints === "auto" && points.length <= 500);

  return (
    <g class={className} data-kamod-chart-line-series="" data-kamod-chart-series-id={id}>
      <path
        d={path}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {shouldShowPoints
        ? points.map((point) =>
            point.defined ? (
              <circle
                key={point.index}
                cx={point.x ?? 0}
                cy={point.y ?? 0}
                r={activeIndex === point.index ? 4 : 2.5}
                fill={color}
                stroke="var(--chart-tooltip-background)"
                stroke-width={activeIndex === point.index ? 2 : 1}
                data-kamod-chart-active={activeIndex === point.index ? "true" : undefined}
              />
            ) : null,
          )
        : null}
    </g>
  );
};
