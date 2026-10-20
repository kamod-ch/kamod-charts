import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { BarChart } from "../src/charts/bar-chart";
import { LineChart } from "../src/charts/line-chart";

const months = [
  { month: "Jan", value: 10 },
  { month: "Feb", value: 20 },
];

describe("mark render slots", () => {
  it("renders a custom diamond point on LineChart", () => {
    const markup = renderToString(
      <LineChart
        id="diamond-line"
        data={months}
        xKey="month"
        xScale="point"
        height={200}
        series={[
          {
            key: "value",
            id: "revenue",
            showPoints: true,
            renderPoint: ({ x, y, color }) => (
              <polygon
                points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`}
                fill={color}
                data-testid="diamond"
              />
            ),
          },
        ]}
      />,
    );
    expect(markup).toContain("<polygon");
    expect(markup).toContain("data-kamod-chart-point");
  });

  it("renders custom bar geometry and pattern fill via defs", () => {
    const markup = renderToString(
      <BarChart
        id="pattern-bar"
        data={months}
        xKey="month"
        height={200}
        series={[
          {
            key: "value",
            id: "sales",
            renderBar: ({ x, y, width, height, fill }) => (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={4}
                data-testid="custom-bar"
              />
            ),
          },
        ]}
        defs={
          <pattern id="pattern-bar-hatch" width={4} height={4} patternUnits="userSpaceOnUse">
            <rect width={4} height={4} fill="var(--chart-1)" />
          </pattern>
        }
      />,
    );
    expect(markup).toContain('data-testid="custom-bar"');
    expect(markup).toContain('id="pattern-bar-hatch"');
  });

  it("uses distinct chart ids for pattern defs across instances", () => {
    const first = renderToString(
      <LineChart
        id="chart-a"
        data={months}
        xKey="month"
        height={200}
        series={[{ key: "value", id: "s1" }]}
        defs={<pattern id="chart-a-pattern" />}
      />,
    );
    const second = renderToString(
      <LineChart
        id="chart-b"
        data={months}
        xKey="month"
        height={200}
        series={[{ key: "value", id: "s1" }]}
        defs={<pattern id="chart-b-pattern" />}
      />,
    );
    expect(first).toContain('id="chart-a-pattern"');
    expect(second).toContain('id="chart-b-pattern"');
    expect(first).not.toContain("chart-b-pattern");
  });
});
