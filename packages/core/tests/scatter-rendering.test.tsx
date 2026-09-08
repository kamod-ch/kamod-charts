import { fireEvent, render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Chart, ScatterChart, ScatterSeries } from "../src";
import { ScatterChart as MotionScatterChart } from "../src/motion";
import { DEFAULT_SCATTER_POINT_RADIUS, mapScatterSizeToRadius } from "../src/charts/scatter-size";

interface BubbleDatum {
  x: number;
  y: number;
  size?: number | null;
}

const bubbleData: BubbleDatum[] = [
  { x: 10, y: 10, size: 10 },
  { x: 20, y: 20, size: 100 },
  { x: 30, y: 30, size: Number.NaN },
];

const readCircles = (container: ParentNode) =>
  [...container.querySelectorAll("[data-kamod-chart-scatter-series] circle")].map((node) => ({
    cx: Number(node.getAttribute("cx")),
    cy: Number(node.getAttribute("cy")),
    r: Number(node.getAttribute("r")),
    baseRadius: Number(node.getAttribute("data-kamod-chart-base-radius")),
    fill: node.getAttribute("fill"),
    fillOpacity: node.getAttribute("fill-opacity"),
    strokeWidth: node.getAttribute("stroke-width"),
    active: node.getAttribute("data-kamod-chart-active") === "true",
  }));

describe("scatter bubble rendering", () => {
  it("keeps legacy scatter markup without new props", () => {
    const markup = renderToString(
      <ScatterChart
        data={bubbleData}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "y" }]}
        height={320}
        width={640}
      />,
    );

    expect(markup).toContain('r="4"');
    expect(markup).toContain('data-kamod-chart-base-radius="4"');
  });

  it("renders pointSize as a number and callback with the previous svg r value", () => {
    const data = [{ x: 1, y: 2 }];
    const numeric = renderToString(
      <ScatterChart
        data={data}
        xKey="x"
        series={[{ key: "y" }]}
        height={200}
        width={400}
        pointSize={7}
      />,
    );
    expect(numeric).toContain('r="7"');

    const callback = renderToString(
      <Chart data={data} xKey="x" width={400} height={200}>
        <ScatterSeries yKey="y" size={(_datum, index) => index + 5} />
      </Chart>,
    );
    expect(callback).toContain('r="5"');
  });

  it("lets pointRadius override pointSize on the chart", () => {
    const markup = renderToString(
      <ScatterChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y" }]}
        height={200}
        width={400}
        pointSize={7}
        pointRadius={9}
      />,
    );

    expect(markup).toContain('r="9"');
    expect(markup).not.toContain('r="7"');
  });

  it("maps sizeKey with sqrt and linear scales plus radius range", () => {
    const sizedData = [
      { x: 1, y: 2, size: 0 },
      { x: 2, y: 2, size: 100 },
    ];
    const domain = [0, 100] as const;
    const range = [4, 18] as const;
    const expected = mapScatterSizeToRadius(100, domain, range, "sqrt");

    const sqrtMarkup = renderToString(
      <ScatterChart
        data={sizedData}
        xKey="x"
        series={[{ key: "y" }]}
        height={200}
        width={400}
        sizeKey="size"
        sizeScale="sqrt"
        pointRadiusRange={range}
      />,
    );
    expect(sqrtMarkup).toContain(`data-kamod-chart-base-radius="${expected}"`);

    const linearExpected = mapScatterSizeToRadius(100, domain, range, "linear");
    const linearMarkup = renderToString(
      <ScatterChart
        data={sizedData}
        xKey="x"
        series={[{ key: "y" }]}
        height={200}
        width={400}
        sizeKey="size"
        sizeScale="linear"
        pointRadiusRange={range}
      />,
    );
    expect(linearMarkup).toContain(`data-kamod-chart-base-radius="${linearExpected}"`);
  });

  it("supports per-series pointRadius without sizeKey", () => {
    const markup = renderToString(
      <ScatterChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", pointRadius: 6 }]}
        height={200}
        width={400}
      />,
    );

    expect(markup).toContain('r="6"');
  });

  it("does not render circles for invalid sizeKey values", () => {
    const { container } = render(
      <ScatterChart
        data={bubbleData}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        height={320}
        width={640}
        sizeKey="size"
      />,
    );

    expect(readCircles(container)).toHaveLength(2);
  });

  it("draws larger bubbles before smaller bubbles when sizeKey is active", () => {
    const { container } = render(
      <ScatterChart
        data={bubbleData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y" }]}
        height={320}
        width={640}
        sizeKey="size"
        sizeScale="linear"
      />,
    );

    const radii = readCircles(container).map((circle) => circle.baseRadius);
    expect(radii[0]).toBeGreaterThan(radii[1]!);
  });

  it("highlights active bubbles without changing the semantic base radius", () => {
    const { container } = render(
      <ScatterChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y" }]}
        height={200}
        width={400}
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    if (!surface) {
      throw new Error("expected chart surface");
    }

    fireEvent.keyDown(surface, { key: "ArrowRight" });

    const active = readCircles(container).find((circle) => circle.active);
    expect(active?.baseRadius).toBe(DEFAULT_SCATTER_POINT_RADIUS);
    expect(active?.r).toBe(DEFAULT_SCATTER_POINT_RADIUS + 2);
    expect(active?.strokeWidth).toBe("2");
  });

  it("clamps pointOpacity to the 0..1 range", () => {
    const markup = renderToString(
      <ScatterChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", pointOpacity: 1.8 }]}
        height={200}
        width={400}
      />,
    );

    expect(markup).toContain('fill-opacity="1"');
  });

  it("matches static and motion output for the same committed state", () => {
    const props = {
      data: bubbleData.slice(0, 2),
      xKey: "x" as const,
      xScale: "linear" as const,
      series: [{ key: "y" as const, id: "y" }],
      height: 240,
      width: 480,
      sizeKey: "size" as const,
      animate: { reducedMotion: "always" as const },
    };

    const staticCircles = readCircles(render(<ScatterChart {...props} />).container).sort(
      (left, right) => left.cx - right.cx,
    );
    const motionCircles = readCircles(render(<MotionScatterChart {...props} />).container).sort(
      (left, right) => left.cx - right.cx,
    );

    expect(motionCircles).toEqual(staticCircles);
  });

  it("keeps stable keys and supports enter, update, and exit with motion", () => {
    const view = render(
      <MotionScatterChart
        data={bubbleData.slice(0, 2)}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "y" }]}
        height={240}
        width={480}
        sizeKey="size"
        animate={{ reducedMotion: "always" }}
      />,
    );

    const initialKeys = [...view.container.querySelectorAll("[data-kamod-chart-key]")].map((node) =>
      node.getAttribute("data-kamod-chart-key"),
    );
    expect(initialKeys.length).toBe(2);

    view.rerender(
      <MotionScatterChart
        data={[
          { x: 10, y: 10, size: 10 },
          { x: 40, y: 40, size: 40 },
        ]}
        xKey="x"
        xScale="linear"
        series={[{ key: "y", id: "y" }]}
        height={240}
        width={480}
        sizeKey="size"
        animate={{ reducedMotion: "always" }}
      />,
    );

    const nextKeys = [...view.container.querySelectorAll("[data-kamod-chart-key]")].map((node) =>
      node.getAttribute("data-kamod-chart-key"),
    );
    expect(nextKeys).toHaveLength(2);
    expect(nextKeys.some((key) => key?.includes("10"))).toBe(true);
    expect(nextKeys.some((key) => key?.includes("40"))).toBe(true);
  });
});
