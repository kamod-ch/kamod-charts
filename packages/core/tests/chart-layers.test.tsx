import { render } from "@testing-library/preact";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChart } from "../src/charts/line-chart";
import { ScatterChart } from "../src/charts/scatter-chart";
import { createPlotClipPathId } from "../src/core/chart-clip";
import { Chart } from "../src/core/chart";
import { Grid } from "../src/primitives";
import { XAxis, YAxis } from "../src/axes";
import { LineSeries } from "../src/series";

const sample = [
  { x: "a", y: 1 },
  { x: "b", y: 2 },
];

describe("chart layers and clipping", () => {
  it("assigns distinct plot clip ids per chart instance", () => {
    const first = renderToString(
      <LineChart
        id="chart-a"
        data={sample}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        clipPlotArea
      />,
    );
    const second = renderToString(
      <LineChart
        id="chart-b"
        data={sample}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        clipPlotArea
      />,
    );
    expect(first).toContain(`id="${createPlotClipPathId("chart-a")}"`);
    expect(second).toContain(`id="${createPlotClipPathId("chart-b")}"`);
    expect(first).not.toContain(createPlotClipPathId("chart-b"));
  });

  it("does not clip by default", () => {
    const markup = renderToString(
      <LineChart
        id="no-clip"
        data={sample}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
      />,
    );
    expect(markup).not.toContain("data-kamod-chart-plot-clip");
    expect(markup).toContain('data-kamod-chart-layer="clipped"');
  });

  it("applies clip-path on clipped layer when enabled", () => {
    const markup = renderToString(
      <LineChart
        id="clip-line"
        data={sample}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        clipPlotArea
      />,
    );
    expect(markup).toContain(`clip-path="url(#${createPlotClipPathId("clip-line")})"`);
    expect(markup).toContain('data-kamod-chart-layer="axes"');
  });

  it("renders user defs at chart root", () => {
    const markup = renderToString(
      <LineChart
        id="defs-line"
        data={sample}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        defs={
          <pattern id="defs-line-hatch" patternUnits="userSpaceOnUse" width={4} height={4}>
            <path d="M0 4 L4 0" stroke="black" />
          </pattern>
        }
      />,
    );
    expect(markup).toContain("data-kamod-chart-defs");
    expect(markup).toContain('id="defs-line-hatch"');
  });

  it("keeps low-level Chart children without layer markers", () => {
    const markup = renderToString(
      <Chart data={sample} xKey="x" width={400} height={240} id="low-level">
        <Grid xKey="x" yDomain={[0, 2]} />
        <XAxis dataKey="x" />
        <YAxis domain={[0, 2]} />
        <LineSeries id="s" dataKey="y" yDomain={[0, 2]} />
      </Chart>,
    );
    expect(markup).not.toContain('data-kamod-chart-layer="clipped"');
    expect(markup).toContain("data-kamod-chart-plot");
  });

  it("hydrates layered scatter markup consistently", () => {
    const props = {
      id: "scatter-clip",
      data: [{ x: 1, y: 2 }],
      xKey: "x" as const,
      series: [{ key: "y" as const, id: "s1" }],
      height: 200,
      clipPlotArea: true,
      pointRadius: 24,
    };
    const ssr = renderToString(<ScatterChart {...props} />);
    const { container } = render(<ScatterChart {...props} />);
    expect(ssr).toContain(createPlotClipPathId("scatter-clip"));
    expect(container.querySelector('[data-kamod-chart-layer="clipped"]')).toBeTruthy();
  });
});
