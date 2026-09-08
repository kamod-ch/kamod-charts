import { useMemo } from "preact/hooks";
import { useCircularChartController } from "./circular-chart-controller";
import { CircularChartView } from "./circular-chart-view";
import { createDonutCenterContext, resolveDonutCenterContent } from "./donut-center-content";
import type { DonutChartProps } from "./types";

export const DonutChart = <TDatum,>({
  data,
  valueKey,
  labelKey,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  variant = "full",
  innerRadiusRatio = 0.68,
  outerRadius,
  padAngle = Math.PI / 90,
  cornerRadius = 6,
  sort = false,
  labels = "outside",
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
}: DonutChartProps<TDatum>) => {
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
      title={title}
      description={description}
      id={id}
      controller={controller}
      onSegmentClick={onSegmentClick}
      animate={animate}
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
        labels,
      }}
      seriesProps={{
        innerRadiusRatio,
        variant,
        outerRadius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        labels,
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
