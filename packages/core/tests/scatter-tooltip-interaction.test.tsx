import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import type { JSX } from "preact";
import { describe, expect, it, vi } from "vitest";
import { getScalePosition } from "../src/axes";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import {
  buildScatterInteractionCandidates,
  findNearestScatterCandidate,
  toScatterPointContext,
} from "../src/charts/scatter-interaction";
import { createScatterKeyboardHandler } from "../src/charts/scatter-keyboard";
import { BarChart, LineChart, ScatterChart } from "../src";
import { inferCombinedNumericDomain } from "../src/series";
import { createCartesianScales } from "../src/series/cartesian";

const plot = resolvePlotAreaFromSize(640, 320);

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
  const plotArea = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
  fireEvent.pointerMove(surface, {
    clientX: plotArea.x + plotX,
    clientY: plotArea.y + plotY,
  });
};

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

describe("scatter bubble hit-testing", () => {
  it("prefers a large bubble edge over a farther center", () => {
    const data = [
      { x: 20, y: 50, size: 100 },
      { x: 80, y: 50, size: 1 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["y"]);
    const candidates = buildScatterInteractionCandidates({
      data,
      series: [{ key: "y", id: "primary" }],
      visibleSeries: [{ key: "y", id: "primary" }],
      xKey: "x",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
      sizeKey: "size",
      sortByRadius: true,
    });
    const large = candidates.find((candidate) => candidate.index === 0);
    const small = candidates.find((candidate) => candidate.index === 1);
    expect(large).toBeDefined();
    expect(small).toBeDefined();
    expect((large?.baseRadius ?? 0) > (small?.baseRadius ?? 0)).toBe(true);

    const pointerX = (large!.plotX + small!.plotX) / 2;
    const hit = findNearestScatterCandidate(candidates, pointerX, large!.plotY);
    expect(hit?.index).toBe(0);
  });

  it("breaks ties by center distance, then visual z-order for overlapping bubbles", () => {
    const data = [{ x: 50, y: 50, alt: 50, size: 80 }];
    const yDomain = inferCombinedNumericDomain(data, ["y", "alt"]);
    const candidates = buildScatterInteractionCandidates({
      data,
      series: [
        { key: "y", id: "a" },
        { key: "alt", id: "b" },
      ],
      visibleSeries: [
        { key: "y", id: "a" },
        { key: "alt", id: "b" },
      ],
      xKey: "x",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
      sizeKey: "size",
      sortByRadius: true,
    });
    expect(candidates).toHaveLength(2);
    expect(candidates[0]?.plotX).toBeCloseTo(candidates[1]?.plotX ?? 0, 5);
    expect(candidates[0]?.plotY).toBeCloseTo(candidates[1]?.plotY ?? 0, 5);

    const hit = findNearestScatterCandidate(candidates, candidates[0]!.plotX, candidates[0]!.plotY);
    expect(hit?.seriesId).toBe(candidates.at(-1)?.seriesId);
  });

  it("excludes hidden categories and invalid size values from candidates", () => {
    const data = [
      { x: 10, y: 10, group: "alpha", size: 10 },
      { x: 20, y: 20, group: "beta", size: Number.NaN },
      { x: 30, y: 30, group: "gamma", size: 20 },
    ];
    const yDomain = inferCombinedNumericDomain(data, ["y"]);
    const candidates = buildScatterInteractionCandidates({
      data,
      series: [{ key: "y", id: "primary" }],
      visibleSeries: [{ key: "y", id: "primary" }],
      xKey: "x",
      yDomain,
      plotWidth: plot.width,
      plotHeight: plot.height,
      sizeKey: "size",
      categoryKey: "group",
      categories: [
        { value: "alpha", id: "alpha" },
        { value: "beta", id: "beta" },
        { value: "gamma", id: "gamma" },
      ],
      hiddenCategoryIds: ["beta"],
      sortByRadius: true,
    });

    expect(candidates.map((candidate) => candidate.index)).toEqual([2, 0]);
  });
});

describe("scatter tooltip and accessibility", () => {
  it("keeps basic tooltip text unchanged without sizeKey or categoryKey", () => {
    const data = [{ x: 10, y: 20 }];
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    expect(tooltip?.textContent).toContain("Primary: 20");
    expect(tooltip?.textContent).not.toContain("·");
  });

  it("includes raw sizeValue in tooltip and live region when sizeKey is set", () => {
    const data = [{ x: 10, y: 20, size: 100 }];
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        sizeKey="size"
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    const liveRegion = container.querySelector("[data-kamod-chart-live-region]");
    expect(tooltip?.textContent).toContain("Primary: 20 · 100");
    expect(liveRegion?.textContent).toContain("Primary: 20 · 100");
  });

  it("uses category label and point color swatch in category mode", () => {
    const data = [{ x: 10, y: 20, group: "alpha" }];
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary", color: "var(--chart-99)" }]}
        categoryKey="group"
        categories={[{ value: "alpha", label: "Alpha", color: "var(--chart-2)" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    const swatch = container.querySelector("[data-kamod-chart-tooltip-swatch]");
    expect(tooltip?.textContent).toContain("Alpha: 20");
    expect(tooltip?.textContent).not.toContain("Primary:");
    expect(swatch?.getAttribute("style")).toContain("var(--chart-2)");
  });

  it("passes a resolved scatterPoint to custom tooltip render callbacks", () => {
    const renderSpy = vi.fn(
      ({
        scatterPoint,
      }: {
        scatterPoint?: {
          sizeValue: number | null;
          categoryLabel: string | null;
          categoryId: string | null;
        };
      }) => <div data-testid="custom-tooltip">{scatterPoint?.sizeValue ?? "none"}</div>,
    );
    const data = [{ x: 10, y: 20, group: "alpha", size: 55 }];
    const { container } = render(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        categoryKey="group"
        categories={[{ value: "alpha", label: "Alpha", color: "var(--chart-2)" }]}
        sizeKey="size"
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip={{ render: renderSpy }}
      />,
    );
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    expect(renderSpy).toHaveBeenCalled();
    const context = renderSpy.mock.calls.at(-1)?.[0];
    expect(context?.scatterPoint?.sizeValue).toBe(55);
    expect(context?.scatterPoint?.categoryLabel).toBe("Alpha");
    expect(context?.scatterPoint?.categoryId).toBeTruthy();
    expect(container.querySelector("[data-testid='custom-tooltip']")?.textContent).toBe("55");
  });

  it("activates bubbles under the pointer using bubble-aware hit-testing", () => {
    const points = [
      { x: 40, low: 10, high: 90 },
      { x: 80, low: 12, high: 88 },
    ];
    const yDomain = inferCombinedNumericDomain(points, ["low", "high"]);
    const { xScale, yScale } = createCartesianScales({
      data: points,
      xKey: "x",
      yKey: "high",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, 40);
    const plotY = getScalePosition(yScale, 90);
    if (plotX == null || plotY == null) {
      throw new Error("expected projected coordinates");
    }

    const { container } = render(
      <ScatterChart
        data={points}
        xKey="x"
        series={[
          { key: "low", id: "low", label: "Low" },
          { key: "high", id: "high", label: "High" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    movePointerToPlot(requireSurface(container), plotX, plotY);
    expect(
      container
        .querySelector('[data-kamod-chart-active="true"]')
        ?.closest("[data-kamod-chart-series-id]")
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("high");
  });
});

describe("scatter keyboard navigation", () => {
  it("skips invalid and hidden targets while supporting Home, End, and Escape", () => {
    const data = [
      { x: 10, y: 10, group: "alpha" },
      { x: 20, y: null as number | null, group: "beta" },
      { x: 30, y: 30, group: "gamma" },
    ];
    const { container, rerender } = render(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        categoryKey="group"
        categories={[
          { value: "alpha", id: "alpha", label: "Alpha" },
          { value: "beta", id: "beta", label: "Beta" },
          { value: "gamma", id: "gamma", label: "Gamma" },
        ]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    const surface = requireSurface(container);
    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Alpha");

    fireEvent.keyDown(surface, { key: "End" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Gamma");

    fireEvent.keyDown(surface, { key: "Escape" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

    rerender(
      <ScatterChart
        data={[{ x: 10, y: 10, group: "alpha" }]}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        categoryKey="group"
        categories={[{ value: "alpha", id: "alpha", label: "Alpha" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    fireEvent.keyDown(requireSurface(container), { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Alpha");
  });

  it("navigates valid scatter targets without assuming a rectangular grid", () => {
    const targets = [
      { index: 0, seriesIndex: 0, seriesId: "a" },
      { index: 0, seriesIndex: 1, seriesId: "b" },
      { index: 2, seriesIndex: 0, seriesId: "a" },
    ];
    const downChanges: Array<{ activeIndex: number; activeSeriesIndex: number }> = [];
    const downEvent = { key: "ArrowDown", preventDefault: () => undefined };
    createScatterKeyboardHandler({
      targets,
      activeIndex: 0,
      activeSeriesIndex: 0,
      onChange: (state) => downChanges.push(state),
    })(downEvent as unknown as JSX.TargetedKeyboardEvent<SVGSVGElement>);
    expect(downChanges).toEqual([{ activeIndex: 0, activeSeriesIndex: 1 }]);

    const rightChanges: Array<{ activeIndex: number; activeSeriesIndex: number }> = [];
    const rightEvent = { key: "ArrowRight", preventDefault: () => undefined };
    createScatterKeyboardHandler({
      targets,
      activeIndex: 0,
      activeSeriesIndex: 1,
      onChange: (state) => rightChanges.push(state),
    })(rightEvent as unknown as JSX.TargetedKeyboardEvent<SVGSVGElement>);
    expect(rightChanges).toEqual([{ activeIndex: 2, activeSeriesIndex: 0 }]);
  });
});

describe("scatter tooltip context helpers", () => {
  it("maps resolved points into scatterPoint contexts", () => {
    const point = {
      datum: { x: 1, y: 2 },
      index: 0,
      seriesId: "primary",
      seriesLabel: "Primary",
      xValue: 1,
      yValue: 2,
      sizeValue: 10,
      radius: 8,
      categoryValue: "alpha" as const,
      categoryId: "alpha",
      categoryLabel: "Alpha",
      color: "var(--chart-2)",
      visible: true,
      active: false,
    };
    expect(toScatterPointContext(point, true)).toMatchObject({
      sizeValue: 10,
      categoryLabel: "Alpha",
      color: "var(--chart-2)",
      active: true,
    });
  });
});

describe("line, area, and bar tooltip regression", () => {
  it("does not require scatterPoint for non-scatter charts", () => {
    const lineMarkup = renderToString(
      <LineChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    expect(lineMarkup).toContain("data-kamod-chart-live-region");

    const line = render(
      <LineChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", id: "primary", label: "Primary" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    fireEvent.keyDown(requireSurface(line.container), { key: "Home" });
    expect(line.container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(requireSurface(line.container), { key: "Escape" });
    expect(line.container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

    const bar = render(
      <BarChart
        data={[{ month: "Jan", revenue: 10 }]}
        xKey="month"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    fireEvent.keyDown(requireSurface(bar.container), { key: "Home" });
    expect(bar.container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(requireSurface(bar.container), { key: "Escape" });
    expect(bar.container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });
});
