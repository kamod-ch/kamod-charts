import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChart } from "../src/charts/line-chart";

describe("LineChart xDomain viewport", () => {
  const data = Array.from({ length: 60 }, (_, index) => ({
    t: new Date(Date.UTC(2024, 0, 1, 0, index)),
    value: Math.sin(index / 4) * 10 + 20,
  }));

  it("renders with a controlled time window without changing row count", () => {
    const xDomain: [Date, Date] = [data[40]!.t, data[59]!.t];
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="t"
        xScale="time"
        xDomain={xDomain}
        series={[{ key: "value", id: "v" }]}
        height={200}
        width={480}
        showGrid
      />,
    );
    expect(markup).toContain("data-kamod-chart-surface");
    expect(markup).toContain("data-kamod-chart-x-axis");
  });

  it("exposes viewport interaction markers when enabled", () => {
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="t"
        xScale="time"
        xViewportInteraction={{ wheelZoom: "modifier" }}
        series={[{ key: "value", id: "v" }]}
        height={200}
        width={480}
      />,
    );
    expect(markup).toContain("data-kamod-chart-viewport-interactive");
  });
});
