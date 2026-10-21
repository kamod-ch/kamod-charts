import { render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "../src/charts/line-chart";
import {
  normalizeChartPngFilename,
  resolvePngRasterSize,
  resolveSvgLayoutDimensions,
} from "../src/export/png";

describe("PNG export helpers", () => {
  it("resolves layout dimensions from viewBox", () => {
    const { container } = render(
      <LineChart data={[{ x: 1, y: 2 }]} xKey="x" series={[{ key: "y", id: "s1" }]} height={200} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const layout = resolveSvgLayoutDimensions(svg);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  it("caps raster dimensions and applies scale × DPR", () => {
    const raster = resolvePngRasterSize(4000, 2000, {
      scale: 2,
      devicePixelRatio: 2,
      maxDimension: 4096,
    });
    expect(Math.max(raster.pixelWidth, raster.pixelHeight)).toBeLessThanOrEqual(4096);
    expect(raster.pixelWidth).toBeGreaterThan(0);
    expect(raster.pixelHeight).toBeGreaterThan(0);
  });

  it("rejects empty layout dimensions", () => {
    expect(() => resolvePngRasterSize(0, 100)).toThrow(/greater than zero/);
  });

  it("normalizes png filenames", () => {
    expect(normalizeChartPngFilename(" Revenue Q1 ")).toBe("Revenue-Q1.png");
  });

  it("renders a png blob from a chart svg", async () => {
    const { container } = render(
      <LineChart
        data={[{ x: 1, y: 2 }]}
        xKey="x"
        series={[{ key: "y", id: "s1", color: "rgb(200, 40, 60)" }]}
        height={120}
        initialWidth={240}
      />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "canvas") {
        const canvas = element as HTMLCanvasElement;
        canvas.getContext = vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          drawImage: vi.fn(),
        })) as unknown as HTMLCanvasElement["getContext"];
        canvas.toBlob = (callback: BlobCallback) => {
          callback(new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }));
        };
      }
      return element;
    });

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decoding = "async";
      width = 240;
      height = 120;
      private currentSrc = "";
      get src() {
        return this.currentSrc;
      }
      set src(url: string) {
        this.currentSrc = url;
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal("Image", MockImage);

    const { renderChartToPngBlob } = await import("../src/export/png");
    const blob = await renderChartToPngBlob(svg, {
      embedStyles: "all-computed",
      backgroundColor: "#ffffff",
      scale: 1,
      devicePixelRatio: 1,
    });
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBeGreaterThan(0);

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
