import { useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { Chart, normalizeAccessor } from "../core";
import { PieSeries as StaticPieSeries } from "../series";
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
  colors,
  centerContent,
  onSegmentClick,
  animate,
}: PieChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const PieSeries = (motion.slots.PieSeries ?? StaticPieSeries) as typeof StaticPieSeries;
  const [activeIndex, setActiveIndex] = useState(0);
  const pointCount = data.length;
  const readValue = normalizeAccessor(valueKey);

  return (
    <Chart
      data={data}
      width={width}
      height={height}
      initialWidth={initialWidth}
      responsive={responsive}
      title={title}
      description={description}
      id={id}
      tabIndex={0}
      onKeyDown={(event) => {
        if (pointCount === 0) {
          return;
        }

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((index) => Math.min(index + 1, pointCount - 1));
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Home") {
          event.preventDefault();
          setActiveIndex(0);
        } else if (event.key === "End") {
          event.preventDefault();
          setActiveIndex(pointCount - 1);
        } else if (event.key === "Escape") {
          event.preventDefault();
          setActiveIndex(0);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const datum = data[activeIndex];
          if (datum) {
            const raw = readValue(datum, activeIndex);
            const value = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
            onSegmentClick?.(datum, activeIndex, value);
          }
        }
      }}
    >
      <PieSeries
        valueKey={valueKey}
        labelKey={labelKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        padAngle={padAngle}
        cornerRadius={cornerRadius}
        sort={sort}
        activeIndex={activeIndex}
        colors={colors}
        labelPosition={labels}
        centerContent={centerContent}
        onSegmentClick={onSegmentClick}
        {...(animate === undefined ? {} : { animate })}
      />
    </Chart>
  );
};
