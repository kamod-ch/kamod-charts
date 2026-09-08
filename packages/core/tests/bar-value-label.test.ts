import { describe, expect, it } from "vitest";
import { resolveBarGeometry } from "../src/charts/bar-geometry";
import {
  createBarValueLabelContext,
  DEFAULT_VALUE_LABEL_OFFSET,
  formatDefaultBarValueLabel,
  resolveAutoBarLabelPosition,
  resolveBarValueLabelContent,
  resolveBarValueLabelLayout,
  resolveBarValueLabelOptions,
  resolveBarValueLabelPresentation,
} from "../src/charts/bar-value-label";
import { resolvePlotAreaFromSize } from "../src/charts/cartesian-interaction";
import type { BarValueLabelContext } from "../src/charts/types";
import { inferGroupedDomain, inferStackedDomain } from "../src/series";

interface Datum {
  month: string;
  revenue: number;
  costs: number;
  losses: number;
}

const data: Datum[] = [
  { month: "Jan", revenue: 10, costs: 4, losses: -2 },
  { month: "Feb", revenue: 20, costs: 8, losses: -5 },
  { month: "Mar", revenue: 15, costs: 6, losses: -3 },
];

const plot = resolvePlotAreaFromSize(640, 320);

describe("bar value labels", () => {
  it("keeps valueLabels=true as auto outside defaults", () => {
    expect(resolveBarValueLabelOptions(true, undefined)).toEqual({ position: "auto" });
    expect(resolveBarValueLabelOptions(undefined, { position: "center", color: "#111" })).toEqual({
      position: "center",
      color: "#111",
    });
  });

  it("places positive and negative vertical outside labels on the correct sides", () => {
    const positive = { x: 40, y: 80, width: 32, height: 120 };
    const negative = { x: 40, y: 120, width: 32, height: 80 };

    const positiveLayout = resolveBarValueLabelLayout(
      positive,
      10,
      false,
      "outside",
      DEFAULT_VALUE_LABEL_OFFSET,
    );
    const negativeLayout = resolveBarValueLabelLayout(
      negative,
      -2,
      false,
      "outside",
      DEFAULT_VALUE_LABEL_OFFSET,
    );

    expect(positiveLayout.y).toBe(positive.y - DEFAULT_VALUE_LABEL_OFFSET);
    expect(positiveLayout.textAnchor).toBe("middle");
    expect(negativeLayout.y).toBe(negative.y + negative.height + DEFAULT_VALUE_LABEL_OFFSET);
    expect(negativeLayout.textAnchor).toBe("middle");
  });

  it("places positive and negative horizontal outside labels on the correct sides", () => {
    const positive = { x: 20, y: 40, width: 140, height: 24 };
    const negative = { x: 60, y: 40, width: 80, height: 24 };

    const positiveLayout = resolveBarValueLabelLayout(
      positive,
      10,
      true,
      "outside",
      DEFAULT_VALUE_LABEL_OFFSET,
    );
    const negativeLayout = resolveBarValueLabelLayout(
      negative,
      -2,
      true,
      "outside",
      DEFAULT_VALUE_LABEL_OFFSET,
    );

    expect(positiveLayout.x).toBe(positive.x + positive.width + DEFAULT_VALUE_LABEL_OFFSET);
    expect(positiveLayout.textAnchor).toBe("start");
    expect(negativeLayout.x).toBe(negative.x - DEFAULT_VALUE_LABEL_OFFSET);
    expect(negativeLayout.textAnchor).toBe("end");
  });

  it("uses center and inside anchors appropriately", () => {
    const rect = { x: 10, y: 20, width: 40, height: 100 };
    const center = resolveBarValueLabelLayout(rect, 10, false, "center", 4);
    const insidePositive = resolveBarValueLabelLayout(rect, 10, false, "inside", 4);
    const insideNegative = resolveBarValueLabelLayout(rect, -5, false, "inside", 4);

    expect(center).toEqual({
      x: 30,
      y: 70,
      textAnchor: "middle",
      dominantBaseline: "middle",
    });
    expect(insidePositive.dominantBaseline).toBe("hanging");
    expect(insideNegative.dominantBaseline).toBe("alphabetic");
  });

  it("auto-centers inner stacked segments and keeps the outer segment outside", () => {
    const series = [
      { key: "revenue" as const, id: "revenue" },
      { key: "costs" as const, id: "costs" },
    ];
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain: inferStackedDomain(
        data,
        series.map((entry) => ({ id: entry.id, value: entry.key })),
      ),
      stacked: true,
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const janRevenue = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "revenue");
    const janCosts = bars.find((bar) => bar.category === "Jan" && bar.seriesId === "costs");
    expect(janRevenue?.value).toBe(10);
    expect(janCosts?.value).toBe(4);
    expect(resolveAutoBarLabelPosition(janRevenue!, bars, true)).toBe("center");
    expect(resolveAutoBarLabelPosition(janCosts!, bars, true)).toBe("outside");
  });

  it("formats labels from raw values and supports suppression", () => {
    const context: BarValueLabelContext<Datum> = {
      datum: data[0]!,
      index: 0,
      value: 10,
      valueStart: 0,
      valueEnd: 10,
      seriesId: "revenue",
      seriesIndex: 0,
      orientation: "vertical",
      stacked: false,
      active: false,
      defaultLabel: formatDefaultBarValueLabel(10),
    };

    expect(
      resolveBarValueLabelContent(10, context, {
        format: (value) => `$${value}`,
      }),
    ).toBe("$10");
    expect(
      resolveBarValueLabelContent(10, context, {
        format: () => undefined,
      }),
    ).toBeNull();
    expect(resolveBarValueLabelContent(10, context, {})).toBe("10");
  });

  it("uses series position override from chart defaults", () => {
    const series = [
      { key: "revenue" as const, id: "revenue", valueLabels: { position: "center" as const } },
    ];
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain: inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]),
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    const presentation = resolveBarValueLabelPresentation(jan!, bars, jan!, {
      chartValueLabels: { position: "outside", color: "#999", class: "chart-label", offset: 8 },
      horizontal: false,
      stacked: false,
      active: true,
    });

    expect(presentation?.layout.y).toBe(jan!.y + jan!.height / 2);
    expect(
      createBarValueLabelContext(jan!, { orientation: "vertical", stacked: false, active: true })
        .active,
    ).toBe(true);
  });

  it("uses series override options instead of chart defaults", () => {
    const series = [
      {
        key: "revenue" as const,
        id: "revenue",
        valueLabels: { color: "#abc", class: "series-label", offset: 12 },
      },
    ];
    const bars = resolveBarGeometry({
      data,
      series,
      xKey: "month",
      yDomain: inferGroupedDomain(data, [{ id: "revenue", value: "revenue" }]),
      plotWidth: plot.width,
      plotHeight: plot.height,
    });
    const jan = bars.find((bar) => bar.category === "Jan");
    const presentation = resolveBarValueLabelPresentation(jan!, bars, jan!, {
      chartValueLabels: { color: "#999", class: "chart-label", offset: 8 },
      horizontal: false,
      stacked: false,
      active: false,
    });

    expect(presentation?.color).toBe("#abc");
    expect(presentation?.class).toBe("series-label");
    expect(presentation?.layout.y).toBe(jan!.y - 12);
  });
});
