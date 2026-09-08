import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { fireEvent, render } from "./testing-library";
import { AreaChart as StaticAreaChart } from "../src/charts/area-chart";
import { AreaChart as MotionAreaChart } from "../src/motion";
import { createAreaGradientId } from "../src/series/area-style";

interface Datum {
  month: string;
  revenue: number;
  costs: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4 },
  { month: "Feb", revenue: 20, costs: 8 },
  { month: "Mar", revenue: 15, costs: 6 },
];

const baseProps = {
  data,
  xKey: "month" as const,
  xScale: "point" as const,
  width: 640,
  height: 320,
};

const requireSurface = (container: ParentNode) => {
  const surface = container.querySelector("[data-kamod-chart-surface]");
  if (!surface) {
    throw new Error("expected chart surface");
  }
  return surface;
};

describe("AreaChart high-level wiring", () => {
  it("passes fill, outline, stroke, points and curve props to each visible series", () => {
    const markup = renderToString(
      <StaticAreaChart
        {...baseProps}
        id="props-chart"
        series={[
          { key: "revenue", id: "revenue" },
          { key: "costs", id: "costs", color: "var(--chart-2)" },
        ]}
        fill={{ type: "gradient", direction: "left-to-right" }}
        outline
        strokeWidth={2}
        strokeDasharray="6 3"
        showPoints
        pointRadius={4}
        curve="step"
      />,
    );

    expect(markup).toContain(createAreaGradientId("props-chart", "revenue"));
    expect(markup).toContain(createAreaGradientId("props-chart", "costs"));
    expect(markup).toContain('stroke-width="2"');
    expect(markup).toContain('stroke-dasharray="6 3"');
    expect(markup.match(/<circle/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
    const linearMarkup = renderToString(
      <StaticAreaChart
        {...baseProps}
        id="props-chart-linear"
        series={[{ key: "revenue", id: "revenue" }]}
        curve="linear"
      />,
    );
    const linearPath = linearMarkup.match(
      /data-kamod-chart-area-series[^>]*>[\s\S]*?<path d="([^"]+)"/,
    )?.[1];
    const stepPath = markup.match(
      /data-kamod-chart-area-series[^>]*>[\s\S]*?<path d="([^"]+)"/,
    )?.[1];
    expect(linearPath).toBeTruthy();
    expect(stepPath).toBeTruthy();
    expect(stepPath).not.toBe(linearPath);
  });

  it("passes the same props to stacked areas", () => {
    const markup = renderToString(
      <StaticAreaChart
        {...baseProps}
        id="stacked-props"
        stacked
        series={[
          { key: "revenue", id: "revenue" },
          { key: "costs", id: "costs", color: "var(--chart-2)" },
        ]}
        fill={{ type: "gradient" }}
        outline
        strokeDasharray="2 4"
        showPoints
        curve="stepAfter"
      />,
    );

    expect(markup).toContain("data-kamod-chart-stacked-area-series");
    expect(markup).toContain(createAreaGradientId("stacked-props", "costs"));
    expect(markup).toContain('stroke-dasharray="2 4"');
    expect(markup).toContain("<circle");
  });

  it("highlights markers only on the active series via pointer and keyboard", () => {
    const { container } = render(
      <StaticAreaChart
        {...baseProps}
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs", color: "var(--chart-2)" },
        ]}
        tooltip
        showPoints
      />,
    );
    const surface = requireSurface(container);

    fireEvent.keyDown(surface, { key: "Home" });
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='revenue'] [data-kamod-chart-active='true']",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='costs'] [data-kamod-chart-active='true']",
      ),
    ).toBeNull();

    fireEvent.keyDown(surface, { key: "ArrowDown" });
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='costs'] [data-kamod-chart-active='true']",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='revenue'] [data-kamod-chart-active='true']",
      ),
    ).toBeNull();

    const tooltipText = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(tooltipText).toContain("Revenue");
    expect(tooltipText).toContain("Costs");
  });

  it("clears tooltip on Escape and pointer leave", () => {
    const { container } = render(
      <StaticAreaChart
        {...baseProps}
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        tooltip
      />,
    );
    const surface = requireSurface(container);

    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();

    fireEvent.keyDown(surface, { key: "Escape" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

    fireEvent.keyDown(surface, { key: "Home" });
    fireEvent.pointerLeave(surface);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("removes hidden series paths, gradients and markers while keeping tooltip safe", () => {
    const { container } = render(
      <StaticAreaChart
        {...baseProps}
        id="legend-wiring"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs", color: "var(--chart-2)" },
        ]}
        showLegend
        fill={{ type: "gradient" }}
        showPoints
        tooltip
      />,
    );
    const surface = requireSurface(container);
    const revenueGradientId = createAreaGradientId("legend-wiring", "revenue");

    expect(container.querySelectorAll("[data-kamod-chart-area-series]")).toHaveLength(2);
    expect(container.querySelector(`#${revenueGradientId}`)).not.toBeNull();

    fireEvent.keyDown(surface, { key: "ArrowDown" });
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='costs'] [data-kamod-chart-active='true']",
      ),
    ).not.toBeNull();

    const revenueButton = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
      (button) => button.textContent?.includes("Revenue"),
    );
    if (!revenueButton) {
      throw new Error("expected revenue legend item");
    }

    fireEvent.click(revenueButton);
    expect(container.querySelectorAll("[data-kamod-chart-area-series]")).toHaveLength(1);
    expect(container.querySelector(`#${revenueGradientId}`)).toBeNull();
    expect(container.querySelector("[data-kamod-chart-series-id='revenue']")).toBeNull();
    expect(
      container.querySelector(
        "[data-kamod-chart-series-id='costs'] [data-kamod-chart-active='true']",
      ),
    ).not.toBeNull();

    fireEvent.keyDown(surface, { key: "Home" });
    const tooltipText = container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(tooltipText).toContain("Costs");
    expect(tooltipText).not.toContain("Revenue");
  });

  it("keeps stable gradient ids when toggling legend visibility", () => {
    const { container } = render(
      <StaticAreaChart
        {...baseProps}
        id="stable-ids"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        showLegend
        fill={{ type: "gradient" }}
      />,
    );
    const costsGradientId = createAreaGradientId("stable-ids", "costs");
    const revenueButton = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find(
      (button) => button.textContent?.includes("Revenue"),
    );
    if (!revenueButton) {
      throw new Error("expected revenue legend item");
    }

    fireEvent.click(revenueButton);
    fireEvent.click(revenueButton);

    expect(container.querySelector(`#${costsGradientId}`)).not.toBeNull();
    expect(
      container.querySelector("[data-kamod-chart-series-id='costs'] path")?.getAttribute("fill"),
    ).toBe(`url(#${costsGradientId})`);
  });
});

describe("AreaChart motion parity", () => {
  it("renders gradient, step curve, dasharray and markers through motion AreaChart", () => {
    const markup = renderToString(
      <MotionAreaChart
        {...baseProps}
        id="motion-area"
        series={[{ key: "revenue", id: "revenue" }]}
        fill={{ type: "gradient" }}
        outline
        strokeDasharray="3 2"
        showPoints
        curve="step"
        animate={{ reducedMotion: "always" }}
      />,
    );

    expect(markup).toContain(createAreaGradientId("motion-area", "revenue"));
    expect(markup).toContain('stroke-dasharray="3 2"');
    expect(markup).toContain("<circle");
    const linearMarkup = renderToString(
      <MotionAreaChart
        {...baseProps}
        id="motion-area-linear"
        series={[{ key: "revenue", id: "revenue" }]}
        curve="linear"
        animate={{ reducedMotion: "always" }}
      />,
    );
    const linearPath = linearMarkup.match(/<path d="([^"]+)"/)?.[1];
    const stepPath = markup.match(/<path d="([^"]+)"/)?.[1];
    expect(linearPath).toBeTruthy();
    expect(stepPath).toBeTruthy();
    expect(stepPath).not.toBe(linearPath);
  });

  it("matches static SSR output when reduced motion is always", () => {
    const props = {
      ...baseProps,
      id: "ssr-area",
      series: [{ key: "revenue" as const, id: "revenue" }],
      fill: { type: "gradient" as const },
      showPoints: true as const,
      animate: { reducedMotion: "always" as const },
    };
    const motionSsr = renderToString(<MotionAreaChart {...props} />);
    const staticSsr = renderToString(<StaticAreaChart {...props} />);

    expect(motionSsr).toContain("data-kamod-chart-area-series");
    expect(staticSsr).toContain("data-kamod-chart-area-series");
    expect(motionSsr).toContain(createAreaGradientId("ssr-area", "revenue"));
    expect(staticSsr).toBe(motionSsr);
  });

  it("disables motion markup when animate is false", () => {
    const markup = renderToString(
      <MotionAreaChart
        {...baseProps}
        series={[{ key: "revenue", id: "revenue" }]}
        animate={false}
      />,
    );

    expect(markup).not.toContain("data-kamod-chart-motion");
  });
});

describe("static area import boundary", () => {
  it("does not load the motion adapter from the static area entry", async () => {
    const staticModule = await import("../src/charts/area-chart");
    expect("MotionConfig" in staticModule).toBe(false);
    expect(staticModule.AreaChart).toBeTypeOf("function");
  });
});
