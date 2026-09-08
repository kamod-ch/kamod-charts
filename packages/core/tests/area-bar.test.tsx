import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "./testing-library";
import { AreaChart, AreaSeries, BarChart, BarSeries, Chart, Grid, XAxis, YAxis } from "../src";
import { hitTestBars, resolveBarGeometry } from "../src/charts/bar-geometry";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
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
