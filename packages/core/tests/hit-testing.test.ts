import { describe, expect, it } from "vitest";
import { getScalePosition } from "../src/axes";
import {
  findNearestCartesianIndexByX,
  findNearestCartesianPoint,
  resolvePlotAreaFromSize,
} from "../src/charts/cartesian-interaction";
import { getNearestIndexByX } from "../src/interaction";
import { inferCombinedNumericDomain } from "../src/series";
import { createCartesianScales } from "../src/series/cartesian";

const plot = resolvePlotAreaFromSize(640, 320);

describe("projected cartesian hit-testing", () => {
  it("selects irregular numeric X by projected position, not equal index spacing", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 1000, y: 30 },
    ];
    const { xScale } = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 10);

    expect(plotX).toBeTypeOf("number");
    expect(getNearestIndexByX(plotX as number, plot.width, data.length)).not.toBe(1);
    expect(
      findNearestCartesianIndexByX({
        data,
        xKey: "x",
        plotWidth: plot.width,
        plotX: plotX as number,
      }),
    ).toBe(1);
  });

  it("selects irregular Date values by projected X", () => {
    const data = [
      { date: new Date("2026-01-01T00:00:00.000Z"), y: 10 },
      { date: new Date("2026-01-02T00:00:00.000Z"), y: 20 },
      { date: new Date("2026-12-31T00:00:00.000Z"), y: 30 },
    ];
    const { xScale } = createCartesianScales({
      data,
      xKey: "date",
      yKey: "y",
      xScale: "time",
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, data[1]!.date);

    expect(plotX).toBeTypeOf("number");
    expect(getNearestIndexByX(plotX as number, plot.width, data.length)).not.toBe(1);
    expect(
      findNearestCartesianIndexByX({
        data,
        xKey: "date",
        xScale: "time",
        plotWidth: plot.width,
        plotX: plotX as number,
      }),
    ).toBe(1);
  });

  it("skips null, undefined, and NaN Y values for scatter candidates", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 50, y: null as number | null },
      { x: 60, y: undefined as number | undefined },
      { x: 70, y: Number.NaN },
      { x: 100, y: 20 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["y"]);
    const { xScale, yScale } = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 50);
    const plotY = getScalePosition(yScale, 10);

    expect(plotX).toBeTypeOf("number");
    expect(plotY).toBeTypeOf("number");
    expect(
      findNearestCartesianPoint({
        data,
        series: [{ key: "y" }],
        xKey: "x",
        yDomain,
        plotWidth: plot.width,
        plotHeight: plot.height,
        plotX: plotX as number,
        plotY: plotY as number,
      }),
    ).toEqual({
      index: 0,
      seriesIndex: 0,
      distanceSquared: expect.any(Number),
    });
  });

  it("selects the nearest Euclidean scatter point when X values are similar", () => {
    const data = [
      { x: 50, y: 10 },
      { x: 52, y: 90 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["y"]);
    const { xScale, yScale } = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 52);
    const plotY = getScalePosition(yScale, 90);

    expect(
      findNearestCartesianPoint({
        data,
        series: [{ key: "y" }],
        xKey: "x",
        yDomain,
        plotWidth: plot.width,
        plotHeight: plot.height,
        plotX: plotX as number,
        plotY: plotY as number,
      }),
    ).toMatchObject({ index: 1, seriesIndex: 0 });
  });

  it("returns named index and seriesIndex across multiple scatter series", () => {
    const data = [
      { x: 40, low: 10, high: 90 },
      { x: 60, low: 12, high: 88 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["low", "high"]);
    const { xScale, yScale } = createCartesianScales({
      data,
      xKey: "x",
      yKey: "high",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 40);
    const plotY = getScalePosition(yScale, 90);
    const result = findNearestCartesianPoint({
      data,
      series: [{ key: "low" }, { key: "high" }],
      xKey: "x",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
      plotX: plotX as number,
      plotY: plotY as number,
    });

    expect(result).toEqual({
      index: 0,
      seriesIndex: 1,
      distanceSquared: expect.any(Number),
    });
    expect(result).toHaveProperty("index");
    expect(result).toHaveProperty("seriesIndex");
    expect(result).toHaveProperty("distanceSquared");
  });

  it("prefers the lower series index, then the lower datum index, on ties", () => {
    const data = [
      { x: 50, a: 10, b: 10 },
      { x: 50, a: 10, b: 10 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["a", "b"]);
    const { xScale, yScale } = createCartesianScales({
      data,
      xKey: "x",
      yKey: "a",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 50);
    const plotY = getScalePosition(yScale, 10);

    expect(
      findNearestCartesianPoint({
        data,
        series: [{ key: "a" }, { key: "b" }],
        xKey: "x",
        yDomain,
        plotWidth: plot.width,
        plotHeight: plot.height,
        plotX: plotX as number,
        plotY: plotY as number,
      }),
    ).toMatchObject({ index: 0, seriesIndex: 0 });
  });

  it("returns null for empty data instead of index 0", () => {
    expect(
      findNearestCartesianIndexByX({
        data: [],
        xKey: "x",
        plotWidth: plot.width,
        plotX: 10,
      }),
    ).toBeNull();
    expect(
      findNearestCartesianPoint({
        data: [],
        series: [{ key: "y" }],
        xKey: "x",
        yDomain: [0, 1],
        plotWidth: plot.width,
        plotHeight: plot.height,
        plotX: 10,
        plotY: 10,
      }),
    ).toBeNull();
  });
});
