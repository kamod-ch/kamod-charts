import { describe, expect, it } from "vitest";
import { downsampleMinMax } from "../src/performance/downsample-min-max";

describe("downsampleMinMax", () => {
  const data = Array.from({ length: 20 }, (_, index) => ({
    x: index,
    y: index === 10 ? 100 : index,
  }));

  it("preserves a sharp spike and endpoints", () => {
    const sampled = downsampleMinMax(
      data,
      (datum) => datum.x,
      (datum) => datum.y,
      { budget: 8 },
    );
    const indices = sampled.map((entry) => entry.index);
    expect(indices[0]).toBe(0);
    expect(indices.at(-1)).toBe(19);
    expect(indices).toContain(10);
  });
});
