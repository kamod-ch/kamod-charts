import { describe, expect, it } from "vitest";
import {
  intersectContinuousXDomains,
  resolveSynchronizedXExtents,
  unionContinuousXDomains,
} from "../src/charts/x-viewport";

describe("synchronized x extents", () => {
  const a: [Date, Date] = [new Date("2024-01-01T00:00:00Z"), new Date("2024-06-01T00:00:00Z")];
  const b: [Date, Date] = [new Date("2024-03-01T00:00:00Z"), new Date("2024-09-01T00:00:00Z")];

  it("intersects overlapping time ranges", () => {
    const intersection = intersectContinuousXDomains([a, b], "time") as [Date, Date];
    expect(intersection[0].toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(intersection[1].toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("falls back to union when intersection is empty", () => {
    const disjoint: [Date, Date] = [
      new Date("2025-01-01T00:00:00Z"),
      new Date("2025-02-01T00:00:00Z"),
    ];
    const resolved = resolveSynchronizedXExtents([a, disjoint], "time") as [Date, Date];
    expect(resolved[0].toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(resolved[1].toISOString()).toBe("2025-02-01T00:00:00.000Z");
  });

  it("unions envelopes", () => {
    const union = unionContinuousXDomains([a, b], "time") as [Date, Date];
    expect(union[0].toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(union[1].toISOString()).toBe("2024-09-01T00:00:00.000Z");
  });
});
