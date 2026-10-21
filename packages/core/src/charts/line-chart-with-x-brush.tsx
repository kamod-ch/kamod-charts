import type { ComponentChildren } from "preact";
import { useCallback, useMemo, useState } from "preact/hooks";
import { CartesianXBrush } from "../primitives/cartesian-x-brush";
import { downsampleMinMaxSegmented } from "../performance/downsample-min-max-segmented";
import { normalizeAccessor, type DataAccessor } from "../core";
import { LineChart } from "./line-chart";
import type { CartesianXBrushOptions, LineChartProps } from "./types";
import {
  clampXViewportDomain,
  createTrailingTimeWindowDomain,
  inferContinuousXDomainFromData,
  isContinuousCartesianXScale,
  type ChartXViewportDomain,
} from "./x-viewport";
import type { XViewportChangeReason } from "./use-cartesian-x-viewport-gestures";

export type { CartesianXBrushOptions };

const resolveBrushOptions = (
  value: boolean | CartesianXBrushOptions | undefined,
): CartesianXBrushOptions => (value === true || value == null || value === false ? {} : value);

const defaultOverviewHeight = 72;
const defaultOverviewBudget = 320;

const buildOverviewData = <TDatum,>(
  data: readonly TDatum[],
  xKey: LineChartProps<TDatum>["xKey"],
  yKey: DataAccessor<TDatum, number | null | undefined> | undefined,
  xScale: LineChartProps<TDatum>["xScale"],
  budget: number,
): readonly TDatum[] => {
  if (data.length <= budget || yKey == null) {
    return data;
  }
  const readX = normalizeAccessor(xKey ?? ((_datum: TDatum, index: number) => index));
  const readY = normalizeAccessor(yKey);
  const result = downsampleMinMaxSegmented(
    data,
    (datum, index) => {
      const value = readX(datum, index);
      if (value instanceof Date) {
        return value.getTime();
      }
      return typeof value === "number" ? value : index;
    },
    (datum, index) => {
      const value = readY(datum, index);
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    },
    { budget },
  );
  const keep = new Set(result.points.map((point) => point.index));
  return data.filter((_, index) => keep.has(index));
};

export type LineChartWithXBrushProps<TDatum> = LineChartProps<TDatum> & {
  xBrush: boolean | CartesianXBrushOptions;
};

export const LineChartWithXBrush = <TDatum,>({
  xBrush,
  xDomain: xDomainProp,
  onXViewportChange,
  data,
  xKey,
  xScale,
  series,
  width,
  initialWidth,
  responsive,
  ...rest
}: LineChartWithXBrushProps<TDatum>) => {
  const brush = resolveBrushOptions(xBrush);
  const overviewHeight = brush.overviewHeight ?? defaultOverviewHeight;
  const overviewBudget = brush.overviewPointBudget ?? defaultOverviewBudget;
  const extents = useMemo(
    () => inferContinuousXDomainFromData(data, xKey, xScale),
    [data, xKey, xScale],
  );
  const [internalDomain, setInternalDomain] = useState<ChartXViewportDomain | undefined>(undefined);
  const isControlled = xDomainProp != null;
  const primaryYKey = series[0]?.key as DataAccessor<TDatum, number | null | undefined> | undefined;

  const defaultWindow = useMemo(() => {
    if (!extents) {
      return undefined;
    }
    if (xScale === "time" && extents[1] instanceof Date) {
      const span = (extents[1] as Date).getTime() - (extents[0] as Date).getTime();
      return createTrailingTimeWindowDomain(
        extents[1] as Date,
        Math.max(span * 0.35, 60_000),
        extents,
      );
    }
    const span = (extents[1] as number) - (extents[0] as number);
    const end = extents[1] as number;
    return clampXViewportDomain([end - span * 0.35, end], extents, xScale);
  }, [extents, xScale]);

  const windowDomain = useMemo(() => {
    if (!extents || !isContinuousCartesianXScale(xScale)) {
      return undefined;
    }
    const candidate = xDomainProp ?? internalDomain ?? defaultWindow;
    return candidate ? clampXViewportDomain(candidate, extents, xScale, brush.minSpan) : undefined;
  }, [brush.minSpan, defaultWindow, extents, internalDomain, xDomainProp, xScale]);

  const emitViewport = useCallback(
    (domain: ChartXViewportDomain, reason: XViewportChangeReason) => {
      if (!extents) {
        return;
      }
      const clamped = clampXViewportDomain(domain, extents, xScale, brush.minSpan);
      if (!isControlled) {
        setInternalDomain(clamped);
      }
      onXViewportChange?.(clamped, reason);
    },
    [brush.minSpan, extents, isControlled, onXViewportChange, xScale],
  );

  const overviewData = useMemo(
    () => buildOverviewData(data, xKey, primaryYKey, xScale, overviewBudget),
    [data, overviewBudget, primaryYKey, xKey, xScale],
  );

  const brushOverlay: ComponentChildren =
    extents && windowDomain ? (
      <CartesianXBrush
        selection={windowDomain}
        extents={extents}
        xKey={xKey}
        xScale={xScale}
        minSpan={brush.minSpan}
        onSelectionChange={(domain, reason) =>
          emitViewport(domain, reason === "keyboard" ? "keyboard" : "pan")
        }
      />
    ) : null;

  if (!isContinuousCartesianXScale(xScale) || !extents || !windowDomain) {
    return (
      <LineChart
        data={data}
        xKey={xKey}
        xScale={xScale}
        series={series}
        width={width}
        initialWidth={initialWidth}
        responsive={responsive}
        xDomain={xDomainProp}
        onXViewportChange={onXViewportChange}
        {...rest}
      />
    );
  }

  return (
    <div data-kamod-line-chart-with-x-brush="">
      <LineChart
        data={data}
        xKey={xKey}
        xScale={xScale}
        series={series}
        width={width}
        initialWidth={initialWidth}
        responsive={responsive}
        xDomain={windowDomain}
        onXViewportChange={emitViewport}
        {...rest}
      />
      <LineChart
        data={overviewData}
        xKey={xKey}
        xScale={xScale}
        series={series}
        width={width}
        initialWidth={initialWidth}
        responsive={responsive}
        height={overviewHeight}
        showGrid={false}
        showLegend={false}
        tooltip={false}
        title={undefined}
        description="Overview range selector"
        xViewportInteraction={false}
        plotForeground={brushOverlay}
        margin={rest.margin}
        format={rest.format}
      />
    </div>
  );
};
