import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  Chart,
  Grid,
  LineChart,
  LineSeries,
  ReferenceLine,
  ScatterChart,
  ScatterSeries,
  XAxis,
  YAxis,
} from "../src";

interface Datum {
  date: Date;
  revenue: number | null;
  costs: number;
  users: number;
}

const data: Datum[] = [
  { date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10, costs: 5, users: 100 },
  { date: new Date("2026-01-02T00:00:00.000Z"), revenue: null, costs: 8, users: 140 },
  { date: new Date("2026-01-03T00:00:00.000Z"), revenue: 30, costs: 12, users: 160 },
];

describe("LineChart and ScatterChart", () => {
  it("renders a high-level multi-series LineChart as SVG", () => {
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[
          { key: "revenue", label: "Umsatz", color: "var(--chart-1)" },
          { key: "costs", label: "Kosten", color: "var(--chart-2)" },
        ]}
        height={320}
        width={640}
        showGrid
        title="Revenue"
        referenceLines={[{ y: 20, label: "Ziel" }]}
      />,
    );

    expect(markup).toContain("data-kamod-chart-line-series");
    expect(markup).toContain("data-kamod-chart-grid");
    expect(markup).toContain("data-kamod-chart-reference-line");
    expect(markup).toContain("Revenue");
    expect(markup).toContain("Ziel");
  });

  it("renders low-level composable line and scatter series", () => {
    const markup = renderToString(
      <Chart data={data} xKey="date" xScale="time" width={640} height={320}>
        <Grid yKey="costs" />
        <XAxis />
        <YAxis dataKey="costs" />
        <LineSeries dataKey="costs" color="var(--chart-2)" />
        <ScatterSeries yKey="users" color="var(--chart-3)" />
        <ReferenceLine y={10} yKey="costs" label="Baseline" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-line-series");
    expect(markup).toContain("data-kamod-chart-scatter-series");
    expect(markup).toContain("Baseline");
  });

  it("renders a high-level ScatterChart", () => {
    const markup = renderToString(
      <ScatterChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "users", color: "var(--chart-3)" }]}
        height={320}
        width={640}
        showGrid
      />,
    );

    expect(markup).toContain("data-kamod-chart-scatter-series");
    expect(markup).toContain("<circle");
  });

  it("supports basic chart-level keyboard navigation", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "costs" }]}
        height={320}
        width={640}
      />,
    );
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("tabindex") ?? svg?.getAttribute("tabIndex")).toBe("0");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "ArrowRight" });

    expect(container.querySelector('[data-kamod-chart-active="true"]')).not.toBeNull();
  });
});
