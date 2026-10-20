import { render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "../src/charts/line-chart";
import { createPlotClipPathId } from "../src/core/chart-clip";
import { downloadChartSvg, normalizeChartSvgFilename, serializeChartSvg } from "../src/export";

describe("chart SVG export", () => {
  it("imports without touching browser globals at module load", async () => {
    const module = await import("../src/export");
    expect(typeof module.serializeChartSvg).toBe("function");
  });

  it("serializes a chart svg with namespace, viewBox, defs, and clip references", () => {
    const { container } = render(
      <LineChart
        id="export-line"
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", id: "s1" }]}
        height={200}
        clipPlotArea
        defs={
          <pattern id="export-line-hatch" width={4} height={4}>
            <path d="M0 4 L4 0" />
          </pattern>
        }
      />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const markup = serializeChartSvg(svg);
    expect(markup).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(markup).toContain('viewBox="0 0');
    expect(markup).toContain('id="export-line-hatch"');
    expect(markup).toContain(createPlotClipPathId("export-line"));
    expect(markup).toMatch(/<svg[\s\S]*<\/svg>/);
    expect(svg.getAttribute("data-kamod-chart-surface")).toBe("");
    expect(svg.querySelector("defs")?.innerHTML).toBeTruthy();
  });

  it("does not mutate the live svg dom", () => {
    const { container } = render(
      <LineChart data={[{ x: 1, y: 2 }]} xKey="x" series={[{ key: "y", id: "s1" }]} height={200} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const before = svg.outerHTML;
    serializeChartSvg(svg, { backgroundColor: "#fff" });
    expect(svg.outerHTML).toBe(before);
  });

  it("normalizes download filenames", () => {
    expect(normalizeChartSvgFilename("  Revenue Q1  ")).toBe("Revenue-Q1.svg");
    expect(normalizeChartSvgFilename("chart.svg")).toBe("chart.svg");
    expect(normalizeChartSvgFilename("chart.SVG")).toBe("chart.svg");
  });

  it("creates an svg blob download", () => {
    const { container } = render(
      <LineChart data={[{ x: 1, y: 2 }]} xKey="x" series={[{ key: "y", id: "s1" }]} height={200} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const createObjectURL = vi.fn(() => "blob:chart");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    const anchor = document.createElement("a");
    anchor.click = click;
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return anchor;
      }
      return originalCreate(tagName);
    });

    downloadChartSvg(svg, "export.svg");
    expect(createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ type: "image/svg+xml;charset=utf-8" }),
    );
    expect(click).toHaveBeenCalled();
    expect(anchor.download).toBe("export.svg");
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
