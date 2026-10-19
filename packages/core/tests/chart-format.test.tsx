import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChart } from "../src/charts/line-chart";

describe("chart format locale", () => {
  it("formats y-axis ticks with de-CH when format.locale is set", () => {
    const markup = renderToString(
      <LineChart
        data={[
          { date: new Date("2024-06-01"), value: 1500.5 },
          { date: new Date("2024-07-01"), value: 2200 },
        ]}
        xKey="date"
        xScale="time"
        format={{ locale: "de-CH", number: { maximumFractionDigits: 0 } }}
        series={[{ key: "value", id: "value", label: "Value" }]}
        width={640}
        height={320}
      />,
    );
    expect(markup).toContain("1'600");
    expect(markup).toContain("Juni 2024");
  });
});
