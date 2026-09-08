import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { Chart, PieChart, PieSeries, normalizePieData, normalizePieValue } from "../src";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 0 },
];

describe("normalizePieData", () => {
  it("computes total and percentage for valid data", () => {
    const result = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
    });

    expect(result.total).toBe(30);
    expect(result.visible).toHaveLength(2);
    expect(result.entries[0]?.percentage).toBeCloseTo(10 / 30);
    expect(result.entries[1]?.percentage).toBeCloseTo(20 / 30);
    expect(result.entries[2]?.percentage).toBe(0);
  });

  it("excludes null, negative, NaN, and Infinity values from visible slices", () => {
    const invalid = [
      { name: "Null", value: null as unknown as number },
      { name: "Neg", value: -5 },
      { name: "NaN", value: Number.NaN },
      { name: "Inf", value: Number.POSITIVE_INFINITY },
      { name: "Undef", value: undefined as unknown as number },
    ];
    const result = normalizePieData({
      data: invalid,
      valueKey: "value",
      labelKey: "name",
    });

    expect(result.visible).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.entries.every((entry) => entry.value === 0)).toBe(true);
  });

  it("assigns stable unique keys for duplicate labels", () => {
    const duplicates = [
      { name: "Same", value: 10 },
      { name: "Same", value: 20 },
    ];
    const result = normalizePieData({
      data: duplicates,
      valueKey: "value",
      labelKey: "name",
    });
    const keys = result.entries.map((entry) => entry.key);

    expect(new Set(keys).size).toBe(2);
    expect(keys[0]).toBe("s:Same");
    expect(keys[1]).toBe("s:Same#1");
  });

  it("keeps colors tied to original indices when filtering and sorting", () => {
    const colors = ["red", "green", "blue", "yellow"];
    const mixed = [
      { name: "Zero", value: 0 },
      { name: "Small", value: 5 },
      { name: "Large", value: 15 },
    ];
    const filtered = normalizePieData({
      data: mixed,
      valueKey: "value",
      labelKey: "name",
      colors,
    });
    const sorted = normalizePieData({
      data: mixed,
      valueKey: "value",
      labelKey: "name",
      colors,
      sort: true,
    });

    expect(filtered.entries[1]?.color).toBe("green");
    expect(filtered.entries[2]?.color).toBe("blue");
    expect(sorted.visible[0]?.index).toBe(2);
    expect(sorted.visible[0]?.color).toBe("blue");
    expect(sorted.visible[1]?.color).toBe("green");
  });

  it("orders visible slices with a custom comparator for render and navigation", () => {
    const result = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
      sort: (left, right) => left.label.localeCompare(right.label),
    });

    expect(result.visible.map((entry) => entry.label)).toEqual(["A", "B"]);
  });
});

describe("normalizePieValue", () => {
  it.each([
    [null, 0],
    [undefined, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [-3, 0],
    [0, 0],
    [12, 12],
  ])("maps %s to %s", (input, expected) => {
    expect(normalizePieValue(input as number | null | undefined)).toBe(expected);
  });
});

describe("PieChart", () => {
  it("renders high-level pie segments and labels", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        title="Share"
        labels="outside"
      />,
    );

    expect(markup).toContain("data-kamod-chart-pie-series");
    expect(markup).toContain("data-kamod-chart-pie-segment");
    expect(markup).toContain("Share");
    expect(markup).toContain(">A</text>");
    expect(markup).toContain(">B</text>");
  });

  it("renders donut options and center content", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        innerRadius={48}
        padAngle={0.02}
        cornerRadius={4}
        centerContent={<text text-anchor="middle">Total</text>}
      />,
    );

    expect(markup).toContain("Total");
    expect(markup).toContain("<path");
  });

  it("shows chart empty state for empty data and custom emptyContent for invalid values", () => {
    const noPositive = renderToString(
      <PieChart
        data={[{ name: "Debt", value: -5 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        emptyContent={<text>No positive values</text>}
      />,
    );
    const empty = renderToString(
      <PieChart data={[]} valueKey="value" labelKey="name" width={320} height={320} />,
    );

    expect(noPositive).toContain("No positive values");
    expect(noPositive).not.toContain("Keine positiven Werte");
    expect(noPositive).toContain("data-kamod-chart-pie-empty");
    expect(empty).toContain("Keine Daten verfügbar");
  });

  it("supports low-level PieSeries composition", () => {
    const markup = renderToString(
      <Chart data={data} width={320} height={320}>
        <PieSeries valueKey="value" labelKey="name" labelPosition="inside" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-pie-series");
  });

  it("supports keyboard navigation and segment click on visible slices", () => {
    const onSegmentClick = vi.fn();
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        onSegmentClick={onSegmentClick}
      />,
    );
    const svg = container.querySelector("svg");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "ArrowRight" });
    expect(container.querySelector('[data-kamod-chart-active="true"]')).not.toBeNull();

    fireEvent.keyDown(svg, { key: "ArrowRight" });
    fireEvent.keyDown(svg, { key: "Enter" });
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], 1, 20);

    const segment = container.querySelector("[data-kamod-chart-pie-segment] path");
    if (!segment) {
      throw new Error("expected segment");
    }

    fireEvent.click(segment);
    expect(onSegmentClick).toHaveBeenCalledWith(data[0], 0, 10);
  });

  it("skips invalid values while navigating with arrow keys", () => {
    const mixed = [
      { name: "A", value: 10 },
      { name: "Gap", value: 0 },
      { name: "B", value: 20 },
    ];
    const { container } = render(
      <PieChart data={mixed} valueKey="value" labelKey="name" width={320} height={320} />,
    );
    const svg = container.querySelector("svg");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "Home" });
    expect(
      container
        .querySelector('[data-kamod-chart-key="s:A"] path')
        ?.getAttribute("data-kamod-chart-active"),
    ).toBe("true");

    fireEvent.keyDown(svg, { key: "End" });
    expect(
      container
        .querySelector('[data-kamod-chart-key="s:B"] path')
        ?.getAttribute("data-kamod-chart-active"),
    ).toBe("true");
  });

  it("clears active state on Escape and ignores Enter when inactive", () => {
    const onSegmentClick = vi.fn();
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        onSegmentClick={onSegmentClick}
      />,
    );
    const svg = container.querySelector("svg");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "ArrowRight" });
    expect(container.querySelector('[data-kamod-chart-active="true"]')).not.toBeNull();

    fireEvent.keyDown(svg, { key: "Escape" });
    expect(container.querySelector('[data-kamod-chart-active="true"]')).toBeNull();

    fireEvent.keyDown(svg, { key: "Enter" });
    expect(onSegmentClick).not.toHaveBeenCalled();
  });

  it("does not invoke click handlers when only invalid values exist", () => {
    const onSegmentClick = vi.fn();
    const { container } = render(
      <PieChart
        data={[{ name: "Debt", value: -1 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        onSegmentClick={onSegmentClick}
      />,
    );
    const svg = container.querySelector("svg");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "Enter" });
    fireEvent.keyDown(svg, { key: " " });
    expect(onSegmentClick).not.toHaveBeenCalled();
  });

  it("follows custom sort order for keyboard navigation", () => {
    const onSegmentClick = vi.fn();
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        sort={(left, right) => left.label.localeCompare(right.label)}
        onSegmentClick={onSegmentClick}
      />,
    );
    const svg = container.querySelector("svg");

    if (!svg) {
      throw new Error("expected svg");
    }

    fireEvent.keyDown(svg, { key: "Home" });
    fireEvent.keyDown(svg, { key: "ArrowRight" });
    fireEvent.keyDown(svg, { key: "Enter" });
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], 1, 20);
  });

  it("produces deterministic SSR output", () => {
    const first = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} />,
    );
    const second = renderToString(
      <PieChart data={data} valueKey="value" labelKey="name" width={320} height={320} />,
    );

    expect(first).toBe(second);
  });
});

describe("PieSeries emptyContent", () => {
  it("renders emptyContent without hardcoded fallback text", () => {
    const markup = renderToString(
      <Chart data={[{ name: "X", value: -1 }]} width={320} height={320}>
        <PieSeries
          valueKey="value"
          labelKey="name"
          emptyContent={<text data-testid="empty">Nothing to show</text>}
        />
      </Chart>,
    );

    expect(markup).toContain("Nothing to show");
    expect(markup).not.toContain("Keine positiven Werte");
  });
});
