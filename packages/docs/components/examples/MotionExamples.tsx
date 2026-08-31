import { LineChart as StaticLineChart } from "@kamod-ch/charts/line";
import {
  AreaChart,
  BarChart,
  LineChart,
  MotionConfig,
  PieChart,
  ScatterChart,
} from "@kamod-ch/charts/motion";
import { chartColors, halfYearMetrics, monthlyMetrics } from "../../data/datasets";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const pieData = [
  { label: "Product", value: 42 },
  { label: "Services", value: 31 },
  { label: "Other", value: 27 },
];

export function MotionExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="static-vs-animated"
        title="Static versus animated line"
        description="The static entry never loads Motion. The motion entry reveals the path once, then morphs on updates."
        badges={["Optional peer", "SSR final geometry"]}
        preview={
          <div class="grid gap-6 lg:grid-cols-2">
            <StaticLineChart
              data={halfYearMetrics}
              xKey="month"
              xScale="point"
              series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
              height={220}
              initialWidth={360}
              responsive
              showGrid
              title="Static line"
            />
            <LineChart
              data={halfYearMetrics}
              xKey="month"
              xScale="point"
              series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
              height={220}
              initialWidth={360}
              responsive
              showGrid
              tooltip
              title="Animated line"
            />
          </div>
        }
        code={`import { LineChart as StaticLineChart } from "@kamod-ch/charts/line";
import { LineChart } from "@kamod-ch/charts/motion";

<StaticLineChart data={data} xKey="month" xScale="point" series={[{ key: "revenue" }]} height={220} />
<LineChart data={data} xKey="month" xScale="point" series={[{ key: "revenue" }]} height={220} />`}
      />

      <ExampleFrame
        id="area-bar"
        title="Area and bar"
        description="Area uses a first-enter path reveal. Bars grow from the value baseline, including negatives."
        preview={
          <div class="grid gap-6 lg:grid-cols-2">
            <AreaChart
              data={monthlyMetrics}
              xKey="month"
              xScale="point"
              series={[
                { key: "revenue", label: "Revenue", color: chartColors.primary },
                { key: "costs", label: "Costs", color: chartColors.secondary },
              ]}
              height={240}
              initialWidth={360}
              responsive
              showGrid
              title="Animated area"
            />
            <BarChart
              data={halfYearMetrics}
              xKey="month"
              series={[
                { key: "revenue", label: "Revenue", color: chartColors.primary },
                { key: "costs", label: "Costs", color: chartColors.secondary },
              ]}
              height={240}
              initialWidth={360}
              responsive
              showGrid
              tooltip
              title="Animated bars"
            />
          </div>
        }
        code={`import { AreaChart, BarChart } from "@kamod-ch/charts/motion";

<AreaChart data={data} xKey="month" xScale="point" series={series} height={240} />
<BarChart data={data} xKey="month" series={series} height={240} tooltip />`}
      />

      <ExampleFrame
        id="pie-scatter"
        title="Pie and scatter"
        description="Pie slices keep label keys while angles and radii change. Scatter tweens position, radius, and opacity."
        preview={
          <div class="grid gap-6 lg:grid-cols-2">
            <PieChart
              data={pieData}
              valueKey="value"
              labelKey="label"
              height={240}
              initialWidth={360}
              responsive
              innerRadius={48}
              title="Animated donut"
            />
            <ScatterChart
              data={halfYearMetrics}
              xKey="month"
              xScale="point"
              series={[{ key: "customers", label: "Customers", color: chartColors.primary }]}
              height={240}
              initialWidth={360}
              responsive
              showGrid
              tooltip
              title="Animated scatter"
            />
          </div>
        }
        code={`import { PieChart, ScatterChart } from "@kamod-ch/charts/motion";

<PieChart data={slices} valueKey="value" labelKey="label" innerRadius={48} height={240} />
<ScatterChart data={data} xKey="month" xScale="point" series={[{ key: "customers" }]} height={240} />`}
      />

      <ExampleFrame
        id="reduced-motion"
        title="Reduced motion"
        description="always jumps to the final frame. user follows the operating-system preference."
        preview={
          <MotionConfig reducedMotion="always">
            <LineChart
              data={halfYearMetrics}
              xKey="month"
              xScale="point"
              series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
              height={220}
              initialWidth={640}
              responsive
              showGrid
              title="Reduced motion line"
            />
          </MotionConfig>
        }
        code={`import { LineChart, MotionConfig } from "@kamod-ch/charts/motion";

<MotionConfig reducedMotion="always">
  <LineChart data={data} xKey="month" xScale="point" series={[{ key: "revenue" }]} height={220} />
</MotionConfig>`}
      />
    </div>
  );
}
