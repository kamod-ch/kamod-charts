import { describe, expect, it } from "vitest";
import type {
  ChartChromeProps,
  CartesianSurfaceChartProps,
} from "../src/charts/chart-chrome-props";
import type {
  AreaChartProps,
  BarChartProps,
  DonutChartProps,
  LineChartProps,
  PieChartProps,
  ScatterChartProps,
} from "../src/charts/types";
import type {
  AreaChartProps as MotionAreaChartProps,
  BarChartProps as MotionBarChartProps,
  DonutChartProps as MotionDonutChartProps,
  LineChartProps as MotionLineChartProps,
  PieChartProps as MotionPieChartProps,
  ScatterChartProps as MotionScatterChartProps,
} from "../src/motion/charts";

type Row = { label: string; value: number };

const sharedChrome: ChartChromeProps = {
  class: "kamod-chart",
  style: { minHeight: "12rem" },
  svgRef: undefined,
  svgProps: {
    "aria-label": "Revenue",
    preserveAspectRatio: "xMidYMid meet",
    "data-testid": "chart-svg",
  },
  defs: null,
  title: "Title",
  description: "Description",
  id: "chart-1",
  width: 400,
  height: 280,
  initialWidth: 640,
  responsive: true,
  aspectRatio: 16 / 9,
};

const cartesianOnly: Pick<
  CartesianSurfaceChartProps,
  "clipPlotArea" | "tickCollision" | "maxTickLabelLength"
> = {
  clipPlotArea: true,
  tickCollision: "truncate",
  maxTickLabelLength: 12,
};

function assertCartesianProps(props: LineChartProps<Row>): LineChartProps<Row> {
  return props;
}

function assertPieProps(props: PieChartProps<Row>): PieChartProps<Row> {
  return props;
}

describe("svg surface API parity (types)", () => {
  it("accepts shared chrome on every high-level chart family", () => {
    const line = assertCartesianProps({
      ...sharedChrome,
      ...cartesianOnly,
      data: [],
      series: [{ key: "value", id: "v" }],
    });
    const area: AreaChartProps<Row> = {
      ...sharedChrome,
      ...cartesianOnly,
      data: [],
      series: [{ key: "value", id: "v" }],
    };
    const bar: BarChartProps<Row> = {
      ...sharedChrome,
      ...cartesianOnly,
      data: [],
      series: [{ key: "value", id: "v" }],
    };
    const scatter: ScatterChartProps<Row> = {
      ...sharedChrome,
      ...cartesianOnly,
      data: [],
      series: [{ key: "value", id: "v" }],
    };
    const pie = assertPieProps({
      ...sharedChrome,
      data: [],
      valueKey: "value",
    });
    const donut: DonutChartProps<Row> = {
      ...sharedChrome,
      data: [],
      valueKey: "value",
    };

    const motionLine: MotionLineChartProps<Row> = line;
    const motionPie: MotionPieChartProps<Row> = pie;
    const motionArea: MotionAreaChartProps<Row> = area;
    const motionBar: MotionBarChartProps<Row> = bar;
    const motionScatter: MotionScatterChartProps<Row> = scatter;
    const motionDonut: MotionDonutChartProps<Row> = donut;

    expect(motionLine.series).toHaveLength(1);
    expect(motionPie.valueKey).toBe("value");
    expect(motionArea.series).toHaveLength(1);
    expect(motionBar.series).toHaveLength(1);
    expect(motionScatter.series).toHaveLength(1);
    expect(motionDonut.valueKey).toBe("value");
  });
});

// Compile-time: cartesian-only keys must not appear on circular chart props.
const _pieClipRejected: PieChartProps<Row> = {
  ...sharedChrome,
  data: [],
  valueKey: "value",
  // @ts-expect-error clipPlotArea is cartesian-only
  clipPlotArea: true,
};

const _donutTickRejected: DonutChartProps<Row> = {
  ...sharedChrome,
  data: [],
  valueKey: "value",
  // @ts-expect-error tickCollision is cartesian-only
  tickCollision: "hide",
};

export { _pieClipRejected, _donutTickRejected };
