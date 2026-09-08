import { barKey, type ChartAnimate } from "../../animation";
import { resolveBarGeometryFill } from "../../charts/bar-fill";
import { type BarGeometry, resolveBarGeometry } from "../../charts/bar-geometry";
import { BarMarks, type BarMarksProps } from "../../charts/bar-marks";
import { roundedRectPath } from "../../charts/bar-path";
import {
  resolveBarValueLabelPresentation,
  barValueLabelUsesFormat,
} from "../../charts/bar-value-label";
import { useChartContext } from "../../core";
import { AnimatedValue } from "../animated-value";
import { lerp } from "../interpolate";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

interface MotionBarMark<TDatum> {
  key: string;
  bar: BarGeometry<TDatum>;
  x: number;
  y: number;
  width: number;
  height: number;
  baselineX: number;
  baselineY: number;
  radius: number;
  horizontal: boolean;
}

export const MotionBarMarks = <TDatum,>(
  props: BarMarksProps<TDatum> & { animate?: ChartAnimate },
) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <BarMarks {...props} />;
  }

  return <AnimatedBarMarks {...props} />;
};

const AnimatedBarMarks = <TDatum,>({
  data,
  xKey,
  series,
  yDomain,
  stacked,
  grouped,
  horizontal,
  radius,
  minBarSize,
  maxBarSize,
  valueLabels,
  activeIndex,
  activeSeriesIndex,
  onBarClick,
  animate,
}: BarMarksProps<TDatum> & { animate?: ChartAnimate }) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { plotArea } = useChartContext<TDatum>();
  const bars = resolveBarGeometry({
    data,
    series,
    xKey,
    yDomain,
    stacked,
    grouped,
    horizontal,
    minBarSize,
    maxBarSize,
    plotWidth: plotArea.width,
    plotHeight: plotArea.height,
  });
  const motionBars: MotionBarMark<TDatum>[] = bars
    .filter((bar) => bar.defined)
    .map((bar) => {
      const baseline = stacked
        ? horizontal
          ? bar.x + (bar.value != null && bar.value < 0 ? bar.width : 0)
          : bar.y + (bar.value != null && bar.value < 0 ? 0 : bar.height)
        : horizontal
          ? bar.value != null && bar.value < 0
            ? bar.x + bar.width
            : bar.x
          : bar.value != null && bar.value < 0
            ? bar.y
            : bar.y + bar.height;

      return {
        key: barKey(bar.seriesId, bar.category),
        bar,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        baselineX: horizontal ? baseline : bar.x,
        baselineY: horizontal ? bar.y : baseline,
        radius,
        horizontal,
      };
    });
  const targetKey = `${plotArea.width}x${plotArea.height}::${motionBars
    .map((bar) => `${bar.key}:${bar.x}:${bar.y}:${bar.width}:${bar.height}`)
    .join("|")}`;
  const displayed = useKeyedTransition(motionBars, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    enterOrigin: (bar) =>
      bar.horizontal
        ? { ...bar, x: bar.baselineX, width: 0 }
        : { ...bar, y: bar.baselineY, height: 0 },
    exitTarget: (bar) =>
      bar.horizontal
        ? { ...bar, x: bar.baselineX, width: 0 }
        : { ...bar, y: bar.baselineY, height: 0 },
    interpolate: (from, to, t) => ({
      ...to,
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      width: lerp(from.width, to.width, t),
      height: lerp(from.height, to.height, t),
    }),
  });

  return (
    <g data-kamod-chart-bars="" data-kamod-chart-motion="">
      {displayed.map((entry) => {
        const { bar } = entry;
        const isActive = activeIndex === bar.index && activeSeriesIndex === bar.seriesIndex;
        const fill = resolveBarGeometryFill(bar, {
          orientation: horizontal ? "horizontal" : "vertical",
          stacked,
          active: isActive,
        });
        const label = resolveBarValueLabelPresentation(
          bar,
          bars,
          { x: entry.x, y: entry.y, width: entry.width, height: entry.height },
          {
            chartValueLabels: valueLabels,
            horizontal,
            stacked,
            active: isActive,
          },
        );

        return (
          <g key={entry.key} data-kamod-chart-key={entry.key} data-kamod-chart-phase={entry.phase}>
            <path
              d={roundedRectPath(entry.x, entry.y, entry.width, entry.height, entry.radius)}
              fill={fill}
              data-kamod-chart-bar=""
              data-kamod-chart-key={entry.key}
              data-kamod-chart-phase={entry.phase}
              data-kamod-chart-series-id={bar.seriesId}
              data-kamod-chart-index={String(bar.index)}
              data-kamod-chart-active={isActive ? "true" : undefined}
              onClick={
                onBarClick && bar.value != null
                  ? () => onBarClick(bar.datum, bar.seriesId, bar.index, bar.value as number)
                  : undefined
              }
            />
            {label ? (
              <text
                x={label.layout.x}
                y={label.layout.y}
                text-anchor={label.layout.textAnchor}
                dominant-baseline={label.layout.dominantBaseline}
                fill={label.color}
                class={label.class}
                data-kamod-chart-value-label=""
              >
                {barValueLabelUsesFormat(valueLabels, bar) ? (
                  label.content
                ) : (
                  <AnimatedValue value={label.animateValue} animate={animate} />
                )}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
