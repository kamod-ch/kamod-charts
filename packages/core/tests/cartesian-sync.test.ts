import { describe, expect, it } from "vitest";
import { findNearestDatumIndexByX } from "../src/charts/cartesian-sync";

describe("findNearestDatumIndexByX", () => {
  const data = [
    { t: new Date("2024-01-01T00:00:00Z"), v: 1 },
    { t: new Date("2024-01-01T01:00:00Z"), v: 2 },
    { t: new Date("2024-01-01T03:00:00Z"), v: 3 },
  ];

  it("picks nearest timestamp within maxDeltaMs", () => {
    const index = findNearestDatumIndexByX(data, "t", new Date("2024-01-01T01:10:00Z"), {
      xScale: "time",
      maxDeltaMs: 60 * 60 * 1000,
    });
    expect(index).toBe(1);
  });

  it("returns null when outside maxDeltaMs", () => {
    const index = findNearestDatumIndexByX(data, "t", new Date("2024-01-01T02:00:00Z"), {
      xScale: "time",
      maxDeltaMs: 15 * 60 * 1000,
    });
    expect(index).toBeNull();
  });
});
