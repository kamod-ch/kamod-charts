import {
  area,
  curveBasis,
  curveMonotoneX,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line,
  type CurveFactory,
} from "d3-shape";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { AreaChart } from "../src";
import type { LineCurve } from "../src/series";
import type { CartesianPoint } from "../src/series/cartesian";
import { buildAreaPath, buildLinePath } from "../src/series/paths";

interface Datum {
  month: string;
  revenue: number;
  costs: number;
  losses: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: 20, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

const samplePoints: CartesianPoint<Record<string, never>>[] = [
  { x: 0, y: 100, defined: true, datum: {}, index: 0, xValue: 0, yValue: 100 },
  { x: 100, y: 50, defined: true, datum: {}, index: 1, xValue: 100, yValue: 50 },
  { x: 200, y: 100, defined: true, datum: {}, index: 2, xValue: 200, yValue: 100 },
];

const linePathWith = (curve: CurveFactory) =>
  line<CartesianPoint<Record<string, never>>>()
    .x((point) => point.x ?? 0)
    .y((point) => point.y ?? 0)
    .curve(curve)(samplePoints);

const areaPathWith = (curve: CurveFactory) =>
  area<CartesianPoint<Record<string, never>>>()
    .defined((point) => point.defined)
    .x((point) => point.x ?? 0)
    .y0(200)
    .y1((point) => point.y ?? 200)
    .curve(curve)(samplePoints);

describe("LineCurve resolution", () => {
  const stepCases = [
    ["step", curveStep],
    ["stepBefore", curveStepBefore],
    ["stepAfter", curveStepAfter],
  ] as const satisfies ReadonlyArray<readonly [LineCurve, CurveFactory]>;

  for (const [curveName, d3Curve] of stepCases) {
    it(`buildLinePath with ${curveName} matches d3-shape`, () => {
      expect(buildLinePath(samplePoints, curveName, false)).toBe(linePathWith(d3Curve));
    });

    it(`buildAreaPath with ${curveName} matches d3-shape`, () => {
      expect(buildAreaPath(samplePoints, curveName, 200)).toBe(areaPathWith(d3Curve));
    });
  }

  it("step curves differ from linear for non-axis-aligned data", () => {
    const linear = buildLinePath(samplePoints, "linear", false);
    const stepped = buildLinePath(samplePoints, "step", false);
    expect(stepped).not.toBe(linear);
    expect(stepped).not.toContain("NaN");
  });

  it("buildAreaPath preserves basis instead of falling back to linear", () => {
    const basis = buildAreaPath(samplePoints, "basis", 200);
    const linear = buildAreaPath(samplePoints, "linear", 200);
    expect(basis).not.toBe(linear);
    expect(basis).toBe(areaPathWith(curveBasis));
  });

  it("buildAreaPath preserves monotoneX", () => {
    expect(buildAreaPath(samplePoints, "monotoneX", 200)).toBe(areaPathWith(curveMonotoneX));
  });
});

describe("StackedAreaSeries curve and outline", () => {
  const renderStacked = (props: { curve?: LineCurve; outline?: boolean } = {}) =>
    renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[
          { key: "revenue", id: "revenue" },
          { key: "costs", id: "costs", color: "var(--chart-2)" },
        ]}
        width={640}
        height={320}
        stacked
        {...props}
      />,
    );

  const extractPaths = (markup: string) => [...markup.matchAll(/<path[^>]*d="([^"]+)"[^>]*>/g)];

  const extractStackedAreaPaths = (markup: string) =>
    [...markup.matchAll(/data-kamod-chart-stacked-area-series[^>]*>([\s\S]*?)<\/g>/g)]
      .flatMap((match) => [...(match[1]?.matchAll(/<path[^>]*>/g) ?? [])])
      .map((match) => match[0]);

  it("stacked areas respect curve=step", () => {
    const linearMarkup = renderStacked({ curve: "linear" });
    const stepMarkup = renderStacked({ curve: "step" });
    const linearPaths = extractPaths(linearMarkup).map((match) => match[1]);
    const stepPaths = extractPaths(stepMarkup).map((match) => match[1]);
    expect(stepPaths.length).toBeGreaterThan(0);
    expect(stepPaths.some((path, index) => path !== linearPaths[index])).toBe(true);
  });

  it("stacked areas omit stroke when outline=false", () => {
    const markup = renderStacked({ outline: false });
    const paths = extractStackedAreaPaths(markup);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.includes('stroke="none"'))).toBe(true);
  });

  it("stacked areas render stroke when outline=true", () => {
    const markup = renderStacked({ outline: true });
    const paths = extractStackedAreaPaths(markup);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => /stroke="var\(--chart-/.test(path))).toBe(true);
  });
});

describe("AreaChart curve regressions", () => {
  it("non-stacked areas still render with monotoneX and basis curves", () => {
    for (const curve of ["monotoneX", "basis"] as const) {
      const markup = renderToString(
        <AreaChart
          data={data}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue" }]}
          width={640}
          height={320}
          curve={curve}
        />,
      );
      expect(markup).toContain("data-kamod-chart-area-series");
      expect(markup).toMatch(/d="M/);
    }
  });

  it("stacked areas with negative values still render", () => {
    const markup = renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[
          { key: "revenue", id: "revenue" },
          { key: "losses", id: "losses", color: "var(--chart-2)" },
        ]}
        width={640}
        height={320}
        stacked
        curve="linear"
      />,
    );
    expect(markup).toContain("data-kamod-chart-stacked-area-series");
    expect(markup).toContain("<path");
  });
});
