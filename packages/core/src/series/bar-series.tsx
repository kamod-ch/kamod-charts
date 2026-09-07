import { useMemo } from "preact/hooks";
import { barKey } from "../animation/keys";
import { roundedRectPath } from "../charts/bar-path";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
import {
  createBandScale,
  createLinearScale,
  inferCategoricalDomain,
  inferNumericDomain,
} from "../scales";

export interface BarSeriesProps<TDatum> {
  dataKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yDomain?: readonly [number, number];
  id?: string;
  color?: string;
  radius?: number;
  minBarSize?: number;
  horizontal?: boolean;
  class?: string;
  onBarClick?: (datum: TDatum, index: number, value: number) => void;
}

const valueToCategory = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value == null) {
    return String(index);
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

export const BarSeries = <TDatum,>({
  dataKey,
  xKey,
  yDomain,
  id,
  color = "var(--chart-1)",
  radius = 0,
  minBarSize = 0,
  horizontal = false,
  class: className,
  onBarClick,
}: BarSeriesProps<TDatum>) => {
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const readY = normalizeAccessor(dataKey);
  const domain = useMemo(
    () => inferCategoricalDomain(data, resolvedXKey ?? ((_datum, index) => index)),
    [data, resolvedXKey],
  );
  const valueDomain = yDomain ?? inferNumericDomain({ data, accessor: dataKey });
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
    paddingInner: 0.2,
    paddingOuter: 0.1,
  });
  const valueScale = createLinearScale({
    domain: valueDomain,
    range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
  });
  const zero = valueScale(0);

  return (
    <g class={className} data-kamod-chart-bar-series="" data-kamod-chart-series-id={id}>
      {data.map((datum, index) => {
        const raw = readY(datum, index);
        if (typeof raw !== "number" || !Number.isFinite(raw)) {
          return null;
        }

        const category = valueToCategory(readX(datum, index), index);
        const categoryPosition = categoryScale(category);
        if (categoryPosition == null) {
          return null;
        }

        const scaled = valueScale(raw);
        const bandwidth = categoryScale.bandwidth();
        const x = horizontal ? Math.min(zero, scaled) : categoryPosition;
        const y = horizontal ? categoryPosition : Math.min(zero, scaled);
        const width = horizontal ? Math.max(Math.abs(scaled - zero), minBarSize) : bandwidth;
        const height = horizontal ? bandwidth : Math.max(Math.abs(scaled - zero), minBarSize);
        const key = barKey(id ?? "series", category);

        return (
          <path
            key={key}
            d={roundedRectPath(x, y, width, height, radius)}
            fill={color}
            data-kamod-chart-bar=""
            data-kamod-chart-key={key}
            onClick={onBarClick ? () => onBarClick(datum, index, raw) : undefined}
          />
        );
      })}
    </g>
  );
};
