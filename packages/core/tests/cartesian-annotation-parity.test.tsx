import { render } from "@testing-library/preact";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { serializeChartSvg } from "../src/export";
import { AreaChart } from "../src/charts/area-chart";
import { LineChart } from "../src/charts/line-chart";
import { BarChart } from "../src/charts/bar-chart";

const timeData = Array.from({ length: 12 }, (_, hour) => ({
  t: new Date(Date.UTC(2024, 5, 1, hour)),
  value: hour * 2 - 4,
}));

const sharedReferences = {
  referenceLines: [{ y: 0, label: "Zero", strokeDasharray: "2 4" }],
  referenceAreas: [
    {
      id: "maint",
      x1: new Date(Date.UTC(2024, 5, 1, 3)),
      x2: new Date(Date.UTC(2024, 5, 1, 5)),
      label: "Maintenance",
    },
  ],
  referencePoints: [
    {
      id: "deploy",
      x: new Date(Date.UTC(2024, 5, 1, 9)),
      y: 14,
      label: "Deploy",
      shape: "diamond" as const,
    },
  ],
  referenceSegments: [
    {
      id: "warn",
      start: { x: new Date(Date.UTC(2024, 5, 1, 1)), y: 8 },
      end: { x: new Date(Date.UTC(2024, 5, 1, 10)), y: 8 },
      label: "CPU warn",
    },
  ],
};

const xDomain: [Date, Date] = [
  new Date(Date.UTC(2024, 5, 1, 2)),
  new Date(Date.UTC(2024, 5, 1, 10)),
];

describe("cartesian annotation parity", () => {
  it("renders the same reference primitives on line and area charts", () => {
    const lineMarkup = renderToString(
      <LineChart
        data={timeData}
        xKey="t"
        xScale="time"
        xDomain={xDomain}
        height={240}
        width={520}
        showGrid
        series={[{ key: "value", id: "v" }]}
        {...sharedReferences}
      />,
    );
    const areaMarkup = renderToString(
      <AreaChart
        data={timeData}
        xKey="t"
        xScale="time"
        xDomain={xDomain}
        height={240}
        width={520}
        showGrid
        series={[{ key: "value", id: "v" }]}
        {...sharedReferences}
      />,
    );

    for (const marker of [
      "data-kamod-chart-reference-line",
      "data-kamod-chart-reference-area",
      "data-kamod-chart-reference-point",
      "data-kamod-chart-reference-segment",
    ]) {
      expect(lineMarkup).toContain(marker);
      expect(areaMarkup).toContain(marker);
    }

    const lineArea = lineMarkup.match(
      /data-kamod-chart-reference-area[^>]*>[\s\S]*?<rect[^>]*x="([^"]+)"/,
    );
    const areaArea = areaMarkup.match(
      /data-kamod-chart-reference-area[^>]*>[\s\S]*?<rect[^>]*x="([^"]+)"/,
    );
    expect(lineArea?.[1]).toBe(areaArea?.[1]);
  });

  it("includes annotations in SVG export with viewport applied", () => {
    const { container } = render(
      <LineChart
        data={timeData}
        xKey="t"
        xScale="time"
        xDomain={xDomain}
        height={200}
        width={400}
        series={[{ key: "value", id: "v" }]}
        referenceLines={[{ y: -2, label: "Floor" }]}
      />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const exported = serializeChartSvg(svg);
    expect(exported).toContain("data-kamod-chart-reference-line");
  });

  it("maps horizontal bar value reference lines to the value axis", () => {
    const markup = renderToString(
      <BarChart
        data={[
          { category: "A", value: 10 },
          { category: "B", value: 30 },
        ]}
        xKey="category"
        orientation="horizontal"
        height={200}
        width={400}
        series={[{ key: "value", id: "v" }]}
        referenceLines={[{ x: 20, label: "Target" }]}
      />,
    );
    expect(markup).toContain("data-kamod-chart-reference-line");
  });
});
