import type { ComponentChildren } from "preact";
import { useChartMotionContext } from "../animation/slots";
import { Chart } from "../core";
import { Legend } from "../primitives";
import { PieSeries as StaticPieSeries } from "../series";
import type { PieSeriesProps } from "../series/pie-series";
import type { CircularVariant } from "../series/pie-layout";
import type { CircularChartController } from "./circular-chart-controller";
import { PieActiveOverlay } from "./pie-active-layers";
import { isPieTooltipEnabled } from "./pie-tooltip-options";
import type { PieTooltipOptions } from "./types";

export interface CircularChartOverlayProps<TDatum> {
  tooltip?: boolean | PieTooltipOptions<TDatum>;
  showLegend?: boolean;
  valueKey: PieSeriesProps<TDatum>["valueKey"];
  labelKey?: PieSeriesProps<TDatum>["labelKey"];
  innerRadius?: number;
  innerRadiusRatio?: number;
  variant?: CircularVariant;
  outerRadius?: number;
  padAngle: number;
  cornerRadius: number;
  sort?: PieSeriesProps<TDatum>["sort"];
  colors?: readonly string[];
  activeOffset?: number;
  rose?: PieSeriesProps<TDatum>["rose"];
  labels?: PieSeriesProps<TDatum>["labels"];
}

export interface CircularChartViewProps<TDatum> {
  data: readonly TDatum[];
  width?: number;
  height: number;
  initialWidth?: number;
  responsive?: boolean;
  title?: string;
  description?: string;
  id?: string;
  controller: CircularChartController<TDatum>;
  overlay: CircularChartOverlayProps<TDatum>;
  seriesProps: Omit<
    PieSeriesProps<TDatum>,
    | "valueKey"
    | "labelKey"
    | "hiddenKeys"
    | "activeIndex"
    | "onSegmentClick"
    | "onSlicePointerEnter"
    | "onSlicePointerMove"
    | "onSlicePointerLeave"
  >;
  centerContent?: ComponentChildren;
  emptyContent?: ComponentChildren;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
  animate?: PieSeriesProps<TDatum>["animate"];
}

export const CircularChartView = <TDatum,>({
  data,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  controller,
  overlay,
  seriesProps,
  centerContent,
  emptyContent,
  onSegmentClick,
  animate,
}: CircularChartViewProps<TDatum>) => {
  const motion = useChartMotionContext();
  const PieSeries = (motion.slots.PieSeries ?? StaticPieSeries) as typeof StaticPieSeries;
  const tooltipEnabled = isPieTooltipEnabled(overlay.tooltip);
  const {
    hiddenKeys,
    activeIndex,
    keyboardIndex,
    pointerIndex,
    legendItems,
    legendInteractive,
    handleLegendToggle,
    handleSlicePointer,
    handleSlicePointerLeave,
    handleChartKeyDown,
  } = controller;

  const chartOverlay = (
    <>
      {overlay.showLegend ? (
        <Legend items={legendItems} onToggle={legendInteractive ? handleLegendToggle : undefined} />
      ) : null}
      {tooltipEnabled ? (
        <PieActiveOverlay
          keyboardIndex={keyboardIndex}
          pointerIndex={pointerIndex}
          tooltip={overlay.tooltip}
          valueKey={overlay.valueKey}
          labelKey={overlay.labelKey}
          innerRadius={overlay.innerRadius}
          innerRadiusRatio={overlay.innerRadiusRatio}
          variant={overlay.variant}
          outerRadius={overlay.outerRadius}
          padAngle={overlay.padAngle}
          cornerRadius={overlay.cornerRadius}
          sort={overlay.sort}
          colors={overlay.colors}
          hiddenKeys={hiddenKeys}
          activeOffset={overlay.activeOffset}
          rose={overlay.rose}
          labels={overlay.labels}
        />
      ) : null}
    </>
  );

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
      style={tooltipEnabled ? { cursor: "default" } : undefined}
      onKeyDown={handleChartKeyDown}
      overlay={overlay.showLegend || tooltipEnabled ? chartOverlay : undefined}
    >
      <PieSeries
        valueKey={overlay.valueKey}
        labelKey={overlay.labelKey}
        hiddenKeys={hiddenKeys}
        activeIndex={activeIndex}
        centerContent={centerContent}
        emptyContent={emptyContent}
        onSegmentClick={onSegmentClick}
        onSlicePointerEnter={
          tooltipEnabled ? (event) => handleSlicePointer(event.context.index) : undefined
        }
        onSlicePointerMove={
          tooltipEnabled ? (event) => handleSlicePointer(event.context.index) : undefined
        }
        onSlicePointerLeave={tooltipEnabled ? handleSlicePointerLeave : undefined}
        {...seriesProps}
        {...(animate === undefined ? {} : { animate })}
      />
    </Chart>
  );
};
