import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/preact";
import { AreaChart, AreaSeries, BarChart, BarSeries, Chart, Grid, XAxis, YAxis } from "../src";

interface Datum {
  month: string;
  revenue: number;
  costs: number;
  losses: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: 20, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

describe("AreaChart and BarChart", () => {
  it("renders high-level AreaChart with multiple areas and reference line", () => {
    const markup = renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }, { key: "costs", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        showGrid
        outline
        referenceLines={[{ y: 12, label: "Ziel" }]}
      />,
    );

    expect(markup).toContain("data-kamod-chart-area-series");
    expect(markup).toContain("data-kamod-chart-grid");
    expect(markup).toContain("Ziel");
  });

  it("renders stacked areas with positive and negative values", () => {
    const markup = renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }, { key: "losses", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        stacked
      />,
    );

    expect(markup).toContain("data-kamod-chart-stacked-area-series");
    expect(markup).toContain("<path");
  });

  it("renders low-level AreaSeries and BarSeries", () => {
    const markup = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={640} height={320}>
        <Grid yKey="revenue" />
        <XAxis />
        <YAxis dataKey="revenue" />
        <AreaSeries dataKey="revenue" />
        <BarSeries dataKey="costs" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-area-series");
    expect(markup).toContain("data-kamod-chart-bar-series");
    expect(markup).toContain("data-kamod-chart-bar");
  });

  it("renders grouped, stacked, horizontal bars and value labels", () => {
    const grouped = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue" }, { key: "costs", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        showGrid
        grouped
        radius={4}
        valueLabels
      />,
    );
    const stackedHorizontal = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue" }, { key: "losses", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        stacked
        orientation="horizontal"
        minBarSize={2}
      />,
    );

    expect(grouped).toContain("data-kamod-chart-bars");
    expect(grouped).toContain(">20</text>");
    expect(stackedHorizontal).toContain("data-kamod-chart-bar");
  });

  it("emits bar click callbacks", () => {
    const onBarClick = vi.fn();
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={640}
        height={320}
        onBarClick={onBarClick}
      />,
    );
    const bar = container.querySelector("[data-kamod-chart-bar]");

    if (!bar) {
      throw new Error("expected bar");
    }

    fireEvent.click(bar);

    expect(onBarClick).toHaveBeenCalledWith(data[0], "revenue", 0, 10);
  });
});
