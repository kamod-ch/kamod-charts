import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { AreaChart, Chart, AreaSeries, StackedAreaSeries } from "../src";
import { createAreaGradientId } from "../src/series/area-style";

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
  { month: "Mar", revenue: Number.NaN, costs: 6, losses: -3 },
];

const baseChartProps = {
  data,
  xKey: "month" as const,
  xScale: "point" as const,
  width: 640,
  height: 320,
};

const extractAreaPaths = (markup: string) =>
  [...markup.matchAll(/data-kamod-chart-area-series[^>]*>[\s\S]*?<path([^>]*)>/g)].map(
    (match) => match[1] ?? "",
  );

const extractGradientIds = (markup: string) =>
  [...markup.matchAll(/<linearGradient id="([^"]+)"/g)].map((match) => match[1]);

describe("Area fill, stroke and markers", () => {
  it("keeps solid fill backward compatible", () => {
    const markup = renderToString(
      <AreaChart
        {...baseChartProps}
        id="solid-chart"
        series={[{ key: "revenue", id: "revenue" }]}
        opacity={0.2}
      />,
    );

    expect(markup).not.toContain("<linearGradient");
    expect(markup).not.toContain("<defs");
    expect(markup).toContain('fill="var(--chart-1)"');
    expect(markup).toContain('fill-opacity="0.2"');
    expect(markup).toContain('stroke="none"');
    expect(markup).not.toContain("<circle");
  });

  it("renders gradient defs, stops, direction and url(#id) reference", () => {
    const markup = renderToString(
      <AreaChart
        {...baseChartProps}
        id="gradient-chart"
        series={[{ key: "revenue", id: "revenue", color: "var(--chart-2)" }]}
        fill={{
          type: "gradient",
          direction: "left-to-right",
          fromOpacity: 0.5,
          toOpacity: 0.05,
        }}
      />,
    );
    const gradientId = createAreaGradientId("gradient-chart", "revenue");

    expect(markup).toContain(`id="${gradientId}"`);
    expect(markup).toContain('x1="0"');
    expect(markup).toContain('x2="1"');
    expect(markup).toContain('y2="0"');
    expect(markup).toContain('stop-color="var(--chart-2)"');
    expect(markup).toContain('stop-opacity="0.5"');
    expect(markup).toContain('stop-opacity="0.05"');
    expect(markup).toContain(`fill="url(#${gradientId})"`);
    expect(markup).not.toContain('fill-opacity="0.2"');
  });

  it("uses default top-to-bottom gradient opacities from chart opacity", () => {
    const markup = renderToString(
      <AreaChart
        {...baseChartProps}
        id="gradient-defaults"
        series={[{ key: "revenue", id: "revenue" }]}
        opacity={0.35}
        fill={{ type: "gradient" }}
      />,
    );

    expect(markup).toContain('y1="0"');
    expect(markup).toContain('y2="1"');
    expect(markup).toContain('stop-opacity="0.35"');
    expect(markup).toContain('stop-opacity="0"');
  });

  it("avoids colliding gradient ids across charts and series", () => {
    const chartA = renderToString(
      <AreaChart
        {...baseChartProps}
        id="chart-a"
        series={[
          { key: "revenue", id: "revenue" },
          { key: "costs", id: "costs", color: "var(--chart-2)" },
        ]}
        fill={{ type: "gradient" }}
      />,
    );
    const chartB = renderToString(
      <AreaChart
        {...baseChartProps}
        id="chart-b"
        series={[
          { key: "revenue", id: "revenue" },
          { key: "costs", id: "costs", color: "var(--chart-2)" },
        ]}
        fill={{ type: "gradient" }}
      />,
    );

    const ids = [...extractGradientIds(chartA), ...extractGradientIds(chartB)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(createAreaGradientId("chart-a", "revenue"));
    expect(ids).toContain(createAreaGradientId("chart-b", "costs"));
  });

  it("renders deterministically with renderToString", () => {
    const props = {
      ...baseChartProps,
      id: "deterministic-chart",
      series: [{ key: "revenue" as const, id: "revenue" }],
      fill: { type: "gradient" as const, direction: "bottom-to-top" as const },
      outline: true,
      showPoints: true as const,
    };
    const first = renderToString(<AreaChart {...props} />);
    const second = renderToString(<AreaChart {...props} />);

    expect(first).toBe(second);
  });

  it("renders markers for finite values only and respects pointRadius", () => {
    const { container } = render(
      <AreaChart
        {...baseChartProps}
        series={[{ key: "revenue", id: "revenue" }]}
        showPoints
        pointRadius={5}
      />,
    );

    const circles = container.querySelectorAll("[data-kamod-chart-area-series] circle");
    expect(circles).toHaveLength(3);
    expect(circles[0]?.getAttribute("r")).toBe("5");
  });

  it("skips markers for null, undefined and NaN values", () => {
    const { container } = render(
      <AreaChart
        {...baseChartProps}
        data={sparseData}
        series={[{ key: "revenue", id: "revenue" }]}
        showPoints
      />,
    );

    expect(container.querySelectorAll("[data-kamod-chart-area-series] circle")).toHaveLength(1);
  });

  it("does not render markers by default", () => {
    const markup = renderToString(
      <AreaChart {...baseChartProps} series={[{ key: "revenue", id: "revenue" }]} />,
    );

    expect(markup).not.toContain("<circle");
  });

  it("supports showPoints auto only when explicitly enabled", () => {
    const markup = renderToString(
      <AreaChart
        {...baseChartProps}
        series={[{ key: "revenue", id: "revenue" }]}
        showPoints="auto"
      />,
    );

    expect(markup).toContain("<circle");
  });

  it("places stacked markers on cumulative y1 geometry", () => {
    const { container } = render(
      <Chart {...baseChartProps} data={data}>
        <StackedAreaSeries
          series={[
            { id: "revenue", value: "revenue", color: "var(--chart-1)" },
            { id: "costs", value: "costs", color: "var(--chart-2)" },
          ]}
          yDomain={[0, 25]}
          showPoints
        />
      </Chart>,
    );

    const costsCircles = container.querySelectorAll("[data-kamod-chart-series-id='costs'] circle");
    expect(costsCircles.length).toBeGreaterThan(0);
    const janCosts = costsCircles[0];
    const revenuePath = container.querySelector("[data-kamod-chart-series-id='revenue'] path");
    const costsPath = container.querySelector("[data-kamod-chart-series-id='costs'] path");
    expect(revenuePath?.getAttribute("d")).toBeTruthy();
    expect(costsPath?.getAttribute("d")).toBeTruthy();
    expect(Number(janCosts?.getAttribute("cy"))).toBeLessThan(
      Number(revenuePath?.getAttribute("d")?.match(/[\d.]+/g)?.[1] ?? 999),
    );
  });

  it("applies outline strokeWidth and strokeDasharray only when outline is true", () => {
    const outlined = renderToString(
      <AreaChart
        {...baseChartProps}
        id="outline-chart"
        series={[{ key: "revenue", id: "revenue" }]}
        outline
        strokeWidth={3}
        strokeDasharray="4 2"
      />,
    );
    const hidden = renderToString(
      <AreaChart
        {...baseChartProps}
        id="outline-hidden"
        series={[{ key: "revenue", id: "revenue" }]}
        strokeWidth={3}
        strokeDasharray="4 2"
      />,
    );

    expect(outlined).toContain('stroke="var(--chart-1)"');
    expect(outlined).toContain('stroke-width="3"');
    expect(outlined).toContain('stroke-dasharray="4 2"');
    expect(hidden).toContain('stroke="none"');
    expect(hidden).not.toContain('stroke-width="3"');
  });

  it("keeps valid gradient references after legend hide and show", () => {
    const { container } = render(
      <AreaChart
        {...baseChartProps}
        id="legend-gradient"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs", color: "var(--chart-2)" },
        ]}
        showLegend
        fill={{ type: "gradient" }}
      />,
    );

    const revenueGradientId = createAreaGradientId("legend-gradient", "revenue");
    const costsGradientId = createAreaGradientId("legend-gradient", "costs");
    const readFillRefs = () =>
      [
        ...container.querySelectorAll(
          "[data-kamod-chart-area-series] path, [data-kamod-chart-stacked-area-series] path",
        ),
      ]
        .map((path) => path.getAttribute("fill"))
        .filter((fill): fill is string => fill?.startsWith("url(#") ?? false);

    expect(container.querySelector(`#${revenueGradientId}`)).not.toBeNull();
    expect(container.querySelector(`#${costsGradientId}`)).not.toBeNull();
    expect(readFillRefs()).toEqual(
      expect.arrayContaining([`url(#${revenueGradientId})`, `url(#${costsGradientId})`]),
    );

    const revenueButton = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
      (button) => button.textContent?.includes("Revenue"),
    );
    if (!revenueButton) {
      throw new Error("expected revenue legend item");
    }

    fireEvent.click(revenueButton);
    expect(container.querySelector(`#${revenueGradientId}`)).toBeNull();
    expect(container.querySelector(`#${costsGradientId}`)).not.toBeNull();
    expect(readFillRefs()).toEqual([`url(#${costsGradientId})`]);

    fireEvent.click(revenueButton);
    expect(container.querySelector(`#${revenueGradientId}`)).not.toBeNull();
    expect(readFillRefs()).toEqual(
      expect.arrayContaining([`url(#${revenueGradientId})`, `url(#${costsGradientId})`]),
    );
  });

  it("supports low-level AreaSeries fill and markers", () => {
    const markup = renderToString(
      <Chart {...baseChartProps} id="low-level">
        <AreaSeries
          id="revenue"
          dataKey="revenue"
          yDomain={[0, 25]}
          fill={{ type: "gradient" }}
          outline
          showPoints
        />
      </Chart>,
    );

    expect(markup).toContain(createAreaGradientId("low-level", "revenue"));
    expect(markup).toContain("<circle");
    expect(
      extractAreaPaths(markup).some((attrs) => attrs.includes('stroke="var(--chart-1)"')),
    ).toBe(true);
  });
});
