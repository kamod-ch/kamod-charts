import { describe, expect, it } from "vitest";
import {
  SCATTER_CHART_COLOR_COUNT,
  SCATTER_CHART_COLORS,
  deriveScatterCategoriesFromData,
  encodeScatterCategoryId,
  mergeScatterCategories,
  resolveScatterPoints,
} from "../src/charts/scatter-model";

describe("scatter category model", () => {
  it("derives categories in first-seen order", () => {
    const data = [{ group: "b" }, { group: "a" }, { group: "b" }, { group: "c" }, { group: "a" }];

    expect(deriveScatterCategoriesFromData(data, "group")).toEqual(["b", "a", "c"]);
  });

  it('distinguishes number 1 from string "1" in internal ids', () => {
    expect(encodeScatterCategoryId(1)).toBe("n:1");
    expect(encodeScatterCategoryId("1")).toBe("s:1");

    const data = [{ kind: 1 }, { kind: "1" }];
    const merged = mergeScatterCategories(undefined, deriveScatterCategoriesFromData(data, "kind"));

    expect(merged.map((entry) => entry.id)).toEqual(["n:1", "s:1"]);
    expect(merged.map((entry) => entry.value)).toEqual([1, "1"]);
  });

  it("merges explicit categories first and keeps configured categories missing from data", () => {
    const merged = mergeScatterCategories(
      [
        { value: "configured", label: "Configured", color: "var(--chart-2)" },
        { value: "hidden", hidden: true },
      ],
      ["discovered", "configured"],
    );

    expect(merged.map((entry) => entry.value)).toEqual(["configured", "hidden", "discovered"]);
    expect(merged[0]?.label).toBe("Configured");
    expect(merged[0]?.color).toBe("var(--chart-2)");
    expect(merged[1]?.hidden).toBe(true);
  });

  it("deduplicates colliding category ids deterministically", () => {
    const merged = mergeScatterCategories(
      [
        { id: "dup", value: "a" },
        { id: "dup", value: "b" },
      ],
      [],
    );

    expect(merged.map((entry) => entry.id)).toEqual(["dup", "dup#1"]);
  });

  it("assigns stable default colors from Kamod chart tokens", () => {
    expect(SCATTER_CHART_COLOR_COUNT).toBe(4);
    expect(SCATTER_CHART_COLORS).toEqual([
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
    ]);

    const first = mergeScatterCategories(undefined, ["a", "b", "c", "d", "e"]);
    const second = mergeScatterCategories(undefined, ["a", "b", "c", "d", "e"]);

    expect(first.map((entry) => entry.color)).toEqual(second.map((entry) => entry.color));
    expect(first[4]?.color).toBe("var(--chart-1)");
  });

  it("does not mutate input data or category config arrays", () => {
    const data = [{ group: "a", y: 1, size: 10 }];
    const categories = [{ value: "a", label: "A" }];
    const series = [{ key: "y" as const, id: "primary" }];
    const dataSnapshot = structuredClone(data);
    const categoriesSnapshot = structuredClone(categories);
    const seriesSnapshot = structuredClone(series);

    resolveScatterPoints({
      data,
      series,
      xKey: "group",
      categoryKey: "group",
      categories,
      sizeKey: "size",
    });

    expect(data).toEqual(dataSnapshot);
    expect(categories).toEqual(categoriesSnapshot);
    expect(series).toEqual(seriesSnapshot);
  });
});

describe("resolved scatter points", () => {
  const data = [
    { x: 1, y: 10, size: 0, group: "alpha" },
    { x: 2, y: 20, size: 100, group: "beta" },
    { x: 3, y: null as number | null, size: 50, group: "alpha" },
    { x: 4, y: 30, size: Number.NaN, group: "gamma" },
    { x: 5, y: 40, size: 10, group: null as string | null },
  ];

  it("builds visible points with category colors and scaled radii", () => {
    const result = resolveScatterPoints({
      data,
      series: [{ key: "y", id: "primary", label: "Primary" }],
      xKey: "x",
      sizeKey: "size",
      sizeScale: "linear",
      categoryKey: "group",
      categories: [{ value: "gamma", label: "Gamma", hidden: true }],
    });

    expect(result.sizeDomain).toEqual([0, 100]);
    expect(result.categories.map((entry) => entry.value)).toEqual(["gamma", "alpha", "beta"]);
    expect(result.points.filter((point) => point.visible)).toHaveLength(2);

    const zeroSize = result.points.find((point) => point.index === 0);
    expect(zeroSize?.sizeValue).toBe(0);
    expect(zeroSize?.visible).toBe(true);
    expect(zeroSize?.categoryLabel).toBe("alpha");
    expect(zeroSize?.color).toBe("var(--chart-2)");

    const invalidSize = result.points.find((point) => point.index === 3);
    expect(invalidSize?.visible).toBe(false);

    const missingCategory = result.points.find((point) => point.index === 4);
    expect(missingCategory?.visible).toBe(false);
  });

  it("marks hidden categories and unknown category values as not visible", () => {
    const result = resolveScatterPoints({
      data: [{ x: 1, y: 10, group: "hidden" }],
      series: [{ key: "y" }],
      xKey: "x",
      categoryKey: "group",
      categories: [{ value: "hidden", hidden: true }],
    });

    expect(result.points[0]?.visible).toBe(false);
  });

  it("keeps stable ids and colors for unchanged data", () => {
    const options = {
      data: [
        { x: 1, y: 10, group: "a" },
        { x: 2, y: 20, group: "b" },
      ],
      series: [{ key: "y" as const }],
      xKey: "x" as const,
      categoryKey: "group" as const,
    };

    const first = resolveScatterPoints(options);
    const second = resolveScatterPoints(options);

    expect(first.categories).toEqual(second.categories);
    expect(first.points.map((point) => point.categoryId)).toEqual(
      second.points.map((point) => point.categoryId),
    );
    expect(first.points.map((point) => point.color)).toEqual(
      second.points.map((point) => point.color),
    );
  });
});
