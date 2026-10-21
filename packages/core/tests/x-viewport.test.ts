import { describe, expect, it } from "vitest";
import {
  clampXViewportDomain,
  createTrailingTimeWindowDomain,
  inferContinuousXDomainFromData,
  normalizeChartXDomain,
  panXViewportDomain,
  resolveControlledChartXDomain,
  zoomXViewportDomain,
} from "../src/charts/x-viewport";

describe("x viewport helpers", () => {
  it("normalizes inverted numeric domains", () => {
    expect(normalizeChartXDomain([10, 2])).toEqual([2, 10]);
  });

  it("ignores xDomain on categorical scales", () => {
    expect(resolveControlledChartXDomain([0, 10], "point")).toBeUndefined();
  });

  it("infers time extents from data", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2024-01-01T01:00:00Z");
    const domain = inferContinuousXDomainFromData(
      [{ t: start }, { t: end }],
      (row) => row.t,
      "time",
    );
    expect(domain?.[0]).toEqual(start);
    expect(domain?.[1]).toEqual(end);
  });

  it("clamps pan and zoom within extents", () => {
    const extents: [number, number] = [0, 100];
    const view: [number, number] = [20, 40];
    const panned = panXViewportDomain(view, 50, extents, "linear");
    expect(panned[0]).toBeGreaterThanOrEqual(0);
    expect(panned[1]).toBeLessThanOrEqual(100);
    const zoomed = zoomXViewportDomain(view, 0.5, 30, extents, "linear") as [number, number];
    expect(zoomed[1] - zoomed[0]).toBeLessThan(view[1] - view[0]);
  });

  it("builds trailing time windows", () => {
    const end = new Date("2024-06-01T12:00:00Z");
    const extents: [Date, Date] = [new Date("2024-01-01T00:00:00Z"), end];
    const window = createTrailingTimeWindowDomain(end, 5 * 60_000, extents);
    expect(window[1]).toEqual(end);
    expect((window[1] as Date).getTime() - (window[0] as Date).getTime()).toBe(5 * 60_000);
    const clamped = clampXViewportDomain(window, extents, "time") as [Date, Date];
    expect(clamped[0].getTime()).toBeGreaterThanOrEqual(extents[0].getTime());
  });
});
