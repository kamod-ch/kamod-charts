import { fireEvent, render } from "@testing-library/preact";
import renderToString from "preact-render-to-string";
import { describe, expect, it, vi } from "vitest";
import { Chart, PieChart, PieSeries } from "../src";

interface Datum {
  name: string;
  value: number;
}

const data: Datum[] = [
  { name: "A", value: 10 },
  { name: "B", value: 20 },
  { name: "C", value: 0 },
];

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

  it("handles negative, zero, and empty values", () => {
    const noPositive = renderToString(
      <PieChart
        data={[{ name: "Debt", value: -5 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
      />,
    );
    const empty = renderToString(
      <PieChart data={[]} valueKey="value" labelKey="name" width={320} height={320} />,
    );

    expect(noPositive).toContain("Keine positiven Werte");
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

  it("supports keyboard navigation and segment click", () => {
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

    fireEvent.keyDown(svg, { key: "Enter" });
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], 1, 20);

    const segment = container.querySelector("[data-kamod-chart-pie-segment] path");
    if (!segment) {
      throw new Error("expected segment");
    }

    fireEvent.click(segment);
    expect(onSegmentClick).toHaveBeenCalledWith(data[0], 0, 10);
  });
});
