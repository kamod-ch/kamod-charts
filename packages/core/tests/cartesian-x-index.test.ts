import { describe, expect, it } from "vitest";
import { buildCartesianXIndex, findNearestIndexOnXIndex } from "../src/charts/cartesian-x-index";

describe("cartesian x index", () => {
  const data = [
    { x: 0, y: 1 },
    { x: 10, y: 2 },
    { x: 1000, y: 3 },
  ];

  it("selects the nearest datum by projected x", () => {
    const index = buildCartesianXIndex({
      data,
      xKey: "x",
      xScale: "linear",
      yDomain: [0, 4],
      plotWidth: 400,
      seriesKey: "y",
    });
    expect(index).not.toBeNull();
    expect(findNearestIndexOnXIndex(index!, 95)).toBe(1);
    expect(findNearestIndexOnXIndex(index!, 380)).toBe(2);
  });

  it("breaks ties by stable datum index order", () => {
    const dupes = [
      { x: 5, y: 1 },
      { x: 5, y: 2 },
    ];
    const index = buildCartesianXIndex({
      data: dupes,
      xKey: "x",
      xScale: "linear",
      yDomain: [0, 3],
      plotWidth: 200,
      seriesKey: "y",
    });
    expect(findNearestIndexOnXIndex(index!, 100)).toBe(0);
  });
});
