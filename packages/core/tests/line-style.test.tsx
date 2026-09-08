import {
  curveBasis,
  curveMonotoneX,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line,
  type CurveFactory,
} from "d3-shape";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { render } from "./testing-library";
import { LineChart as StaticLineChart } from "../src/charts/line-chart";
import { LineChart as MotionLineChart } from "../src/motion";
import { Chart, LineSeries } from "../src";
import type { LineCurve } from "../src/series";
import type { CartesianPoint } from "../src/series/cartesian";
import { buildLinePath } from "../src/series/paths";

interface Datum {
  month: string;
  revenue: number;
  forecast: number;
  costs: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, forecast: 12, costs: 4 },
  { month: "Feb", revenue: 20, forecast: 18, costs: 8 },
  { month: "Mar", revenue: 15, forecast: 22, costs: 6 },
];

const baseProps = {
  data,
  xKey: "month" as const,
  xScale: "point" as const,
  width: 640,
  height: 320,
};

const samplePoints: CartesianPoint<Record<string, never>>[] = [
  { x: 0, y: 100, defined: true, datum: {}, index: 0, xValue: 0, yValue: 100 },
  { x: 100, y: 50, defined: true, datum: {}, index: 1, xValue: 100, yValue: 50 },
  { x: 200, y: 100, defined: true, datum: {}, index: 2, xValue: 200, yValue: 100 },
];

const linePathWith = (curve: CurveFactory) =>
  line<CartesianPoint<Record<string, never>>>()
    .x((point) => point.x ?? 0)
    .y((point) => point.y ?? 0)
    .curve(curve)(samplePoints);

const extractSeriesPath = (markup: string, seriesId: string) =>
  markup.match(
    new RegExp(`data-kamod-chart-series-id="${seriesId}"[^>]*>[\\s\\S]*?<path([^>]*)>`),
  )?.[1];

describe("LineChart line styles", () => {
  it("prefers series overrides over chart-level defaults", () => {
    const { container } = render(
      <StaticLineChart
        {...baseProps}
        strokeWidth={2}
        pointRadius={3}
        showPoints={false}
        series={[
          { key: "revenue", id: "revenue", strokeWidth: 5, pointRadius: 6, showPoints: true },
          { key: "costs", id: "costs" },
        ]}
      />,
    );

    const revenuePath = container.querySelector("[data-kamod-chart-series-id='revenue'] path");
    const costsPath = container.querySelector("[data-kamod-chart-series-id='costs'] path");
    const revenueCircles = container.querySelectorAll(
      "[data-kamod-chart-series-id='revenue'] circle",
    );
    const costsCircles = container.querySelectorAll("[data-kamod-chart-series-id='costs'] circle");

    expect(revenuePath?.getAttribute("stroke-width")).toBe("5");
    expect(costsPath?.getAttribute("stroke-width")).toBe("2");
    expect(revenueCircles.length).toBeGreaterThan(0);
    expect(costsCircles).toHaveLength(0);
    expect(revenueCircles[0]?.getAttribute("r")).toBe("6");
  });

  it("renders solid and dashed series simultaneously", () => {
    const markup = renderToString(
      <StaticLineChart
        {...baseProps}
        series={[
          { key: "revenue", id: "revenue" },
          { key: "forecast", id: "forecast", strokeDasharray: "8 4" },
        ]}
      />,
    );

    const revenuePath = extractSeriesPath(markup, "revenue");
    const forecastPath = extractSeriesPath(markup, "forecast");

    expect(revenuePath).toBeTruthy();
    expect(forecastPath).toBeTruthy();
    expect(revenuePath).not.toContain('stroke-dasharray="8 4"');
    expect(forecastPath).toContain('stroke-dasharray="8 4"');
  });

  it("forwards strokeWidth and pointRadius to SVG", () => {
    const { container } = render(
      <StaticLineChart
        {...baseProps}
        strokeWidth={4}
        pointRadius={3.5}
        showPoints
        series={[{ key: "revenue", id: "revenue" }]}
      />,
    );

    const path = container.querySelector("[data-kamod-chart-line-series] path");
    const circle = container.querySelector("[data-kamod-chart-line-series] circle");

    expect(path?.getAttribute("stroke-width")).toBe("4");
    expect(circle?.getAttribute("r")).toBe("3.5");
  });

  it("matches path styling attributes between static and motion line series", () => {
    const props = {
      ...baseProps,
      strokeWidth: 3,
      strokeDasharray: "5 2",
      showPoints: true as const,
      pointRadius: 4,
      series: [{ key: "revenue" as const, id: "revenue" }],
    };

    const staticMarkup = renderToString(<StaticLineChart {...props} />);
    const motionMarkup = renderToString(
      <MotionLineChart {...props} animate={{ reducedMotion: "never" }} />,
    );

    const staticPath = extractSeriesPath(staticMarkup, "revenue");
    const motionPath = extractSeriesPath(motionMarkup, "revenue");

    expect(staticPath).toContain('stroke-width="3"');
    expect(motionPath).toContain('stroke-width="3"');
    expect(staticPath).toContain('stroke-dasharray="5 2"');
    expect(motionPath).toContain('stroke-dasharray="5 2"');
  });

  it("preserves showPoints auto logic for small and large datasets", () => {
    const smallAuto = renderToString(
      <StaticLineChart
        {...baseProps}
        showPoints="auto"
        series={[{ key: "revenue", id: "revenue" }]}
      />,
    );
    expect(smallAuto).toContain("<circle");

    const largeData = Array.from({ length: 501 }, (_, index) => ({
      month: `M${index}`,
      revenue: index,
      forecast: index,
      costs: index,
    }));
    const largeAuto = renderToString(
      <StaticLineChart
        data={largeData}
        xKey="month"
        xScale="point"
        width={640}
        height={320}
        showPoints="auto"
        series={[{ key: "revenue", id: "revenue" }]}
      />,
    );
    expect(largeAuto).not.toContain("<circle");

    const largeForced = renderToString(
      <StaticLineChart
        data={largeData}
        xKey="month"
        xScale="point"
        width={640}
        height={320}
        showPoints
        series={[{ key: "revenue", id: "revenue" }]}
      />,
    );
    expect(largeForced).toContain("<circle");
  });

  it("keeps default rendering when no style props are set", () => {
    const markup = renderToString(
      <StaticLineChart {...baseProps} series={[{ key: "revenue", id: "revenue" }]} showPoints />,
    );

    const path = extractSeriesPath(markup, "revenue");
    expect(path).toContain('stroke-width="2"');
    expect(path).not.toContain("stroke-dasharray");
    expect(markup.match(/<circle[^>]*r="2\.5"/)?.length ?? 0).toBeGreaterThan(0);
  });

  it("enlarges the active point relative to pointRadius", () => {
    const { container } = render(
      <Chart {...baseProps}>
        <LineSeries dataKey="revenue" showPoints pointRadius={4} activeIndex={1} />
      </Chart>,
    );

    const circles = container.querySelectorAll("[data-kamod-chart-line-series] circle");
    expect(circles[0]?.getAttribute("r")).toBe("4");
    expect(circles[1]?.getAttribute("r")).toBe("5.5");
  });
});

describe("LineChart curve regressions", () => {
  const stepCases = [
    ["step", curveStep],
    ["stepBefore", curveStepBefore],
    ["stepAfter", curveStepAfter],
  ] as const satisfies ReadonlyArray<readonly [LineCurve, CurveFactory]>;

  for (const [curveName, d3Curve] of stepCases) {
    it(`buildLinePath with ${curveName} matches d3-shape`, () => {
      expect(buildLinePath(samplePoints, curveName, false)).toBe(linePathWith(d3Curve));
    });
  }

  it("step curves differ from linear for non-axis-aligned data", () => {
    const linear = buildLinePath(samplePoints, "linear", false);
    const stepped = buildLinePath(samplePoints, "step", false);
    expect(stepped).not.toBe(linear);
    expect(stepped).not.toContain("NaN");
  });

  it("buildLinePath preserves basis instead of falling back to linear", () => {
    const basis = buildLinePath(samplePoints, "basis", false);
    const linear = buildLinePath(samplePoints, "linear", false);
    expect(basis).not.toBe(linear);
    expect(basis).toBe(linePathWith(curveBasis));
  });

  it("buildLinePath preserves monotoneX", () => {
    expect(buildLinePath(samplePoints, "monotoneX", false)).toBe(linePathWith(curveMonotoneX));
  });

  const renderLineChart = (curve: LineCurve) =>
    renderToString(
      <StaticLineChart {...baseProps} curve={curve} series={[{ key: "revenue", id: "revenue" }]} />,
    );

  const extractLinePathD = (markup: string) =>
    markup.match(/data-kamod-chart-line-series[^>]*>[\s\S]*?<path d="([^"]+)"/)?.[1];

  it("LineChart renders distinct valid paths for each named curve", () => {
    const curves = [
      "linear",
      "monotoneX",
      "basis",
      "step",
      "stepBefore",
      "stepAfter",
    ] as const satisfies readonly LineCurve[];
    const paths = new Map(curves.map((curve) => [curve, extractLinePathD(renderLineChart(curve))]));

    for (const curve of curves) {
      const path = paths.get(curve);
      expect(path).toBeTruthy();
      expect(path).toMatch(/^M/);
      expect(path).not.toContain("NaN");
    }

    expect(paths.get("linear")).not.toBe(paths.get("step"));
    expect(paths.get("linear")).not.toBe(paths.get("basis"));
    expect(paths.get("step")).not.toBe(paths.get("stepBefore"));
    expect(paths.get("stepBefore")).not.toBe(paths.get("stepAfter"));
  });
});
