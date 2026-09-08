import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { render } from "./testing-library";
import { Chart, LineChart, ReferenceArea } from "../src";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import type { CartesianReferenceArea } from "../src/charts/types";
import {
  clampReferenceSpan,
  projectReferenceSpan,
} from "../src/primitives/reference-area-geometry";
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
  { month: "Apr", date: new Date("2026-04-01T00:00:00.000Z"), revenue: 25 },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

describe("ReferenceArea geometry", () => {
  it("normalizes reversed bounds", () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 400] });
    expect(projectReferenceSpan(scale, 80, 20)).toEqual({ start: 80, end: 320 });
  });

  it("includes full band widths on band scales", () => {
    const scale = createBandScale({
      domain: ["Jan", "Feb", "Mar"],
      range: [0, 300],
      paddingInner: 0,
      paddingOuter: 0,
    }) as AxisScale;
    const span = projectReferenceSpan(scale, "Feb", "Jan");
    expect(span).toEqual({ start: 0, end: 200 });
  });

  it("returns null for values outside a band domain", () => {
    const scale = createBandScale({
      domain: ["Jan", "Feb"],
      range: [0, 200],
    }) as AxisScale;
    expect(projectReferenceSpan(scale, "Missing", "Jan")).toBeNull();
  });

  it("clamps spans to the plot area", () => {
    expect(clampReferenceSpan({ start: -20, end: 120 }, 100)).toEqual({
      start: 0,
      end: 100,
    });
    expect(clampReferenceSpan({ start: 140, end: 180 }, 100)).toBeNull();
  });
});

describe("ReferenceArea primitive", () => {
  it("renders a vertical area on a band scale with full band coverage", () => {
    const { container } = render(
      <Chart data={data} xKey="month" xScale="band" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea x1="Feb" x2="Mar" label="Mid quarter" />
      </Chart>,
    );

    const rect = container.querySelector("[data-kamod-chart-reference-area] rect");
    const width = Number(rect?.getAttribute("width"));
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const scale = createBandScale({
      domain: data.map((entry) => entry.month),
      range: [0, plot.width],
    });
    const expectedWidth = scale("Mar")! + scale.bandwidth() - scale("Feb")!;

    expect(rect).not.toBeNull();
    expect(width).toBeCloseTo(expectedWidth, 4);
    expect(width).toBeGreaterThan(scale.bandwidth()! * 1.5);
    expect(container.innerHTML).toContain("Mid quarter");
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("renders a vertical area on time and linear scales", () => {
    const timeMarkup = renderToString(
      <Chart data={data} xKey="date" xScale="time" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea
          x1={new Date("2026-02-01T00:00:00.000Z")}
          x2={new Date("2026-03-15T00:00:00.000Z")}
        />
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
        <ReferenceArea x1={20} x2={80} xScale="linear" xDomain={[0, 100]} />
      </Chart>,
    );

    expect(timeMarkup).toContain("data-kamod-chart-reference-area");
    expect(timeMarkup).toMatch(/width="[0-9.]+"/);
    expect(linearMarkup).toMatch(/width="[0-9.]+"/);
    expect(timeMarkup).not.toContain("NaN");
    expect(linearMarkup).not.toContain("NaN");
  });

  it("renders a horizontal area", () => {
    const markup = renderToString(
      <Chart data={data} width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea y1={12} y2={22} yDomain={[0, 30]} />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-reference-area");
    expect(markup).toMatch(/height="[0-9.]+"/);
    expect(markup).not.toContain("NaN");
  });

  it("supports custom fill, opacity, class and label", () => {
    const markup = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea
          id="forecast-band"
          class="forecast-band"
          x1="Mar"
          x2="Apr"
          label="Forecast"
          fill="var(--chart-4)"
          fillOpacity={0.5}
        />
      </Chart>,
    );

    expect(markup).toContain('id="forecast-band"');
    expect(markup).toContain('class="forecast-band"');
    expect(markup).toContain('fill="var(--chart-4)"');
    expect(markup).toContain('fill-opacity="0.5"');
    expect(markup).toContain("Forecast");
  });

  it("renders nothing for incomplete or unprojectable values", () => {
    const incomplete = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea x1="Jan" />
      </Chart>,
    );
    const invalid = renderToString(
      <Chart data={data} xKey="month" xScale="band" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea x1="Missing" x2="AlsoMissing" />
      </Chart>,
    );
    const outOfDomain = renderToString(
      <Chart data={data} width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea y1={1000} y2={2000} yDomain={[0, 30]} />
      </Chart>,
    );

    expect(incomplete).not.toContain("data-kamod-chart-reference-area");
    expect(invalid).not.toContain("<rect");
    expect(outOfDomain).not.toContain("<rect");
    expect(incomplete).not.toContain("NaN");
    expect(invalid).not.toContain("NaN");
    expect(outOfDomain).not.toContain("NaN");
  });

  it("renders deterministically with renderToString", () => {
    const chart = (
      <Chart data={data} xKey="month" xScale="point" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceArea x1="Feb" x2="Mar" label="Stable" />
      </Chart>
    );
    expect(renderToString(chart)).toBe(renderToString(chart));
  });
});

describe("LineChart referenceAreas", () => {
  it("renders high-level reference areas behind grid and series", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showGrid
        referenceAreas={[{ x1: "Feb", x2: "Mar", label: "Highlight" }]}
      />,
    );

    const area = container.querySelector("[data-kamod-chart-reference-area]");
    const grid = container.querySelector("[data-kamod-chart-grid]");
    const series = container.querySelector("[data-kamod-chart-line-series]");

    expect(area).not.toBeNull();
    expect(grid).not.toBeNull();
    expect(series).not.toBeNull();
    expect(area!.compareDocumentPosition(grid!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(grid!.compareDocumentPosition(series!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("accepts typed CartesianReferenceArea entries", () => {
    const areas: readonly CartesianReferenceArea<Datum>[] = [
      { id: "band", x1: "Jan", x2: "Feb", fillOpacity: 0.2 },
      { id: "threshold", y1: 10, y2: 20 },
    ];
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        referenceAreas={areas}
      />,
    );

    expect(markup).toContain('id="band"');
    expect(markup).toContain('id="threshold"');
  });
});

describe("ReferenceArea exports", () => {
  it("is exported from the package root and primitives barrel", async () => {
    const root = await import("../src");
    const primitives = await import("../src/primitives");
    expect(root.ReferenceArea).toBeTypeOf("function");
    expect(primitives.ReferenceArea).toBe(root.ReferenceArea);
  });
});
