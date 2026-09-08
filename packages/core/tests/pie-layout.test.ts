import { describe, expect, it } from "vitest";
import { computeOutsideLabelGutter, resolvePieLabelOptions } from "../src/series/pie-label";
import { buildPieSlices } from "../src/series/pie-geometry";
import {
  DEFAULT_INNER_RADIUS_RATIO,
  FULL_PIE_END_ANGLE,
  FULL_PIE_START_ANGLE,
  HALF_PIE_CENTER_Y_RATIO,
  HALF_PIE_END_ANGLE,
  HALF_PIE_START_ANGLE,
  MAX_INNER_RADIUS_RATIO,
  resolvePieLayout,
  type ResolvePieLayoutOptions,
} from "../src/series/pie-layout";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 30 },
];

const legacyFullAutoOuterRadius = (
  plotArea: { width: number; height: number },
  labelOptions: ReturnType<typeof resolvePieLabelOptions>,
): number => {
  const gutter = labelOptions.position === "outside" ? computeOutsideLabelGutter(labelOptions) : 0;
  const maxRadius = Math.max(0, Math.min(plotArea.width, plotArea.height) / 2);
  return Math.max(0, maxRadius - gutter);
};

const assertFiniteLayout = (layout: ReturnType<typeof resolvePieLayout>): void => {
  for (const value of Object.values(layout)) {
    if (typeof value === "number") {
      expect(Number.isFinite(value)).toBe(true);
    }
  }
};

describe("resolvePieLayout full variant", () => {
  it("matches legacy center and auto outer radius exactly", () => {
    const plotArea = { width: 320, height: 240 };
    const inside = resolvePieLabelOptions("inside");
    const outside = resolvePieLabelOptions("outside");

    const insideLayout = resolvePieLayout({
      plotArea,
      variant: "full",
      labelOptions: inside,
    });
    const outsideLayout = resolvePieLayout({
      plotArea,
      variant: "full",
      labelOptions: outside,
    });

    expect(insideLayout.centerX).toBe(160);
    expect(insideLayout.centerY).toBe(120);
    expect(insideLayout.startAngle).toBe(FULL_PIE_START_ANGLE);
    expect(insideLayout.endAngle).toBe(FULL_PIE_END_ANGLE);
    expect(insideLayout.centerContentOffsetY).toBe(0);
    expect(insideLayout.outerRadius).toBe(legacyFullAutoOuterRadius(plotArea, inside));
    expect(outsideLayout.outerRadius).toBe(legacyFullAutoOuterRadius(plotArea, outside));
    expect(insideLayout.innerRadius).toBe(0);
  });

  it("preserves explicit outerRadius when within geometric bounds", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 200, height: 200 },
      variant: "full",
      outerRadius: 72,
      labelOptions: resolvePieLabelOptions("outside"),
    });

    expect(layout.outerRadius).toBe(72);
  });
});

describe("resolvePieLayout half variant", () => {
  it("uses the upper semicircle angle range and lowered center", () => {
    const plotArea = { width: 400, height: 300 };
    const layout = resolvePieLayout({
      plotArea,
      variant: "half",
      labelOptions: resolvePieLabelOptions("inside"),
    });

    expect(layout.startAngle).toBe(HALF_PIE_START_ANGLE);
    expect(layout.endAngle).toBe(HALF_PIE_END_ANGLE);
    expect(layout.centerX).toBe(200);
    expect(layout.centerY).toBeCloseTo(300 * HALF_PIE_CENTER_Y_RATIO, 8);
    expect(layout.centerContentOffsetY).toBeLessThan(0);
    expect(layout.outerRadius).toBeGreaterThan(0);
    expect(layout.outerRadius + 6).toBeLessThanOrEqual(layout.centerY + 1e-6);
  });

  it("defaults inner radius via ratio for half charts", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 400, height: 300 },
      variant: "half",
    });

    expect(layout.innerRadius).toBeCloseTo(layout.outerRadius * DEFAULT_INNER_RADIUS_RATIO, 8);
  });
});

describe("resolvePieLayout plot shapes", () => {
  const cases: Array<{ name: string; plotArea: { width: number; height: number } }> = [
    { name: "wide", plotArea: { width: 640, height: 200 } },
    { name: "tall", plotArea: { width: 200, height: 640 } },
    { name: "square", plotArea: { width: 320, height: 320 } },
    { name: "extremely narrow", plotArea: { width: 8, height: 240 } },
    { name: "zero-sized", plotArea: { width: 0, height: 0 } },
  ];

  it.each(cases)("handles $name plot areas without NaN output", ({ plotArea }) => {
    for (const variant of ["full", "half"] as const) {
      const layout = resolvePieLayout({ plotArea, variant });
      assertFiniteLayout(layout);
      expect(layout.outerRadius).toBeGreaterThanOrEqual(0);
      expect(layout.innerRadius).toBeGreaterThanOrEqual(0);
      expect(layout.innerRadius).toBeLessThanOrEqual(layout.outerRadius);
    }
  });
});

describe("resolvePieLayout outer radius clamping", () => {
  it("clamps explicit outerRadius to the geometric maximum", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 200, height: 200 },
      variant: "full",
      outerRadius: 500,
      activeOffset: 6,
    });

    expect(layout.outerRadius).toBe(100);
  });

  it("keeps active expansion inside the plot for half charts", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 180 },
      variant: "half",
      activeOffset: 12,
    });

    expect(layout.outerRadius + 12).toBeLessThanOrEqual(layout.centerY + 1e-6);
    expect(layout.outerRadius).toBeLessThanOrEqual(layout.centerX);
  });
});

describe("resolvePieLayout inner radius", () => {
  it("treats ratio 0 as a filled circle", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 240 },
      variant: "full",
      innerRadiusRatio: 0,
      outerRadius: 80,
    });

    expect(layout.innerRadius).toBe(0);
  });

  it("uses the default 0.68 ratio when provided explicitly", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 240 },
      variant: "full",
      innerRadiusRatio: DEFAULT_INNER_RADIUS_RATIO,
      outerRadius: 100,
    });

    expect(layout.innerRadius).toBeCloseTo(68, 8);
  });

  it("clamps ratio to the 0.95 maximum", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 240 },
      variant: "full",
      innerRadiusRatio: 1.5,
      outerRadius: 100,
    });

    expect(layout.innerRadius).toBeCloseTo(95, 8);
    expect(layout.innerRadius / layout.outerRadius).toBeLessThanOrEqual(MAX_INNER_RADIUS_RATIO);
  });

  it("prefers pixel innerRadius over ratio", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 240 },
      variant: "full",
      innerRadius: 42,
      innerRadiusRatio: 0.2,
      outerRadius: 100,
    });

    expect(layout.innerRadius).toBe(42);
  });

  it("clamps invalid pixel inner radius values safely", () => {
    const layout = resolvePieLayout({
      plotArea: { width: 240, height: 240 },
      variant: "full",
      innerRadius: Number.NaN,
      outerRadius: 80,
    });

    expect(layout.innerRadius).toBe(0);
  });
});

describe("resolvePieLayout input safety", () => {
  it("does not mutate the input options object", () => {
    const plotArea = { width: 320, height: 240 };
    const options: ResolvePieLayoutOptions = {
      plotArea,
      variant: "half",
      innerRadiusRatio: 0.5,
      activeOffset: 8,
      labelOptions: resolvePieLabelOptions("outside"),
    };
    const snapshot = structuredClone(options);

    resolvePieLayout(options);

    expect(options).toEqual(snapshot);
    expect(options.plotArea).toBe(plotArea);
  });

  it("sanitizes invalid plot dimensions and offsets", () => {
    const layout = resolvePieLayout({
      plotArea: { width: Number.NaN, height: Number.POSITIVE_INFINITY },
      variant: "half",
      activeOffset: Number.NaN,
      outerRadius: Number.NEGATIVE_INFINITY,
      innerRadius: Number.POSITIVE_INFINITY,
    });

    assertFiniteLayout(layout);
    expect(layout.outerRadius).toBe(0);
    expect(layout.innerRadius).toBe(0);
    expect(layout.centerX).toBe(0);
    expect(layout.centerY).toBe(0);
  });
});

describe("buildPieSlices angle range integration", () => {
  const sliceSpan = (slice: { startAngle: number; endAngle: number; padAngle: number }) =>
    slice.endAngle - slice.startAngle - slice.padAngle;

  it("fills the full circle by default", () => {
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle: 0,
      cornerRadius: 0,
    });

    expect(slices[0]?.startAngle).toBeCloseTo(FULL_PIE_START_ANGLE, 8);
    expect(slices.at(-1)?.endAngle).toBeCloseTo(FULL_PIE_END_ANGLE, 8);
    expect(slices.reduce((sum, slice) => sum + sliceSpan(slice), 0)).toBeCloseTo(
      FULL_PIE_END_ANGLE - FULL_PIE_START_ANGLE,
      8,
    );
  });

  it("fills a custom half-pie angle range", () => {
    const padAngle = 0.01;
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle,
      cornerRadius: 0,
      startAngle: HALF_PIE_START_ANGLE,
      endAngle: HALF_PIE_END_ANGLE,
    });

    expect(slices[0]?.startAngle).toBeCloseTo(HALF_PIE_START_ANGLE, 8);
    expect(slices.at(-1)?.endAngle).toBeCloseTo(HALF_PIE_END_ANGLE, 8);

    const spanTotal = slices.reduce((sum, slice) => sum + sliceSpan(slice), 0);
    expect(spanTotal).toBeCloseTo(
      HALF_PIE_END_ANGLE - HALF_PIE_START_ANGLE - slices.length * padAngle,
      8,
    );
  });

  it("applies custom angles to rose slices", () => {
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle: 0,
      cornerRadius: 0,
      rose: true,
      startAngle: HALF_PIE_START_ANGLE,
      endAngle: HALF_PIE_END_ANGLE,
    });

    expect(slices[0]?.startAngle).toBeCloseTo(HALF_PIE_START_ANGLE, 8);
    expect(slices.at(-1)?.endAngle).toBeCloseTo(HALF_PIE_END_ANGLE, 8);
  });
});
