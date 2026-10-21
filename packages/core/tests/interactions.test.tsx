import { act, fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { getScalePosition } from "../src/axes";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import { Legend, LineChart, ScatterChart, Tooltip, AreaChart, BarChart } from "../src";
import { inferCombinedNumericDomain } from "../src/series";
import { createCartesianScales } from "../src/series/cartesian";

interface Datum {
  date: Date;
  revenue: number;
  costs: number;
}

const data: Datum[] = [
  { date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10, costs: 5 },
  { date: new Date("2026-01-02T00:00:00.000Z"), revenue: 20, costs: 8 },
];

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

const requireActiveMarker = (container: ParentNode) => {
  const marker = container.querySelector<SVGCircleElement>('[data-kamod-chart-active="true"]');
  if (!marker) {
    throw new Error("expected active marker");
  }
  return marker;
};

describe("phase 6 interactions", () => {
  it("renders HTML legend and live region; tooltip appears after pointer move", () => {
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        showLegend
        tooltip
      />,
    );

    expect(markup).toContain("data-kamod-chart-legend");
    expect(markup).toContain("data-kamod-chart-live-region");
    expect(markup).not.toContain("data-kamod-chart-tooltip");
    expect(markup).not.toContain("data-kamod-chart-crosshair");

    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        showLegend
        tooltip
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }

    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    expect(container.querySelector("[data-kamod-chart-crosshair]")).not.toBeNull();
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Revenue");
  });

  it("retains pointer coordinates until the animation-frame update", () => {
    let frame: FrameRequestCallback | undefined;
    vi.stubEnv("VITEST", "");
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    });

    try {
      const { container } = render(
        <LineChart
          data={data}
          xKey="date"
          xScale="time"
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          tooltip
        />,
      );
      const surface = requireSurface(container);
      mockSurfaceRect(surface);

      fireEvent.pointerMove(surface, { clientX: CHART_WIDTH - 50, clientY: 100 });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

      act(() => frame?.(0));

      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
        "Revenue: 20",
      );
    } finally {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });

  it("clears tooltip on pointer leave", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }

    fireEvent.pointerMove(surface, { clientX: 200, clientY: 100 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.pointerLeave(surface);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("toggles series visibility through legend", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        showLegend
      />,
    );
    const button = container.querySelector("[data-kamod-chart-legend-item]");

    expect(container.querySelector("[data-kamod-chart-line-series]")).not.toBeNull();
    if (!button) {
      throw new Error("expected legend button");
    }

    fireEvent.click(button);
    expect(container.querySelector("[data-kamod-chart-line-series]")).toBeNull();
  });

  it("exports standalone Tooltip and Legend primitives", () => {
    const tooltipMarkup = renderToString(
      <Tooltip
        interaction={{ datum: data[0]!, seriesId: "revenue", index: 0, value: 10, x: 1, y: 2 }}
      />,
    );
    const legendMarkup = renderToString(<Legend items={[{ id: "revenue", label: "Revenue" }]} />);

    expect(tooltipMarkup).toContain("revenue: 10");
    expect(legendMarkup).toContain("Revenue");
  });

  it("selects the visually nearest LineChart datum on an irregular time axis", () => {
    const irregular = [
      { date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10 },
      { date: new Date("2026-01-02T00:00:00.000Z"), revenue: 20 },
      { date: new Date("2026-12-31T00:00:00.000Z"), revenue: 30 },
    ];
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const { xScale, yScale } = createCartesianScales({
      data: irregular,
      xKey: "date",
      yKey: "revenue",
      xScale: "time",
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const plotX = getScalePosition(xScale, irregular[1]!.date);
    const plotY = getScalePosition(yScale, 20);
    if (plotX == null || plotY == null) {
      throw new Error("expected projected coordinates");
    }

    const { container } = render(
      <LineChart
        data={irregular}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        tooltip
      />,
    );
    movePointerToPlot(requireSurface(container), plotX, plotY);

    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    const liveRegion = container.querySelector("[data-kamod-chart-live-region]");
    const marker = requireActiveMarker(container);

    expect(tooltip?.textContent).toContain("Revenue: 20");
    expect(liveRegion?.textContent).toContain("Revenue: 20");
    expect(marker.getAttribute("data-kamod-chart-active")).toBe("true");
    expect(Number(marker.getAttribute("cx"))).toBeCloseTo(plotX, 5);
  });

  it("selects the ScatterChart series nearest in Y when X values are shared", () => {
    const points = [
      { x: 40, low: 10, high: 90 },
      { x: 80, low: 12, high: 88 },
    ];
    const yDomain = inferCombinedNumericDomain(points, ["low", "high"]);
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
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

    const marker = requireActiveMarker(container);
    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    const liveRegion = container.querySelector("[data-kamod-chart-live-region]");

    expect(
      marker.closest("[data-kamod-chart-series-id]")?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("high");
    expect(Number(marker.getAttribute("cy"))).toBeCloseTo(plotY, 5);
    expect(tooltip?.textContent).toContain("High: 90");
    expect(liveRegion?.textContent).toContain("High: 90");
  });

  it("does not keep a scatter tooltip after every series is hidden", () => {
    const points = [
      { x: 40, low: 10, high: 90 },
      { x: 80, low: 12, high: 88 },
    ];
    const yDomain = inferCombinedNumericDomain(points, ["low", "high"]);
    const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
    const { xScale, yScale } = createCartesianScales({
      data: points,
      xKey: "x",
      yKey: "high",
      yDomain,
      xRange: [0, plot.width],
      yRange: [plot.height, 0],
    });
    const highPlotX = getScalePosition(xScale, 40);
    const highPlotY = getScalePosition(yScale, 90);
    const lowPlotY = getScalePosition(yScale, 10);
    if (highPlotX == null || highPlotY == null || lowPlotY == null) {
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
        showLegend
        tooltip
      />,
    );
    const surface = requireSurface(container);
    movePointerToPlot(surface, highPlotX, highPlotY);
    expect(
      requireActiveMarker(container)
        .closest("[data-kamod-chart-series-id]")
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("high");

    const legendButtons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
    const highButton = legendButtons.find((button) => button.textContent?.includes("High"));
    const lowButton = legendButtons.find((button) => button.textContent?.includes("Low"));
    if (!highButton || !lowButton) {
      throw new Error("expected legend buttons");
    }

    fireEvent.click(highButton);
    movePointerToPlot(surface, highPlotX, highPlotY);
    expect(
      requireActiveMarker(container)
        .closest("[data-kamod-chart-series-id]")
        ?.getAttribute("data-kamod-chart-series-id"),
    ).toBe("low");
    expect(Number(requireActiveMarker(container).getAttribute("cy"))).toBeCloseTo(lowPlotY, 5);

    fireEvent.click(lowButton);
    movePointerToPlot(surface, highPlotX, highPlotY);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    expect(container.querySelector('[data-kamod-chart-active="true"]')).toBeNull();
    expect(container.querySelector("[data-kamod-chart-scatter-series]")).toBeNull();
  });

  it("gives AreaChart and BarChart the same tooltip dismiss behavior", () => {
    const categorical = [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 20 },
    ];
    const area = render(
      <AreaChart
        data={categorical}
        xKey="month"
        xScale="point"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip
      />,
    );
    const areaSurface = requireSurface(area.container);
    fireEvent.pointerMove(areaSurface, { clientX: 120, clientY: 80 });
    expect(area.container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.pointerLeave(areaSurface);
    expect(area.container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    fireEvent.keyDown(areaSurface, { key: "Home" });
    expect(area.container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(areaSurface, { key: "Escape" });
    expect(area.container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

    const bar = render(
      <BarChart
        data={categorical}
        xKey="month"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip
      />,
    );
    const barSurface = requireSurface(bar.container);
    fireEvent.keyDown(barSurface, { key: "Home" });
    expect(bar.container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(barSurface, { key: "Escape" });
    expect(bar.container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });
});
