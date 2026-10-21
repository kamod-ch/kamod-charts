import { act, fireEvent, render, waitFor } from "./testing-library";
import renderToString from "preact-render-to-string";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CartesianTooltipOptions, LineChartProps } from "../src";
import { LineChart, ScatterChart, Tooltip } from "../src";
import {
  calculateTooltipPlacement,
  viewBoxToContainerPixels,
} from "../src/primitives/tooltip-placement";

interface Datum {
  date: Date;
  revenue: number;
  costs: number;
}

const data: Datum[] = [
  { date: new Date("2026-01-01T00:00:00.000Z"), revenue: 10, costs: 5 },
  { date: new Date("2026-01-02T00:00:00.000Z"), revenue: 20, costs: 8 },
];

const numericData = [
  { x: 0, low: 10, high: 90 },
  { x: 100, low: 12, high: 88 },
];

const interaction = {
  datum: data[0]!,
  seriesId: "revenue",
  label: "Revenue",
  index: 0,
  value: 10,
  x: 160,
  y: 80,
};

const asRect = (width: number, height: number, left = 0, top = 0) =>
  ({
    x: left,
    y: top,
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

const mockTooltipGeometry = ({
  container,
  tooltipWidth = 120,
  tooltipHeight = 40,
  boundaryWidth = 320,
  boundaryHeight = 200,
  svgWidth = 320,
  svgHeight = 200,
}: {
  container: ParentNode;
  tooltipWidth?: number;
  tooltipHeight?: number;
  boundaryWidth?: number;
  boundaryHeight?: number;
  svgWidth?: number;
  svgHeight?: number;
}) => {
  const chartContainer = container.querySelector("[data-kamod-chart-container]");
  const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
  const svg = container.querySelector("[data-kamod-chart-surface]");
  if (chartContainer instanceof Element) {
    Object.defineProperty(chartContainer, "getBoundingClientRect", {
      configurable: true,
      value: () => asRect(boundaryWidth, boundaryHeight),
    });
  }
  if (tooltip instanceof Element) {
    Object.defineProperty(tooltip, "getBoundingClientRect", {
      configurable: true,
      value: () => asRect(tooltipWidth, tooltipHeight),
    });
  }
  if (svg instanceof Element) {
    Object.defineProperty(svg, "getBoundingClientRect", {
      configurable: true,
      value: () => asRect(svgWidth, svgHeight),
    });
  }
};

const renderMeasuredTooltip = async (options?: {
  x?: number;
  y?: number;
  placement?: CartesianTooltipOptions<Datum>["placement"];
  tooltipWidth?: number;
  tooltipHeight?: number;
  boundaryWidth?: number;
  boundaryHeight?: number;
  svgWidth?: number;
  svgHeight?: number;
  viewBox?: string;
}) => {
  const geometry = {
    tooltipWidth: options?.tooltipWidth ?? 120,
    tooltipHeight: options?.tooltipHeight ?? 40,
    boundaryWidth: options?.boundaryWidth ?? 320,
    boundaryHeight: options?.boundaryHeight ?? 200,
    svgWidth: options?.svgWidth ?? options?.boundaryWidth ?? 320,
    svgHeight: options?.svgHeight ?? options?.boundaryHeight ?? 200,
  };
  const viewBox = options?.viewBox ?? `0 0 ${geometry.boundaryWidth} ${geometry.boundaryHeight}`;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    if (this.hasAttribute("data-kamod-chart-tooltip")) {
      return asRect(geometry.tooltipWidth, geometry.tooltipHeight);
    }
    if (this.hasAttribute("data-kamod-chart-container")) {
      return asRect(geometry.boundaryWidth, geometry.boundaryHeight);
    }
    if (this.hasAttribute("data-kamod-chart-surface")) {
      return asRect(geometry.svgWidth, geometry.svgHeight);
    }
    return asRect(0, 0);
  });

  const result = render(
    <div data-kamod-chart-container="" style={{ position: "relative" }}>
      <svg
        data-kamod-chart-surface=""
        width={geometry.boundaryWidth}
        height={geometry.boundaryHeight}
        viewBox={viewBox}
      />
      <Tooltip
        interaction={{ ...interaction, x: options?.x ?? 160, y: options?.y ?? 80 }}
        placement={options?.placement ?? "auto"}
      />
    </div>,
  );

  const tooltip = result.container.querySelector("[data-kamod-chart-tooltip]");
  if (!(tooltip instanceof HTMLElement)) {
    throw new Error("expected tooltip");
  }

  await waitFor(() => {
    expect(tooltip.style.transform).toBe("none");
  });

  return { tooltip, geometry, ...result };
};

describe("tooltip placement", () => {
  it("places explicit top/right/bottom/left from the anchor", () => {
    const base = {
      anchorX: 160,
      anchorY: 100,
      tooltipWidth: 80,
      tooltipHeight: 40,
      boundaryWidth: 320,
      boundaryHeight: 200,
      offset: 8,
      padding: 8,
    };

    expect(calculateTooltipPlacement({ ...base, placement: "top" })).toEqual({
      placement: "top",
      left: 120,
      top: 52,
    });
    expect(calculateTooltipPlacement({ ...base, placement: "right" })).toEqual({
      placement: "right",
      left: 168,
      top: 80,
    });
    expect(calculateTooltipPlacement({ ...base, placement: "bottom" })).toEqual({
      placement: "bottom",
      left: 120,
      top: 108,
    });
    expect(calculateTooltipPlacement({ ...base, placement: "left" })).toEqual({
      placement: "left",
      left: 72,
      top: 80,
    });
  });

  it("auto-selects a fully fitting side before clamping", () => {
    const base = {
      tooltipWidth: 80,
      tooltipHeight: 40,
      boundaryWidth: 320,
      boundaryHeight: 200,
      offset: 8,
      padding: 8,
    };

    expect(calculateTooltipPlacement({ ...base, anchorX: 160, anchorY: 100 }).placement).toBe(
      "top",
    );
    expect(calculateTooltipPlacement({ ...base, anchorX: 160, anchorY: 16 }).placement).toBe(
      "bottom",
    );
    expect(calculateTooltipPlacement({ ...base, anchorX: 300, anchorY: 100 }).placement).toBe(
      "left",
    );
    expect(calculateTooltipPlacement({ ...base, anchorX: 20, anchorY: 100 }).placement).toBe(
      "right",
    );
  });

  it("keeps auto placement inside every edge and corner of a 320px container", () => {
    const corners = [
      { anchorX: 8, anchorY: 8 },
      { anchorX: 312, anchorY: 8 },
      { anchorX: 8, anchorY: 192 },
      { anchorX: 312, anchorY: 192 },
      { anchorX: 160, anchorY: 8 },
      { anchorX: 160, anchorY: 192 },
      { anchorX: 8, anchorY: 100 },
      { anchorX: 312, anchorY: 100 },
    ];

    for (const anchor of corners) {
      const result = calculateTooltipPlacement({
        ...anchor,
        tooltipWidth: 120,
        tooltipHeight: 48,
        boundaryWidth: 320,
        boundaryHeight: 200,
      });
      expect(result.left).toBeGreaterThanOrEqual(8);
      expect(result.top).toBeGreaterThanOrEqual(8);
      expect(result.left + 120).toBeLessThanOrEqual(312);
      expect(result.top + 48).toBeLessThanOrEqual(192);
    }
  });

  it("clamps a tooltip that is larger than the boundary", () => {
    const result = calculateTooltipPlacement({
      anchorX: 160,
      anchorY: 100,
      tooltipWidth: 400,
      tooltipHeight: 260,
      boundaryWidth: 320,
      boundaryHeight: 200,
      placement: "top",
    });

    expect(result.left).toBe(8);
    expect(result.top).toBe(8);
  });

  it("converts SVG viewBox coordinates into container CSS pixels", () => {
    expect(
      viewBoxToContainerPixels(
        80,
        40,
        { width: 640, height: 320 },
        { left: 0, top: 0, width: 320, height: 160 },
        { left: 0, top: 0 },
      ),
    ).toEqual({ x: 40, y: 20 });
  });
});

describe("tooltip API and accessibility", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepts boolean and typed option fixtures", () => {
    const booleanTooltip: LineChartProps<Datum>["tooltip"] = true;
    const objectTooltip: CartesianTooltipOptions<Datum> = {
      mode: "axis",
      placement: "top",
      offset: 12,
      formatValue: (value) => value,
      formatLabel: (xValue) => String(xValue ?? ""),
      render: (context) => context.seriesId,
    };

    expect(booleanTooltip).toBe(true);
    expect(objectTooltip.mode).toBe("axis");
  });

  it("keeps boolean tooltip compatibility", async () => {
    const { container, rerender } = render(
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
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Revenue");

    rerender(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip={true}
      />,
    );
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("Revenue");
  });

  it("passes datum context to render, formatValue, and formatLabel", () => {
    const renderFn = vi.fn(
      (context: { seriesId: string; datum: Datum }) => `custom:${context.seriesId}`,
    );
    const formatValue = vi.fn((value: number | null) => (value == null ? null : `$${value}`));
    const formatLabel = vi.fn(() => "Day");

    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip={{ render: renderFn }}
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "custom:revenue",
    );
    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        datum: expect.objectContaining({ revenue: expect.any(Number) }),
        seriesId: "revenue",
        index: expect.any(Number),
      }),
    );

    const formatted = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip={{ formatValue, formatLabel }}
      />,
    );
    const nextSurface = formatted.container.querySelector("[data-kamod-chart-surface]");
    if (!nextSurface) {
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(nextSurface, { clientX: 120, clientY: 80 });
    expect(formatted.container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "Day",
    );
    expect(formatted.container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "$",
    );
    expect(formatValue).toHaveBeenCalled();
    expect(formatLabel).toHaveBeenCalled();
  });

  it("renders an em dash when a formatter returns null", () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip={{ formatValue: () => null, formatLabel: () => null }}
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("–");
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).not.toContain(
      "null",
    );
  });

  it("shows every series in axis mode and only the selected series in nearest mode", () => {
    const axis = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        series={[
          { key: "revenue", id: "revenue", label: "Revenue" },
          { key: "costs", id: "costs", label: "Costs" },
        ]}
        width={640}
        height={320}
        tooltip={{ mode: "axis" }}
      />,
    );
    const axisSurface = axis.container.querySelector("[data-kamod-chart-surface]");
    if (!axisSurface) {
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(axisSurface, { clientX: 120, clientY: 80 });
    expect(axis.container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "Revenue",
    );
    expect(axis.container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "Costs",
    );

    const nearest = render(
      <ScatterChart
        data={numericData}
        xKey="x"
        series={[
          { key: "low", id: "low", label: "Low" },
          { key: "high", id: "high", label: "High" },
        ]}
        width={640}
        height={320}
        tooltip={{ mode: "nearest" }}
      />,
    );
    const nearestSurface = nearest.container.querySelector("[data-kamod-chart-surface]");
    if (!nearestSurface) {
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(nearestSurface, { clientX: 80, clientY: 40 });
    const nearestText =
      nearest.container.querySelector("[data-kamod-chart-tooltip]")?.textContent ?? "";
    expect(nearest.container.querySelectorAll("[data-kamod-chart-tooltip-row]")).toHaveLength(1);
    expect(nearestText.includes("Low") || nearestText.includes("High")).toBe(true);
  });

  it("exposes exactly one live-region announcement surface", () => {
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
      throw new Error("expected surface");
    }
    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(1);
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.getAttribute("role")).toBeNull();
  });

  it("opens from keyboard navigation and clears on Escape and pointer leave", () => {
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
      throw new Error("expected surface");
    }

    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.keyDown(surface, { key: "Escape" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();

    fireEvent.pointerMove(surface, { clientX: 120, clientY: 80 });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    fireEvent.pointerLeave(surface);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("renders stable SSR markup without unguarded browser APIs", () => {
    const markup = renderToString(
      <Tooltip interaction={interaction} placement="top">
        {(entry) => `${entry.seriesId}:${entry.value}`}
      </Tooltip>,
    );

    expect(markup).toContain("data-kamod-chart-tooltip");
    expect(markup).toContain("revenue:10");
    expect(markup).toContain("aria-hidden");
    expect(markup).not.toContain('role="status"');
  });

  it("keeps measured coordinates inside each mocked boundary edge", async () => {
    const padding = 8;
    const tooltipWidth = 120;
    const tooltipHeight = 40;
    const boundaryWidth = 320;
    const boundaryHeight = 200;
    const anchors = [
      { x: 8, y: 8 },
      { x: 312, y: 8 },
      { x: 8, y: 192 },
      { x: 312, y: 192 },
    ];

    for (const anchor of anchors) {
      const { tooltip, unmount } = await renderMeasuredTooltip({
        x: anchor.x,
        y: anchor.y,
        tooltipWidth,
        tooltipHeight,
        boundaryWidth,
        boundaryHeight,
      });
      const left = Number.parseFloat(tooltip.style.left);
      const top = Number.parseFloat(tooltip.style.top);
      expect(left).toBeGreaterThanOrEqual(padding);
      expect(top).toBeGreaterThanOrEqual(padding);
      expect(left + tooltipWidth).toBeLessThanOrEqual(boundaryWidth - padding);
      expect(top + tooltipHeight).toBeLessThanOrEqual(boundaryHeight - padding);
      unmount();
    }
  });

  it("recalculates after resize and disconnects observers on unmount", async () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    const callbacks: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          callbacks.push(callback);
        }
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
      },
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    const { tooltip, unmount, container, geometry } = await renderMeasuredTooltip({
      x: 40,
      y: 40,
      boundaryWidth: 320,
      boundaryHeight: 200,
    });
    expect(observe).toHaveBeenCalled();

    geometry.boundaryWidth = 640;
    geometry.boundaryHeight = 320;
    geometry.svgWidth = 640;
    geometry.svgHeight = 320;
    mockTooltipGeometry({
      container,
      tooltipWidth: 120,
      tooltipHeight: 40,
      boundaryWidth: 640,
      boundaryHeight: 320,
      svgWidth: 640,
      svgHeight: 320,
    });
    callbacks.at(-1)?.([], {} as ResizeObserver);
    await waitFor(() => {
      expect(Number.parseFloat(tooltip.style.left)).toBeGreaterThanOrEqual(8);
    });

    act(() => unmount());
    expect(disconnect).toHaveBeenCalled();
  });

  it("does not emit an active tooltip during SSR of a high-level chart", () => {
    const markup = renderToString(
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

    expect(markup).not.toContain("data-kamod-chart-tooltip");
    expect(markup).toContain("data-kamod-chart-live-region");
  });
});
