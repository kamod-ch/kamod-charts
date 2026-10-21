import { assertBrowser } from "./browser";
import { serializeChartSvg } from "./serialize";
import type { SerializeChartSvgOptions } from "./types";

export interface PngExportOptions extends SerializeChartSvgOptions {
  /** Multiplier on SVG layout width/height. Default: `1`. */
  scale?: number;
  /** Device pixel ratio applied after `scale`. Default: `globalThis.devicePixelRatio ?? 1`. */
  devicePixelRatio?: number;
  /** Caps the longest raster edge (after scale × DPR). Default: `8192`. */
  maxDimension?: number;
  /** `image/png` quality is ignored; reserved for future formats. */
  mimeType?: "image/png";
}

export type PngRasterSize = {
  layoutWidth: number;
  layoutHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  scale: number;
  devicePixelRatio: number;
};

const DEFAULT_MAX_DIMENSION = 8192;

export const resolveSvgLayoutDimensions = (
  svgElement: SVGSVGElement,
): { width: number; height: number } => {
  const viewBox = svgElement.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }

  const widthAttr = svgElement.getAttribute("width");
  const heightAttr = svgElement.getAttribute("height");
  const parsedWidth = widthAttr ? Number.parseFloat(widthAttr) : Number.NaN;
  const parsedHeight = heightAttr ? Number.parseFloat(heightAttr) : Number.NaN;
  if (
    Number.isFinite(parsedWidth) &&
    parsedWidth > 0 &&
    Number.isFinite(parsedHeight) &&
    parsedHeight > 0
  ) {
    return { width: parsedWidth, height: parsedHeight };
  }

  const bbox = svgElement.getBBox?.();
  if (bbox && bbox.width > 0 && bbox.height > 0) {
    return { width: bbox.width, height: bbox.height };
  }

  throw new Error(
    "[kamod-charts] PNG export requires a chart SVG with positive width and height (viewBox or width/height attributes).",
  );
};

export const resolvePngRasterSize = (
  layoutWidth: number,
  layoutHeight: number,
  options: Pick<PngExportOptions, "scale" | "devicePixelRatio" | "maxDimension"> = {},
): PngRasterSize => {
  if (!(layoutWidth > 0) || !(layoutHeight > 0)) {
    throw new Error("[kamod-charts] PNG export dimensions must be greater than zero.");
  }

  const scale = options.scale ?? 1;
  const devicePixelRatio = options.devicePixelRatio ?? globalThis.devicePixelRatio ?? 1;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

  if (!(scale > 0) || !Number.isFinite(scale)) {
    throw new Error("[kamod-charts] PNG export scale must be a positive finite number.");
  }

  let pixelWidth = Math.round(layoutWidth * scale * devicePixelRatio);
  let pixelHeight = Math.round(layoutHeight * scale * devicePixelRatio);

  const longest = Math.max(pixelWidth, pixelHeight);
  if (longest > maxDimension) {
    const shrink = maxDimension / longest;
    pixelWidth = Math.max(1, Math.round(pixelWidth * shrink));
    pixelHeight = Math.max(1, Math.round(pixelHeight * shrink));
  }

  return {
    layoutWidth,
    layoutHeight,
    pixelWidth,
    pixelHeight,
    scale,
    devicePixelRatio,
  };
};

const loadSvgImage = (svgMarkup: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    image.decoding = "async";

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      image.onload = null;
      image.onerror = null;
    };

    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(
        new Error(
          "[kamod-charts] PNG export failed while decoding SVG (external images, fonts, or CSP may block rasterization).",
        ),
      );
    };

    image.src = objectUrl;
  });

export const renderChartToPngBlob = async (
  svgElement: SVGSVGElement,
  options: PngExportOptions = {},
): Promise<Blob> => {
  assertBrowser("renderChartToPngBlob");
  if (typeof globalThis.HTMLCanvasElement === "undefined") {
    throw new Error("[kamod-charts] renderChartToPngBlob requires Canvas APIs.");
  }

  const layout = resolveSvgLayoutDimensions(svgElement);
  const raster = resolvePngRasterSize(layout.width, layout.height, options);
  const svgMarkup = serializeChartSvg(svgElement, options);
  const image = await loadSvgImage(svgMarkup);

  const canvas = document.createElement("canvas");
  canvas.width = raster.pixelWidth;
  canvas.height = raster.pixelHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("[kamod-charts] renderChartToPngBlob could not acquire a 2D canvas context.");
  }

  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, raster.pixelWidth, raster.pixelHeight);
  }

  try {
    context.drawImage(image, 0, 0, raster.pixelWidth, raster.pixelHeight);
  } catch (error) {
    const message =
      error instanceof Error && /taint/i.test(error.message)
        ? "[kamod-charts] PNG export blocked by a tainted canvas (cross-origin SVG assets)."
        : "[kamod-charts] PNG export failed while drawing the SVG to canvas.";
    throw new Error(message, { cause: error });
  }

  const mimeType = options.mimeType ?? "image/png";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("[kamod-charts] PNG export produced an empty blob."));
        return;
      }
      resolve(result);
    }, mimeType);
  });

  image.src = "";
  return blob;
};

export const normalizeChartPngFilename = (filename: string): string => {
  const trimmed = filename.trim() || "chart.png";
  const withoutExtension = trimmed.replace(/\.png$/i, "");
  const safe = withoutExtension.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${safe || "chart"}.png`;
};

export const downloadChartPng = async (
  svgElement: SVGSVGElement,
  filename: string,
  options: PngExportOptions & { revokeDelayMs?: number } = {},
): Promise<void> => {
  assertBrowser("downloadChartPng");
  const blob = await renderChartToPngBlob(svgElement, options);
  const objectUrl = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = normalizeChartPngFilename(filename);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  const revokeDelayMs = options.revokeDelayMs ?? 60_000;
  globalThis.setTimeout(() => {
    globalThis.URL.revokeObjectURL(objectUrl);
  }, revokeDelayMs);
};
