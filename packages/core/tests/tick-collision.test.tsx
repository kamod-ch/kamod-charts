import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChart } from "../src/charts/line-chart";
import {
  estimateTickCollisionWidth,
  prepareAxisTicks,
  truncateTickLabel,
} from "../src/axes/tick-collision";

describe("tick collision utilities", () => {
  it("truncates labels deterministically", () => {
    const result = truncateTickLabel("January revenue report", 8);
    expect(result.display).toBe("January…");
    expect(result.full).toBe("January revenue report");
  });

  it("does not cap collision width below uncropped label width", () => {
    const full = "0123456789";
    expect(estimateTickCollisionWidth(full, full, 20)).toBe(full.length * 6.5);
    const truncated = truncateTickLabel(full, 2).display;
    expect(estimateTickCollisionWidth(truncated, full, 40)).toBeGreaterThanOrEqual(
      truncated.length * 6.5,
    );
  });

  it("hides middle ticks but keeps first and last", () => {
    const prepared = prepareAxisTicks(
      [
        { position: 0, labelText: "January" },
        { position: 24, labelText: "February" },
        { position: 48, labelText: "March" },
        { position: 72, labelText: "April" },
        { position: 96, labelText: "May" },
      ],
      { tickCollision: "hide", orientation: "x", maxTickLabelWidth: 36 },
    );
    expect(prepared[0]?.visible).toBe(true);
    expect(prepared[prepared.length - 1]?.visible).toBe(true);
    expect(prepared.filter((entry) => entry.visible).length).toBeLessThan(prepared.length);
  });

  it("applies auto rotation when strategy is rotate", () => {
    const prepared = prepareAxisTicks([{ position: 10, labelText: "Q1" }], {
      tickCollision: "rotate",
      orientation: "x",
    });
    expect(prepared[0]?.rotation).toBe(-45);
  });

  it("uses vertical extent for y-axis hide collisions", () => {
    const prepared = prepareAxisTicks(
      [
        { position: 0, labelText: "0" },
        { position: 10, labelText: "1" },
        { position: 20, labelText: "2" },
        { position: 30, labelText: "3" },
      ],
      { tickCollision: "hide", orientation: "y", maxTickLabelWidth: 80 },
    );
    expect(prepared.filter((entry) => entry.visible).length).toBeLessThan(prepared.length);
  });

  it("handles descending pixel positions on the x axis", () => {
    const prepared = prepareAxisTicks(
      [
        { position: 96, labelText: "A" },
        { position: 72, labelText: "B" },
        { position: 48, labelText: "C" },
        { position: 24, labelText: "D" },
        { position: 0, labelText: "E" },
      ],
      { tickCollision: "hide", orientation: "x", maxTickLabelWidth: 30 },
    );
    const minPosition = Math.min(...prepared.filter((t) => t.visible).map((t) => t.position));
    const maxPosition = Math.max(...prepared.filter((t) => t.visible).map((t) => t.position));
    expect(minPosition).toBe(0);
    expect(maxPosition).toBe(96);
  });

  it("prefers explicit tickRotation over auto rotate", () => {
    const prepared = prepareAxisTicks([{ position: 10, labelText: "Q1" }], {
      tickCollision: "rotate",
      tickRotation: 30,
      orientation: "x",
    });
    expect(prepared[0]?.rotation).toBe(30);
  });
});

describe("tick collision SSR", () => {
  const categories = Array.from({ length: 12 }, (_, index) => ({
    month: `Month-${index + 1}-extra-long-label`,
    value: index,
  }));

  it("renders truncated x labels with title for full value", () => {
    const markup = renderToString(
      <LineChart
        data={categories}
        xKey="month"
        xScale="point"
        height={200}
        width={240}
        tickCollision="truncate"
        maxTickLabelLength={8}
        series={[{ key: "value", id: "v" }]}
      />,
    );
    expect(markup).toContain("Month-1…");
    expect(markup).toContain("Month-1-extra-long-label");
  });

  it("matches SSR and client markup for hide strategy", () => {
    const props = {
      data: categories,
      xKey: "month" as const,
      xScale: "point" as const,
      height: 200,
      width: 240,
      tickCollision: "hide" as const,
      series: [{ key: "value" as const, id: "v" }],
    };
    const ssr = renderToString(<LineChart {...props} />);
    const ssrTicks = (ssr.match(/data-kamod-chart-tick/g) ?? []).length;
    const second = renderToString(<LineChart {...props} />);
    expect((second.match(/data-kamod-chart-tick/g) ?? []).length).toBe(ssrTicks);
  });
});
