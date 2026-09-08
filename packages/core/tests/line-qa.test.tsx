import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { LineChart } from "../src/charts/line-chart";
import type { CartesianReferenceArea, CartesianReferencePoint } from "../src/charts/types";

interface Datum {
  month: string;
  date: Date;
  revenue: number;
  costs: number;
  actual: number | null;
  forecast: number | null;
}

const data: Datum[] = [
  {
    month: "Jan",
    date: new Date("2026-01-01T00:00:00.000Z"),
    revenue: 10,
    costs: 4,
    actual: 10,
    forecast: null,
  },
  {
    month: "Feb",
    date: new Date("2026-02-01T00:00:00.000Z"),
    revenue: 20,
    costs: 8,
    actual: 20,
    forecast: null,
  },
  {
    month: "Mar",
    date: new Date("2026-03-01T00:00:00.000Z"),
    revenue: 15,
    costs: 6,
    actual: 15,
    forecast: 18,
  },
];

const baseProps = {
  data,
  xKey: "month" as const,
  xScale: "point" as const,
  height: 320,
  width: 640,
};

const stackedSeries = [
  { key: "revenue" as const, id: "revenue", label: "Revenue" },
  { key: "costs" as const, id: "costs", label: "Costs" },
];

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

describe("Line chart release QA", () => {
  describe("SSR", () => {
    it("renders stacked line charts deterministically without NaN", () => {
      const chart = (
        <LineChart
          {...baseProps}
          id="line-stacked-ssr"
          series={stackedSeries}
          stacked
          showPoints
          title="Stacked channels"
          description="Cumulative line geometry"
        />
      );
      const first = renderToString(chart);
      const second = renderToString(chart);

      expect(first).toBe(second);
      expect(first).toContain("data-kamod-chart-stacked-line-series");
      expect(first).toContain(
        'aria-labelledby="line-stacked-ssr-title line-stacked-ssr-description"',
      );
      expect(first).not.toMatch(/NaN/);
    });

    it("renders annotated line charts with areas, points, and lines on SSR", () => {
      const referenceAreas: readonly CartesianReferenceArea<Datum>[] = [
        { id: "peak-window", x1: "Jan", x2: "Feb", label: "Peak interval" },
      ];
      const referencePoints: readonly CartesianReferencePoint<Datum>[] = [
        { id: "circle", x: "Jan", y: 10, shape: "circle", label: "Start" },
        { id: "square", x: "Feb", y: 20, shape: "square", label: "Mid" },
        { id: "diamond", x: "Mar", y: 15, shape: "diamond", label: "End" },
      ];

      const chart = (
        <LineChart
          {...baseProps}
          id="line-annotated-ssr"
          series={[
            { key: "actual", label: "Actual" },
            { key: "forecast", label: "Forecast", strokeDasharray: "6 4" },
          ]}
          referenceAreas={referenceAreas}
          referencePoints={referencePoints}
          referenceLines={[{ y: 12, label: "Target", strokeDasharray: "4 4" }]}
          title="Actual vs forecast"
          description="Solid actuals with dashed forecast and annotations"
        />
      );

      const markup = renderToString(chart);
      expect(markup).toContain("data-kamod-chart-reference-area");
      expect(markup).toContain("data-kamod-chart-reference-point");
      expect(markup).toContain("data-kamod-chart-reference-line");
      expect(markup).toContain("<circle");
      expect(markup).toContain("<rect");
      expect(markup).toContain("<polygon");
      expect(markup).toContain('stroke-dasharray="6 4"');
      expect(markup).not.toMatch(/NaN/);
      expect(renderToString(chart)).toBe(markup);
    });

    it("imports without touching browser globals during SSR module evaluation", async () => {
      const previousWindow = globalThis.window;
      const previousDocument = globalThis.document;
      // @ts-expect-error simulate SSR environment
      delete globalThis.window;
      // @ts-expect-error simulate SSR environment
      delete globalThis.document;

      try {
        const mod = await import("../src/charts/line-chart");
        expect(mod.LineChart).toBeTypeOf("function");
        const markup = renderToString(
          <mod.LineChart
            {...baseProps}
            series={[{ key: "revenue", id: "revenue" }]}
            stacked
            referenceAreas={[{ x1: "Jan", x2: "Feb" }]}
            referencePoints={[{ x: "Feb", y: 20, shape: "diamond" }]}
          />,
        );
        expect(markup).toContain("data-kamod-chart-stacked-line-series");
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
        <LineChart
          {...baseProps}
          id="a11y-line"
          series={[{ key: "revenue", id: "revenue" }]}
          title="Revenue trend"
          description="Monthly revenue in EUR"
        />,
      );
      expect(markup).toContain('role="img"');
      expect(markup).toContain('aria-labelledby="a11y-line-title a11y-line-description"');
      expect(markup).toContain('<title id="a11y-line-title">Revenue trend</title>');
      expect(markup).toContain('<desc id="a11y-line-description">Monthly revenue in EUR</desc>');
    });

    it("keeps reference annotations decorative without extra tab stops", () => {
      const { container } = render(
        <LineChart
          {...baseProps}
          series={[{ key: "revenue", id: "revenue" }]}
          referenceAreas={[{ x1: "Jan", x2: "Feb", label: "Window" }]}
          referencePoints={[{ id: "peak", x: "Feb", y: 20, shape: "diamond", label: "Peak" }]}
          referenceLines={[{ y: 12, label: "Target" }]}
        />,
      );

      const annotations = container.querySelectorAll(
        "[data-kamod-chart-reference-area], [data-kamod-chart-reference-point], [data-kamod-chart-reference-line]",
      );
      expect(annotations.length).toBeGreaterThan(0);
      for (const node of annotations) {
        expect(node.getAttribute("aria-hidden")).toBe("true");
        expect(node.getAttribute("tabindex")).toBeNull();
      }
    });

    it("exposes legend labels and pressed state for actual vs forecast series", () => {
      const { container } = render(
        <LineChart
          {...baseProps}
          series={[
            { key: "actual", id: "actual", label: "Actual" },
            { key: "forecast", id: "forecast", label: "Forecast", strokeDasharray: "6 4" },
          ]}
          showLegend
        />,
      );

      const buttons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
      expect(buttons.map((button) => button.textContent?.trim())).toEqual(
        expect.arrayContaining(["Actual", "Forecast"]),
      );
      expect(buttons.every((button) => button.getAttribute("aria-pressed") === "true")).toBe(true);
      fireEvent.click(buttons[0]!);
      expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
    });
  });

  describe("interaction", () => {
    it("supports keyboard navigation on the chart surface", () => {
      const { container } = render(
        <LineChart {...baseProps} series={stackedSeries} tooltip showPoints />,
      );
      const surface = requireSurface(container);

      fireEvent.keyDown(surface, { key: "Home" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();

      fireEvent.keyDown(surface, { key: "ArrowRight" });
      expect(container.querySelector("[data-kamod-chart-tooltip-label]")?.textContent).toContain(
        "Feb",
      );

      fireEvent.keyDown(surface, { key: "Escape" });
      expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    });

    it("reports raw tooltip values on stacked lines while markers use cumulative geometry", () => {
      const { container } = render(
        <LineChart {...baseProps} series={stackedSeries} stacked tooltip showPoints />,
      );
      const surface = requireSurface(container);

      fireEvent.keyDown(surface, { key: "Home" });
      fireEvent.keyDown(surface, { key: "ArrowDown" });

      const tooltip = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
      expect(tooltip).toContain("Revenue: 10");
      expect(tooltip).toContain("Costs: 4");
      expect(tooltip).not.toContain("14");
    });
  });

  describe("responsive widths", () => {
    for (const width of [320, 375, 768, 1280]) {
      it(`renders at width=${width}px`, () => {
        const markup = renderToString(
          <LineChart
            {...baseProps}
            width={width}
            series={[{ key: "revenue", id: "revenue" }]}
            curve="monotoneX"
            showPoints
            referenceAreas={[{ x1: "Jan", x2: "Feb" }]}
          />,
        );
        expect(markup).toContain(`width="${width}"`);
        expect(markup).toContain(`viewBox="0 0 ${width} 320"`);
        expect(markup).toMatch(/<path d="M/);
        expect(markup).not.toMatch(/NaN/);
      });
    }
  });
});
