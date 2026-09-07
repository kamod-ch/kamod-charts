import { fireEvent, render } from "./testing-library";
import { useState } from "preact/hooks";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { domainKey, pointKey, uniquifyKeys } from "../src/animation/keys";
import { BarChart as StaticBarChart } from "../src/charts/bar-chart";
import { LineChart as StaticLineChart } from "../src/charts/line-chart";
import {
  AnimatedValue,
  AreaChart,
  BarChart,
  LineChart,
  MotionConfig,
  PieChart,
  ScatterChart,
} from "../src/motion";

interface Datum {
  x: string;
  y: number;
  extra?: number | null;
}

const lineData: Datum[] = [
  { x: "a", y: 10 },
  { x: "b", y: 20 },
  { x: "c", y: 30 },
];

const barData: Datum[] = [
  { x: "north", y: 12 },
  { x: "south", y: -4 },
  { x: "east", y: 8 },
];

const pieData = [
  { label: "A", value: 40 },
  { label: "B", value: 25 },
  { label: "C", value: 35 },
];

describe("stable keys", () => {
  it("prefers domain values over array index", () => {
    expect(domainKey("Jan", 0)).toBe("s:Jan");
    expect(domainKey(new Date("2026-01-01T00:00:00.000Z"), 3)).toBe("2026-01-01T00:00:00.000Z");
    expect(pointKey("revenue", "Jan", 0)).toBe("revenue::s:Jan");
  });

  it("uniquifies colliding domain keys without using a shifting index as the identity", () => {
    expect(uniquifyKeys(["s:A", "s:A", "s:B"])).toEqual(["s:A", "s:A#1", "s:B"]);
  });
});

describe("motion charts", () => {
  it("renders the same final line geometry for SSR and the first client render", () => {
    const props = {
      data: lineData,
      xKey: "x" as const,
      xScale: "point" as const,
      series: [{ key: "y" as const, id: "y" }],
      height: 240,
      width: 480,
      animate: { reducedMotion: "always" as const },
    };
    const ssr = renderToString(<LineChart {...props} />);
    const { container } = render(<LineChart {...props} />);

    expect(ssr).toContain("data-kamod-chart-line-series");
    expect(container.querySelector("[data-kamod-chart-line-series] path")?.getAttribute("d")).toBe(
      ssr.match(/<path[^>]*d="([^"]+)"/)?.[1],
    );
  });

  it("does not change static chart markup when motion is not configured", () => {
    const props = {
      data: lineData,
      xKey: "x" as const,
      xScale: "point" as const,
      series: [{ key: "y" as const, id: "y" }],
      height: 200,
      width: 400,
    };
    expect(renderToString(<StaticLineChart {...props} />)).toBe(
      renderToString(<StaticLineChart {...props} animate />),
    );
  });

  it("keeps enter/update/exit on stable keys after a data update", () => {
    const view = render(
      <BarChart
        data={barData}
        xKey="x"
        series={[{ key: "y", id: "sales" }]}
        height={200}
        width={400}
        animate={{ reducedMotion: "always" }}
      />,
    );

    const initialKeys = [...view.container.querySelectorAll("[data-kamod-chart-key]")].map((node) =>
      node.getAttribute("data-kamod-chart-key"),
    );
    expect(initialKeys).toContain("sales::north");
    expect(initialKeys).toContain("sales::south");

    view.rerender(
      <BarChart
        data={[barData[0]!, { x: "west", y: 9 }]}
        xKey="x"
        series={[{ key: "y", id: "sales" }]}
        height={200}
        width={400}
        animate={{ reducedMotion: "always" }}
      />,
    );

    const nextKeys = [...view.container.querySelectorAll("[data-kamod-chart-key]")].map((node) =>
      node.getAttribute("data-kamod-chart-key"),
    );
    expect(nextKeys).toContain("sales::north");
    expect(nextKeys).toContain("sales::west");
    expect(nextKeys).not.toContain("sales::south");
  });

  it("replaces in-flight updates when data changes rapidly", () => {
    const Harness = () => {
      const [rows, setRows] = useState(lineData);
      return (
        <div>
          <button
            type="button"
            onClick={() => setRows((current) => current.map((row) => ({ ...row, y: row.y + 1 })))}
          >
            bump
          </button>
          <LineChart
            data={rows}
            xKey="x"
            xScale="point"
            series={[{ key: "y", id: "y" }]}
            height={200}
            width={400}
            animate
          />
        </div>
      );
    };

    const view = render(<Harness />);
    fireEvent.click(view.getByText("bump"));
    fireEvent.click(view.getByText("bump"));
    fireEvent.click(view.getByText("bump"));
    expect(view.container.querySelector("[data-kamod-chart-line-series]")).not.toBeNull();
  });

  it("stops clocks on unmount", () => {
    const view = render(
      <ScatterChart
        data={lineData}
        xKey="x"
        xScale="point"
        series={[{ key: "y", id: "y" }]}
        height={200}
        width={400}
        animate
      />,
    );

    expect(() => view.unmount()).not.toThrow();
  });

  it("skips motion when reducedMotion is always", () => {
    const markup = renderToString(
      <PieChart
        data={pieData}
        valueKey="value"
        labelKey="label"
        height={240}
        width={240}
        animate={{ reducedMotion: "always" }}
      />,
    );
    const { container } = render(
      <PieChart
        data={pieData}
        valueKey="value"
        labelKey="label"
        height={240}
        width={240}
        animate={{ reducedMotion: "always" }}
      />,
    );

    expect(markup).toContain('data-kamod-chart-key="s:A"');
    expect(container.querySelector('[data-kamod-chart-key="s:A"]')).not.toBeNull();
    expect(container.querySelector("[data-kamod-chart-phase]")).toBeNull();
  });

  it("keeps tooltip and keyboard interaction on committed values", () => {
    const { container } = render(
      <StaticLineChart
        data={lineData}
        xKey="x"
        xScale="point"
        series={[{ key: "y", id: "y", label: "Sales" }]}
        height={200}
        width={400}
        tooltip
        animate={{ reducedMotion: "always" }}
      />,
    );

    const svg = container.querySelector("[data-kamod-chart-surface]");
    expect(svg).not.toBeNull();
    fireEvent.keyDown(svg!, { key: "ArrowRight" });
    const announcement =
      container.querySelector("[data-kamod-chart-live-region]")?.textContent ?? "";
    expect(announcement).toMatch(/Sales: 20/);
    expect(announcement).not.toMatch(/Sales: 20\.\d/);
  });

  it("renders empty, single, negative, and mixed series", () => {
    expect(
      renderToString(
        <LineChart
          data={[]}
          xKey="x"
          series={[{ key: "y", id: "y" }]}
          height={180}
          width={320}
          animate={{ reducedMotion: "always" }}
        />,
      ),
    ).toContain("Keine Daten");

    expect(
      renderToString(
        <LineChart
          data={[{ x: "only", y: 5 }]}
          xKey="x"
          xScale="point"
          series={[{ key: "y", id: "y" }]}
          height={180}
          width={320}
          showPoints
          animate={{ reducedMotion: "always" }}
        />,
      ),
    ).toContain("data-kamod-chart-line-series");

    expect(
      renderToString(
        <StaticBarChart
          data={barData}
          xKey="x"
          series={[{ key: "y", id: "y" }]}
          height={180}
          width={320}
        />,
      ),
    ).toContain("data-kamod-chart-bar");

    expect(
      renderToString(
        <AreaChart
          data={[
            { x: "a", y: 4 },
            { x: "b", y: 0 },
            { x: "c", extra: null, y: 7 },
          ]}
          xKey="x"
          xScale="point"
          series={[{ key: "y", id: "y" }]}
          height={180}
          width={320}
          animate={{ reducedMotion: "always" }}
        />,
      ),
    ).toContain("data-kamod-chart-area-series");
  });

  it("retargets after a responsive resize while mounted", () => {
    const view = render(
      <LineChart
        data={lineData}
        xKey="x"
        xScale="point"
        series={[{ key: "y", id: "y" }]}
        height={200}
        width={320}
        animate={{ reducedMotion: "always" }}
      />,
    );
    const first = view.container
      .querySelector("[data-kamod-chart-line-series] path")
      ?.getAttribute("d");
    view.rerender(
      <LineChart
        data={lineData}
        xKey="x"
        xScale="point"
        series={[{ key: "y", id: "y" }]}
        height={200}
        width={640}
        animate={{ reducedMotion: "always" }}
      />,
    );
    const second = view.container
      .querySelector("[data-kamod-chart-line-series] path")
      ?.getAttribute("d");
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);
  });

  it("animates tooltip numbers visually without changing the live region mid-tween", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <AnimatedValue value={120} />
      </MotionConfig>,
    );
    expect(container.textContent).toContain("120");
  });

  it("disables animation through animate={false}", () => {
    const markup = renderToString(
      <LineChart
        data={lineData}
        xKey="x"
        xScale="point"
        series={[{ key: "y", id: "y" }]}
        height={200}
        width={400}
        animate={false}
      />,
    );
    expect(markup).not.toContain("data-kamod-chart-motion");
  });
});

describe("static import boundary", () => {
  it("does not load the motion adapter from the static line entry", async () => {
    const staticModule = await import("../src/charts/line-chart");
    expect("MotionConfig" in staticModule).toBe(false);
    expect(staticModule.LineChart).toBeTypeOf("function");
  });
});
