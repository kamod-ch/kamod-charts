import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { AreaChart } from "../src/charts/area-chart";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import { createAreaGradientId } from "../src/series/area-style";
import type { LineCurve } from "../src/series/paths";

interface Datum {
  month: string;
  revenue: number | null | undefined;
  costs: number;
  losses: number;
}

const baseData: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: 20, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

const seriesPair = [
  { key: "revenue" as const, id: "revenue", label: "Revenue" },
  { key: "costs" as const, id: "costs", label: "Costs" },
];

const baseProps = {
  xKey: "month" as const,
  xScale: "point" as const,
  height: 320,
  width: 640,
};

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

const requirePlotCapture = (container: ParentNode) => {
  const capture = container.querySelector("[data-kamod-chart-plot-capture]");
  if (!capture) {
    throw new Error("expected plot capture layer");
  }
  return capture;
};

const mockSurfaceRect = (
  surface: Element,
  chartWidth: number,
  chartHeight: number,
  offsetLeft = 0,
) => {
  Object.defineProperty(surface, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: offsetLeft,
      y: 0,
      top: 0,
      left: offsetLeft,
      right: offsetLeft + chartWidth,
      bottom: chartHeight,
      width: chartWidth,
      height: chartHeight,
      toJSON: () => ({}),
    }),
  });
};

const movePointerToPlot = (
  surface: Element,
  chartWidth: number,
  chartHeight: number,
  plotX: number,
  plotY: number,
  offsetLeft = 0,
) => {
  mockSurfaceRect(surface, chartWidth, chartHeight, offsetLeft);
  const plot = resolvePlotAreaFromSize(chartWidth, chartHeight);
  const capture = surface.querySelector("[data-kamod-chart-plot-capture]") ?? surface;
  fireEvent.pointerMove(capture, {
    clientX: offsetLeft + plot.x + plotX,
    clientY: plot.y + plotY,
  });
};

const readTooltipLabel = (container: ParentNode) =>
  container.querySelector("[data-kamod-chart-tooltip-label]")?.textContent?.trim() ?? "";

const readCrosshairPlotX = (container: ParentNode): number => {
  const line = container.querySelector("[data-kamod-chart-crosshair] line");
  const raw = line?.getAttribute("x1");
  if (raw == null) {
    throw new Error("expected crosshair vertical line");
  }
  return Number(raw);
};

describe("Area chart release QA", () => {
  describe("data edge cases", () => {
    it("renders empty state without series paths", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          data={[]}
          series={[{ key: "revenue", id: "revenue" }]}
          title="Empty"
          description="No rows"
        />,
      );
      expect(markup).toContain("Keine Daten");
      expect(markup).not.toContain("data-kamod-chart-area-series");
    });

    it("renders a single-row area path", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          data={[{ month: "Only", revenue: 42, costs: 0, losses: 0 }]}
          series={[{ key: "revenue", id: "revenue" }]}
        />,
      );
      expect(markup).toMatch(/d="M[^"]+"/);
    });

    it("skips null, undefined and NaN marker values", () => {
      const sparse: Datum[] = [
        { month: "Jan", revenue: 10, costs: 4, losses: -2 },
        { month: "Feb", revenue: null, costs: 8, losses: -5 },
        { month: "Mar", revenue: undefined, costs: 6, losses: -3 },
        { month: "Apr", revenue: Number.NaN, costs: 2, losses: -1 },
      ];
      const { container } = render(
        <AreaChart
          {...baseProps}
          data={sparse}
          series={[{ key: "revenue", id: "revenue" }]}
          showPoints
          tooltip
        />,
      );
      expect(container.querySelectorAll("[data-kamod-chart-area-series] circle")).toHaveLength(1);
    });

    it("renders stacked areas with negative segments", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          data={baseData}
          series={[
            { key: "revenue", id: "revenue" },
            { key: "losses", id: "losses" },
          ]}
          stacked
        />,
      );
      expect(markup).toContain("data-kamod-chart-stacked-area-series");
      expect(markup).toMatch(/d="M/);
    });

    it("handles a large peak without NaN paths", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          data={[
            { month: "Jan", revenue: 1, costs: 0, losses: 0 },
            { month: "Feb", revenue: 1_000_000, costs: 0, losses: 0 },
            { month: "Mar", revenue: 2, costs: 0, losses: 0 },
          ]}
          series={[{ key: "revenue", id: "revenue" }]}
          curve="monotoneX"
        />,
      );
      const path = markup.match(/<path d="([^"]+)"/)?.[1] ?? "";
      expect(path).toMatch(/^M/);
      expect(path).not.toContain("NaN");
    });
  });

  describe("curve matrix", () => {
    const curves: LineCurve[] = ["linear", "monotoneX", "basis", "step", "stepBefore", "stepAfter"];

    for (const curve of curves) {
      it(`renders non-empty area path for curve=${curve}`, () => {
        const markup = renderToString(
          <AreaChart
            {...baseProps}
            data={baseData}
            series={[{ key: "revenue", id: "revenue" }]}
            curve={curve}
          />,
        );
        expect(markup).toMatch(/<path d="M[^"]+"/);
      });
    }

    for (const curve of curves) {
      it(`renders stacked area path for curve=${curve}`, () => {
        const markup = renderToString(
          <AreaChart {...baseProps} data={baseData} series={seriesPair} stacked curve={curve} />,
        );
        expect(markup).toContain("data-kamod-chart-stacked-area-series");
        expect(markup).toMatch(/<path d="M/);
      });
    }
  });

  describe("fill, outline and markers", () => {
    it("uses outline stroke for high-contrast edge and omits it when disabled", () => {
      const outlined = renderToString(
        <AreaChart
          {...baseProps}
          id="outline-on"
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          outline
          strokeWidth={2}
        />,
      );
      const plain = renderToString(
        <AreaChart
          {...baseProps}
          id="outline-off"
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
        />,
      );
      expect(outlined).toContain('stroke="var(--chart-1)"');
      expect(outlined).toContain('stroke-width="2"');
      expect(plain).toContain('stroke="none"');
    });

    it("applies strokeDasharray only with outline", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          outline
          strokeDasharray="5 3"
        />,
      );
      expect(markup).toContain('stroke-dasharray="5 3"');
    });

    it("keeps solid fill independent from gradient url", () => {
      const solid = renderToString(
        <AreaChart
          {...baseProps}
          id="solid"
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          fill="solid"
        />,
      );
      expect(solid).toContain('fill="var(--chart-1)"');
      expect(solid).not.toContain("url(#");
    });

    it("does not assign tab stops to point markers", () => {
      const { container } = render(
        <AreaChart
          {...baseProps}
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          showPoints
          tooltip
        />,
      );
      const tabbableMarkers = [...container.querySelectorAll("circle")].filter(
        (node) => node.getAttribute("tabindex") != null,
      );
      expect(tabbableMarkers).toHaveLength(0);
      const svg = container.querySelector("[data-kamod-chart-surface]");
      expect(svg?.getAttribute("tabindex") ?? svg?.getAttribute("tabIndex")).toBe("0");
    });
  });

  describe("legend and tooltip interaction", () => {
    it("hides every series and clears tooltip when all legend items are toggled off", () => {
      const { container } = render(
        <AreaChart {...baseProps} data={baseData} series={seriesPair} showLegend tooltip />,
      );
      const surface = requireSurface(container);
      fireEvent.keyDown(surface, { key: "Home" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();

      for (const button of container.querySelectorAll("[data-kamod-chart-legend-item]")) {
        fireEvent.click(button);
      }

      expect(container.querySelector("[data-kamod-chart-area-series]")).toBeNull();
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    });

    it("reports raw stacked values in the live region", () => {
      const { container } = render(
        <AreaChart {...baseProps} data={baseData} series={seriesPair} stacked tooltip />,
      );
      fireEvent.keyDown(requireSurface(container), { key: "Home" });
      const live = container.querySelector("[data-kamod-chart-live-region]")?.textContent ?? "";
      expect(live).toContain("Revenue: 10");
      expect(live).toContain("Costs: 4");
      expect(live).not.toContain("14");
    });

    it("opens tooltip via keyboard, navigates, and closes with Escape and pointer leave", () => {
      const { container } = render(
        <AreaChart
          {...baseProps}
          data={baseData}
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          tooltip
        />,
      );
      const surface = requireSurface(container);

      fireEvent.keyDown(surface, { key: "Home" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();

      fireEvent.keyDown(surface, { key: "ArrowRight" });
      const tooltipAfterMove =
        container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
      expect(tooltipAfterMove).toContain("Feb");

      fireEvent.keyDown(surface, { key: "Escape" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

      fireEvent.keyDown(surface, { key: "Home" });
      fireEvent.pointerLeave(surface);
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    });

    it("opens tooltip from pointer move", () => {
      const { container } = render(
        <AreaChart
          {...baseProps}
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          tooltip
        />,
      );
      fireEvent.pointerMove(requireSurface(container), { clientX: 200, clientY: 120 });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    it("updates tooltip x label when the pointer scrubs across the plot", () => {
      const heroData = [
        { month: "Jan", revenue: 28400, costs: 14200, losses: 0 },
        { month: "Feb", revenue: 31200, costs: 15100, losses: 0 },
        { month: "Mar", revenue: 36800, costs: 16400, losses: 0 },
        { month: "Apr", revenue: 34100, costs: 15900, losses: 0 },
        { month: "May", revenue: 41600, costs: 17800, losses: 0 },
        { month: "Jun", revenue: 48200, costs: 19200, losses: 0 },
      ];
      const chartWidth = 750;
      const chartHeight = 320;
      const { container } = render(
        <AreaChart
          data={heroData}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          width={chartWidth}
          height={chartHeight}
          showGrid
          outline
          curve="monotoneX"
          tooltip
        />,
      );
      const surface = requireSurface(container);
      const plot = resolvePlotAreaFromSize(chartWidth, chartHeight);
      const labels: string[] = [];

      for (const plotX of [0, plot.width * 0.25, plot.width * 0.5, plot.width * 0.75, plot.width]) {
        movePointerToPlot(surface, chartWidth, chartHeight, plotX, plot.height / 2, 41);
        labels.push(readTooltipLabel(container));
      }

      expect(new Set(labels.filter(Boolean)).size).toBeGreaterThan(1);
      expect(labels.some((label) => label.includes("Jan"))).toBe(true);
      expect(labels.some((label) => label.includes("Jun"))).toBe(true);
      expect(requirePlotCapture(container)).not.toBeNull();
    });

    it("updates tooltip x label on responsive hero-like charts", async () => {
      const heroData = [
        { month: "Jan", revenue: 28400, costs: 14200, losses: 0 },
        { month: "Feb", revenue: 31200, costs: 15100, losses: 0 },
        { month: "Mar", revenue: 36800, costs: 16400, losses: 0 },
        { month: "Apr", revenue: 34100, costs: 15900, losses: 0 },
        { month: "May", revenue: 41600, costs: 17800, losses: 0 },
        { month: "Jun", revenue: 48200, costs: 19200, losses: 0 },
      ];
      const chartWidth = 750;
      const chartHeight = 320;
      const { container } = render(
        <AreaChart
          data={heroData}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          height={chartHeight}
          initialWidth={760}
          responsive
          showGrid
          outline
          curve="monotoneX"
          tooltip
        />,
      );
      const surface = requireSurface(container) as SVGSVGElement;
      surface.setAttribute("width", String(chartWidth));
      surface.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight}`);

      const plot = resolvePlotAreaFromSize(chartWidth, chartHeight);
      const labels: string[] = [];
      for (const plotX of [0, plot.width * 0.5, plot.width]) {
        movePointerToPlot(surface, chartWidth, chartHeight, plotX, plot.height / 2, 41);
        labels.push(readTooltipLabel(container));
      }

      expect(new Set(labels.filter(Boolean)).size).toBeGreaterThan(1);
    });

    it("tracks the pointer smoothly for crosshair positioning in axis mode", () => {
      const chartWidth = 750;
      const chartHeight = 320;
      const { container } = render(
        <AreaChart
          data={baseData}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          width={chartWidth}
          height={chartHeight}
          tooltip
        />,
      );
      const surface = requireSurface(container);
      const plot = resolvePlotAreaFromSize(chartWidth, chartHeight);
      const targetPlotX = plot.width * 0.35;

      movePointerToPlot(surface, chartWidth, chartHeight, targetPlotX, plot.height / 2, 41);

      expect(readCrosshairPlotX(container)).toBeCloseTo(targetPlotX, 1);
    });

    it("exposes legend buttons with labels and pressed state", () => {
      const { container } = render(
        <AreaChart {...baseProps} data={baseData} series={seriesPair} showLegend />,
      );
      const buttons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
      expect(buttons.map((button) => button.textContent?.trim())).toEqual(
        expect.arrayContaining(["Revenue", "Costs"]),
      );
      expect(buttons.every((button) => button.getAttribute("aria-pressed") === "true")).toBe(true);
      fireEvent.click(buttons[0]!);
      expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
    });
  });

  describe("SSR and duplicate series ids", () => {
    it("matches SSR path geometry on first client render with explicit chart id", () => {
      const props = {
        ...baseProps,
        id: "area-hydration",
        data: baseData,
        series: [{ key: "revenue" as const, id: "revenue" }],
        fill: { type: "gradient" as const },
        showPoints: true as const,
        tooltip: true,
      };
      const ssr = renderToString(<AreaChart {...props} />);
      const { container } = render(<AreaChart {...props} />);
      const ssrPath = ssr.match(/<path d="([^"]+)"/)?.[1];
      const clientPath = container
        .querySelector("[data-kamod-chart-area-series] path")
        ?.getAttribute("d");
      expect(ssrPath).toBeTruthy();
      expect(clientPath).toBe(ssrPath);
    });

    it("keeps gradient ids unique when multiple charts share series ids", () => {
      const markup = renderToString(
        <div>
          <AreaChart
            {...baseProps}
            id="page-chart-a"
            data={baseData}
            series={[{ key: "revenue", id: "revenue" }]}
            fill={{ type: "gradient" }}
          />
          <AreaChart
            {...baseProps}
            id="page-chart-b"
            data={baseData}
            series={[{ key: "revenue", id: "revenue" }]}
            fill={{ type: "gradient" }}
          />
        </div>,
      );
      const ids = [
        createAreaGradientId("page-chart-a", "revenue"),
        createAreaGradientId("page-chart-b", "revenue"),
      ];
      expect(markup).toContain(`id="${ids[0]}"`);
      expect(markup).toContain(`id="${ids[1]}"`);
      expect(ids[0]).not.toBe(ids[1]);
    });

    it("links title and description to the svg surface", () => {
      const markup = renderToString(
        <AreaChart
          {...baseProps}
          id="a11y-area"
          data={baseData}
          series={[{ key: "revenue", id: "revenue" }]}
          title="Revenue trend"
          description="Monthly revenue in EUR"
        />,
      );
      expect(markup).toContain('role="img"');
      expect(markup).toContain('aria-labelledby="a11y-area-title"');
      expect(markup).toContain('aria-describedby="a11y-area-description"');
      expect(markup).toContain('<title id="a11y-area-title">Revenue trend</title>');
      expect(markup).toContain('<desc id="a11y-area-description">Monthly revenue in EUR</desc>');
    });
  });

  describe("responsive widths", () => {
    for (const width of [320, 375, 768, 1280]) {
      it(`renders at width=${width}px`, () => {
        const markup = renderToString(
          <AreaChart
            {...baseProps}
            width={width}
            data={baseData}
            series={[{ key: "revenue", id: "revenue" }]}
            curve="monotoneX"
            outline
            showPoints
          />,
        );
        expect(markup).toContain(`width="${width}"`);
        expect(markup).toContain(`viewBox="0 0 ${width} 320"`);
        expect(markup).toMatch(/<path d="M/);
      });
    }
  });
});
