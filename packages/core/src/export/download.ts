import { assertBrowser } from "./browser";
import { serializeChartSvg } from "./serialize";
import type { DownloadChartSvgOptions } from "./types";

const DEFAULT_FILENAME = "chart.svg";

export const normalizeChartSvgFilename = (filename: string): string => {
  const trimmed = filename.trim() || DEFAULT_FILENAME;
  const withoutExtension = trimmed.replace(/\.svg$/i, "");
  const safe = withoutExtension.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${safe || "chart"}.svg`;
};

export const downloadChartSvg = (
  svgElement: SVGSVGElement,
  filename: string,
  options: DownloadChartSvgOptions = {},
): void => {
  assertBrowser("downloadChartSvg");
  if (typeof globalThis.URL?.createObjectURL !== "function") {
    throw new Error("[kamod-charts] downloadChartSvg requires URL.createObjectURL.");
  }

  const svgMarkup = serializeChartSvg(svgElement, options);
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = normalizeChartSvgFilename(filename);
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
