import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChartWithXBrush } from "../src/charts/line-chart-with-x-brush";

describe("LineChartWithXBrush", () => {
  const data = Array.from({ length: 40 }, (_, index) => ({
    t: new Date(Date.UTC(2024, 0, 1, 0, index)),
    value: Math.sin(index / 3) * 10 + 20,
  }));

  it("renders overview brush markers", () => {
    const markup = renderToString(
      <LineChartWithXBrush
        data={data}
        xKey="t"
        xScale="time"
        xBrush
        series={[{ key: "value", id: "v" }]}
        height={200}
        width={480}
      />,
    );
    expect(markup).toContain("data-kamod-line-chart-with-x-brush");
    expect(markup).toContain("data-kamod-cartesian-x-brush");
  });
});
