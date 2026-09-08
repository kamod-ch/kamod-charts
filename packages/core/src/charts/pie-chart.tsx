import { useCircularChartController } from "./circular-chart-controller";
import { CircularChartView } from "./circular-chart-view";
import type { PieChartProps } from "./types";

export const PieChart = <TDatum,>({
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
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  labels = "inside",
  rose,
  colors,
  centerContent,
  emptyContent,
  activeOffset,
  tooltip = false,
  showLegend = false,
  legend,
  onSegmentClick,
  animate,
}: PieChartProps<TDatum>) => {
  const controller = useCircularChartController({
    data,
    valueKey,
    labelKey,
    colors,
    sort,
    legend,
    onSegmentClick,
  });
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
        innerRadius,
        outerRadius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        activeOffset,
        rose,
        labels,
      }}
      seriesProps={{
        innerRadius,
        outerRadius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        labels,
        activeOffset,
        rose,
      }}
      centerContent={centerContent}
      emptyContent={emptyContent}
    />
  );
};
