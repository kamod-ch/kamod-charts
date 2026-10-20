import { useMemo } from "preact/hooks";
import { useCircularChartController } from "./circular-chart-controller";
import { CircularChartView } from "./circular-chart-view";
import { createDonutCenterContext, resolveDonutCenterContent } from "./donut-center-content";
import type { DonutChartProps, DonutVariant } from "./types";
import type { PieLabels } from "../series/pie-label";

/** Default slice labels: outside on full rings, none on half donuts (flat edge). */
export const resolveDonutChartLabels = <TDatum,>(
  variant: DonutVariant,
  labels?: PieLabels<TDatum>,
): PieLabels<TDatum> => labels ?? (variant === "half" ? "none" : "outside");

export const DonutChart = <TDatum,>({
  data,
  valueKey,
  labelKey,
  width,
  height,
  initialWidth,
  responsive,
  aspectRatio,
  class: className,
  style,
  title,
  description,
  id,
  variant = "full",
  innerRadiusRatio = 0.68,
  outerRadius,
  padAngle = Math.PI / 90,
  cornerRadius = 6,
  sort = false,
  labels,
  colors,
  showTotal = true,
  formatTotal,
  centerContent,
  emptyContent,
  activeOffset = 3,
  tooltip = false,
  showLegend = false,
  legend,
  onSegmentClick,
  animate,
  svgRef,
  svgProps,
  defs,
}: DonutChartProps<TDatum>) => {
  const resolvedLabels = resolveDonutChartLabels(variant, labels);
  const controller = useCircularChartController({
    data,
    valueKey,
    labelKey,
    colors,
    sort,
    legend,
    onSegmentClick,
  });

  const resolvedCenterContent = useMemo(() => {
    const context = createDonutCenterContext({
      data,
      variant,
      centerMetrics: controller.centerMetrics,
    });

    return resolveDonutCenterContent({
      centerContent,
      showTotal,
      formatTotal,
      context,
    });
  }, [centerContent, controller.centerMetrics, data, formatTotal, showTotal, variant]);

  return (
    <CircularChartView
      data={data}
      width={width}
      height={height}
      initialWidth={initialWidth}
      responsive={responsive}
      aspectRatio={aspectRatio}
      class={className}
      style={style}
      title={title}
      description={description}
      id={id}
      controller={controller}
      onSegmentClick={onSegmentClick}
      animate={animate}
      svgRef={svgRef}
      svgProps={svgProps}
      defs={defs}
      overlay={{
        tooltip,
        showLegend,
        valueKey,
        labelKey,
        innerRadiusRatio,
        variant,
        outerRadius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        activeOffset,
        labels: resolvedLabels,
      }}
      seriesProps={{
        innerRadiusRatio,
        variant,
        outerRadius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        labels: resolvedLabels,
        activeOffset,
      }}
      centerContent={resolvedCenterContent}
      emptyContent={emptyContent}
    />
  );
};

export type {
  DonutCenterContext,
  DonutCenterContent,
  DonutChartProps,
  DonutFormatTotal,
  DonutVariant,
} from "./types";
