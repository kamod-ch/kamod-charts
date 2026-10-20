import { assertBrowser } from "./browser";
import type { SerializeChartSvgOptions } from "./types";

const CHART_TOKEN_PREFIXES = ["--kamod-", "--chart-"];

const isStyleTokenName = (name: string, mode: SerializeChartSvgOptions["embedStyles"]): boolean => {
  if (mode === "all-computed") {
    return name.startsWith("--");
  }
  return CHART_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix));
};

const collectCustomProperties = (
  element: Element,
  mode: NonNullable<SerializeChartSvgOptions["embedStyles"]>,
): Record<string, string> => {
  const view = element.ownerDocument?.defaultView;
  if (!view) {
    return {};
  }

  const collected: Record<string, string> = {};
  let current: Element | null = element;
  while (current) {
    const computed = view.getComputedStyle(current);
    for (let index = 0; index < computed.length; index += 1) {
      const name = computed.item(index);
      if (!name || !isStyleTokenName(name, mode)) {
        continue;
      }
      const value = computed.getPropertyValue(name).trim();
      if (value) {
        collected[name] = value;
      }
    }
    current = current.parentElement;
  }

  return collected;
};

const inlineCustomProperties = (
  target: SVGSVGElement,
  properties: Record<string, string>,
  inlineStyle?: Record<string, string>,
): void => {
  const parts = Object.entries(properties).map(([name, value]) => `${name}:${value}`);
  if (inlineStyle) {
    for (const [key, value] of Object.entries(inlineStyle)) {
      parts.push(`${key}:${value}`);
    }
  }
  if (parts.length === 0) {
    return;
  }
  const existing = target.getAttribute("style");
  target.setAttribute("style", existing ? `${existing};${parts.join(";")}` : parts.join(";"));
};

const applyBackground = (clone: SVGSVGElement, backgroundColor: string): void => {
  const rect = clone.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
  const width = clone.getAttribute("width") ?? String(clone.viewBox.baseVal.width);
  const height = clone.getAttribute("height") ?? String(clone.viewBox.baseVal.height);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", backgroundColor);
  clone.insertBefore(rect, clone.firstChild);
};

export const serializeChartSvg = (
  svgElement: SVGSVGElement,
  options: SerializeChartSvgOptions = {},
): string => {
  assertBrowser("serializeChartSvg");
  const embedStyles = options.embedStyles ?? "kamod-tokens";
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  if (embedStyles !== "none") {
    inlineCustomProperties(
      clone,
      collectCustomProperties(svgElement, embedStyles),
      options.inlineStyle,
    );
  } else if (options.inlineStyle) {
    inlineCustomProperties(clone, {}, options.inlineStyle);
  }

  if (options.backgroundColor) {
    applyBackground(clone, options.backgroundColor);
  }

  return new globalThis.XMLSerializer().serializeToString(clone);
};
