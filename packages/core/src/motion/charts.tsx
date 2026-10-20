import { AreaChart as StaticAreaChart } from "../charts/area-chart";
import { BarChart as StaticBarChart } from "../charts/bar-chart";
import { LineChart as StaticLineChart } from "../charts/line-chart";
import { PieChart as StaticPieChart } from "../charts/pie-chart";
import { DonutChart as StaticDonutChart } from "../charts/donut-chart";
import { ScatterChart as StaticScatterChart } from "../charts/scatter-chart";
import type {
  AreaChartProps,
  BarChartProps,
  DonutChartProps,
  LineChartProps,
  PieChartProps,
  ScatterChartProps,
} from "../charts/types";
import { MotionConfig } from "./config";

export const LineChart = <TDatum,>(props: LineChartProps<TDatum>) => (
  <MotionConfig>
    <StaticLineChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export const AreaChart = <TDatum,>(props: AreaChartProps<TDatum>) => (
  <MotionConfig>
    <StaticAreaChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export const BarChart = <TDatum,>(props: BarChartProps<TDatum>) => (
  <MotionConfig>
    <StaticBarChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export const PieChart = <TDatum,>(props: PieChartProps<TDatum>) => (
  <MotionConfig>
    <StaticPieChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export const DonutChart = <TDatum,>(props: DonutChartProps<TDatum>) => (
  <MotionConfig>
    <StaticDonutChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export const ScatterChart = <TDatum,>(props: ScatterChartProps<TDatum>) => (
  <MotionConfig>
    <StaticScatterChart {...props} animate={props.animate ?? true} />
  </MotionConfig>
);

export type {
  AreaChartProps,
  BarChartProps,
  DonutChartProps,
  LineChartProps,
  PieChartProps,
  ScatterChartProps,
} from "../charts/types";
