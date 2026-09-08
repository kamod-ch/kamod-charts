import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { LineChart as StaticLineChart } from "../src/charts/line-chart";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import { LineChart as MotionLineChart } from "../src/motion";
import { createLinearScale, inferStackedDomain } from "../src";
import { getStackedValues } from "../src/series";

interface Datum {
  month: string;
  revenue: number | null;
  costs: number;
  losses: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: 20, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

const sparseData: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: null, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

const baseProps = {
  data,
  xKey: "month" as const,
  xScale: "point" as const,
  width: CHART_WIDTH,
  height: CHART_HEIGHT,
};

const seriesPair = [
  { key: "revenue" as const, id: "revenue", label: "Revenue" },
  { key: "costs" as const, id: "costs", label: "Costs", color: "var(--chart-2)" },
];

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

const stackedY1 = (
  series: readonly { id: string; value: "revenue" | "costs" | "losses" }[],
  seriesId: string,
  index: number,
): number => {
  const layers = getStackedValues(data, series);
  const layerIndex = series.findIndex((entry) => entry.id === seriesId);
  const point = layers[layerIndex]?.[index];
  if (!point) {
    throw new Error(`missing stack point for ${seriesId}@${index}`);
  }
  return point.y1;
};

describe("Stacked LineChart", () => {
  it("renders stacked line series markup", () => {
    const markup = renderToString(
      <StaticLineChart {...baseProps} series={seriesPair} stacked showPoints />,
    );
    expect(markup).toContain("data-kamod-chart-stacked-line-series");
    expect(markup).toContain("data-kamod-chart-line-series");
    expect(markup).not.toContain("NaN");
  });

  it("accumulates two positive series on cumulative y1 geometry", () => {
    const stackSeries = [
      { id: "revenue", value: "revenue" as const },
      { id: "costs", value: "costs" as const },
    ];
    const yDomain = inferStackedDomain(data, stackSeries);
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const yScale = createLinearScale({
      domain: yDomain,
      range: [plot.height, 0],
    });

    const { container } = render(
      <StaticLineChart {...baseProps} series={seriesPair} stacked showPoints />,
    );

    const revenueCircle = container.querySelector("[data-kamod-chart-series-id='revenue'] circle");
    const costsCircle = container.querySelector("[data-kamod-chart-series-id='costs'] circle");
    expect(revenueCircle).not.toBeNull();
    expect(costsCircle).not.toBeNull();

    const expectedRevenueY = yScale(stackedY1(stackSeries, "revenue", 0));
    const expectedCostsY = yScale(stackedY1(stackSeries, "costs", 0));
    expect(Number(revenueCircle?.getAttribute("cy"))).toBeCloseTo(expectedRevenueY, 4);
    expect(Number(costsCircle?.getAttribute("cy"))).toBeCloseTo(expectedCostsY, 4);
    expect(expectedCostsY).toBeLessThan(expectedRevenueY);
  });

  it("uses separate baselines for positive and negative stacks", () => {
    const stackSeries = [
      { id: "revenue", value: "revenue" as const },
      { id: "losses", value: "losses" as const },
    ];
    const yDomain = inferStackedDomain(data, stackSeries);
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const yScale = createLinearScale({
      domain: yDomain,
      range: [plot.height, 0],
    });

    const { container } = render(
      <StaticLineChart
        {...baseProps}
        series={[
          { key: "revenue", id: "revenue" },
          { key: "losses", id: "losses", color: "var(--chart-2)" },
        ]}
        stacked
        showPoints
      />,
    );

    const revenueY = yScale(stackedY1(stackSeries, "revenue", 0));
    const lossesY = yScale(stackedY1(stackSeries, "losses", 0));
    const revenueCircle = container.querySelector("[data-kamod-chart-series-id='revenue'] circle");
    const lossesCircle = container.querySelector("[data-kamod-chart-series-id='losses'] circle");

    expect(Number(revenueCircle?.getAttribute("cy"))).toBeCloseTo(revenueY, 4);
    expect(Number(lossesCircle?.getAttribute("cy"))).toBeCloseTo(lossesY, 4);
    expect(lossesY).toBeGreaterThan(revenueY);
  });

  it("recomputes stack and domain when a series is hidden via legend", () => {
    const legendData = [
      { month: "Jan", revenue: 10, costs: 5, losses: 0 },
      { month: "Feb", revenue: 50, costs: 5, losses: 0 },
    ];
    const legendSeries = [
      { key: "revenue" as const, id: "revenue", label: "Revenue" },
      { key: "costs" as const, id: "costs", label: "Costs" },
    ];

    const { container } = render(
      <StaticLineChart
        data={legendData}
        xKey="month"
        xScale="point"
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        series={legendSeries}
        stacked
        showLegend
        showPoints
      />,
    );

    const costsCircleBefore = container.querySelector(
      "[data-kamod-chart-series-id='costs'] circle",
    );
    const yBefore = Number(costsCircleBefore?.getAttribute("cy"));

    const revenueLegend = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
      (button) => button.textContent?.includes("Revenue"),
    );
    if (!revenueLegend) {
      throw new Error("expected revenue legend item");
    }

    fireEvent.click(revenueLegend);
    expect(container.querySelector("[data-kamod-chart-series-id='revenue']")).toBeNull();
    expect(container.querySelectorAll("[data-kamod-chart-line-series]")).toHaveLength(1);

    const costsCircleAfter = container.querySelector("[data-kamod-chart-series-id='costs'] circle");
    const yAfter = Number(costsCircleAfter?.getAttribute("cy"));
    expect(yBefore).not.toBeCloseTo(yAfter, 0);
  });

  it("shows raw tooltip values while anchoring markers on cumulative y1", () => {
    const { container } = render(
      <StaticLineChart {...baseProps} series={seriesPair} stacked tooltip showPoints />,
    );
    const surface = requireSurface(container);

    fireEvent.keyDown(surface, { key: "Home" });
    fireEvent.keyDown(surface, { key: "ArrowDown" });

    const tooltip = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(tooltip).toContain("Revenue: 10");
    expect(tooltip).toContain("Costs: 4");
    expect(tooltip).not.toContain("14");

    const activeMarker = container.querySelector(
      '[data-kamod-chart-series-id="costs"] [data-kamod-chart-active="true"]',
    );
    expect(activeMarker).not.toBeNull();

    const stackSeries = [
      { id: "revenue", value: "revenue" as const },
      { id: "costs", value: "costs" as const },
    ];
    const yDomain = inferStackedDomain(data, stackSeries);
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const yScale = createLinearScale({
      domain: yDomain,
      range: [plot.height, 0],
    });
    expect(Number(activeMarker?.getAttribute("cy"))).toBeCloseTo(
      yScale(stackedY1(stackSeries, "costs", 0)),
      4,
    );
  });

  it("respects connectNulls=false with gaps and connectNulls=true without NaN", () => {
    const disconnected = renderToString(
      <StaticLineChart
        data={sparseData}
        xKey="month"
        xScale="point"
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        series={seriesPair}
        stacked
        connectNulls={false}
      />,
    );
    const connected = renderToString(
      <StaticLineChart
        data={sparseData}
        xKey="month"
        xScale="point"
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        series={seriesPair}
        stacked
        connectNulls
      />,
    );

    const revenueDisconnected = disconnected.match(
      /data-kamod-chart-series-id="revenue"[\s\S]*?<path d="([^"]+)"/,
    )?.[1];
    const revenueConnected = connected.match(
      /data-kamod-chart-series-id="revenue"[\s\S]*?<path d="([^"]+)"/,
    )?.[1];

    expect(revenueDisconnected).toBeTruthy();
    expect(revenueConnected).toBeTruthy();
    expect(revenueDisconnected).not.toBe(revenueConnected);
    expect(revenueConnected).not.toContain("NaN");
    expect(revenueDisconnected).not.toContain("NaN");
  });

  it("renders valid SVG on SSR and responsive initial render", () => {
    const ssr = renderToString(
      <StaticLineChart
        {...baseProps}
        series={seriesPair}
        stacked
        initialWidth={640}
        responsive
        showPoints
      />,
    );
    expect(ssr).toContain("data-kamod-chart-stacked-line-series");
    expect(ssr).not.toMatch(/d="[^"]*NaN/);
    expect(ssr).not.toMatch(/cy="NaN"/);
  });

  it("supports motion and reduced-motion stacked rendering", () => {
    const motion = renderToString(
      <MotionLineChart
        {...baseProps}
        series={seriesPair}
        stacked
        showPoints
        animate={{ reducedMotion: "never" }}
      />,
    );
    const reduced = renderToString(
      <MotionLineChart
        {...baseProps}
        series={seriesPair}
        stacked
        showPoints
        animate={{ reducedMotion: "always" }}
      />,
    );

    expect(motion).toContain("data-kamod-chart-motion");
    expect(reduced).toContain("data-kamod-chart-stacked-line-series");
    expect(motion).not.toContain("NaN");
    expect(reduced).not.toContain("NaN");
  });
});

describe("Non-stacked LineChart regression", () => {
  it("keeps the unstacked multi-series rendering path", () => {
    const markup = renderToString(
      <StaticLineChart {...baseProps} series={seriesPair} showPoints />,
    );
    expect(markup).toContain("data-kamod-chart-line-series");
    expect(markup).not.toContain("data-kamod-chart-stacked-line-series");
    expect(markup.match(/data-kamod-chart-line-series/g)?.length).toBe(2);
  });
});
