import { fireEvent, render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import {
  BarChart,
  Chart,
  LineChart,
  LineSeries,
  ReferenceLine,
  ScatterChart,
  XAxis,
  YAxis,
} from "../src";

interface NumericDatum {
  x: number;
  y: number;
}

/** Finite domain that D3 `nice()` expands (typically to `[0, 100]`). */
const numericData: NumericDatum[] = [
  { x: 3, y: 3 },
  { x: 50, y: 50 },
  { x: 97, y: 97 },
];

interface BarDatum {
  category: string;
  value: number;
}

const barData: BarDatum[] = [
  { category: "low", value: 3 },
  { category: "mid", value: 50 },
  { category: "high", value: 97 },
];

const readNumber = (element: Element | null, attribute: string): number => {
  const raw = element?.getAttribute(attribute);
  if (raw == null) {
    throw new Error(`expected attribute ${attribute}`);
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`expected numeric ${attribute}, received ${raw}`);
  }

  return value;
};

const activateFirstPoint = (container: ParentNode) => {
  const svg = container.querySelector("svg");
  if (!svg) {
    throw new Error("expected svg");
  }

  fireEvent.keyDown(svg, { key: "Home" });
};

const getActiveMarker = (container: ParentNode): SVGCircleElement => {
  const marker = container.querySelector<SVGCircleElement>('[data-kamod-chart-active="true"]');
  if (!marker) {
    throw new Error("expected active marker");
  }

  return marker;
};

const getCrosshairPlotCoords = (container: ParentNode): { x: number; y: number } => {
  const lines = container.querySelectorAll("[data-kamod-chart-crosshair] line");
  const vertical = lines[0];
  const horizontal = lines[1];
  if (!vertical || !horizontal) {
    throw new Error("expected crosshair lines");
  }

  return {
    x: readNumber(vertical, "x1"),
    y: readNumber(horizontal, "y1"),
  };
};

const parseRectPathOrigin = (d: string | null): { x: number; y: number } => {
  const match = d?.match(/^M(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!match?.[1] || !match[2]) {
    throw new Error(`expected bar path origin, received ${d}`);
  }

  return { x: Number(match[1]), y: Number(match[2]) };
};

describe("cartesian scale alignment", () => {
  it("aligns LineChart active marker with crosshair on a non-round domain", () => {
    const { container } = render(
      <LineChart
        data={numericData}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "y", label: "Y" }]}
        width={640}
        height={320}
        tooltip
        showPoints
      />,
    );

    activateFirstPoint(container);

    const marker = getActiveMarker(container);
    const crosshair = getCrosshairPlotCoords(container);

    expect(readNumber(marker, "cx")).toBeCloseTo(crosshair.x, 5);
    expect(readNumber(marker, "cy")).toBeCloseTo(crosshair.y, 5);
  });

  it("aligns ScatterChart active marker with crosshair on a non-round domain", () => {
    const { container } = render(
      <ScatterChart
        data={numericData}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "y", label: "Y" }]}
        width={640}
        height={320}
        tooltip
      />,
    );

    activateFirstPoint(container);

    const marker = getActiveMarker(container);
    const crosshair = getCrosshairPlotCoords(container);

    expect(readNumber(marker, "cx")).toBeCloseTo(crosshair.x, 5);
    expect(readNumber(marker, "cy")).toBeCloseTo(crosshair.y, 5);
  });

  it("aligns LineSeries markers with a ReferenceLine at an existing datum", () => {
    const target = numericData[2]!;
    const { container } = render(
      <Chart data={numericData} xKey="x" xScale="linear" width={640} height={320}>
        <XAxis />
        <YAxis dataKey="y" />
        <LineSeries dataKey="y" showPoints />
        <ReferenceLine x={target.x} xKey="x" xScale="linear" />
        <ReferenceLine y={target.y} yKey="y" />
      </Chart>,
    );

    const circles = container.querySelectorAll("[data-kamod-chart-line-series] circle");
    const marker = circles[2];
    const references = container.querySelectorAll("[data-kamod-chart-reference-line] line");
    const vertical = references[0];
    const horizontal = references[1];

    if (!marker || !vertical || !horizontal) {
      throw new Error("expected marker and reference lines");
    }

    expect(readNumber(marker, "cx")).toBeCloseTo(readNumber(vertical, "x1"), 5);
    expect(readNumber(marker, "cy")).toBeCloseTo(readNumber(horizontal, "y1"), 5);
  });

  it("aligns BarChart value geometry with a matching ReferenceLine", () => {
    const { container } = render(
      <BarChart
        data={barData}
        xKey="category"
        series={[{ key: "value", id: "value" }]}
        width={640}
        height={320}
        grouped={false}
        referenceLines={[{ y: 97 }]}
      />,
    );

    const bars = [...container.querySelectorAll("[data-kamod-chart-bar]")];
    const origins = bars.map((bar) => parseRectPathOrigin(bar.getAttribute("d")));
    const tallest = origins.reduce((current, origin) => (origin.y < current.y ? origin : current));
    const reference = container.querySelector("[data-kamod-chart-reference-line] line");

    if (!reference) {
      throw new Error("expected reference line");
    }

    expect(tallest.y).toBeCloseTo(readNumber(reference, "y1"), 5);
  });
});
