import { render } from "@testing-library/preact";
import renderToString from "preact-render-to-string";
import { useRef } from "preact/hooks";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "../src/charts/line-chart";
import { PieChart } from "../src/charts/pie-chart";
import { ChartSurface } from "../src/core/chart-surface";
import { composeSvgEventHandlers, splitChartSvgProps } from "../src/core/chart-svg-props";

describe("ChartSvgProps utilities", () => {
  it("drops protected keys from user svgProps", () => {
    const { presentation, dataAttributes } = splitChartSvgProps({
      id: "evil",
      width: 1,
      "aria-label": "Custom label",
      "data-testid": "chart-root",
      preserveAspectRatio: "xMidYMid meet",
    });
    expect(presentation["aria-label"]).toBe("Custom label");
    expect(presentation.preserveAspectRatio).toBe("xMidYMid meet");
    expect(dataAttributes["data-testid"]).toBe("chart-root");
  });

  it("composes handlers with defaultPrevented guard", () => {
    const internal = vi.fn();
    const external = vi.fn();
    const handler = composeSvgEventHandlers(internal, external)!;
    const event = { defaultPrevented: false } as PointerEvent;
    handler(event);
    expect(internal).toHaveBeenCalledOnce();
    expect(external).toHaveBeenCalledOnce();

    external.mockClear();
    internal.mockImplementation(() => {
      (event as { defaultPrevented: boolean }).defaultPrevented = true;
    });
    handler(event);
    expect(external).not.toHaveBeenCalled();
  });
});

describe("ChartSurface svgProps SSR", () => {
  it("renders aria-label, preserveAspectRatio and data attributes", () => {
    const markup = renderToString(
      <ChartSurface
        id="chart-1"
        width={320}
        height={200}
        svgProps={{
          "aria-label": "Revenue trend",
          preserveAspectRatio: "xMinYMin slice",
          "data-export": "ready",
        }}
      />,
    );
    expect(markup).toContain('aria-label="Revenue trend"');
    expect(markup).toContain('preserveAspectRatio="xMinYMin slice"');
    expect(markup).toContain('data-export="ready"');
    expect(markup).toContain('id="chart-1"');
    expect(markup).toContain('viewBox="0 0 320 200"');
  });

  it("keeps Kamod-controlled title ids when title is set", () => {
    const markup = renderToString(
      <ChartSurface
        id="chart-2"
        title="Revenue"
        width={100}
        height={100}
        svgProps={{ id: "override" }}
      />,
    );
    expect(markup).toContain('id="chart-2"');
    expect(markup).toContain('aria-labelledby="chart-2-title"');
  });
});

describe("High-level chart svgRef", () => {
  it("assigns svgRef on LineChart client render", () => {
    const ref = { current: null as SVGSVGElement | null };
    render(
      <LineChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        svgRef={ref}
        svgProps={{ "data-testid": "line-svg" }}
      />,
    );
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(ref.current?.getAttribute("data-testid")).toBe("line-svg");
    expect(ref.current?.getAttribute("data-kamod-chart-surface")).toBe("");
  });

  it("assigns svgRef on PieChart", () => {
    const Harness = () => {
      const ref = useRef<SVGSVGElement>(null);
      return (
        <PieChart data={[{ label: "A", value: 1 }]} valueKey="value" height={200} svgRef={ref} />
      );
    };
    render(<Harness />);
    const svg = document.querySelector("[data-kamod-chart-surface]");
    expect(svg).toBeInstanceOf(SVGSVGElement);
  });
});

describe("svgProps event composition on ChartSurface", () => {
  it("invokes internal and external pointer handlers once", () => {
    const internal = vi.fn();
    const external = vi.fn();
    const { container } = render(
      <ChartSurface
        id="ev"
        width={100}
        height={100}
        onPointerMove={internal}
        svgProps={{ onPointerMove: external }}
      />,
    );
    const svg = container.querySelector("svg")!;
    svg.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    expect(internal).toHaveBeenCalledOnce();
    expect(external).toHaveBeenCalledOnce();
  });
});
