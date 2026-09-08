import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { Chart, ReferenceSegment, ScatterChart } from "../src";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import type {
  CartesianReferenceArea,
  CartesianReferencePoint,
  CartesianReferenceSegment,
} from "../src/charts/types";
import {
  clipReferenceSegmentToPlot,
  projectReferenceSegment,
  projectReferenceSegmentPoint,
  resolveReferenceSegmentLabel,
} from "../src/primitives/reference-segment-geometry";
import { getScalePosition } from "../src/axes";
import { createLinearScale, createTimeScale } from "../src/scales";
import type { AxisScale } from "../src/axes/ticks";

interface Datum {
  x: number;
  y: number;
  date: Date;
}

const data: Datum[] = [
  { x: 0, y: 0, date: new Date("2026-01-01T00:00:00.000Z") },
  { x: 50, y: 50, date: new Date("2026-06-01T00:00:00.000Z") },
  { x: 100, y: 100, date: new Date("2026-12-31T00:00:00.000Z") },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

const linearScales = (plotWidth: number, plotHeight: number) => {
  const xScale = createLinearScale({ domain: [0, 100], range: [0, plotWidth] }) as AxisScale;
  const yScale = createLinearScale({ domain: [0, 100], range: [plotHeight, 0] }) as AxisScale;
  return { xScale, yScale };
};

describe("ReferenceSegment geometry", () => {
  it("projects both endpoints on linear scales", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const { xScale, yScale } = linearScales(plot.width, plot.height);

    expect(projectReferenceSegmentPoint(xScale, yScale, 10, 20)).toEqual({
      x: getScalePosition(xScale, 10),
      y: getScalePosition(yScale, 20),
    });
    expect(
      projectReferenceSegment(xScale, yScale, 0, 0, 100, 100, plot.width, plot.height),
    ).toEqual({
      x1: 0,
      y1: plot.height,
      x2: plot.width,
      y2: 0,
    });
  });

  it("resolves label positions at start, middle and end with a perpendicular offset", () => {
    const horizontal = { x1: 0, y1: 100, x2: 200, y2: 100 };
    const vertical = { x1: 100, y1: 0, x2: 100, y2: 200 };

    expect(resolveReferenceSegmentLabel(horizontal, "start")).toMatchObject({
      x: 0,
      y: 92,
      textAnchor: "start",
    });
    expect(resolveReferenceSegmentLabel(horizontal, "middle")).toMatchObject({
      x: 100,
      y: 92,
      textAnchor: "middle",
    });
    expect(resolveReferenceSegmentLabel(horizontal, "end")).toMatchObject({
      x: 200,
      y: 92,
      textAnchor: "end",
    });
    expect(resolveReferenceSegmentLabel(vertical, "middle")).toMatchObject({
      x: 92,
      y: 100,
      textAnchor: "middle",
    });
  });

  it("renders nothing for invalid coordinates and zero-length segments", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const { xScale, yScale } = linearScales(plot.width, plot.height);

    expect(
      projectReferenceSegment(xScale, yScale, Number.NaN, 0, 10, 10, plot.width, plot.height),
    ).toBeNull();
    expect(
      projectReferenceSegment(xScale, yScale, 10, 10, 10, 10, plot.width, plot.height),
    ).toBeNull();
    expect(
      clipReferenceSegmentToPlot({ x: 10, y: 10 }, { x: 10, y: 10 }, plot.width, plot.height),
    ).toBeNull();
  });

  it("clips diagonal, horizontal and vertical segments to the plot area", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);

    expect(
      clipReferenceSegmentToPlot(
        { x: -40, y: 20 },
        { x: plot.width + 40, y: 80 },
        plot.width,
        plot.height,
      ),
    ).toMatchObject({ x1: 0, x2: plot.width });
    expect(
      clipReferenceSegmentToPlot(
        { x: 10, y: -20 },
        { x: 10, y: plot.height + 40 },
        plot.width,
        plot.height,
      ),
    ).toMatchObject({ x1: 10, x2: 10, y1: 0, y2: plot.height });
    expect(
      clipReferenceSegmentToPlot({ x: -50, y: -50 }, { x: -10, y: -10 }, plot.width, plot.height),
    ).toBeNull();
  });

  it("projects time-based x values", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const xScale = createTimeScale({
      domain: [data[0]!.date, data[2]!.date],
      range: [0, plot.width],
    }) as AxisScale;
    const yScale = createLinearScale({ domain: [0, 100], range: [plot.height, 0] }) as AxisScale;
    const segment = projectReferenceSegment(
      xScale,
      yScale,
      data[0]!.date,
      10,
      data[2]!.date,
      90,
      plot.width,
      plot.height,
    );

    expect(segment).not.toBeNull();
    expect(segment?.x1).toBe(0);
    expect(segment?.x2).toBeCloseTo(plot.width, 4);
  });
});

describe("ReferenceSegment primitive", () => {
  it("forwards stroke, class and id attributes into SVG", () => {
    const markup = renderToString(
      <Chart data={data} xKey="x" xScale="linear" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceSegment
          id="trend"
          class="trend-line"
          start={{ x: 0, y: 0 }}
          end={{ x: 100, y: 100 }}
          yDomain={[0, 100]}
          strokeWidth={3}
          strokeDasharray="2 6"
          color="var(--chart-3)"
          label="Trend"
          labelPosition="end"
        />
      </Chart>,
    );

    expect(markup).toContain('id="trend"');
    expect(markup).toContain('class="trend-line"');
    expect(markup).toContain("data-kamod-chart-reference-segment");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('pointer-events="none"');
    expect(markup).toContain('stroke-width="3"');
    expect(markup).toContain('stroke-dasharray="2 6"');
    expect(markup).toContain('stroke="var(--chart-3)"');
    expect(markup).toContain("Trend");
  });

  it("renders deterministically with renderToString", () => {
    const chart = (
      <Chart data={data} xKey="x" xScale="linear" width={CHART_WIDTH} height={CHART_HEIGHT}>
        <ReferenceSegment start={{ x: 0, y: 0 }} end={{ x: 100, y: 50 }} yDomain={[0, 100]} />
      </Chart>
    );
    expect(renderToString(chart)).toBe(renderToString(chart));
  });
});

describe("ScatterChart reference layering", () => {
  const references = {
    referenceAreas: [
      { id: "band", x1: 20, x2: 80, class: "ref-area" },
    ] satisfies readonly CartesianReferenceArea<Datum>[],
    referenceLines: [{ y: 50, label: "Mid", strokeWidth: 2, strokeDasharray: "1 3" }],
    referenceSegments: [
      {
        id: "diag",
        class: "ref-segment",
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        label: "Diagonal",
        labelPosition: "middle",
        strokeWidth: 2,
      },
    ] satisfies readonly CartesianReferenceSegment<Datum>[],
    referencePoints: [
      { id: "peak", x: 50, y: 50, label: "Peak", class: "ref-point" },
    ] satisfies readonly CartesianReferencePoint<Datum>[],
  };

  it("renders areas, lines, segments and points in the expected DOM order", () => {
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showGrid
        tooltip
        {...references}
      />,
    );

    const ordered = [
      "[data-kamod-chart-reference-area]",
      "[data-kamod-chart-grid]",
      "[data-kamod-chart-reference-line]",
      "[data-kamod-chart-reference-segment]",
      "[data-kamod-chart-scatter-series]",
      "[data-kamod-chart-reference-point]",
    ].map((selector) => container.querySelector(selector));

    for (let index = 1; index < ordered.length; index += 1) {
      expect(ordered[index - 1]).not.toBeNull();
      expect(ordered[index]).not.toBeNull();
      expect(
        ordered[index - 1]!.compareDocumentPosition(ordered[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }
    Object.defineProperty(surface, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: CHART_WIDTH,
        bottom: CHART_HEIGHT,
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        toJSON: () => ({}),
      }),
    });
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    fireEvent.pointerMove(surface, {
      clientX: plot.x + plot.width / 2,
      clientY: plot.y + plot.height / 2,
    });

    const crosshair = container.querySelector("[data-kamod-chart-crosshair]");
    const referencePoint = container.querySelector("[data-kamod-chart-reference-point]");
    expect(crosshair).not.toBeNull();
    expect(referencePoint).not.toBeNull();
    expect(
      referencePoint!.compareDocumentPosition(crosshair!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("does not change scatter hit-testing when a segment is present", () => {
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
        {...references}
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }

    Object.defineProperty(surface, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: CHART_WIDTH,
        bottom: CHART_HEIGHT,
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        toJSON: () => ({}),
      }),
    });

    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    fireEvent.pointerMove(surface, {
      clientX: plot.x + plot.width / 2,
      clientY: plot.y + plot.height / 2,
    });

    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    expect(container.querySelector('[data-kamod-chart-active="true"]')).not.toBeNull();
  });

  it("forwards reference line stroke props that were previously missing", () => {
    const markup = renderToString(
      <ScatterChart
        data={data}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        referenceLines={[{ y: 50, strokeWidth: 5, strokeDasharray: "9 1" }]}
      />,
    );

    expect(markup).toContain('stroke-width="5"');
    expect(markup).toContain('stroke-dasharray="9 1"');
  });
});

describe("ReferenceSegment exports", () => {
  it("is exported from the package root and primitives barrel", async () => {
    const root = await import("../src");
    const primitives = await import("../src/primitives");
    const charts = await import("../src/charts");

    expect(root.ReferenceSegment).toBeTypeOf("function");
    expect(primitives.ReferenceSegment).toBe(root.ReferenceSegment);
    expect(charts.ScatterChart).toBeTypeOf("function");
  });
});
