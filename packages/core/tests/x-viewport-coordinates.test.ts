import { describe, expect, it } from "vitest";
import { panDomainByPlotDelta, projectXValueToPlot } from "../src/charts/x-viewport-coordinates";

describe("x viewport coordinates", () => {
  const data = Array.from({ length: 10 }, (_, index) => ({
    t: new Date(Date.UTC(2024, 0, 1, 0, index)),
    value: index,
  }));

  it("projects time values across plot width", () => {
    const domain: [Date, Date] = [data[0]!.t, data[9]!.t];
    const left = projectXValueToPlot(data[0]!.t, {
      data,
      xKey: (row) => row.t,
      xScale: "time",
      xDomain: domain,
      plotWidth: 400,
    });
    const right = projectXValueToPlot(data[9]!.t, {
      data,
      xKey: (row) => row.t,
      xScale: "time",
      xDomain: domain,
      plotWidth: 400,
    });
    expect(left).toBeCloseTo(0, 1);
    expect(right).toBeCloseTo(400, 1);
  });

  it("pans time domain by plot delta and clamps to extents", () => {
    const extents: [Date, Date] = [data[0]!.t, data[9]!.t];
    const view: [Date, Date] = [data[2]!.t, data[7]!.t];
    const panned = panDomainByPlotDelta(view, 80, 400, extents, "time") as [Date, Date];
    expect(panned[0].getTime()).toBeLessThan(view[0].getTime());
    expect(panned[1].getTime()).toBeLessThanOrEqual(extents[1].getTime());
  });
});
