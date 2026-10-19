import { fireEvent, render, waitFor } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { DonutChart } from "../src";
import { resolveDonutChartLabels } from "../src/charts/donut-chart";
import {
  createDonutCenterContext,
  resolveDonutCenterContent,
} from "../src/charts/donut-center-content";
import { buildPieSlicesForLayout, resolvePieSeriesLayout } from "../src/series/pie-series-layout";
import type { DonutCenterContext } from "../src/charts/types";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 30 },
];

describe("resolveDonutChartLabels", () => {
  it("defaults to outside labels on full and none on half", () => {
    expect(resolveDonutChartLabels("full")).toBe("outside");
    expect(resolveDonutChartLabels("half")).toBe("none");
    expect(resolveDonutChartLabels("full", "inside")).toBe("inside");
    expect(resolveDonutChartLabels("half", "outside")).toBe("outside");
  });
});

describe("DonutChart half variant", () => {
  it("omits slice labels by default and marks the semicircle variant in SSR", () => {
    const markup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={240}
        variant="half"
        showTotal={false}
      />,
    );

    expect(markup).toContain('data-kamod-chart-circular-variant="half"');
    expect(markup).not.toContain(">A</text>");
    expect(markup).not.toContain(">B</text>");
    expect(markup).toContain("<path");
  });

  it("renders showTotal in the reserved half baseline via center offset", () => {
    const markup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={240}
        variant="half"
        formatTotal={(total) => `Σ ${total}`}
      />,
    );

    expect(markup).toContain(">Σ 60</text>");
    expect(markup).toMatch(/translate\(0 -8\)/);
  });

  it("supports tooltip and keyboard navigation on half donuts", async () => {
    const { container } = render(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={240}
        variant="half"
        tooltip
      />,
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
  });
});

describe("DonutChart defaults", () => {
  it("renders a full donut ring with outside labels and automatic total", () => {
    const markup = renderToString(
      <DonutChart data={data} valueKey="value" labelKey="name" width={320} height={320} />,
    );

    expect(markup).toContain("data-kamod-chart-donut");
    expect(markup).toContain("data-kamod-chart-pie-series");
    expect(markup).toContain(">60</text>");
    expect(markup).toContain(">A</text>");
    expect(markup).toContain(">B</text>");
    expect(markup).toContain(">C</text>");
  });

  it("uses innerRadiusRatio 0.68 in resolved layout", () => {
    const { layout } = resolvePieSeriesLayout({
      plotArea: { width: 320, height: 320 },
      labels: "outside",
      innerRadiusRatio: 0.68,
      activeOffset: 3,
    });

    expect(layout.innerRadius).toBeCloseTo(layout.outerRadius * 0.68, 8);
    expect(layout.innerRadius).toBeGreaterThan(0);
  });
});

describe("DonutChart geometry props", () => {
  it("renders a filled chart when innerRadiusRatio is 0", () => {
    const { layout } = resolvePieSeriesLayout({
      plotArea: { width: 320, height: 320 },
      labels: "outside",
      innerRadiusRatio: 0,
      outerRadius: 100,
    });
    const { slices } = buildPieSlicesForLayout({
      data,
      valueKey: "value",
      labelKey: "name",
      layout,
      padAngle: Math.PI / 90,
      cornerRadius: 6,
    });

    expect(layout.innerRadius).toBe(0);
    expect(slices.every((slice) => slice.innerRadius === 0)).toBe(true);

    const markup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        innerRadiusRatio={0}
      />,
    );

    expect(markup).toContain("data-kamod-chart-donut");
    expect(markup).toContain("<path");
  });

  it("forwards cornerRadius, padAngle, and explicit outerRadius", () => {
    const { layout } = resolvePieSeriesLayout({
      plotArea: { width: 320, height: 320 },
      labels: "outside",
      innerRadiusRatio: 0.68,
      outerRadius: 90,
      activeOffset: 3,
    });

    expect(layout.outerRadius).toBe(90);

    const { slices } = buildPieSlicesForLayout({
      data,
      valueKey: "value",
      labelKey: "name",
      layout,
      padAngle: 0.05,
      cornerRadius: 8,
    });

    expect(slices[0]?.cornerRadius).toBe(8);
    expect(slices[0]?.padAngle).toBe(0.05);
  });
});

describe("DonutChart center content", () => {
  it("supports formatTotal", () => {
    const markup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        formatTotal={(total) => `Sum ${total}`}
      />,
    );

    expect(markup).toContain(">Sum 60</text>");
  });

  it("renders string, number, and VNode center content", () => {
    const stringMarkup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showTotal={false}
        centerContent="KPI"
      />,
    );
    const numberMarkup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showTotal={false}
        centerContent={42}
      />,
    );
    const vnodeMarkup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showTotal={false}
        centerContent={<text data-testid="custom">Custom</text>}
      />,
    );

    expect(stringMarkup).toContain(">KPI</text>");
    expect(numberMarkup).toContain(">42</text>");
    expect(vnodeMarkup).toContain('data-testid="custom"');
    expect(vnodeMarkup).toContain(">Custom</text>");
  });

  it("passes the correct context to render-function center content", () => {
    const renderFn = vi.fn((context: DonutCenterContext<Datum>) => (
      <text>{`${context.visibleCount}/${context.segmentCount}:${context.total}/${context.grandTotal}`}</text>
    ));

    renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showTotal={false}
        centerContent={renderFn}
      />,
    );

    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "full",
        total: 60,
        grandTotal: 60,
        visibleCount: 3,
        segmentCount: 3,
        data,
      }),
    );
  });

  it("renders no center content when showTotal is false and centerContent is omitted", () => {
    const markup = renderToString(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showTotal={false}
      />,
    );

    expect(markup).not.toContain(">60</text>");
    expect(markup).toContain(">A</text>");
  });
});

describe("resolveDonutCenterContent", () => {
  const context = createDonutCenterContext({
    data,
    variant: "full",
    centerMetrics: {
      total: 60,
      grandTotal: 60,
      visibleCount: 3,
      segmentCount: 3,
    },
  });

  it("prioritizes centerContent over showTotal", () => {
    const resolved = resolveDonutCenterContent({
      centerContent: "Manual",
      showTotal: true,
      context,
    });

    expect(resolved).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          children: "Manual",
        }),
      }),
    );
  });
});

const requireLegendButton = (container: ParentNode, label: string) => {
  const button = Array.from(container.querySelectorAll("[data-kamod-chart-legend-item]")).find(
    (node) => node.textContent?.includes(label),
  );
  if (!button) {
    throw new Error(`expected legend item ${label}`);
  }
  return button;
};

describe("DonutChart legend and empty states", () => {
  it("updates total versus grandTotal after legend toggle", () => {
    const { container } = render(
      <DonutChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        showLegend
        formatTotal={(total, context) => `${total}/${context.grandTotal}`}
      />,
    );

    expect(container.textContent).toContain("60/60");

    fireEvent.click(requireLegendButton(container, "C"));
    expect(container.textContent).toContain("30/60");
  });

  it("shows emptyContent for invalid-only values and chart empty state for empty data", () => {
    const invalid = renderToString(
      <DonutChart
        data={[{ name: "Debt", value: -5 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        emptyContent={<text>No positive values</text>}
      />,
    );
    const empty = renderToString(
      <DonutChart data={[]} valueKey="value" labelKey="name" width={320} height={320} />,
    );

    expect(invalid).toContain("No positive values");
    expect(invalid).toContain("data-kamod-chart-pie-empty");
    expect(empty).toContain("Keine Daten verfügbar");
  });
});

describe("DonutChart interaction and SSR", () => {
  it("supports keyboard navigation and segment click like PieChart", () => {
    const onSegmentClick = vi.fn();
    const { container } = render(
      <DonutChart
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
    fireEvent.keyDown(svg, { key: "ArrowRight" });
    fireEvent.keyDown(svg, { key: "Enter" });
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], 1, 20);
  });

  it("produces deterministic SSR output without browser globals", () => {
    const props = {
      data,
      valueKey: "value" as const,
      labelKey: "name" as const,
      width: 320,
      height: 320,
      showLegend: true,
      tooltip: true,
    };
    const first = renderToString(<DonutChart {...props} />);
    const second = renderToString(<DonutChart {...props} />);

    expect(first).toBe(second);
    expect(first).toContain("data-kamod-chart-donut");
    expect(first).not.toContain("[object Object]");
  });
});
