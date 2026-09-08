import type { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import type { ChartInteraction, DataAccessor } from "../core";
import { useChartContext } from "../core";
import { LiveRegion, Tooltip } from "../primitives";
import { buildPieSlicesForLayout, resolvePieSeriesLayout } from "../series/pie-series-layout";
import {
  pieSliceSurfacePoint,
  toPieSliceContext,
  type PieRose,
  type PieSortComparator,
} from "../series/pie-geometry";
import type { PieLabels } from "../series/pie-label";
import { resolvePieTooltipOptions } from "./pie-tooltip-options";
import type { PieSliceContext, PieTooltipOptions } from "./types";

const defaultPercentageLabel = (percentage: number): string => `${(percentage * 100).toFixed(1)}%`;

const toAnnouncementText = (value: ComponentChildren, fallback: string): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

const resolveFormattedChild = (
  formatted: ComponentChildren | null | undefined,
  fallback: string,
): ComponentChildren => (formatted == null ? fallback : formatted);

export interface PieActiveOverlayProps<TDatum> {
  keyboardIndex: number | null;
  pointerIndex: number | null;
  tooltip?: boolean | PieTooltipOptions<TDatum>;
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius?: number;
  innerRadiusRatio?: number;
  variant?: import("../series/pie-layout").CircularVariant;
  outerRadius?: number;
  padAngle: number;
  cornerRadius: number;
  sort?: boolean | PieSortComparator<TDatum>;
  colors?: readonly string[];
  hiddenKeys?: readonly string[];
  activeOffset?: number;
  rose?: PieRose;
  labels?: PieLabels<TDatum>;
}

const usePieActiveState = <TDatum,>({
  keyboardIndex,
  pointerIndex,
  tooltip,
  valueKey,
  labelKey,
  innerRadius = 0,
  innerRadiusRatio,
  variant = "full",
  outerRadius,
  padAngle,
  cornerRadius,
  sort,
  colors,
  hiddenKeys = [],
  activeOffset,
  rose,
  labels = "inside",
}: PieActiveOverlayProps<TDatum>): {
  tooltipContext: PieSliceContext<TDatum> | null;
  keyboardContext: PieSliceContext<TDatum> | null;
  interaction: ChartInteraction<TDatum> | null;
  keyboardInteraction: ChartInteraction<TDatum> | null;
  options: PieTooltipOptions<TDatum> | null;
} => {
  const { data, plotArea } = useChartContext<TDatum>();
  const options = resolvePieTooltipOptions(tooltip);
  const activeIndex = pointerIndex ?? keyboardIndex;
  const { layout } = useMemo(
    () =>
      resolvePieSeriesLayout({
        plotArea,
        labels,
        innerRadius,
        innerRadiusRatio,
        variant,
        outerRadius,
        activeOffset,
      }),
    [activeOffset, innerRadius, innerRadiusRatio, labels, outerRadius, plotArea, variant],
  );
  const { slices } = useMemo(
    () =>
      buildPieSlicesForLayout({
        data,
        valueKey,
        labelKey,
        layout,
        padAngle,
        cornerRadius,
        sort,
        colors,
        hiddenKeys,
        activeIndex,
        activeOffset,
        rose,
      }),
    [
      activeIndex,
      activeOffset,
      colors,
      cornerRadius,
      data,
      hiddenKeys,
      labelKey,
      layout,
      padAngle,
      rose,
      sort,
      valueKey,
    ],
  );

  const resolveContext = (index: number | null): PieSliceContext<TDatum> | null => {
    if (index == null) {
      return null;
    }

    const slice = slices.find((entry) => entry.index === index);
    if (!slice) {
      return null;
    }

    return toPieSliceContext(slice, activeIndex === index);
  };

  const toInteraction = (
    context: PieSliceContext<TDatum> | null,
  ): ChartInteraction<TDatum> | null => {
    if (!context) {
      return null;
    }

    const slice = slices.find((entry) => entry.index === context.index);
    if (!slice) {
      return null;
    }

    const anchor = pieSliceSurfacePoint(slice, plotArea, layout);

    return {
      datum: context.datum,
      seriesId: context.key,
      index: context.index,
      value: context.value,
      label: context.label,
      x: anchor.x,
      y: anchor.y,
    };
  };

  const tooltipContext = options ? resolveContext(activeIndex) : null;
  const keyboardContext = options ? resolveContext(keyboardIndex) : null;

  return {
    tooltipContext,
    keyboardContext,
    interaction: toInteraction(tooltipContext),
    keyboardInteraction: toInteraction(keyboardContext),
    options,
  };
};

const DefaultPieTooltipContent = <TDatum,>({
  context,
  options,
}: {
  context: PieSliceContext<TDatum>;
  options: PieTooltipOptions<TDatum>;
}) => {
  const formattedValue = resolveFormattedChild(
    options.formatValue?.(context.value, context),
    String(context.value),
  );
  const formattedPercentage = resolveFormattedChild(
    options.formatPercentage?.(context.percentage, context),
    defaultPercentageLabel(context.percentage),
  );

  return (
    <div data-kamod-chart-tooltip-content="">
      <div data-kamod-chart-tooltip-label="">{context.label}</div>
      <div data-kamod-chart-tooltip-row="">
        <span
          aria-hidden="true"
          data-kamod-chart-tooltip-swatch=""
          style={{ background: context.color }}
        />
        <span>
          {formattedValue} ({formattedPercentage})
        </span>
      </div>
    </div>
  );
};

const announcePieTooltip = <TDatum,>(
  context: PieSliceContext<TDatum>,
  options: PieTooltipOptions<TDatum>,
): string => {
  const formattedValue = resolveFormattedChild(
    options.formatValue?.(context.value, context),
    String(context.value),
  );
  const formattedPercentage = resolveFormattedChild(
    options.formatPercentage?.(context.percentage, context),
    defaultPercentageLabel(context.percentage),
  );

  return `${context.label}: ${toAnnouncementText(formattedValue, String(context.value))} (${toAnnouncementText(formattedPercentage, defaultPercentageLabel(context.percentage))})`;
};

export const PieActiveOverlay = <TDatum,>(props: PieActiveOverlayProps<TDatum>) => {
  const { tooltipContext, keyboardContext, interaction, keyboardInteraction, options } =
    usePieActiveState(props);

  if (!options) {
    return null;
  }

  return (
    <>
      {tooltipContext && interaction ? (
        <Tooltip interaction={interaction} placement={options.placement} offset={options.offset}>
          {() =>
            options.render ? (
              options.render(tooltipContext)
            ) : (
              <DefaultPieTooltipContent context={tooltipContext} options={options} />
            )
          }
        </Tooltip>
      ) : null}
      <LiveRegion
        interaction={keyboardInteraction}
        format={() => (keyboardContext ? announcePieTooltip(keyboardContext, options) : "")}
      />
    </>
  );
};
