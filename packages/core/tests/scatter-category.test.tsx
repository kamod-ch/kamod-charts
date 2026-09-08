import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { ScatterChart } from "../src";
import { ScatterChart as MotionScatterChart } from "../src/motion";
import { encodeScatterCategoryId } from "../src/charts/scatter-model";

interface Datum {
  x: number;
  y: number;
  group?: string | number | null;
  alt?: number;
}

const categoryData: Datum[] = [
  { x: 10, y: 10, group: "alpha" },
  { x: 20, y: 20, group: "beta" },
  { x: 30, y: 30, group: 1 },
  { x: 40, y: 40, group: "1" },
  { x: 50, y: 50, group: null },
];

const legendButtonByLabel = (container: ParentNode, label: string) => {
  const button = [...container.querySelectorAll("[data-kamod-chart-legend-item]")].find((node) =>
    node.textContent?.includes(label),
  );
  if (!button) {
    throw new Error(`expected legend item ${label}`);
  }
  return button;
};

const readCircles = (container: ParentNode) =>
  [...container.querySelectorAll("[data-kamod-chart-scatter-series] circle")].map((node) => ({
    fill: node.getAttribute("fill"),
    categoryId: node.getAttribute("data-kamod-chart-category-id"),
    phase: node.getAttribute("data-kamod-chart-phase"),
  }));

const readYAxisTicks = (container: ParentNode) =>
  [...container.querySelectorAll("[data-kamod-chart-y-axis] text")].map((node) => node.textContent);

describe("ScatterChart category mode", () => {
  it("keeps series mode unchanged without categoryKey", () => {
    const markup = renderToString(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[
          { key: "y", id: "primary", label: "Primary", color: "var(--chart-2)" },
          { key: "alt", id: "secondary", label: "Secondary", color: "var(--chart-3)" },
        ]}
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(markup).toContain("Primary");
    expect(markup).toContain("Secondary");
    expect(markup).not.toContain("data-kamod-chart-category-id=");
    expect(markup.match(/data-kamod-chart-scatter-series/g)?.length).toBe(2);
  });

  it("applies category colors in SVG", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "primary", color: "var(--chart-99)" }]}
        categoryKey="group"
        categories={[
          { value: "alpha", label: "Alpha", color: "var(--chart-2)" },
          { value: "beta", label: "Beta", color: "var(--chart-3)" },
        ]}
        height={240}
        width={480}
      />,
    );

    const circles = readCircles(container);
    expect(circles.map((circle) => circle.fill)).toEqual(["var(--chart-2)", "var(--chart-3)"]);
    expect(circles.every((circle) => circle.fill !== "var(--chart-99)")).toBe(true);
  });

  it("renders one legend item per category with order, labels, colors, and ids", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData.slice(0, 4)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        categories={[
          { value: "beta", label: "Beta Label", color: "var(--chart-3)" },
          { value: 1, label: "One", color: "var(--chart-4)" },
        ]}
        height={240}
        width={480}
        showLegend
      />,
    );

    const buttons = [...container.querySelectorAll("[data-kamod-chart-legend-item]")];
    expect(buttons).toHaveLength(4);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      "Beta Label",
      "One",
      "alpha",
      "1",
    ]);
    expect(encodeScatterCategoryId(1)).toBe("n:1");
    expect(encodeScatterCategoryId("1")).toBe("s:1");
    expect(readCircles(container).map((circle) => circle.categoryId)).toEqual([
      "s:alpha",
      "s:beta",
      "n:1",
      "s:1",
    ]);
  });

  it("toggles only the targeted category visibility", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(readCircles(container)).toHaveLength(2);
    fireEvent.click(legendButtonByLabel(container, "alpha"));
    expect(readCircles(container)).toHaveLength(1);
    expect(readCircles(container)[0]?.categoryId).toBe("s:beta");
    fireEvent.click(legendButtonByLabel(container, "alpha"));
    expect(readCircles(container)).toHaveLength(2);
  });

  it("respects initial hidden categories from config", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        categories={[{ value: "alpha", hidden: true }]}
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(readCircles(container)).toHaveLength(1);
    expect(legendButtonByLabel(container, "alpha").getAttribute("aria-pressed")).toBe("false");
  });

  it("adds and removes dynamically discovered categories", () => {
    const view = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(view.container.querySelectorAll("[data-kamod-chart-legend-item]")).toHaveLength(2);

    view.rerender(
      <ScatterChart
        data={[...categoryData.slice(0, 2), { x: 60, y: 60, group: "gamma" }]}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );
    expect(view.container.querySelectorAll("[data-kamod-chart-legend-item]")).toHaveLength(3);
    expect(readCircles(view.container)).toHaveLength(3);

    view.rerender(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );
    expect(view.container.querySelectorAll("[data-kamod-chart-legend-item]")).toHaveLength(2);
  });

  it("deduplicates colliding configured category ids deterministically", () => {
    const { container } = render(
      <ScatterChart
        data={[
          { x: 1, y: 1, group: "a" },
          { x: 2, y: 2, group: "b" },
        ]}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        categories={[
          { id: "dup", value: "a", label: "A" },
          { id: "dup", value: "b", label: "B" },
        ]}
        height={240}
        width={480}
        showLegend
      />,
    );

    const ids = readCircles(container).map((circle) => circle.categoryId);
    expect(ids).toEqual(["dup", "dup#1"]);
  });

  it("does not duplicate category legend items for multiple y series", () => {
    const multiSeriesData: Datum[] = [
      { x: 10, y: 10, alt: 5, group: "alpha" },
      { x: 20, y: 20, alt: 8, group: "beta" },
    ];
    const { container } = render(
      <ScatterChart
        data={multiSeriesData}
        xKey="x"
        xScale="linear"
        series={[
          { key: "y", id: "primary", label: "Primary" },
          { key: "alt", id: "secondary", label: "Secondary" },
        ]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(container.querySelectorAll("[data-kamod-chart-legend-item]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-kamod-chart-scatter-series]")).toHaveLength(2);
    expect(readCircles(container)).toHaveLength(4);
  });

  it("keeps y-axis domain stable when toggling categories", () => {
    const { container, rerender } = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );

    const before = readYAxisTicks(container);
    fireEvent.click(legendButtonByLabel(container, "alpha"));
    const after = readYAxisTicks(container);
    expect(after).toEqual(before);

    rerender(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );
    expect(readYAxisTicks(container)).toEqual(before);
  });

  it("clears active state when the active category is hidden", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
        tooltip
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }

    fireEvent.keyDown(surface, { key: "Home" });
    expect(container.querySelector('[data-kamod-chart-active="true"]')).not.toBeNull();

    fireEvent.click(legendButtonByLabel(container, "alpha"));
    expect(container.querySelector('[data-kamod-chart-active="true"]')).toBeNull();
  });

  it("does not render missing category values or invent labels", () => {
    const { container } = render(
      <ScatterChart
        data={categoryData}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        categoryKey="group"
        height={240}
        width={480}
        showLegend
      />,
    );

    expect(readCircles(container)).toHaveLength(4);
    expect(container.textContent).not.toContain("null");
    expect(container.textContent).not.toContain("Missing");
  });

  it("exits hidden category circles in motion and matches reduced-motion fallback", async () => {
    const props = {
      data: categoryData.slice(0, 2),
      xKey: "x" as const,
      xScale: "linear" as const,
      series: [{ key: "y" as const, id: "y" }],
      categoryKey: "group" as const,
      height: 240,
      width: 480,
      showLegend: true,
      animate: { reducedMotion: "always" as const },
    };

    const staticCircles = readCircles(render(<ScatterChart {...props} />).container);
    const motionCircles = readCircles(render(<MotionScatterChart {...props} />).container);
    expect(motionCircles).toEqual(staticCircles);

    const reducedView = render(
      <MotionScatterChart {...props} animate={{ reducedMotion: "always" }} />,
    );
    fireEvent.click(legendButtonByLabel(reducedView.container, "alpha"));
    expect(readCircles(reducedView.container)).toHaveLength(1);

    vi.useFakeTimers();
    const view = render(<MotionScatterChart {...props} animate />);
    fireEvent.click(legendButtonByLabel(view.container, "alpha"));
    await vi.runAllTimersAsync();
    const circles = readCircles(view.container);
    expect(circles).toHaveLength(1);
    expect(circles[0]?.categoryId).toBe("s:beta");
    vi.useRealTimers();
  });
});
