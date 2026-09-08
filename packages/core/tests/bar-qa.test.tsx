import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "./testing-library";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import { DEFAULT_VALUE_LABEL_OFFSET } from "../src/charts/bar-value-label";
import { BarChart } from "../src/charts/bar-chart";
import { BarChart as MotionBarChart } from "../src/motion";
import { resolveBarGeometry } from "../src/charts/bar-geometry";
import { inferGroupedDomain } from "../src/series";

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

const baseProps = {
  data,
  xKey: "month" as const,
  height: 320,
  width: 640,
};

const stackedSeries = [
  { key: "revenue" as const, id: "revenue", label: "Revenue" },
  { key: "costs" as const, id: "costs", label: "Costs" },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

describe("Bar chart release QA", () => {
  describe("SSR", () => {
    it("renders horizontal negative bars deterministically without NaN", () => {
      const chart = (
        <BarChart
          {...baseProps}
          id="bar-horizontal-negative-ssr"
          series={[{ key: "losses", id: "losses", label: "Losses" }]}
          orientation="horizontal"
          valueLabels={{ position: "outside" }}
          title="Losses by month"
          description="Signed horizontal bars"
        />
      );
      const first = renderToString(chart);
      const second = renderToString(chart);

      expect(first).toBe(second);
      expect(first).toContain("data-kamod-chart-bar");
      expect(first).toContain('role="img"');
      expect(first).toContain('aria-labelledby="bar-horizontal-negative-ssr-title');
      expect(first).toContain(
        '<title id="bar-horizontal-negative-ssr-title">Losses by month</title>',
      );
      expect(first).not.toMatch(/NaN/);
      expect(first).not.toMatch(/d="[^"]*NaN/);
    });

    it("renders stacked bars with referenceAreas deterministically without NaN", () => {
      const chart = (
        <BarChart
          {...baseProps}
          id="bar-stacked-ref-ssr"
          series={stackedSeries}
          stacked
          showGrid
          referenceAreas={[{ id: "mid-quarter", x1: "Feb", x2: "Mar", label: "Mid quarter" }]}
          title="Stacked costs"
          description="Stacked bars with category band"
        />
      );
      const first = renderToString(chart);
      const second = renderToString(chart);

      expect(first).toBe(second);
      expect(first).toContain("data-kamod-chart-bars");
      expect(first).toContain('id="mid-quarter"');
      expect(first).toContain("Mid quarter");
      expect(first).toContain("data-kamod-chart-reference-area");
      expect(first).toContain("data-kamod-chart-grid");
      expect(first).not.toMatch(/NaN/);
    });

    it("imports without touching browser globals during SSR module evaluation", async () => {
      const previousWindow = globalThis.window;
      const previousDocument = globalThis.document;
      // @ts-expect-error simulate SSR environment
      delete globalThis.window;
      // @ts-expect-error simulate SSR environment
      delete globalThis.document;

      try {
        const mod = await import("../src/charts/bar-chart");
        expect(mod.BarChart).toBeTypeOf("function");
        const markup = renderToString(
          <mod.BarChart
            {...baseProps}
            series={stackedSeries}
            stacked
            orientation="horizontal"
            referenceAreas={[{ x1: "Jan", x2: "Feb" }]}
            valueLabels
          />,
        );
        expect(markup).toContain("data-kamod-chart-bars");
        expect(markup).not.toMatch(/NaN/);
      } finally {
        globalThis.window = previousWindow;
        globalThis.document = previousDocument;
      }
    });
  });

  describe("accessibility", () => {
    it("links title and description to the svg surface", () => {
      const markup = renderToString(
        <BarChart
          {...baseProps}
          id="a11y-bar"
          series={[{ key: "revenue", id: "revenue" }]}
          title="Revenue by month"
          description="Grouped deploy counts"
        />,
      );
      expect(markup).toContain('role="img"');
      expect(markup).toContain('aria-labelledby="a11y-bar-title a11y-bar-description"');
      expect(markup).toContain('<title id="a11y-bar-title">Revenue by month</title>');
      expect(markup).toContain('<desc id="a11y-bar-description">Grouped deploy counts</desc>');
    });

    it("keeps reference areas decorative without tab stops", () => {
      const { container } = render(
        <BarChart
          {...baseProps}
          series={[{ key: "revenue", id: "revenue" }]}
          referenceAreas={[{ x1: "Jan", x2: "Feb", label: "Window" }]}
        />,
      );
      const area = container.querySelector("[data-kamod-chart-reference-area]");
      expect(area).not.toBeNull();
      expect(area?.getAttribute("aria-hidden")).toBe("true");
      expect(area?.getAttribute("tabindex")).toBeNull();
    });

    it("places negative outside labels on the negative value end in vertical charts", () => {
      const plot = resolvePlotAreaFromSize(CHART_WIDTH, CHART_HEIGHT);
      const series = [{ key: "losses" as const, id: "losses" }];
      const bars = resolveBarGeometry({
        data,
        series,
        xKey: "month",
        yDomain: inferGroupedDomain(data, [{ id: "losses", value: "losses" }]),
        plotWidth: plot.width,
        plotHeight: plot.height,
      });
      const jan = bars.find((bar) => bar.category === "Jan");
      const { container } = render(
        <BarChart {...baseProps} series={series} valueLabels={{ position: "outside" }} />,
      );
      const label = container.querySelector("[data-kamod-chart-value-label]");
      expect(label?.textContent).toBe("-2");
      expect(Number(label?.getAttribute("y"))).toBeCloseTo(
        (jan?.y ?? 0) + (jan?.height ?? 0) + DEFAULT_VALUE_LABEL_OFFSET,
        5,
      );
    });
  });

  describe("interaction and motion", () => {
    it("fires onBarClick from Space as well as Enter", () => {
      const onBarClick = vi.fn();
      const { container } = render(
        <BarChart
          {...baseProps}
          series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
          tooltip
          onBarClick={onBarClick}
        />,
      );
      const surface = requireSurface(container);
      fireEvent.keyDown(surface, { key: "Home" });
      fireEvent.keyDown(surface, { key: " " });
      expect(onBarClick).toHaveBeenCalledWith(data[0], "revenue", 0, 10);
    });

    it("recomputes geometry after orientation changes and data updates", () => {
      const { container, rerender } = render(
        <BarChart
          {...baseProps}
          series={[{ key: "revenue", id: "revenue" }]}
          orientation="vertical"
        />,
      );
      const verticalBars = container.querySelectorAll("[data-kamod-chart-bar]").length;
      expect(verticalBars).toBe(3);

      rerender(
        <BarChart
          {...baseProps}
          series={[{ key: "revenue", id: "revenue" }]}
          orientation="horizontal"
        />,
      );
      expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(3);

      rerender(
        <BarChart
          data={data.slice(0, 2)}
          xKey="month"
          height={320}
          width={640}
          series={[{ key: "revenue", id: "revenue" }]}
          orientation="horizontal"
        />,
      );
      expect(container.querySelectorAll("[data-kamod-chart-bar]")).toHaveLength(2);
    });

    it("clears tooltip state when the active series is hidden from the legend", () => {
      const { container } = render(
        <BarChart {...baseProps} series={stackedSeries} showLegend tooltip />,
      );
      const surface = requireSurface(container);
      fireEvent.keyDown(surface, { key: "Home" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();

      const revenue = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
        (button) => button.textContent?.includes("Revenue"),
      );
      if (!revenue) {
        throw new Error("expected revenue legend item");
      }
      fireEvent.click(revenue);
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    });

    it("reports stacked raw values in nearest tooltips rather than cumulative totals", () => {
      const { container } = render(
        <BarChart {...baseProps} series={stackedSeries} stacked tooltip={{ mode: "nearest" }} />,
      );
      fireEvent.keyDown(requireSurface(container), { key: "Home" });
      const text = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
      expect(text).toContain("Revenue: 10");
      expect(text).not.toContain("14");

      fireEvent.keyDown(requireSurface(container), { key: "ArrowDown" });
      const costsText = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
      expect(costsText).toContain("Costs: 4");
      expect(costsText).not.toContain("14");
    });

    it("matches static SSR output when motion is reduced", () => {
      const props = {
        ...baseProps,
        series: stackedSeries,
        stacked: true,
        referenceAreas: [{ x1: "Feb", x2: "Mar", label: "Band" }],
        animate: { reducedMotion: "always" as const },
      };
      const staticMarkup = renderToString(<BarChart {...props} />);
      const motionMarkup = renderToString(<MotionBarChart {...props} />);
      expect(staticMarkup).toBe(motionMarkup);
      expect(staticMarkup).not.toMatch(/NaN/);
    });
  });
});
