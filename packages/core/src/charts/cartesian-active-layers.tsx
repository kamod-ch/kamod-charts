import type { ComponentChildren } from "preact";
import { useChartMotionContext } from "../animation/slots";
import type { ChartCartesianScaleKind, ChartInteraction, DataAccessor } from "../core";
import { normalizeAccessor, useChartContext } from "../core";
import { Crosshair, LiveRegion, Tooltip } from "../primitives";
import type { NumericDomain } from "../scales";
import { resolveCartesianActivePoint, type CartesianActivePoint } from "./cartesian-interaction";
import { getSeriesId } from "./series-identity";
import { resolveTooltipOptions } from "./tooltip-options";
import type { CartesianPointerPlot } from "./use-cartesian-pointer-state";
import type {
  CartesianTooltipContext,
  CartesianTooltipMode,
  CartesianTooltipOptions,
  CartesianTooltipSeriesValue,
  CartesianSeriesConfig,
} from "./types";

type ActiveLayersProps<TDatum> = {
  activeIndex: number | null;
  activeSeries?: CartesianSeriesConfig<TDatum>;
  visibleSeries: readonly CartesianSeriesConfig<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  yDomain: NumericDomain;
  tooltip?: boolean | CartesianTooltipOptions<TDatum>;
  defaultMode: CartesianTooltipMode;
  activePoint?: CartesianActivePoint | null;
  pointerPlot?: CartesianPointerPlot | null;
};

const clampPlotCoord = (value: number, max: number): number => Math.min(Math.max(value, 0), max);

const tooltipNumberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const tooltipDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const missingValue = "–";

const formatDefaultXLabel = (value: string | number | Date | null): string | null => {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : tooltipDateFormatter.format(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? tooltipNumberFormatter.format(value) : null;
  }

  return String(value);
};

const formatDefaultValue = (value: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return missingValue;
  }

  return tooltipNumberFormatter.format(value);
};

const toAnnouncementText = (value: ComponentChildren, fallback: string): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

const displayedSeriesValues = <TDatum,>(
  seriesValues: readonly CartesianTooltipSeriesValue<TDatum>[],
  seriesId: string,
  mode: CartesianTooltipMode,
): readonly CartesianTooltipSeriesValue<TDatum>[] => {
  if (mode !== "nearest") {
    return seriesValues;
  }

  const selected = seriesValues.filter((entry) => entry.id === seriesId);
  return selected.length > 0 ? selected : seriesValues;
};

const useActiveInteraction = <TDatum,>({
  activeIndex,
  activeSeries,
  visibleSeries,
  xKey,
  xScale,
  yDomain,
  activePoint: activePointOverride,
  pointerPlot,
  tooltip,
  defaultMode,
}: ActiveLayersProps<TDatum>): {
  interaction: ChartInteraction<TDatum> | null;
  plotInteraction: ChartInteraction<TDatum> | null;
  context: CartesianTooltipContext<TDatum> | null;
} => {
  const { data, plotArea } = useChartContext<TDatum>();
  const tooltipMode = resolveTooltipOptions(tooltip, defaultMode)?.mode ?? defaultMode;
  const useSmoothPointer = pointerPlot != null && tooltipMode === "axis";
  const activeDatum = activeIndex == null ? undefined : data[activeIndex];
  const activeValue =
    activeDatum && activeSeries && activeIndex != null
      ? normalizeAccessor(activeSeries.key)(activeDatum, activeIndex)
      : null;
  const activePoint =
    activePointOverride !== undefined
      ? activePointOverride
      : activeIndex == null || !activeSeries
        ? null
        : resolveCartesianActivePoint({
            data,
            index: activeIndex,
            seriesKey: activeSeries.key,
            xKey,
            xScale,
            yDomain,
            plotWidth: plotArea.width,
            plotHeight: plotArea.height,
            plotOffsetX: plotArea.x,
            plotOffsetY: plotArea.y,
          });

  const readX = normalizeAccessor(xKey ?? ((_datum: TDatum, index: number) => index));
  const xValue =
    activeDatum && activeIndex != null ? (readX(activeDatum, activeIndex) ?? null) : null;
  const xLabel = formatDefaultXLabel(xValue);

  const seriesValues: CartesianTooltipSeriesValue<TDatum>[] =
    activeDatum && activeIndex != null
      ? visibleSeries.map((entry, seriesIndex) => {
          const raw = normalizeAccessor(entry.key)(activeDatum, activeIndex);
          return {
            id: getSeriesId(entry, seriesIndex),
            label: entry.label ?? getSeriesId(entry, seriesIndex),
            color: entry.color,
            value: typeof raw === "number" && Number.isFinite(raw) ? raw : null,
            series: entry,
          };
        })
      : [];

  if (!activeDatum || !activeSeries || !activePoint || activeIndex == null) {
    return { interaction: null, plotInteraction: null, context: null };
  }

  const seriesId = getSeriesId(activeSeries, Math.max(visibleSeries.indexOf(activeSeries), 0));
  const plotX = useSmoothPointer
    ? clampPlotCoord(pointerPlot.plotX, plotArea.width)
    : activePoint.plotX;
  const plotY = useSmoothPointer
    ? clampPlotCoord(pointerPlot.plotY, plotArea.height)
    : activePoint.plotY;
  const surfaceX = useSmoothPointer ? plotArea.x + plotX : activePoint.surfaceX;
  const surfaceY = useSmoothPointer ? plotArea.y + plotY : activePoint.surfaceY;

  const interaction: ChartInteraction<TDatum> = {
    datum: activeDatum,
    seriesId,
    label: activeSeries.label,
    index: activeIndex,
    value: typeof activeValue === "number" ? activeValue : null,
    x: surfaceX,
    y: surfaceY,
  };

  return {
    interaction,
    plotInteraction: { ...interaction, x: plotX, y: plotY },
    context: {
      datum: activeDatum,
      index: activeIndex,
      xValue,
      xLabel,
      seriesId,
      seriesLabel: activeSeries.label,
      seriesValues,
      x: surfaceX,
      y: surfaceY,
    },
  };
};

const resolveFormattedChild = (
  formatted: ComponentChildren | null | undefined,
  fallback: string,
): ComponentChildren => (formatted == null ? fallback : formatted);

const DefaultTooltipContent = <TDatum,>({
  context,
  options,
}: {
  context: CartesianTooltipContext<TDatum>;
  options: CartesianTooltipOptions<TDatum>;
}) => {
  const mode = options.mode ?? "axis";
  const rows = displayedSeriesValues(context.seriesValues, context.seriesId, mode);
  const formattedLabel = options.formatLabel
    ? resolveFormattedChild(options.formatLabel(context.xValue, context), missingValue)
    : context.xLabel;
  const AnimatedNumber = useChartMotionContext().slots.AnimatedNumber;

  return (
    <div data-kamod-chart-tooltip-content="">
      {formattedLabel ? <div data-kamod-chart-tooltip-label="">{formattedLabel}</div> : null}
      {rows.map((series) => {
        const formattedValue = options.formatValue ? (
          resolveFormattedChild(options.formatValue(series.value, context), missingValue)
        ) : AnimatedNumber ? (
          <AnimatedNumber value={series.value} />
        ) : (
          formatDefaultValue(series.value)
        );

        return (
          <div key={series.id} data-kamod-chart-tooltip-row="">
            <span
              aria-hidden="true"
              data-kamod-chart-tooltip-swatch=""
              style={{ background: series.color ?? "currentColor" }}
            />
            <span>
              {series.label}: {formattedValue}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const announceTooltip = <TDatum,>(
  context: CartesianTooltipContext<TDatum>,
  options: CartesianTooltipOptions<TDatum>,
): string => {
  const mode = options.mode ?? "axis";
  const rows = displayedSeriesValues(context.seriesValues, context.seriesId, mode);
  const formattedLabel = options.formatLabel
    ? resolveFormattedChild(options.formatLabel(context.xValue, context), missingValue)
    : context.xLabel;
  const labelText = formattedLabel
    ? toAnnouncementText(formattedLabel, context.xLabel ?? missingValue)
    : null;
  const rowText = rows
    .map((series) => {
      const formattedValue = options.formatValue
        ? resolveFormattedChild(options.formatValue(series.value, context), missingValue)
        : formatDefaultValue(series.value);
      return `${series.label}: ${toAnnouncementText(formattedValue, formatDefaultValue(series.value))}`;
    })
    .join(", ");

  return labelText ? `${labelText}: ${rowText}` : rowText;
};

export const CartesianActiveCrosshair = <TDatum,>(props: ActiveLayersProps<TDatum>) => {
  const { plotInteraction } = useActiveInteraction(props);
  if (!resolveTooltipOptions(props.tooltip, props.defaultMode)) {
    return null;
  }
  return <Crosshair interaction={plotInteraction} />;
};

export const CartesianActiveOverlay = <TDatum,>(props: ActiveLayersProps<TDatum>) => {
  const { interaction, context } = useActiveInteraction(props);
  const options = resolveTooltipOptions(props.tooltip, props.defaultMode);

  return (
    <>
      {options && context ? (
        <Tooltip interaction={interaction} placement={options.placement} offset={options.offset}>
          {() =>
            options.render ? (
              options.render(context)
            ) : (
              <DefaultTooltipContent context={context} options={options} />
            )
          }
        </Tooltip>
      ) : null}
      <LiveRegion
        interaction={interaction}
        format={() => (context && options ? announceTooltip(context, options) : "")}
      />
    </>
  );
};
