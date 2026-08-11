import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Chart, Grid, XAxis, YAxis } from "../src";

interface Datum {
  category: string;
  date: Date;
  value: number;
}

const data: Datum[] = [
  { category: "A", date: new Date("2026-01-01T00:00:00.000Z"), value: -5 },
  { category: "B", date: new Date("2026-01-02T00:00:00.000Z"), value: 10 },
];

describe("axes and grid SSR", () => {
  it("renders Preact SVG axes and grid for numeric data", () => {
    const markup = renderToString(
      <Chart data={data} width={400} height={240} id="axis-chart">
        <Grid yKey="value" yDomain={[-10, 10]} />
        <XAxis domain={[0, 1]} tickCount={2} label="Index" />
        <YAxis dataKey="value" domain={[-10, 10]} tickCount={3} label="Value" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-grid");
    expect(markup).toContain("data-kamod-chart-x-axis");
    expect(markup).toContain("data-kamod-chart-y-axis");
    expect(markup).toContain("Value");
    expect(markup).not.toContain("d3-selection");
  });

  it("renders time and band axes", () => {
    const markup = renderToString(
      <Chart data={data} width={400} height={240} id="mixed-axis-chart">
        <XAxis dataKey="date" scale="time" tickCount={2} formatSpecifier="%Y-%m-%d" />
        <YAxis domain={[-10, 10]} tickCount={3} />
      </Chart>,
    );
    const bandMarkup = renderToString(
      <Chart data={data} width={400} height={240} id="band-axis-chart">
        <XAxis dataKey="category" scale="band" />
        <YAxis dataKey="value" />
      </Chart>,
    );

    expect(markup).toContain("2026-01-01");
    expect(bandMarkup).toContain(">A</text>");
    expect(bandMarkup).toContain(">B</text>");
  });

  it("handles empty data and one-point domains", () => {
    const empty = renderToString(
      <Chart data={[]} width={320} height={180} id="empty-axis-chart" emptyState={null}>
        <XAxis dataKey="category" scale="band" />
        <YAxis dataKey="value" />
      </Chart>,
    );
    const onePoint = renderToString(
      <Chart data={[{ value: 5 }]} width={320} height={180} id="one-point-axis-chart">
        <YAxis dataKey="value" />
      </Chart>,
    );

    expect(empty).toContain("empty-axis-chart");
    expect(onePoint).toContain("data-kamod-chart-y-axis");
  });
});
