import { render } from "./testing-library";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Chart, PieChart, PieSeries } from "../src";
import {
  computeOutsideLabelGeometry,
  layoutPieLabels,
  resolvePieLabelOptions,
  resolvePieOuterRadius,
} from "../src/series/pie-label";
import { buildPieSlices } from "../src/series/pie-geometry";

interface Datum {
  name: string;
  value: number;
}

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

const parsePolylinePoints = (points: string): Array<[number, number]> =>
  points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return [x, y] as [number, number];
    });

describe("resolvePieLabelOptions", () => {
  it("maps string shorthands to compatible defaults", () => {
    expect(resolvePieLabelOptions(undefined)).toEqual({ position: "inside" });
    expect(resolvePieLabelOptions("inside")).toEqual({ position: "inside" });
    expect(resolvePieLabelOptions("none")).toEqual({ position: "none" });
    expect(resolvePieLabelOptions("outside")).toEqual({
      position: "outside",
      collision: "shift",
    });
  });

  it("preserves custom outside options", () => {
    expect(
      resolvePieLabelOptions({
        position: "outside",
        collision: "hide",
        minAngle: 8,
      }),
    ).toEqual({
      position: "outside",
      collision: "hide",
      minAngle: 8,
    });
  });
});

describe("resolvePieOuterRadius", () => {
  it("reserves gutter for auto radius with outside labels", () => {
    const options = resolvePieLabelOptions("outside");
    const auto = resolvePieOuterRadius({ width: 200, height: 200 }, undefined, options);
    const full = resolvePieOuterRadius({ width: 200, height: 200 }, undefined, {
      position: "inside",
    });

    expect(auto).toBeLessThan(full);
    expect(auto).toBeGreaterThan(0);
  });

  it("keeps explicit outerRadius unchanged", () => {
    const options = resolvePieLabelOptions("outside");
    expect(resolvePieOuterRadius({ width: 200, height: 200 }, 72, options)).toBe(72);
  });
});

describe("layoutPieLabels geometry", () => {
  const data: Datum[] = [
    { name: "Right", value: 40 },
    { name: "Left", value: 30 },
    { name: "Top", value: 20 },
    { name: "Bottom", value: 10 },
  ];

  const { slices } = buildPieSlices({
    data,
    valueKey: "value",
    labelKey: "name",
    innerRadius: 0,
    outerRadius: 80,
    padAngle: 0,
    cornerRadius: 0,
    sort: true,
  });

  it("places inside labels at slice centroids", () => {
    const layouts = layoutPieLabels({
      slices,
      labelOptions: resolvePieLabelOptions("inside"),
      plotArea: { width: 240, height: 240 },
    });

    expect(layouts.every((layout) => layout.kind === "inside")).toBe(true);
    expect(layouts.every((layout) => layout.textAnchor === "middle")).toBe(true);
    expect(layouts.every((layout) => layout.linePoints == null)).toBe(true);
    expect(
      layouts.every((layout) => isFiniteNumber(layout.textX) && isFiniteNumber(layout.textY)),
    ).toBe(true);
  });

  it("builds leader lines with valid points and side anchors", () => {
    const layouts = layoutPieLabels({
      slices,
      labelOptions: resolvePieLabelOptions("outside"),
      plotArea: { width: 320, height: 320 },
    });

    const right = layouts.find((layout) => layout.textAnchor === "start");
    const left = layouts.find((layout) => layout.textAnchor === "end");

    expect(right).toBeDefined();
    expect(left).toBeDefined();

    for (const layout of layouts.filter((entry) => entry.visible)) {
      expect(layout.linePoints).toHaveLength(3);
      for (const [x, y] of layout.linePoints ?? []) {
        expect(isFiniteNumber(x)).toBe(true);
        expect(isFiniteNumber(y)).toBe(true);
      }
    }

    expect((right?.textX ?? 0) > 0).toBe(true);
    expect((left?.textX ?? 0) < 0).toBe(true);
  });

  it("shifts dense outside labels to reduce overlap", () => {
    const dense = Array.from({ length: 24 }, (_, index) => ({
      name: `S${index}`,
      value: 1,
    }));
    const denseSlices = buildPieSlices({
      data: dense,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle: 0.04,
      cornerRadius: 0,
    }).slices;
    const shifted = layoutPieLabels({
      slices: denseSlices,
      labelOptions: { position: "outside", collision: "shift" },
      plotArea: { width: 200, height: 200 },
    }).filter((layout) => layout.visible);
    const none = layoutPieLabels({
      slices: denseSlices,
      labelOptions: { position: "outside", collision: "none" },
      plotArea: { width: 200, height: 200 },
    }).filter((layout) => layout.visible);

    const overlapCount = (layouts: typeof shifted) => {
      let overlaps = 0;

      for (const side of ["left", "right"] as const) {
        const ys = layouts
          .filter((layout) =>
            side === "right" ? layout.textAnchor === "start" : layout.textAnchor === "end",
          )
          .map((layout) => layout.textY)
          .sort((left, right) => left - right);

        for (let index = 1; index < ys.length; index += 1) {
          if (ys[index] - ys[index - 1] < 13.9) {
            overlaps += 1;
          }
        }
      }

      return overlaps;
    };

    expect(overlapCount(none)).toBeGreaterThan(0);
    expect(overlapCount(shifted)).toBe(0);
  });

  it("hides colliding labels deterministically and prefers larger slices", () => {
    const dense = [
      { name: "Big", value: 100 },
      { name: "A", value: 1 },
      { name: "B", value: 1 },
      { name: "C", value: 1 },
      { name: "D", value: 1 },
      { name: "E", value: 1 },
    ];
    const denseSlices = buildPieSlices({
      data: dense,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 60,
      padAngle: 0.01,
      cornerRadius: 0,
      sort: true,
    }).slices;

    const first = layoutPieLabels({
      slices: denseSlices,
      labelOptions: { position: "outside", collision: "hide" },
      plotArea: { width: 220, height: 220 },
    });
    const second = layoutPieLabels({
      slices: denseSlices,
      labelOptions: { position: "outside", collision: "hide" },
      plotArea: { width: 220, height: 220 },
    });

    expect(first).toEqual(second);
    expect(first.find((layout) => layout.content === "Big")?.visible).toBe(true);
    expect(first.filter((layout) => layout.visible).length).toBeLessThan(denseSlices.length);
  });

  it("suppresses label and line together when minAngle is not met", () => {
    const { slices: smallSlices } = buildPieSlices({
      data: [
        { name: "Huge", value: 990 },
        { name: "Tiny", value: 10 },
      ],
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle: 0,
      cornerRadius: 0,
    });
    const layouts = layoutPieLabels({
      slices: smallSlices,
      labelOptions: { position: "outside", minAngle: 20 },
      plotArea: { width: 280, height: 280 },
    });
    const tiny = layouts.find((layout) => layout.key.includes("Tiny"));

    expect(tiny?.visible).toBe(false);
    expect(tiny?.linePoints).toBeUndefined();
  });

  it("supports custom render, color, class, offset, and line options", () => {
    const { slices: customSlices } = buildPieSlices({
      data: [{ name: "Alpha", value: 10 }],
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 50,
      padAngle: 0,
      cornerRadius: 0,
    });
    const geometry = computeOutsideLabelGeometry(customSlices[0], {
      position: "outside",
      offset: 6,
      line: { length: 10, horizontalLength: 20 },
    });
    const [layout] = layoutPieLabels({
      slices: customSlices,
      labelOptions: {
        position: "outside",
        collision: "none",
        offset: 6,
        color: "#abc",
        class: "custom-label",
        line: {
          length: 10,
          horizontalLength: 20,
          color: "#def",
          strokeWidth: 2,
          class: "custom-line",
        },
        render: (context) => `${context.label}:${context.value}`,
      },
      plotArea: { width: 200, height: 200 },
    });

    expect(layout.content).toBe("Alpha:10");
    expect(layout.color).toBe("#abc");
    expect(layout.class).toBe("custom-label");
    expect(layout.lineColor).toBe("#def");
    expect(layout.lineStrokeWidth).toBe(2);
    expect(layout.lineClass).toBe("custom-line");
    expect(layout.linePoints?.[1]).toEqual(geometry.elbow);
  });

  it("returns no layouts for none", () => {
    const layouts = layoutPieLabels({
      slices,
      labelOptions: resolvePieLabelOptions("none"),
      plotArea: { width: 240, height: 240 },
    });

    expect(layouts).toEqual([]);
  });
});

describe("PieChart outside labels integration", () => {
  const data: Datum[] = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
  ];

  it("renders leader lines and decorative label layer for outside labels", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="outside"
      />,
    );

    expect(markup).toContain("data-kamod-chart-pie-labels");
    expect(markup).toContain("data-kamod-chart-pie-label-line");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("<polyline");
    expect(markup).toContain(">A</text>");
    expect(markup).toContain(">B</text>");

    const polylines = [...markup.matchAll(/<polyline points="([^"]+)"/g)].map((match) =>
      parsePolylinePoints(match[1] ?? ""),
    );
    expect(polylines.length).toBeGreaterThan(0);
    expect(
      polylines.every((points) => points.every(([x, y]) => isFiniteNumber(x) && isFiniteNumber(y))),
    ).toBe(true);
  });

  it("keeps inside and none compatibility", () => {
    const inside = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="inside"
      />,
    );
    const none = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="none"
      />,
    );

    expect(inside).toContain("data-kamod-chart-pie-label-text");
    expect(inside).not.toContain("data-kamod-chart-pie-label-line");
    expect(none).not.toContain("data-kamod-chart-pie-label-text");
  });

  it("supports donut, sorted slices, and custom outside options without NaN output", () => {
    const markup = renderToString(
      <PieChart
        data={[
          { name: "C", value: 5 },
          { name: "A", value: 15 },
          { name: "B", value: 10 },
        ]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        innerRadius={40}
        labels={{ position: "outside", collision: "shift" }}
        sort
      />,
    );

    expect(markup).not.toContain("NaN");
    expect(markup).toContain("data-kamod-chart-pie-label-line");
  });

  it("produces deterministic SSR output with outside labels", () => {
    const props = {
      data,
      valueKey: "value" as const,
      labelKey: "name" as const,
      width: 320,
      height: 320,
      labels: "outside" as const,
    };
    const first = renderToString(<PieChart {...props} />);
    const second = renderToString(<PieChart {...props} />);

    expect(first).toBe(second);
  });

  it("honors explicit outerRadius while still rendering outside labels", () => {
    const markup = renderToString(
      <Chart data={data} width={320} height={320}>
        <PieSeries valueKey="value" labelKey="name" outerRadius={90} labels="outside" />
      </Chart>,
    );

    expect(markup).toContain("data-kamod-chart-pie-label-line");
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 90,
      padAngle: 0,
      cornerRadius: 0,
    });
    const anchorX = computeOutsideLabelGeometry(slices[0], resolvePieLabelOptions("outside"))
      .anchor[0];

    expect(Math.abs(anchorX)).toBeLessThanOrEqual(90 + 0.001);
  });
});

describe("PieChart outside labels motion", () => {
  const data: Datum[] = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
  ];

  it("renders outside labels immediately with reduced motion", () => {
    const markup = renderToString(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="outside"
        animate={{ reducedMotion: "always" }}
      />,
    );

    expect(markup).toContain("data-kamod-chart-pie-label-line");
    expect(markup).not.toContain("NaN");
  });

  it("omits labels for exiting motion slices", () => {
    const { container, rerender } = render(
      <PieChart
        data={data}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="outside"
        animate={{ reducedMotion: "never", duration: 300 }}
      />,
    );

    rerender(
      <PieChart
        data={[{ name: "A", value: 10 }]}
        valueKey="value"
        labelKey="name"
        width={320}
        height={320}
        labels="outside"
        animate={{ reducedMotion: "never", duration: 300 }}
      />,
    );

    const labels = container.querySelectorAll("[data-kamod-chart-pie-label-text]");
    expect(labels.length).toBeLessThanOrEqual(1);
    expect(container.textContent).not.toContain("NaN");
  });

  it("uses active outer radius for outside leader line anchors", () => {
    const { slices } = buildPieSlices({
      data,
      valueKey: "value",
      labelKey: "name",
      innerRadius: 0,
      outerRadius: 80,
      padAngle: 0,
      cornerRadius: 0,
      activeIndex: 0,
      activeOffset: 12,
    });
    const inactive = computeOutsideLabelGeometry(
      buildPieSlices({
        data,
        valueKey: "value",
        labelKey: "name",
        innerRadius: 0,
        outerRadius: 80,
        padAngle: 0,
        cornerRadius: 0,
        activeIndex: null,
        activeOffset: 12,
      }).slices[0],
      resolvePieLabelOptions("outside"),
    );
    const active = computeOutsideLabelGeometry(slices[0], resolvePieLabelOptions("outside"));

    expect(active.anchor[0]).not.toEqual(inactive.anchor[0]);
    expect(Math.hypot(active.anchor[0], active.anchor[1])).toBeGreaterThan(
      Math.hypot(inactive.anchor[0], inactive.anchor[1]),
    );
  });
});
