import { describe, expect, it } from "vitest";
import { getScalePosition } from "../src/axes";
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  createTimeScale,
  inferCategoricalDomain,
  inferNumericDomain,
  inferTimeDomain,
} from "../src/scales";
import { createCartesianScales } from "../src/series/cartesian";

describe("scales and domains", () => {
  const data = [
    { category: "A", date: new Date("2026-01-01T00:00:00.000Z"), value: -10 },
    { category: "B", date: new Date("2026-01-02T00:00:00.000Z"), value: 30 },
    { category: "A", date: new Date("2026-01-03T00:00:00.000Z"), value: null },
  ];

  it("infers numeric domains with negative values and missing values", () => {
    expect(inferNumericDomain({ data, accessor: "value" })).toEqual([-10, 30]);
  });

  it("expands one-point numeric domains", () => {
    expect(inferNumericDomain({ data: [{ value: 5 }], accessor: "value" })).toEqual([0, 10]);
  });

  it("infers time domains", () => {
    const domain = inferTimeDomain({ data, accessor: "date" });

    expect(domain[0].toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(domain[1].toISOString()).toBe("2026-01-03T00:00:00.000Z");
  });

  it("infers stable categorical domains", () => {
    expect(inferCategoricalDomain(data, "category")).toEqual(["A", "B"]);
  });

  it("creates linear, time, band, and point scales", () => {
    expect(createLinearScale({ domain: [-10, 30], range: [0, 400] })(10)).toBe(200);
    expect(
      createTimeScale({ domain: [new Date(0), new Date(1000)], range: [0, 10] })(new Date(500)),
    ).toBe(5);
    expect(createBandScale({ domain: ["A", "B"], range: [0, 100] })("A")).toBeTypeOf("number");
    expect(createPointScale({ domain: ["A", "B"], range: [0, 100] })("B")).toBeTypeOf("number");
  });
});

describe("createCartesianScales contract", () => {
  const data = [
    { x: 3, y: 3, date: new Date("2026-01-01T00:00:00.000Z") },
    { x: 97, y: 97, date: new Date("2026-01-03T00:00:00.000Z") },
  ];

  it("maps the exact inferred domain by default", () => {
    const scales = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      xRange: [0, 100],
      yRange: [200, 0],
    });

    expect(getScalePosition(scales.xScale, 3)).toBe(0);
    expect(getScalePosition(scales.xScale, 97)).toBe(100);
    expect(getScalePosition(scales.yScale, 3)).toBe(200);
    expect(getScalePosition(scales.yScale, 97)).toBe(0);
  });

  it("does not share a niced domain unless nice is requested", () => {
    const exact = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      xRange: [0, 100],
      yRange: [100, 0],
    });
    const niced = createCartesianScales({
      data,
      xKey: "x",
      yKey: "y",
      xRange: [0, 100],
      yRange: [100, 0],
      nice: true,
    });

    expect(getScalePosition(exact.xScale, 3)).not.toBe(getScalePosition(niced.xScale, 3));
    expect(niced.xScale.domain()).toEqual([0, 100]);
  });

  it("constructs time domains from Date values", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = new Date("2026-01-03T00:00:00.000Z");
    const scales = createCartesianScales({
      data,
      xKey: "date",
      yKey: "y",
      xScale: "time",
      xRange: [0, 10],
      yRange: [10, 0],
    });

    expect(getScalePosition(scales.xScale, start)).toBe(0);
    expect(getScalePosition(scales.xScale, end)).toBe(10);
    expect(getScalePosition(scales.xScale, new Date("2026-01-02T00:00:00.000Z"))).toBe(5);
  });
});
