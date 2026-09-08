import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "./testing-library";
import { AreaChart, AreaSeries, BarChart, BarSeries, Chart, Grid, XAxis, YAxis } from "../src";
import { resolveBarFill, resolveBarGeometryFill } from "../src/charts/bar-fill";
import { hitTestBars, resolveBarGeometry } from "../src/charts/bar-geometry";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import { DEFAULT_VALUE_LABEL_OFFSET } from "../src/charts/bar-value-label";
import type { BarDatumContext } from "../src/charts/types";
import { BarChart as MotionBarChart } from "../src/motion";
import { createLinearScale } from "../src/scales";
import { inferGroupedDomain, inferStackedDomain } from "../src/series";

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

describe("AreaChart and BarChart", () => {
  it("renders high-level AreaChart with multiple areas and reference line", () => {
    const markup = renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }, { key: "costs", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        showGrid
        outline
        referenceLines={[{ y: 12, label: "Ziel" }]}
      />,
    );

    expect(markup).toContain("data-kamod-chart-area-series");
    expect(markup).toContain("data-kamod-chart-grid");
    expect(markup).toContain("Ziel");
  });

  it("renders stacked areas with positive and negative values", () => {
    const markup = renderToString(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue" }, { key: "losses", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        stacked
      />,
    );

    expect(markup).toContain("data-kamod-chart-stacked-area-series");
    expect(markup).toContain("<path");
  });

  it("renders low-level AreaSeries and BarSeries", () => {
    const markup = renderToString(
      <Chart data={data} xKey="month" xScale="point" width={640} height={320}>
        <Grid yKey="revenue" />
        <XAxis />
        <YAxis dataKey="revenue" />
        <AreaSeries dataKey="revenue" />
        <BarSeries dataKey="costs" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-area-series");
    expect(markup).toContain("data-kamod-chart-bar-series");
    expect(markup).toContain("data-kamod-chart-bar");
  });

  it("renders grouped, stacked, horizontal bars and value labels", () => {
    const grouped = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue" }, { key: "costs", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        showGrid
        grouped
        radius={4}
        valueLabels
      />,
    );
    const stackedHorizontal = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue" }, { key: "losses", color: "var(--chart-2)" }]}
        width={640}
        height={320}
        stacked
        orientation="horizontal"
        minBarSize={2}
      />,
    );

    expect(grouped).toContain("data-kamod-chart-bars");
    expect(grouped).toContain(">20</text>");
    expect(stackedHorizontal).toContain("data-kamod-chart-bar");
  });

  it("uses numeric X and categorical Y axes for horizontal orientation", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        orientation="horizontal"
      />,
    );

    const xTicks = getAxisTicks(container, "x");
    const yTicks = getAxisTicks(container, "y");
    const numericXLabels = xTicks.map((tick) => tick.label).filter(Boolean);

    expect(numericXLabels.length).toBeGreaterThan(1);
    expect(numericXLabels.every((label) => Number.isFinite(Number(label.replace(/,/g, ""))))).toBe(
      true,
    );
    expect(Math.max(...xTicks.map((tick) => tick.position))).toBeGreaterThan(0);
    expect(yTicks.map((tick) => tick.label)).toEqual(expect.arrayContaining(["Jan", "Feb", "Mar"]));
    expect(Math.max(...yTicks.map((tick) => tick.position))).toBeGreaterThan(0);
  });

  it("aligns horizontal bar endpoints and category centers with axis scales", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const series = [{ key: "revenue" as const, id: "revenue" }];
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      horizontal: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    if (!jan) {
      throw new Error("expected Jan bar");
    }

    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={series}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        orientation="horizontal"
      />,
    );
    const bar = container.querySelector("[data-kamod-chart-bar]");
    const rendered = parseBarPathEnd(bar?.getAttribute("d") ?? null);
    const janTick = getAxisTicks(container, "y").find((tick) => tick.label === "Jan");
    const valueScale = createLinearScale({ domain: yDomain, range: [0, plot.width] });

    expect(rendered.x).toBeCloseTo(jan.anchorX, 5);
    expect(rendered.x).toBeCloseTo(valueScale(jan.value ?? 0), 5);
    expect(janTick?.position).toBeCloseTo(jan.anchorY, 5);
  });

  it("keeps categorical X and numeric Y axes for vertical orientation", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />,
    );

    const xTicks = getAxisTicks(container, "x");
    const yTicks = getAxisTicks(container, "y");

    expect(xTicks.map((tick) => tick.label)).toEqual(expect.arrayContaining(["Jan", "Feb", "Mar"]));
    expect(yTicks.map((tick) => tick.label)).not.toEqual(
      expect.arrayContaining(["Jan", "Feb", "Mar"]),
    );
    expect(yTicks.every((tick) => Number.isFinite(Number(tick.label.replace(/,/g, ""))))).toBe(
      true,
    );
  });

  it("formats large Y-axis values compactly to avoid label clipping", () => {
    const largeData: Datum[] = [
      { month: "Jan", revenue: 28_400, costs: 14_200, losses: 0 },
      { month: "Feb", revenue: 31_200, costs: 15_100, losses: 0 },
      { month: "Mar", revenue: 36_800, costs: 16_400, losses: 0 },
    ];
    const { container } = render(
      <AreaChart
        data={largeData}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showGrid
      />,
    );

    const yLabels = getAxisTicks(container, "y")
      .map((tick) => tick.label)
      .filter(Boolean);

    expect(yLabels.length).toBeGreaterThan(1);
    expect(yLabels.some((label) => label.endsWith("k") || label === "0")).toBe(true);
    expect(yLabels.every((label) => !/^0+$/.test(label) || label === "0")).toBe(true);
  });

  it("aligns horizontal numeric reference lines with the value axis", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const threshold = 12;
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const valueScale = createLinearScale({ domain: yDomain, range: [0, plot.width] });
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        orientation="horizontal"
        referenceLines={[{ x: threshold, label: "Target" }]}
      />,
    );
    const reference = container.querySelector("[data-kamod-chart-reference-line] line");
    if (!reference) {
      throw new Error("expected reference line");
    }

    expect(readNumberAttribute(reference, "x1")).toBeCloseTo(valueScale(threshold), 5);
    expect(readNumberAttribute(reference, "x2")).toBeCloseTo(valueScale(threshold), 5);
  });

  it("renders stacked horizontal bars with negative segments", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const series = [
      { key: "revenue" as const, id: "revenue" },
      { key: "losses" as const, id: "losses" },
    ];
    const yDomain = inferStackedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      stacked: true,
      horizontal: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janLosses = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "losses");
    expect(janLosses?.defined).toBe(true);
    expect(janLosses?.value).toBeLessThan(0);

    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={series}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        stacked
        orientation="horizontal"
      />,
    );

    expect(container.querySelectorAll("[data-kamod-chart-bar]").length).toBeGreaterThan(0);
    expect(getAxisTicks(container, "y").map((tick) => tick.label)).toEqual(
      expect.arrayContaining(["Jan", "Feb", "Mar"]),
    );
  });

  it("emits bar click callbacks", () => {
    const onBarClick = vi.fn();
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={640}
        height={320}
        onBarClick={onBarClick}
      />,
    );
    const bar = container.querySelector("[data-kamod-chart-bar]");

    if (!bar) {
      throw new Error("expected bar");
    }

    fireEvent.click(bar);

    expect(onBarClick).toHaveBeenCalledWith(data[0], "revenue", 0, 10);
  });
});

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

const mockSurfaceRect = (surface: Element) => {
  Object.defineProperty(surface, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: CHART_WIDTH,
      bottom: CHART_HEIGHT,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      toJSON: () => ({}),
    }),
  });
};

const movePointerToPlot = (surface: Element, plotX: number, plotY: number) => {
  mockSurfaceRect(surface);
  const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
  fireEvent.pointerMove(surface, {
    clientX: plot.x + plotX,
    clientY: plot.y + plotY,
  });
};

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

const parseTranslate = (transform: string | null): { x: number; y: number } => {
  const match = transform?.match(/translate\(([-\d.]+)(?:[,\s]+([-\d.]+))?\)/);
  if (!match?.[1]) {
    throw new Error(`expected translate transform, received ${transform}`);
  }

  return {
    x: Number(match[1]),
    y: Number(match[2] ?? 0),
  };
};

const readNumberAttribute = (element: Element | null, attribute: string): number => {
  const raw = element?.getAttribute(attribute);
  if (raw == null) {
    throw new Error(`expected attribute ${attribute}`);
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`expected numeric ${attribute}, received ${raw}`);
  }

  return value;
};

type AxisTick = {
  position: number;
  label: string;
};

const getAxisTicks = (container: ParentNode, axis: "x" | "y"): AxisTick[] => {
  const selector = axis === "x" ? "[data-kamod-chart-x-axis]" : "[data-kamod-chart-y-axis]";
  const axisGroup = container.querySelector(selector);
  if (!axisGroup) {
    throw new Error(`expected ${axis} axis`);
  }

  return [...axisGroup.querySelectorAll("g[transform]")].map((tick) => {
    const { x, y } = parseTranslate(tick.getAttribute("transform"));
    return {
      position: axis === "x" ? x : y,
      label: tick.querySelector("text")?.textContent?.trim() ?? "",
    };
  });
};

const parseBarPathEnd = (d: string | null): { x: number; y: number } => {
  const numbers = d?.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length < 4) {
    throw new Error(`expected bar path with coordinates, received ${d}`);
  }

  const [originX, originY, cornerX, cornerY] = numbers;
  return {
    x: Math.max(originX ?? 0, cornerX ?? 0),
    y: (originY ?? 0) + ((cornerY ?? 0) - (originY ?? 0)) / 2,
  };
};

describe("bar geometry", () => {
  const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
  const series = [
    { key: "revenue" as const, id: "revenue" },
    { key: "costs" as const, id: "costs" },
  ];

  it("keeps grouped bars in distinct category bands", () => {
    const yDomain = inferGroupedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      grouped: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenue = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    expect(janRevenue?.defined).toBe(true);
    expect(janCosts?.defined).toBe(true);
    expect(janRevenue?.x).not.toBe(janCosts?.x);
    expect(janRevenue?.anchorY).toBeLessThan((janRevenue?.y ?? 0) + (janRevenue?.height ?? 0));
  });

  it("stacks segments on a shared category band", () => {
    const yDomain = inferStackedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      stacked: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenue = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    expect(janRevenue?.x).toBe(janCosts?.x);
    expect(janRevenue?.width).toBe(janCosts?.width);
    expect(janCosts?.y).not.toBe(janRevenue?.y);
  });

  it("anchors negative vertical bars at the bottom center", () => {
    const negativeSeries = [{ key: "losses" as const, id: "losses" }];
    const yDomain = inferGroupedDomain(data, [{ id: "losses", value: "losses" }]);
    const bars = resolveBarGeometry({
      data,
      series: negativeSeries,
      xKey: "month",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    expect(jan?.value).toBe(-2);
    expect(jan?.anchorY).toBeCloseTo((jan?.y ?? 0) + (jan?.height ?? 0), 5);
  });

  it("anchors horizontal bars at the value end-center", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const bars = resolveBarGeometry({
      data,
      series: [{ key: "revenue", id: "revenue" }],
      xKey: "month",
      yDomain,
      horizontal: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    expect(jan?.anchorX).toBeCloseTo((jan?.x ?? 0) + (jan?.width ?? 0), 5);
    expect(jan?.anchorY).toBeCloseTo((jan?.y ?? 0) + (jan?.height ?? 0) / 2, 5);
    const hit = hitTestBars(
      bars,
      (jan?.x ?? 0) + (jan?.width ?? 0) / 2,
      (jan?.y ?? 0) + (jan?.height ?? 0) / 2,
      "nearest",
      true,
    );
    expect(hit?.seriesId).toBe("revenue");
    expect(hit?.index).toBe(0);
  });

  it("marks missing values as not selectable", () => {
    const sparse = [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: Number.NaN },
      { month: "Mar", revenue: 15 },
    ];
    const yDomain = inferGroupedDomain(sparse, [{ id: "revenue", value: "revenue" }]);
    const bars = resolveBarGeometry({
      data: sparse,
      series: [{ key: "revenue", id: "revenue" }],
      xKey: "month",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    expect(bars.find((bar) => bar.index === 1)?.defined).toBe(false);
    expect(bars.filter((bar) => bar.defined)).toHaveLength(2);
  });
});

describe("maxBarSize", () => {
  const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
  const series = [
    { key: "revenue" as const, id: "revenue" },
    { key: "costs" as const, id: "costs" },
  ];

  const singleSeries = [{ key: "revenue" as const, id: "revenue" }];

  it("limits and centers a single vertical bar", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const unlimited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const limited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      maxBarSize: 32,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janUnlimited = unlimited.find((bar) => bar.category === "Jan");
    const janLimited = limited.find((bar) => bar.category === "Jan");
    if (!janUnlimited || !janLimited) {
      throw new Error("expected Jan bar");
    }

    expect(janLimited.width).toBe(32);
    expect(janLimited.width).toBeLessThan(janUnlimited.width);
    expect(janLimited.x).toBeGreaterThan(janUnlimited.x);
    expect(janLimited.x + janLimited.width).toBeLessThan(janUnlimited.x + janUnlimited.width);
    expect(janLimited.x + janLimited.width / 2).toBeCloseTo(
      janUnlimited.x + janUnlimited.width / 2,
      5,
    );
  });

  it("limits and centers a horizontal bar height", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const unlimited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      horizontal: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const limited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      horizontal: true,
      maxBarSize: 24,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janUnlimited = unlimited.find((bar) => bar.category === "Jan");
    const janLimited = limited.find((bar) => bar.category === "Jan");
    if (!janUnlimited || !janLimited) {
      throw new Error("expected Jan bar");
    }

    expect(janLimited.height).toBe(24);
    expect(janLimited.y + janLimited.height / 2).toBeCloseTo(
      janUnlimited.y + janUnlimited.height / 2,
      5,
    );
  });

  it("centers a grouped bar cluster as a whole", () => {
    const yDomain = inferGroupedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const unlimited = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      grouped: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const limited = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      grouped: true,
      maxBarSize: 20,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenueUnlimited = unlimited.find(
      (bar) => bar.category === "Jan" && bar.seriesId === "revenue",
    );
    const janCostsUnlimited = unlimited.find(
      (bar) => bar.category === "Jan" && bar.seriesId === "costs",
    );
    const janRevenue = limited.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = limited.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    if (!janRevenueUnlimited || !janCostsUnlimited || !janRevenue || !janCosts) {
      throw new Error("expected grouped Jan bars");
    }

    expect(janRevenue.width).toBe(20);
    expect(janCosts.width).toBe(20);
    expect(janCosts.x).toBeGreaterThan(janRevenue.x + janRevenue.width);
    const unlimitedCenter =
      (janRevenueUnlimited.x + janCostsUnlimited.x + janCostsUnlimited.width) / 2;
    const limitedCenter = (janRevenue.x + janCosts.x + janCosts.width) / 2;
    expect(limitedCenter).toBeCloseTo(unlimitedCenter, 5);
  });

  it("shares limited category geometry across stacked segments", () => {
    const yDomain = inferStackedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      stacked: true,
      maxBarSize: 28,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenue = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    expect(janRevenue?.width).toBe(28);
    expect(janCosts?.width).toBe(28);
    expect(janRevenue?.x).toBe(janCosts?.x);
  });

  it("keeps negative values aligned to zero", () => {
    const negativeSeries = [{ key: "losses" as const, id: "losses" }];
    const yDomain = inferGroupedDomain(data, [{ id: "losses", value: "losses" }]);
    const bars = resolveBarGeometry({
      data,
      series: negativeSeries,
      xKey: "month",
      yDomain,
      maxBarSize: 32,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    expect(jan?.value).toBe(-2);
    expect(jan?.anchorY).toBeCloseTo((jan?.y ?? 0) + (jan?.height ?? 0), 5);
    expect(Number.isFinite(jan?.x ?? NaN)).toBe(true);
    expect(Number.isFinite(jan?.width ?? NaN)).toBe(true);
  });

  it("hit-tests the visible bar bounds instead of the full category band", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const unlimited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const limited = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      maxBarSize: 32,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janUnlimited = unlimited.find((bar) => bar.category === "Jan");
    const janLimited = limited.find((bar) => bar.category === "Jan");
    if (!janUnlimited || !janLimited) {
      throw new Error("expected Jan bar");
    }

    const outsideLimited = hitTestBars(
      limited,
      janUnlimited.x + 2,
      janLimited.y + janLimited.height / 2,
      "nearest",
      false,
    );
    const insideLimited = hitTestBars(
      limited,
      janLimited.x + janLimited.width / 2,
      janLimited.y + janLimited.height / 2,
      "nearest",
      false,
    );
    expect(outsideLimited).toBeNull();
    expect(insideLimited?.seriesId).toBe("revenue");
  });

  it("keeps active anchors and click data aligned with limited geometry", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const bars = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      maxBarSize: 32,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    if (!jan) {
      throw new Error("expected Jan bar");
    }

    const onBarClick = vi.fn();
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={singleSeries}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        maxBarSize={32}
        tooltip
        onBarClick={onBarClick}
      />,
    );
    movePointerToPlot(requireSurface(container), jan.anchorX, jan.anchorY);
    expect(
      container
        .querySelector('[data-kamod-chart-active="true"]')
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("revenue");
    fireEvent.keyDown(requireSurface(container), { key: "Enter" });
    expect(onBarClick).toHaveBeenCalledWith(data[0], "revenue", 0, 10);
  });

  it("does not enlarge bars when the natural band is smaller than maxBarSize", () => {
    const narrowPlot = { width: 120, height: 80 };
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    const natural = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      plotWidth: narrowPlot.width,
      plotHeight: narrowPlot.height,
    });
    const capped = resolveBarGeometry({
      data,
      series: singleSeries,
      xKey: "month",
      yDomain,
      maxBarSize: 200,
      plotWidth: narrowPlot.width,
      plotHeight: narrowPlot.height,
    });
    const janNatural = natural.find((bar) => bar.category === "Jan");
    const janCapped = capped.find((bar) => bar.category === "Jan");
    expect(janCapped?.width).toBe(janNatural?.width);
  });

  it("ignores invalid maxBarSize values without producing NaN paths", () => {
    const yDomain = inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]);
    for (const invalid of [0, -8, Number.NaN, Number.POSITIVE_INFINITY]) {
      const bars = resolveBarGeometry({
        data,
        series: singleSeries,
        xKey: "month",
        yDomain,
        maxBarSize: invalid,
        plotWidth: plot.width,
        plotHeight: plot.height,
      });
      const jan = bars.find((bar) => bar.category === "Jan");
      expect(Number.isFinite(jan?.x ?? NaN)).toBe(true);
      expect(Number.isFinite(jan?.y ?? NaN)).toBe(true);
      expect(Number.isFinite(jan?.width ?? NaN)).toBe(true);
      expect(Number.isFinite(jan?.height ?? NaN)).toBe(true);
    }

    const markup = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={singleSeries}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        maxBarSize={Number.NaN}
      />,
    );
    expect(markup).not.toContain("NaN");
  });
});

describe("bar fill", () => {
  const baseContext = (
    overrides: Partial<BarDatumContext<Datum>> = {},
  ): BarDatumContext<Datum> => ({
    datum: data[0]!,
    index: 0,
    value: 10,
    valueStart: 0,
    valueEnd: 10,
    seriesId: "revenue",
    seriesIndex: 0,
    orientation: "vertical",
    stacked: false,
    active: false,
    ...overrides,
  });

  it("uses constant fill instead of series color", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue", color: "#111111", fill: "#abcdef" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />,
    );
    expect(container.querySelector("[data-kamod-chart-bar]")?.getAttribute("fill")).toBe("#abcdef");
  });

  it("falls back from undefined callback results to series color", () => {
    const fill = vi.fn(() => undefined);
    render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue", color: "#222222", fill }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />,
    );
    expect(fill).toHaveBeenCalled();
    expect(resolveBarFill({ key: "revenue", color: "#222222", fill }, baseContext())).toBe(
      "#222222",
    );
  });

  it("passes grouped, stacked, positive, and negative context to fill callbacks", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const fill = (context: BarDatumContext<Datum>) =>
      context.value >= 0 ? "#positive" : "#negative";
    const groupedSeries = [
      { key: "revenue" as const, id: "revenue", label: "Revenue", fill },
      { key: "costs" as const, id: "costs", label: "Costs", fill: () => "#costs" },
    ];
    const groupedDomain = inferGroupedDomain(
      data,
      groupedSeries.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const stackedDomain = inferStackedDomain(
      data,
      groupedSeries.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const contexts: BarDatumContext<Datum>[] = [];

    render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            fill: (context) => {
              contexts.push(context);
              return fill(context);
            },
          },
          {
            key: "costs",
            id: "costs",
            fill: (context) => {
              contexts.push(context);
              return "#costs";
            },
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        grouped
      />,
    );

    const groupedBars = resolveBarGeometry({
      data,
      series: groupedSeries,
      xKey: "month",
      yDomain: groupedDomain,
      grouped: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const stackedBars = resolveBarGeometry({
      data,
      series: groupedSeries,
      xKey: "month",
      yDomain: stackedDomain,
      stacked: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const negativeBar = resolveBarGeometry({
      data,
      series: [{ key: "losses", id: "losses", fill }],
      xKey: "month",
      yDomain: inferGroupedDomain(data, [{ id: "losses", value: "losses" }]),
      plotWidth: plot.width,
      plotHeight: plot.height,
    }).find((bar) => bar.category === "Jan" && bar.defined);

    expect(contexts.some((context) => context.seriesId === "costs" && !context.stacked)).toBe(true);
    expect(
      resolveBarGeometryFill(groupedBars.find((bar) => bar.seriesId === "revenue")!, {
        orientation: "vertical",
        stacked: false,
        active: false,
      }),
    ).toBe("#positive");
    expect(
      resolveBarGeometryFill(stackedBars.find((bar) => bar.seriesId === "costs")!, {
        orientation: "vertical",
        stacked: true,
        active: false,
      }),
    ).toBe("#costs");
    expect(
      resolveBarGeometryFill(negativeBar!, {
        orientation: "vertical",
        stacked: false,
        active: false,
      }),
    ).toBe("#negative");
    expect(negativeBar?.value).toBeLessThan(0);
  });

  it("marks only the active bar with active: true in fill callbacks", () => {
    const activeFlags: boolean[] = [];
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            fill: (context) => {
              activeFlags.push(context.active);
              return context.active ? "#active" : "#idle";
            },
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    expect(activeFlags.every((active) => !active)).toBe(true);
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    expect(activeFlags.some((active) => active)).toBe(true);
    expect(container.querySelector('[data-kamod-chart-active="true"]')?.getAttribute("fill")).toBe(
      "#active",
    );
    expect(
      [...container.querySelectorAll("[data-kamod-chart-bar]")].filter(
        (bar) => bar.getAttribute("fill") === "#idle",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("keeps legend color on stable series.color while bars use fill", () => {
    const markup = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            label: "Revenue",
            color: "#series-blue",
            fill: () => "#bar-red",
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showLegend
      />,
    );
    expect(markup).toContain("background:#series-blue");
    expect(markup).toContain('fill="#bar-red"');
    expect(markup).not.toContain('fill="#series-blue"');
  });

  it("keeps tooltip rows stable while bar fill uses per-datum colors", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            label: "Revenue",
            color: "#series-blue",
            fill: () => "#bar-red",
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip-row]")?.textContent).toContain(
      "Revenue: 10",
    );
    expect(container.querySelector("[data-kamod-chart-bar]")?.getAttribute("fill")).toBe(
      "#bar-red",
    );
    expect(
      resolveBarFill(
        { key: "revenue", color: "#series-blue", fill: () => "#bar-red" },
        baseContext(),
      ),
    ).not.toBe("#series-blue");
  });

  it("does not evaluate fill callbacks for hidden series", () => {
    const revenueFill = vi.fn(() => "#revenue");
    const costsFill = vi.fn(() => "#costs");
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue", fill: revenueFill },
          { key: "costs", id: "costs", label: "Costs", fill: costsFill },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showLegend
      />,
    );
    expect(revenueFill).toHaveBeenCalledTimes(3);
    expect(costsFill).toHaveBeenCalledTimes(3);
    revenueFill.mockClear();
    costsFill.mockClear();

    const revenueButton = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
      (button) => button.textContent?.includes("Revenue"),
    );
    if (!revenueButton) {
      throw new Error("expected revenue legend item");
    }
    fireEvent.click(revenueButton);
    expect(revenueFill).not.toHaveBeenCalled();
    expect(costsFill).toHaveBeenCalledTimes(3);
  });

  it("renders identical fills for static SSR and motion with reduced motion", () => {
    const props = {
      data,
      xKey: "month" as const,
      series: [
        {
          key: "revenue" as const,
          id: "revenue",
          color: "#111111",
          fill: (context: BarDatumContext<Datum>) =>
            context.value >= 15 ? "#highlight" : "#regular",
        },
      ],
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      animate: { reducedMotion: "always" as const },
    };
    const staticMarkup = renderToString(<BarChart {...props} />);
    const motionMarkup = renderToString(<MotionBarChart {...props} />);
    const staticFills = [...staticMarkup.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]);
    const motionFills = [...motionMarkup.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]);

    expect(staticFills.filter((fill) => fill.startsWith("#"))).toEqual(
      motionFills.filter((fill) => fill.startsWith("#")),
    );
    expect(staticMarkup).not.toContain("NaN");
    expect(motionMarkup).not.toContain("NaN");
  });

  it("renders deterministic SSR fills for deterministic callbacks", () => {
    const markupA = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            fill: (context) => (context.value >= 15 ? "url(#hot)" : "url(#cool)"),
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />,
    );
    const markupB = renderToString(
      <BarChart
        data={data}
        xKey="month"
        series={[
          {
            key: "revenue",
            id: "revenue",
            fill: (context) => (context.value >= 15 ? "url(#hot)" : "url(#cool)"),
          },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />,
    );
    expect(markupA).toBe(markupB);
    expect(markupA).not.toMatch(/fill="(?:NaN|undefined|null)"/);
  });
});

describe("bar value label rendering", () => {
  const getBarLabel = (container: ParentNode, seriesId: string, index = 0) => {
    const bar = container.querySelector(
      `[data-kamod-chart-series-id="${seriesId}"][data-kamod-chart-index="${index}"]`,
    );
    return bar?.parentElement?.querySelector("[data-kamod-chart-value-label]");
  };

  it("preserves legacy valueLabels=true placement for positive vertical bars", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        valueLabels
      />,
    );
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const bars = resolveBarGeometry({
      data,
      series: [{ key: "revenue", id: "revenue" }],
      xKey: "month",
      yDomain: inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]),
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const feb = bars.find((bar) => bar.category === "Feb");
    const label = getBarLabel(container, "revenue", 1);
    expect(label?.textContent).toBe("20");
    expect(Number(label?.getAttribute("x"))).toBeCloseTo((feb?.x ?? 0) + (feb?.width ?? 0) / 2, 5);
    expect(Number(label?.getAttribute("y"))).toBeCloseTo(
      (feb?.y ?? 0) - DEFAULT_VALUE_LABEL_OFFSET,
      5,
    );
  });

  it("renders stacked raw values in segment centers and outer labels outside", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const series = [
      { key: "revenue" as const, id: "revenue" },
      { key: "costs" as const, id: "costs" },
    ];
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain: inferStackedDomain(
        data,
        series.map((entry) => ({ id: entry.id, value: entry.key })),
      ),
      stacked: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenue = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={series}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        stacked
        valueLabels
      />,
    );
    const revenueLabel = getBarLabel(container, "revenue", 0);
    const costsLabel = getBarLabel(container, "costs", 0);
    expect(revenueLabel?.textContent).toBe("10");
    expect(costsLabel?.textContent).toBe("4");
    expect(Number(revenueLabel?.getAttribute("y"))).toBeCloseTo(
      (janRevenue?.y ?? 0) + (janRevenue?.height ?? 0) / 2,
      5,
    );
    expect(Number(costsLabel?.getAttribute("y"))).toBeCloseTo(
      (janCosts?.y ?? 0) - DEFAULT_VALUE_LABEL_OFFSET,
      5,
    );
  });

  it("applies formatter, color, class, offset and suppresses individual labels", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[{ key: "revenue", id: "revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        valueLabels={{
          color: "#123456",
          class: "value-label",
          offset: 10,
          format: (value, context) => (context.index === 1 ? undefined : `$${value}`),
        }}
      />,
    );
    const labels = [...container.querySelectorAll("[data-kamod-chart-value-label]")];
    expect(labels).toHaveLength(2);
    expect(labels[0]?.textContent).toBe("$10");
    expect(labels[0]?.getAttribute("fill")).toBe("#123456");
    expect(labels[0]?.getAttribute("class")).toBe("value-label");
    expect(labels.some((label) => label.textContent === "$20")).toBe(false);
  });

  it("matches static and motion label positions when motion is suppressed", () => {
    const props = {
      data,
      xKey: "month" as const,
      series: [{ key: "losses" as const, id: "losses" }],
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      valueLabels: { position: "outside" as const },
      animate: { reducedMotion: "always" as const },
    };
    const staticMarkup = renderToString(<BarChart {...props} />);
    const motionMarkup = renderToString(<MotionBarChart {...props} />);
    const readLabels = (markup: string) =>
      [...markup.matchAll(/data-kamod-chart-value-label=""[^>]*x="([^"]+)"[^>]*y="([^"]+)"/g)].map(
        (match) => ({ x: Number(match[1]), y: Number(match[2]) }),
      );
    expect(readLabels(staticMarkup)).toEqual(readLabels(motionMarkup));
    expect(staticMarkup).not.toContain("NaN");
  });
});

describe("AreaChart and BarChart interactions", () => {
  it("shows AreaChart tooltips from pointer and keyboard with formatters", () => {
    const { container } = render(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip={{ formatValue: (value) => `$${value}`, formatLabel: () => "Month" }}
      />,
    );
    const surface = requireSurface(container);
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Month");
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("$");
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain(
      "Revenue",
    );

    fireEvent.pointerLeave(surface);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(surface, { key: "Escape" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("toggles one AreaChart series from the legend without removing the other", () => {
    const { container } = render(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showLegend
        tooltip
      />,
    );
    expect(container.querySelectorAll("[data-kamod-chart-area-series]")).toHaveLength(2);
    const buttons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
    const revenue = buttons.find((button) => button.textContent?.includes("Revenue"));
    if (!revenue) {
      throw new Error("expected revenue legend item");
    }
    fireEvent.click(revenue);
    expect(container.querySelectorAll("[data-kamod-chart-area-series]")).toHaveLength(1);
    expect(container.querySelector("[data-kamod-chart-series-id='costs']")).not.toBeNull();
  });

  it("reports stacked AreaChart original values rather than cumulative totals", () => {
    const { container } = render(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        stacked
        tooltip
      />,
    );
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    const text = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(text).toContain("Revenue: 10");
    expect(text).toContain("Costs: 4");
    expect(text).not.toContain("14");
  });

  it("clears AreaChart interaction after every series is hidden", () => {
    const { container } = render(
      <AreaChart
        data={data}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showLegend
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    const button = container.querySelector("[data-kamod-chart-legend-item]");
    if (!button) {
      throw new Error("expected legend item");
    }
    fireEvent.click(button);
    expect(container.querySelector("[data-kamod-chart-area-series]")).toBeNull();
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("selects the exact grouped BarChart series under the pointer", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const series = [
      { key: "revenue" as const, id: "revenue", label: "Revenue" },
      { key: "costs" as const, id: "costs", label: "Costs" },
    ];
    const yDomain = inferGroupedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      grouped: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const costs = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    if (!costs) {
      throw new Error("expected costs bar");
    }

    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={series}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        grouped
        tooltip
      />,
    );
    movePointerToPlot(
      requireSurface(container),
      costs.x + costs.width / 2,
      costs.y + costs.height / 2,
    );
    expect(
      container
        .querySelector('[data-kamod-chart-active="true"]')
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("costs");
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Costs");
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Jan");
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain("4");
  });

  it("selects a stacked BarChart segment rather than the whole category", () => {
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const series = [
      { key: "revenue" as const, id: "revenue", label: "Revenue" },
      { key: "costs" as const, id: "costs", label: "Costs" },
    ];
    const yDomain = inferStackedDomain(
      data,
      series.map((entry) => ({ id: entry.id, value: entry.key })),
    );
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain,
      stacked: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const top = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    if (!top) {
      throw new Error("expected stacked costs segment");
    }

    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={series}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        stacked
        tooltip={{ mode: "nearest" }}
      />,
    );
    movePointerToPlot(requireSurface(container), top.x + top.width / 2, top.y + top.height / 2);
    expect(
      container
        .querySelector('[data-kamod-chart-active="true"]')
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("costs");
    expect(container.querySelectorAll("[data-kamod-chart-tooltip-row]")).toHaveLength(1);
  });

  it("uses axis mode to report every visible BarChart series for a category", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip={{ mode: "axis" }}
      />,
    );
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    const text = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(text).toContain("Revenue");
    expect(text).toContain("Costs");
    expect(container.querySelectorAll("[data-kamod-chart-tooltip-row]").length).toBeGreaterThan(1);
  });

  it("recomputes BarChart geometry after legend toggles and clears a stale tooltip", () => {
    const { container } = render(
      <BarChart
        data={data}
        xKey="month"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        showLegend
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(6);

    const buttons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
    const revenue = buttons.find((button) => button.textContent?.includes("Revenue"));
    const costs = buttons.find((button) => button.textContent?.includes("Costs"));
    if (!revenue || !costs) {
      throw new Error("expected legend buttons");
    }

    fireEvent.click(revenue);
    expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(3);
    expect(container.querySelector("[data-kamod-chart-series-id='costs']")).not.toBeNull();

    fireEvent.click(costs);
    expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(0);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("skips missing BarChart values and keeps onBarClick compatible with Enter", () => {
    const sparse = [
      { month: "Jan", revenue: 10, costs: 4, losses: -2 },
      { month: "Feb", revenue: Number.NaN, costs: 8, losses: -5 },
      { month: "Mar", revenue: 15, costs: 6, losses: -3 },
    ];
    const onBarClick = vi.fn();
    const { container } = render(
      <BarChart
        data={sparse}
        xKey="month"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
        onBarClick={onBarClick}
      />,
    );
    expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(2);
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    fireEvent.keyDown(surface, { key: "Enter" });
    expect(onBarClick).toHaveBeenCalledWith(sparse[0], "revenue", 0, 10);
    fireEvent.keyDown(surface, { key: "ArrowRight" });
    expect(
      container
        .querySelector('[data-kamod-chart-active="true"]')
        ?.getAttribute("data-kamod-chart-index"),
    ).toBe("2");
  });
});
