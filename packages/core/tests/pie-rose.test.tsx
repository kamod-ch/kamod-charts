import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Chart, PieChart, PieSeries, normalizePieData } from "../src";
import {
  computeRoseOuterRadius,
  normalizeRoseScale,
  resolvePieRoseOptions,
  resolveRoseMinRadius,
} from "../src/series/pie-rose";
import { buildPieSlices, pieSlicePath } from "../src/series/pie-geometry";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 40 },
  { name: "C", value: 10 },
];

const sliceSpan = (slice: { startAngle: number; endAngle: number; padAngle: number }) =>
  slice.endAngle - slice.startAngle - slice.padAngle;

describe("resolvePieRoseOptions", () => {
  it("defaults to sqrt scale when rose is true", () => {
    expect(resolvePieRoseOptions(true)).toEqual({ scale: "sqrt" });
    expect(resolvePieRoseOptions(undefined)).toBeNull();
  });
});

describe("rose radius helpers", () => {
  it("clamps minRadius between inner and outer radius", () => {
    expect(resolveRoseMinRadius(20, 80, 10)).toBe(20);
    expect(resolveRoseMinRadius(20, 80, 200)).toBe(80);
    expect(resolveRoseMinRadius(0, 100, undefined)).toBeCloseTo(8);
  });

  it("computes sqrt and linear normalization", () => {
    expect(normalizeRoseScale(25, 100, "linear")).toBe(0.25);
    expect(normalizeRoseScale(25, 100, "sqrt")).toBeCloseTo(0.5);
    expect(normalizeRoseScale(100, 100, "sqrt")).toBe(1);
  });

  it("assigns equal radii for equal values", () => {
    const minRadius = 10;
    const outerRadius = 80;
    const left = computeRoseOuterRadius(20, 20, 0, outerRadius, minRadius, "linear");
    const right = computeRoseOuterRadius(20, 20, 0, outerRadius, minRadius, "sqrt");

    expect(left).toBe(outerRadius);
    expect(right).toBe(outerRadius);
  });
});

describe("buildPieSlices rose geometry", () => {
  const base = {
    data,
    valueKey: "value" as const,
    labelKey: "name" as const,
    innerRadius: 0,
    outerRadius: 80,
    padAngle: 0,
    cornerRadius: 0,
  };

  it("keeps normal pie geometry when rose is disabled", () => {
    const { slices: pieSlices } = buildPieSlices(base);
    const spans = pieSlices.map(sliceSpan);
    const radii = pieSlices.map((slice) => slice.outerRadius);

    expect(new Set(radii).size).toBe(1);
    expect(Math.max(...spans)).toBeGreaterThan(Math.min(...spans));
  });

  it("uses equal angles and varying radii in rose mode", () => {
    const { slices: roseSlices } = buildPieSlices({ ...base, rose: true });
    const spans = roseSlices.map(sliceSpan);
    const radii = roseSlices.map((slice) => slice.outerRadius);

    expect(spans.every((span) => Math.abs(span - spans[0]) < 0.0001)).toBe(true);
    expect(new Set(radii).size).toBeGreaterThan(1);
    expect(Math.max(...radii)).toBeCloseTo(80, 1);
    expect(Math.min(...radii)).toBeLessThan(80);
  });

  it("supports sqrt and linear scale modes", () => {
    const sqrt = buildPieSlices({ ...base, rose: { scale: "sqrt" } }).slices;
    const linear = buildPieSlices({ ...base, rose: { scale: "linear" } }).slices;
    const medium = sqrt.find((slice) => slice.label === "A");
    const mediumLinear = linear.find((slice) => slice.label === "A");

    expect(medium?.outerRadius).toBeDefined();
    expect(mediumLinear?.outerRadius).toBeDefined();
    expect((medium?.outerRadius ?? 0) > (mediumLinear?.outerRadius ?? 0)).toBe(true);
  });

  it("renders a full ring for a single visible slice", () => {
    const { slices } = buildPieSlices({
      ...base,
      data: [{ name: "Only", value: 12 }],
      rose: true,
    });
    const [slice] = slices;

    expect(slices).toHaveLength(1);
    expect(sliceSpan(slice)).toBeCloseTo(Math.PI * 2, 3);
    expect(slice.outerRadius).toBeCloseTo(80, 1);
  });

  it("works with donut geometry and active offset", () => {
    const inactive = buildPieSlices({
      ...base,
      innerRadius: 30,
      rose: true,
      activeIndex: null,
    }).slices;
    const active = buildPieSlices({
      ...base,
      innerRadius: 30,
      rose: true,
      activeIndex: 0,
      activeOffset: 8,
    }).slices;
    const activeSlice = active.find((slice) => slice.index === 0);
    const inactiveSlice = inactive.find((slice) => slice.index === 0);

    expect((activeSlice?.outerRadius ?? 0) - (inactiveSlice?.outerRadius ?? 0)).toBeCloseTo(8);
    expect(activeSlice?.innerRadius).toBe(30);
    expect(pieSlicePath(activeSlice!)).not.toContain("NaN");
  });

  it("recalculates max radius and percentages when slices are hidden", () => {
    const hidden = normalizePieData({
      data,
      valueKey: "value",
      labelKey: "name",
      hiddenKeys: ["s:B"],
    });
    const { slices } = buildPieSlices({
      ...base,
      hiddenKeys: ["s:B"],
      rose: true,
    });
    const smaller = slices.find((slice) => slice.label === "A");

    expect(hidden.total).toBe(20);
    expect(slices).toHaveLength(2);
    expect(slices.every((slice) => slice.outerRadius <= 80)).toBe(true);
    expect(smaller?.outerRadius).toBeCloseTo(80, 1);
  });
});

describe("PieChart rose integration", () => {
  it("renders rose markup with outside labels and tooltip anchors", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        rose
        labels="outside"
        tooltip
        innerRadius={24}
      />,
    );

    expect(markup).toContain("data-kamod-chart-pie-rose");
    expect(markup).toContain("data-kamod-chart-pie-label-line");
    expect(markup).not.toContain("NaN");
  });

  it("supports legend hide with rose radii", () => {
    const { container } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        rose
        showLegend
      />,
    );
    const legendButtons = container.querySelectorAll("[data-kamod-chart-legend-item]");
    let target: HTMLButtonElement | null = null;
    for (const node of legendButtons) {
      if (node instanceof HTMLButtonElement && node.textContent?.includes("B")) {
        target = node;
        break;
      }
    }

    if (!target) {
      throw new Error("expected legend item B");
    }

    fireEvent.click(target);
    expect(container.querySelector('[data-kamod-chart-key="s:B"]')).toBeNull();
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("produces deterministic SSR output", () => {
    const props = {
      data,
      valueKey: "value" as const,
      labelKey: "name" as const,
      width: 320,
      height: 320,
      rose: true as const,
    };
    expect(renderToString(<PieChart {...props} />)).toBe(renderToString(<PieChart {...props} />));
  });

  it("animates rose slices with reduced motion fallback", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        rose
        animate={{ reducedMotion: "always" }}
      />,
    );

    expect(markup).toContain("data-kamod-chart-pie-rose");
    expect(markup).not.toContain("NaN");
  });

  it("updates rose radii on data changes without NaN paths", () => {
    const { container, rerender } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        rose
        animate={{ reducedMotion: "never", duration: 200 }}
      />,
    );

    rerender(
      <PieChart
        data={[
          { name: "A", value: 5 },
          { name: "B", value: 50 },
        ]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        rose
        animate={{ reducedMotion: "never", duration: 200 }}
      />,
    );

    expect(container.innerHTML).not.toContain("NaN");
    expect(container.querySelector("path")?.getAttribute("d")).not.toContain("NaN");
  });

  it("honors explicit outerRadius in rose mode", () => {
    const markup = renderToString(
      <Chart data={data} width={320} height={320}>
        <PieSeries valueKey="value" labelKey="name" outerRadius={90} rose />
      </Chart>,
    );

    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 90,
      padAngle: 0,
      cornerRadius: 0,
      rose: true,
    });

    expect(markup).toContain("data-kamod-chart-pie-rose");
    expect(Math.max(...slices.map((slice) => slice.outerRadius))).toBeCloseTo(90, 1);
  });
});
