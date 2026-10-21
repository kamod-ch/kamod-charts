import { describe, expect, it } from "vitest";
import {
  computeHistogramBins,
  formatHistogramBinInterval,
  histogramBinsToBarData,
} from "../src/data/histogram-bins";

describe("computeHistogramBins", () => {
  it("assigns each valid value exactly once and preserves total count", () => {
    const values = [1, 2, 2, 3, 3, 3, null, Number.NaN, undefined, -1];
    const result = computeHistogramBins(values, { binCount: 3 });
    const sum = result.bins.reduce((total, bin) => total + bin.count, 0);
    expect(sum).toBe(result.assignedCount);
    expect(result.assignedCount).toBe(7);
    expect(result.skippedCount).toBe(3);
  });

  it("uses inclusive right edge on the last bin only", () => {
    const result = computeHistogramBins([5, 15], { edges: [0, 10, 20] });
    expect(result.bins[0]!.count).toBe(1);
    expect(result.bins[1]!.count).toBe(1);
    expect(formatHistogramBinInterval(result.bins[0]!, false)).toBe("[0, 10)");
    expect(formatHistogramBinInterval(result.bins[1]!, true)).toBe("[10, 20]");
  });

  it("supports unequal bin widths", () => {
    const result = computeHistogramBins([5, 15, 25, 35], {
      edges: [0, 10, 30, 40],
    });
    expect(result.bins.map((bin) => bin.count)).toEqual([1, 2, 1]);
  });

  it("handles identical values in a single bin", () => {
    const result = computeHistogramBins([7, 7, 7], { binCount: 5 });
    expect(result.bins.reduce((total, bin) => total + bin.count, 0)).toBe(3);
    expect(result.bins.some((bin) => bin.count === 3)).toBe(true);
  });

  it("maps bins to bar chart rows with interval labels", () => {
    const result = computeHistogramBins([1, 2, 9], { edges: [0, 5, 10] });
    const rows = histogramBinsToBarData(result);
    expect(rows[0]!.bin).toBe("[0, 5)");
    expect(rows[1]!.bin).toBe("[5, 10]");
    expect(rows.reduce((total, row) => total + row.count, 0)).toBe(3);
  });
});
