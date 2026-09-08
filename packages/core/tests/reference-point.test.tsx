import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { render } from "./testing-library";
import { Chart, LineChart, ReferenceLine, ReferencePoint } from "../src";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import type { CartesianReferencePoint } from "../src/charts/types";
import {
  projectReferencePoint,
  referencePointDiamondPoints,
  resolveReferencePointLabel,
} from "../src/primitives/reference-point-geometry";
import { createBandScale, createLinearScale } from "../src/scales";
import type { AxisScale } from "../src/axes/ticks";

interface Datum {
  month: string;
  date: Date;
  revenue: number;
}

const data: Datum[] = [
  { month: "Jan", date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10 },
  { month: "Feb", date: new Date("2026-02-01T00:00:00.000Z"), revenue: 20 },
  { month: "Mar", date: new Date("2026-03-01T00:00:00.000Z"), revenue: 15 },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

describe("ReferencePoint geometry", () => {
  it("projects valid points and rejects out-of-plot coordinates", () => {
    const xScale = createLinearScale({ domain: [0, 100], range: [0, 200] }) as AxisScale;
    const yScale = createLinearScale({ domain: [0, 100], range: [200, 0] }) as AxisScale;

    expect(projectReferencePoint(xScale, yScale, 50, 50, 200, 200)).toEqual({ x: 100, y: 100 });
    expect(projectReferencePoint(xScale, yScale, 150, 50, 200, 200)).toBeNull();
    expect(projectReferencePoint(xScale, yScale, Number.NaN, 50, 200, 200)).toBeNull();
  });

  it("builds diamond polygon coordinates from center and size", () => {
    expect(referencePointDiamondPoints(10, 20, 4)).toBe("10,16 14,20 10,24 6,20");
  });

  it("resolves stable label positions", () => {
    const point = { x: 100, y: 80 };
    expect(resolveReferencePointLabel(point, 4, "top")).toMatchObject({
      y: 68,
      textAnchor: "middle",
    });
    expect(resolveReferencePointLabel(point, 4, "right")).toMatchObject({
      x: 112,
      textAnchor: "start",
    });
    expect(resolveReferencePointLabel(point, 4, "bottom")).toMatchObject({
      y: 92,
      dominantBaseline: "hanging",
    });
    expect(resolveReferencePointLabel(point, 4, "left")).toMatchObject({
      x: 88,
      textAnchor: "end",
    });
  });
});

describe("ReferencePoint primitive", () => {
  const projectedAt = (month: string, revenue: number) => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const xScale = createBandScale({
      domain: data.map((entry) => entry.month),
      range: [0, plot.width],
    }) as AxisScale;
    const yScale = createLinearScale({ domain: [0, 30], range: [plot.height, 0] }) as AxisScale;
    return projectReferencePoint(xScale, yScale, month, revenue, plot.width, plot.height);
  };

  it("renders circle, square and diamond shapes at projected coordinates", () => {
    const expected = projectedAt("Feb", 20);
    expect(expected).not.toBeNull();

    for (const shape of ["circle", "square", "diamond"] as const) {
      const { container } = render(
        <Chart data={data} xKey="month" xScale="band" width={CHART_WIDTH} height={CHART_HEIGHT}>
          <ReferencePoint x="Feb" y={20} yDomain={[0, 30]} shape={shape} size={5} />
        </Chart>,
      );

      const marker = container.querySelector(
        shape === "circle" ? "circle" : shape === "square" ? "rect" : "polygon",
      );
      expect(marker).not.toBeNull();
      if (shape === "circle") {
        expect(marker?.getAttribute("cx")).toBe(String(expected?.x));
        expect(marker?.getAttribute("cy")).toBe(String(expected?.y));
        expect(marker?.getAttribute("r")).toBe("5");
      }
      if (shape === "square") {
        expect(Number(marker?.getAttribute("x"))).toBeCloseTo(expected!.x - 5, 4);
        expect(Number(marker?.getAttribute("y"))).toBeCloseTo(expected!.y - 5, 4);
        expect(marker?.getAttribute("width")).toBe("10");
      }
      if (shape === "diamond") {
        expect(marker?.getAttribute("points")).toBe(
          referencePointDiamondPoints(expected!.x, expected!.y, 5),
        );
      }
    }
  });

  it("supports all label positions and svg title for string labels", () => {
    for (const labelPosition of ["top", "right", "bottom", "left"] as const) {
      const markup = renderToString(
        <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
          <ReferencePoint
            x="Feb"
            y={20}
            yDomain={[0, 30]}
            label={`Peak ${labelPosition}`}
            labelPosition={labelPosition}
          />
        </Chart>,
      );
      expect(markup).toContain(`Peak ${labelPosition}`);
      expect(markup).toContain("<title>Peak");
    }
  });

  it("supports custom color, size and class", () => {
    const markup = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferencePoint
          id="peak"
          class="peak-marker"
          x="Feb"
          y={20}
          yDomain={[0, 30]}
          color="var(--chart-4)"
          size={6}
        />
      </Chart>,
    );

    expect(markup).toContain('id="peak"');
    expect(markup).toContain('class="peak-marker"');
    expect(markup).toContain('fill="var(--chart-4)"');
    expect(markup).toContain('r="6"');
  });

  it("renders nothing for invalid or out-of-domain values", () => {
    const invalid = renderToString(
      <Chart data={data} xKey="month" xScale="band" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferencePoint x="Missing" y={20} yDomain={[0, 30]} />
      </Chart>,
    );
    const outside = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferencePoint x="Feb" y={500} yDomain={[0, 30]} />
      </Chart>,
    );

    expect(invalid).not.toContain("data-kamod-chart-reference-point");
    expect(outside).not.toContain("<circle");
    expect(invalid).not.toContain("NaN");
    expect(outside).not.toContain("NaN");
  });

  it("projects time and linear x scales", () => {
    const timeMarkup = renderToString(
      <Chart data={data} xKey="date" xScale="time" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferencePoint x={new Date("2026-02-01T00:00:00.000Z")} y={20} yDomain={[0, 30]} />
      </Chart>,
    );
    const linearMarkup = renderToString(
      <Chart
        data={[
          { month: "a", date: new Date(), revenue: 0 },
          { month: "b", date: new Date(), revenue: 100 },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      >
        <ReferencePoint x={50} y={25} xScale="linear" xDomain={[0, 100]} yDomain={[0, 50]} />
      </Chart>,
    );

    expect(timeMarkup).toContain("data-kamod-chart-reference-point");
    expect(linearMarkup).toContain("data-kamod-chart-reference-point");
    expect(timeMarkup).not.toContain("NaN");
    expect(linearMarkup).not.toContain("NaN");
  });

  it("renders deterministically with renderToString", () => {
    const chart = (
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferencePoint x="Feb" y={20} yDomain={[0, 30]} label="Peak" />
      </Chart>
    );
    expect(renderToString(chart)).toBe(renderToString(chart));
  });
});

describe("ReferenceLine styling", () => {
  it("keeps legacy defaults when stroke props are omitted", () => {
    const markup = renderToString(
      <Chart data={data} width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceLine y={15} yDomain={[0, 30]} label="Target" />
      </Chart>,
    );

    expect(markup).toContain('stroke-dasharray="4 4"');
    expect(markup).not.toContain("stroke-width=");
    expect(markup).toContain('aria-hidden="true"');
  });

  it("accepts custom stroke width and dash pattern", () => {
    const markup = renderToString(
      <Chart data={data} width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceLine y={15} yDomain={[0, 30]} strokeWidth={3} strokeDasharray="8 3" />
      </Chart>,
    );

    expect(markup).toContain('stroke-width="3"');
    expect(markup).toContain('stroke-dasharray="8 3"');
  });
});

describe("LineChart referencePoints", () => {
  it("renders reference points above data series in the DOM", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        referencePoints={[{ id: "peak", x: "Feb", y: 20, label: "Peak" }]}
      />,
    );

    const series = container.querySelector("[data-kamod-chart-line-series]");
    const point = container.querySelector("[data-kamod-chart-reference-point]");
    expect(series).not.toBeNull();
    expect(point).not.toBeNull();
    expect(series!.compareDocumentPosition(point!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("accepts typed CartesianReferencePoint entries", () => {
    const points: readonly CartesianReferencePoint<Datum>[] = [
      { id: "peak", x: "Feb", y: 20, shape: "diamond", labelPosition: "right" },
    ];
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        referencePoints={points}
      />,
    );
    expect(markup).toContain('id="peak"');
    expect(markup).toContain("<polygon");
  });
});

describe("ReferencePoint exports", () => {
  it("is exported from the package root and primitives barrel", async () => {
    const root = await import("../src");
    const primitives = await import("../src/primitives");
    expect(root.ReferencePoint).toBeTypeOf("function");
    expect(primitives.ReferencePoint).toBe(root.ReferencePoint);
  });
});
