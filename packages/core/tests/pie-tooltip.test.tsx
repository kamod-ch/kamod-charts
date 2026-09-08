import { fireEvent, render, waitFor } from "./testing-library";
import renderToString from "preact-render-to-string";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PieChart } from "../src";
import { pieSliceAnchor, pieSliceSurfacePoint, buildPieSlices } from "../src/series/pie-geometry";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 0 },
];

const requireSegmentPath = (container: ParentNode, key = "s:A") => {
  const path = container.querySelector(`[data-kamod-chart-key="${key}"] path`);
  if (!path) {
    throw new Error(`expected segment path for ${key}`);
  }
  return path;
};

describe("PieChart tooltip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows default tooltip content on pointer enter with value and percentage", async () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );

    fireEvent.pointerEnter(requireSegmentPath(container, "s:A"));

    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    const tooltip = container.querySelector("[data-kamod-chart-tooltip]");
    expect(tooltip?.getAttribute("aria-hidden")).toBe("true");
    expect(tooltip?.textContent).toContain("A");
    expect(tooltip?.textContent).toContain("10");
    expect(tooltip?.textContent).toContain("33.3%");
  });

  it("hides tooltip on pointer leave", async () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );
    const path = requireSegmentPath(container, "s:B");

    fireEvent.pointerEnter(path);
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    fireEvent.pointerLeave(path);
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("shows tooltip and live region on keyboard navigation", async () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );
    const svg = container.querySelector("svg");
    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "ArrowRight" });
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("A");
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain("A");
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain("10");
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain(
      "33.3%",
    );
  });

  it("keeps keyboard tooltip after pointer leave", async () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );
    const svg = container.querySelector("svg");
    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "End" });
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("B");
    });

    const path = requireSegmentPath(container, "s:A");
    fireEvent.pointerEnter(path);
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("A");
    });

    fireEvent.pointerLeave(path);
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("B");
    });
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toContain("B");
  });

  it("supports custom render and formatters", async () => {
    const renderFn = vi.fn((context: { label: string }) => <div>Custom {context.label}</div>);
    const formatValue = vi.fn((value: number) => `$${value}`);
    const formatPercentage = vi.fn((percentage: number) => `${Math.round(percentage * 100)} pct`);

    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        tooltip={{ render: renderFn, formatValue, formatPercentage }}
      />,
    );

    fireEvent.pointerEnter(requireSegmentPath(container, "s:B"));
    await waitFor(() => {
      expect(renderFn).toHaveBeenCalled();
    });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain(
      "Custom B",
    );
    expect(formatValue).not.toHaveBeenCalled();
    expect(formatPercentage).not.toHaveBeenCalled();
  });

  it("uses formatters in default tooltip content", async () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        tooltip={{
          formatValue: (value) => `$${value}`,
          formatPercentage: (percentage) => `${Math.round(percentage * 100)}%`,
        }}
      />,
    );

    fireEvent.pointerEnter(requireSegmentPath(container, "s:B"));
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("$20");
    });
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("67%");
  });

  it("does not activate tooltip for invalid-only data", () => {
    const { container } = render(
      <PieChart
        data={[{ name: "Debt", value: -1 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        tooltip
      />,
    );

    expect(container.querySelector("[data-kamod-chart-pie-segment]")).toBeNull();
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });

  it("clears tooltip and active state on Escape", async () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );
    const svg = container.querySelector("svg");
    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "ArrowRight" });
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    fireEvent.keyDown(svg, { key: "Escape" });
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
    expect(container.querySelector('[data-kamod-chart-active="true"]')).toBeNull();
    expect(container.querySelector("[data-kamod-chart-live-region]")?.textContent).toBe("");
  });

  it("does not render an open tooltip during SSR", () => {
    const markup = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} tooltip />,
    );

    expect(markup).not.toContain("data-kamod-chart-tooltip");
  });

  it("shows tooltip for outside labels when slices use gutter shrink", async () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="outside"
        tooltip
      />,
    );

    fireEvent.pointerEnter(requireSegmentPath(container, "s:A"));

    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")).not.toBeNull();
    });

    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("33.3%");
  });

  it("uses the same interaction semantics with reduced motion", async () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        tooltip
        animate={{ reducedMotion: "always" }}
      />,
    );

    fireEvent.pointerEnter(requireSegmentPath(container, "s:A"));
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("A");
    });

    fireEvent.pointerLeave(requireSegmentPath(container, "s:A"));
    expect(container.querySelector("[data-kamod-chart-tooltip]")).toBeNull();
  });
});

describe("pie slice anchor geometry", () => {
  it("places anchors between inner and outer radius for donut and active offset", () => {
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 48,
      outerRadius: 120,
      padAngle: 0.02,
      cornerRadius: 4,
      activeIndex: 0,
      activeOffset: 10,
    });
    const slice = slices[0];
    if (!slice) {
      throw new Error("expected slice");
    }

    const [anchorX, anchorY] = pieSliceAnchor(slice);
    const distance = Math.hypot(anchorX, anchorY);
    expect(distance).toBeGreaterThan(slice.innerRadius);
    expect(distance).toBeLessThan(slice.outerRadius + 0.01);

    const surface = pieSliceSurfacePoint(slice, { x: 0, y: 0, width: 320, height: 320 });
    expect(surface.x).toBeGreaterThan(0);
    expect(surface.y).toBeGreaterThan(0);
    expect(surface.x).toBeLessThan(320);
    expect(surface.y).toBeLessThan(320);
  });
});
