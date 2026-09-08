import { useMemo } from "preact/hooks";
import { barKey } from "../animation/keys";
import { resolveBarFill } from "../charts/bar-fill";
import { resolveMaxBarCategorySize } from "../charts/bar-geometry";
import { roundedRectPath } from "../charts/bar-path";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
import {
  createBandScale,
  createLinearScale,
  inferCategoricalDomain,
  inferNumericDomain,
} from "../scales";
import type { BarFill } from "../charts/types";

export interface BarSeriesProps<TDatum> {
  dataKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yDomain?: readonly [number, number];
  id?: string;
  color?: string;
  fill?: BarFill<TDatum>;
  radius?: number;
  minBarSize?: number;
  maxBarSize?: number;
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
  fill,
  radius = 0,
  minBarSize = 0,
  maxBarSize,
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
  const seriesId = id ?? "series";

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
        const barCategorySize = resolveMaxBarCategorySize(bandwidth, maxBarSize);
        const categoryOffset = (bandwidth - barCategorySize) / 2;
        const x = horizontal ? Math.min(zero, scaled) : categoryPosition + categoryOffset;
        const y = horizontal ? categoryPosition + categoryOffset : Math.min(zero, scaled);
        const width = horizontal ? Math.max(Math.abs(scaled - zero), minBarSize) : barCategorySize;
        const height = horizontal ? barCategorySize : Math.max(Math.abs(scaled - zero), minBarSize);
        const key = barKey(seriesId, category);
        const barFill = resolveBarFill(
          { key: dataKey, id, color, fill },
          {
            datum,
            index,
            value: raw,
            valueStart: 0,
            valueEnd: raw,
            seriesId,
            seriesIndex: 0,
            orientation: horizontal ? "horizontal" : "vertical",
            stacked: false,
            active: false,
          },
        );

        return (
          <path
            key={key}
            d={roundedRectPath(x, y, width, height, radius)}
            fill={barFill}
            data-kamod-chart-bar=""
            data-kamod-chart-key={key}
            onClick={onBarClick ? () => onBarClick(datum, index, raw) : undefined}
          />
        );
      })}
    </g>
  );
};
