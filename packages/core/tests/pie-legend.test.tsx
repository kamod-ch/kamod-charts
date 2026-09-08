import { fireEvent, render, waitFor } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { PieChart, normalizePieData } from "../src";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 0 },
];

const duplicates: Datum[] = [
  { name: "Same", value: 10 },
  { name: "Same", value: 20 },
];

const requireLegendButton = (container: ParentNode, label: string) => {
  const button = Array.from(container.querySelectorAll("[data-kamod-chart-legend-item]")).find(
    (node) => node.textContent?.includes(label),
  );
  if (!button) {
    throw new Error(`expected legend item ${label}`);
  }
  return button;
};

describe("PieChart legend", () => {
  it("hides the legend by default and shows it with showLegend", () => {
    const without = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} />,
    );
    const withLegend = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} showLegend />,
    );

    expect(without).not.toContain("data-kamod-chart-legend");
    expect(withLegend).toContain("data-kamod-chart-legend");
    expect(withLegend).toContain(">A</button>");
    expect(withLegend).toContain(">B</button>");
    expect(withLegend).not.toContain(">C</button>");
  });

  it("assigns unique legend ids for duplicate labels", () => {
    const { container } = render(
      <PieChart
        data={duplicates}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
      />,
    );

    const items = container.querySelectorAll("[data-kamod-chart-legend-item]");
    expect(items).toHaveLength(2);
  });

  it("toggles the matching slice out of the plot", () => {
    const { container } = render(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} showLegend />,
    );

    expect(container.querySelectorAll("[data-kamod-chart-pie-segment]")).toHaveLength(2);
    fireEvent.click(requireLegendButton(container, "A"));
    expect(container.querySelector('[data-kamod-chart-key="s:A"]')).toBeNull();
    expect(container.querySelectorAll("[data-kamod-chart-pie-segment]")).toHaveLength(1);
  });

  it("recomputes total and percentage for visible slices", () => {
    const hiddenB = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
      hiddenKeys: ["s:B"],
    });

    expect(hiddenB.total).toBe(10);
    expect(hiddenB.entries[0]?.percentage).toBe(1);
    expect(hiddenB.visible).toHaveLength(1);
  });

  it("keeps colors stable when slices are hidden", () => {
    const full = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
      colors: ["red", "green", "blue"],
    });
    const hiddenA = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
      colors: ["red", "green", "blue"],
      hiddenKeys: ["s:A"],
    });

    expect(full.entries[1]?.color).toBe("green");
    expect(hiddenA.entries[1]?.color).toBe("green");
  });

  it("works with sorting and toggling together", () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        sort
      />,
    );

    fireEvent.click(requireLegendButton(container, "B"));
    expect(container.querySelector('[data-kamod-chart-key="s:B"]')).toBeNull();
    expect(container.querySelector('[data-kamod-chart-key="s:A"]')).not.toBeNull();
  });

  it("moves active and tooltip state when the active slice is hidden", async () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        tooltip
      />,
    );
    const svg = container.querySelector("svg");
    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "End" });
    await waitFor(() => {
      expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("B");
    });

    fireEvent.click(requireLegendButton(container, "B"));
    expect(container.querySelector("[data-kamod-chart-tooltip]")?.textContent).toContain("A");
    expect(
      container
        .querySelector('[data-kamod-chart-key="s:A"] path')
        ?.getAttribute("data-kamod-chart-active"),
    ).toBe("true");
  });

  it("shows emptyContent when all slices are hidden but keeps the legend restorable", () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        emptyContent={<text>Nothing left</text>}
      />,
    );

    fireEvent.click(requireLegendButton(container, "A"));
    fireEvent.click(requireLegendButton(container, "B"));
    expect(container.querySelector("[data-kamod-chart-pie-empty]")).not.toBeNull();
    expect(container.querySelectorAll("[data-kamod-chart-legend-item]")).toHaveLength(2);

    fireEvent.click(requireLegendButton(container, "A"));
    expect(container.querySelectorAll("[data-kamod-chart-pie-segment]")).toHaveLength(1);
  });

  it("does not toggle when legend.interactive is false", () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        legend={{ interactive: false }}
      />,
    );

    fireEvent.click(requireLegendButton(container, "A"));
    expect(container.querySelectorAll("[data-kamod-chart-pie-segment]")).toHaveLength(2);
    expect(requireLegendButton(container, "A").getAttribute("aria-pressed")).toBe("true");
  });

  it("preserves motion semantics with reduced motion", () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        animate={{ reducedMotion: "always" }}
      />,
    );

    fireEvent.click(requireLegendButton(container, "A"));
    expect(container.querySelector('[data-kamod-chart-key="s:A"]')).toBeNull();
    expect(container.querySelector('[data-kamod-chart-key="s:B"]')).not.toBeNull();
  });

  it("renders legend markup during SSR without auto-showing it", () => {
    const withoutLegend = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} />,
    );
    const withLegend = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} showLegend />,
    );

    expect(withoutLegend).not.toContain("data-kamod-chart-legend");
    expect(withLegend).toContain("data-kamod-chart-legend");
  });
});

describe("Pie legend exports", () => {
  it("exposes PieLegendOptions from the package root", async () => {
    const root = await import("../src");
    expect(root.PieChart).toBeTypeOf("function");
    expect(root.normalizePieData).toBeTypeOf("function");
  });
});
