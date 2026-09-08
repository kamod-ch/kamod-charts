import { describe, expect, it } from "vitest";
import {
  inferScatterSizeDomain,
  isValidScatterSizeValue,
  mapScatterSizeToRadius,
  midpointOfRange,
  normalizeNumericPair,
  resolveFixedScatterRadius,
  resolveScatterRadius,
} from "../src/charts/scatter-size";

describe("scatter size scaling", () => {
  const domain = [0, 100] as const;
  const range = [4, 18] as const;

  it("validates non-negative finite size values and treats zero as valid", () => {
    expect(isValidScatterSizeValue(0)).toBe(true);
    expect(isValidScatterSizeValue(12)).toBe(true);
    expect(isValidScatterSizeValue(null)).toBe(false);
    expect(isValidScatterSizeValue(undefined)).toBe(false);
    expect(isValidScatterSizeValue(Number.NaN)).toBe(false);
    expect(isValidScatterSizeValue(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidScatterSizeValue(-1)).toBe(false);
  });

  it("maps sqrt scale at min, midpoint, and max", () => {
    expect(mapScatterSizeToRadius(0, domain, range, "sqrt")).toBeCloseTo(4, 8);
    expect(mapScatterSizeToRadius(100, domain, range, "sqrt")).toBeCloseTo(18, 8);
    expect(mapScatterSizeToRadius(25, domain, range, "sqrt")).toBeCloseTo(11, 8);
  });

  it("maps linear scale at min, midpoint, and max", () => {
    expect(mapScatterSizeToRadius(0, domain, range, "linear")).toBeCloseTo(4, 8);
    expect(mapScatterSizeToRadius(100, domain, range, "linear")).toBeCloseTo(18, 8);
    expect(mapScatterSizeToRadius(50, domain, range, "linear")).toBeCloseTo(11, 8);
  });

  it("clamps in-range values below and above the domain", () => {
    expect(mapScatterSizeToRadius(0, [10, 100], range, "linear")).toBeCloseTo(4, 8);
    expect(mapScatterSizeToRadius(150, domain, range, "linear")).toBeCloseTo(18, 8);
    expect(mapScatterSizeToRadius(0, [10, 100], range, "sqrt")).toBeCloseTo(4, 8);
    expect(mapScatterSizeToRadius(150, domain, range, "sqrt")).toBeCloseTo(18, 8);
  });

  it("normalizes reversed domain and range deterministically", () => {
    expect(normalizeNumericPair([100, 0])).toEqual([0, 100]);
    expect(normalizeNumericPair([18, 4])).toEqual([4, 18]);
    expect(mapScatterSizeToRadius(0, [100, 0], [18, 4], "linear")).toBeCloseTo(4, 8);
    expect(mapScatterSizeToRadius(100, [100, 0], [18, 4], "linear")).toBeCloseTo(18, 8);
  });

  it("uses an explicit domain without re-inferring from data", () => {
    const data = [{ size: 10 }, { size: 20 }];
    expect(inferScatterSizeDomain(data, "size", [0, 50])).toEqual([0, 50]);
    expect(mapScatterSizeToRadius(50, [0, 50], range, "linear")).toBeCloseTo(18, 8);
  });

  it("returns the range midpoint for constant and empty domains", () => {
    expect(mapScatterSizeToRadius(10, [5, 5], range, "linear")).toBeCloseTo(
      midpointOfRange(range),
      8,
    );
    expect(mapScatterSizeToRadius(10, [0, 0], range, "sqrt")).toBeCloseTo(
      midpointOfRange(range),
      8,
    );
    expect(inferScatterSizeDomain([], "size")).toEqual([0, 0]);
    expect(mapScatterSizeToRadius(10, [0, 0], range, "linear")).toBeCloseTo(11, 8);
  });

  it("never returns NaN or negative radii for invalid size values", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, -5, Number.NaN]) {
      const radius = mapScatterSizeToRadius(value, domain, range, "sqrt");
      expect(Number.isFinite(radius)).toBe(true);
      expect(radius).toBeGreaterThanOrEqual(0);
    }
  });

  it("infers domain from finite non-negative values only", () => {
    const data = [
      { size: 0 },
      { size: 10 },
      { size: null as number | null },
      { size: Number.NaN },
      { size: Number.POSITIVE_INFINITY },
      { size: -3 },
      { size: 30 },
    ];

    expect(inferScatterSizeDomain(data, "size")).toEqual([0, 30]);
  });

  it("marks invalid sizeKey values as invalid while keeping a safe radius", () => {
    const data = [{ size: Number.NaN }];
    const resolved = resolveScatterRadius({
      data,
      datum: data[0]!,
      index: 0,
      sizeKey: "size",
    });

    expect(resolved.sizeValid).toBe(false);
    expect(resolved.sizeValue).toBeNull();
    expect(resolved.radius).toBe(4);
    expect(Number.isFinite(resolved.radius)).toBe(true);
    expect(resolved.radius).toBeGreaterThanOrEqual(0);
  });

  it("resolves legacy pointSize and pointRadius aliases without sizeKey", () => {
    const datum = { value: 1 };
    expect(
      resolveScatterRadius({
        data: [datum],
        datum,
        index: 0,
        pointSize: 6,
      }).radius,
    ).toBe(6);
    expect(
      resolveScatterRadius({
        data: [datum],
        datum,
        index: 0,
        pointRadius: 8,
        pointSize: 6,
      }).radius,
    ).toBe(8);
    expect(resolveFixedScatterRadius(datum, 0, (_item, index) => index + 3, 4)).toBe(3);
  });

  it("follows pointRadius > pointSize > sizeKey > series.pointRadius > 4", () => {
    const datum = { size: 100 };
    const data = [datum];

    expect(
      resolveScatterRadius({
        data,
        datum,
        index: 0,
        sizeKey: "size",
        pointRadius: 9,
        pointSize: 7,
        seriesPointRadius: 6,
      }).radius,
    ).toBe(9);
    expect(
      resolveScatterRadius({
        data,
        datum,
        index: 0,
        sizeKey: "size",
        pointSize: 7,
        seriesPointRadius: 6,
      }).radius,
    ).toBe(7);
    expect(
      resolveScatterRadius({
        data,
        datum,
        index: 0,
        sizeKey: "size",
        sizeDomain: [0, 100],
        pointRadiusRange: [4, 18],
        sizeScale: "linear",
      }).radius,
    ).toBe(18);
    expect(
      resolveScatterRadius({
        data,
        datum,
        index: 0,
        seriesPointRadius: 6,
      }).radius,
    ).toBe(6);
    expect(resolveScatterRadius({ data, datum, index: 0 }).radius).toBe(4);
  });
});
