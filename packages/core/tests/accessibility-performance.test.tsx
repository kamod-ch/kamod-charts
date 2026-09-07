import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  bisectDate,
  buildChartDescription,
  DataTable,
  downsampleByStride,
  getLargeDatasetWarning,
  interpolateValue,
  prefersReducedMotion,
  shouldAnimate,
  shouldReduceMarkers,
} from "../src";

describe("accessibility helpers", () => {
  const data = [
    { date: new Date("2026-01-01T00:00:00.000Z"), value: 10 },
    { date: new Date("2026-01-02T00:00:00.000Z"), value: null },
  ];

  it("renders an accessible data table alternative", () => {
    const markup = renderToString(
      <DataTable
        data={data}
        caption="Values"
        columns={[
          { id: "date", header: "Date", accessor: "date" },
          { id: "value", header: "Value", accessor: "value" },
        ]}
      />,
    );

    expect(markup).toContain("data-kamod-chart-data-table");
    expect(markup).toContain("Values");
    expect(markup).toContain("2026-01-01T00:00:00.000Z");
  });

  it("builds chart descriptions", () => {
    expect(buildChartDescription({ title: "Revenue", dataCount: 2, seriesCount: 1 })).toBe(
      "Revenue. 2 Datenpunkte. 1 Serien",
    );
  });
});

describe("animation and performance helpers", () => {
  it("is SSR-safe for reduced motion", () => {
    expect(prefersReducedMotion()).toBe(false);
    expect(shouldAnimate({ reducedMotion: true })).toBe(false);
    expect(interpolateValue(0, 10, 0.5)).toBe(5);
  });

  it("downsamples large arrays and keeps the last datum", () => {
    const data = Array.from({ length: 10_000 }, (_, index) => index);
    const sampled = downsampleByStride(data, { threshold: 1000 });

    expect(sampled.length).toBeLessThanOrEqual(1001);
    expect(sampled.at(-1)).toBe(9999);
    expect(shouldReduceMarkers(501)).toBe(true);
    expect(getLargeDatasetWarning(2001)).toContain("2001");
  });

  it("bisects sorted time series", () => {
    const data = [new Date(0), new Date(10), new Date(20)].map((date) => ({ date }));

    expect(bisectDate(data, new Date(11), (datum) => datum.date)).toBe(2);
  });
});
