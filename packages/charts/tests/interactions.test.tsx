import { fireEvent, render } from "@testing-library/preact";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Legend, LineChart, Tooltip } from "../src";

interface Datum {
  date: Date;
  revenue: number;
  costs: number;
}

const data: Datum[] = [
  { date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10, costs: 5 },
  { date: new Date("2026-01-02T00:00:00.000Z"), revenue: 20, costs: 8 },
];

describe("phase 6 interactions", () => {
  it("renders HTML tooltip, legend, crosshair, and live region for high-level charts", () => {
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        showLegend
        tooltip
      />,
    );

    expect(markup).toContain("data-kamod-chart-tooltip");
    expect(markup).toContain("data-kamod-chart-legend");
    expect(markup).toContain("data-kamod-chart-crosshair");
    expect(markup).toContain("data-kamod-chart-live-region");
  });

  it("toggles series visibility through legend", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        showLegend
      />,
    );
    const button = container.querySelector("[data-kamod-chart-legend-item]");

    expect(container.querySelector("[data-kamod-chart-line-series]")).not.toBeNull();
    if (!button) {
      throw new Error("expected legend button");
    }

    fireEvent.click(button);
    expect(container.querySelector("[data-kamod-chart-line-series]")).toBeNull();
  });

  it("exports standalone Tooltip and Legend primitives", () => {
    const tooltipMarkup = renderToString(
      <Tooltip
        interaction={{ datum: data[0]!, seriesId: "revenue", index: 0, value: 10, x: 1, y: 2 }}
      />,
    );
    const legendMarkup = renderToString(<Legend items={[{ id: "revenue", label: "Revenue" }]} />);

    expect(tooltipMarkup).toContain("revenue: 10");
    expect(legendMarkup).toContain("Revenue");
  });
});
