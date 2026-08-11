import { describe, expect, it } from "vitest";
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  createTimeScale,
  inferCategoricalDomain,
  inferNumericDomain,
  inferTimeDomain,
} from "../src/scales";

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
