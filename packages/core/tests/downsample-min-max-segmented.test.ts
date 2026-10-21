import { describe, expect, it } from "vitest";
import { downsampleMinMaxSegmented } from "../src/performance/downsample-min-max-segmented";
import { buildLinePath } from "../src/series/paths";
import type { CartesianPoint } from "../src/series/cartesian";

describe("downsampleMinMaxSegmented", () => {
  const readX = (datum: { x: number }) => datum.x;
  const readY = (datum: { y: number | null }) => datum.y;

  it("returns empty output for budget 0 and non-finite budgets", () => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
    ];
    expect(downsampleMinMaxSegmented(data, readX, readY, { budget: 0 }).points).toEqual([]);
    expect(downsampleMinMaxSegmented(data, readX, readY, { budget: -3 }).points).toEqual([]);
    expect(downsampleMinMaxSegmented(data, readX, readY, { budget: Number.NaN }).points).toEqual(
      [],
    );
  });

  it("uses floor for non-integer budgets", () => {
    const data = Array.from({ length: 30 }, (_, index) => ({
      x: index,
      y: index === 15 ? 80 : index,
    }));
    const sampled = downsampleMinMaxSegmented(data, readX, readY, { budget: 5.9 });
    expect(sampled.points.length).toBeLessThanOrEqual(5);
    expect(sampled.points.length).toBeGreaterThan(0);
  });

  it("keeps spike before and after a null gap in separate segments", () => {
    const data = [
      ...Array.from({ length: 12 }, (_, index) => ({ x: index, y: index === 6 ? 50 : index })),
      { x: 12, y: null },
      ...Array.from({ length: 12 }, (_, index) => ({
        x: 20 + index,
        y: index === 6 ? 60 : index,
      })),
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 10 });
    expect(result.segments).toHaveLength(2);
    const indices = result.points.map((entry) => entry.index);
    expect(indices.some((index) => data[index]?.y === 50)).toBe(true);
    expect(indices.some((index) => data[index]?.y === 60)).toBe(true);
    expect(indices).not.toContain(12);
  });

  it("splits on explicit gapThreshold without inferring interval", () => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 100, y: 3 },
      { x: 101, y: 4 },
    ];
    const withoutThreshold = downsampleMinMaxSegmented(data, readX, readY, { budget: 10 });
    expect(withoutThreshold.segments).toHaveLength(1);

    const withThreshold = downsampleMinMaxSegmented(data, readX, readY, {
      budget: 10,
      gapThreshold: 10,
    });
    expect(withThreshold.segments).toHaveLength(2);
    expect(withThreshold.timeGapAfterIndices).toEqual([1]);
  });

  it("allocates tight budgets deterministically across many segments", () => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: null },
      { x: 2, y: 2 },
      { x: 3, y: null },
      { x: 4, y: 3 },
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 2 });
    expect(result.points.map((entry) => entry.index)).toEqual([0, 2]);
  });

  it("handles budget 1 with a single valid point", () => {
    const data = [
      { x: 0, y: null },
      { x: 1, y: 5 },
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 1 });
    expect(result.points).toEqual([{ datum: data[1], index: 1 }]);
  });

  it("handles budget 2 on one segment with endpoints", () => {
    const data = Array.from({ length: 8 }, (_, index) => ({ x: index, y: index }));
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 2 });
    expect(result.points.map((entry) => entry.index)).toEqual([0, 7]);
  });

  it("returns no drawable points when all Y values are missing", () => {
    const data = [
      { x: 0, y: null },
      { x: 1, y: Number.NaN },
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 8 });
    expect(result.points).toEqual([]);
    expect(result.segments).toEqual([]);
    expect(result.valueGapIndices).toEqual([0, 1]);
  });

  it("does not reorder unsorted X input", () => {
    const data = [
      { x: 5, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 3 },
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 10 });
    expect(result.points.map((entry) => entry.index)).toEqual([0, 1, 2]);
  });

  it("keeps duplicate X values without inventing merged coordinates", () => {
    const data = [
      { x: 1, y: 1 },
      { x: 1, y: 5 },
      { x: 1, y: 2 },
    ];
    const result = downsampleMinMaxSegmented(data, readX, readY, { budget: 10 });
    expect(result.points).toHaveLength(3);
    expect(result.points.map((entry) => entry.datum.y)).toEqual([1, 5, 2]);
  });

  it("preserves original datum references and indices", () => {
    const row = { x: 0, y: 1 };
    const result = downsampleMinMaxSegmented([row], readX, readY, { budget: 1 });
    expect(result.points[0]?.datum).toBe(row);
    expect(result.points[0]?.index).toBe(0);
  });

  it("renders a broken SVG path after reduction when connectNulls is false", () => {
    const data = Array.from({ length: 40 }, (_, index) => ({
      x: index,
      y: index === 20 ? null : index === 10 || index === 30 ? 80 : index,
    }));
    const reduced = downsampleMinMaxSegmented(data, readX, readY, { budget: 8 });
    const points: CartesianPoint<{ x: number; y: number | null }>[] = [];
    let previousSegment = -1;

    reduced.points.forEach((entry) => {
      const segmentIndex = reduced.segments.findIndex(
        (segment) => entry.index >= segment.firstIndex && entry.index <= segment.lastIndex,
      );
      if (previousSegment >= 0 && segmentIndex !== previousSegment) {
        points.push({
          datum: entry.datum,
          index: entry.index,
          xValue: null,
          yValue: null,
          x: Number.NaN,
          y: Number.NaN,
          defined: false,
        });
      }
      points.push({
        datum: entry.datum,
        index: entry.index,
        xValue: entry.datum.x,
        yValue: entry.datum.y,
        x: entry.datum.x,
        y: entry.datum.y ?? Number.NaN,
        defined: typeof entry.datum.y === "number" && Number.isFinite(entry.datum.y),
      });
      previousSegment = segmentIndex;
    });

    const path = buildLinePath(points, "linear", false);
    expect(path.split("M").length).toBeGreaterThan(1);
  });
});
