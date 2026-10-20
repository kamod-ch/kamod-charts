import { describe, expect, it } from "vitest";
import { calculatePlotArea, normalizeMargin, resolveChartSize } from "../src/core";

describe("chart layout", () => {
  it("normalizes partial margins", () => {
    expect(normalizeMargin({ left: 12 })).toEqual({
      top: 16,
      right: 16,
      bottom: 32,
      left: 12,
    });
  });

  it("calculates clamped plot areas", () => {
    expect(
      calculatePlotArea({ width: 100, height: 80 }, { top: 10, right: 20, bottom: 30, left: 40 }),
    ).toEqual({ x: 40, y: 10, width: 40, height: 40 });

    expect(
      calculatePlotArea({ width: 10, height: 10 }, { top: 10, right: 20, bottom: 30, left: 40 }),
    ).toEqual({ x: 40, y: 10, width: 0, height: 0 });
  });

  it("resolves fixed and responsive initial sizes deterministically", () => {
    expect(resolveChartSize({ width: 500, height: 240 })).toEqual({ width: 500, height: 240 });
    expect(resolveChartSize({ height: 240, initialWidth: 720, responsive: true })).toEqual({
      width: 720,
      height: 240,
    });
    expect(
      resolveChartSize({
        initialWidth: 400,
        responsive: true,
        aspectRatio: 2,
        measuredWidth: 300,
      }),
    ).toEqual({ width: 300, height: 150 });
  });
});
