import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  Ref,
  WheelEventHandler,
} from "preact";

/** Kamod-controlled keys may appear in `svgProps` but are ignored at runtime. */
type ChartSvgIgnoredProps = {
  id?: string;
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  xmlns?: string;
  role?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "data-kamod-chart-surface"?: string;
};

export type ChartSvgProps = ChartSvgIgnoredProps & {
  "aria-label"?: string;
  preserveAspectRatio?: string;
  focusable?: "true" | "false" | "auto";
  onClick?: MouseEventHandler<SVGSVGElement>;
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onFocus?: FocusEventHandler<SVGSVGElement>;
  onBlur?: FocusEventHandler<SVGSVGElement>;
  onKeyDown?: KeyboardEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
  onPointerCancel?: PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: PointerEventHandler<SVGSVGElement>;
  onWheel?: WheelEventHandler<SVGSVGElement>;
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export interface ChartSurfaceSvgOptions {
  svgRef?: Ref<SVGSVGElement>;
  svgProps?: ChartSvgProps;
}

const PROTECTED_SVG_KEYS = new Set([
  "id",
  "width",
  "height",
  "viewBox",
  "xmlns",
  "role",
  "aria-labelledby",
  "aria-describedby",
  "data-kamod-chart-surface",
]);

const warnedProtectedKeys = new Set<string>();

export const splitChartSvgProps = (
  svgProps?: ChartSvgProps,
): {
  dataAttributes: Record<string, string | number | boolean | undefined>;
  presentation: Pick<ChartSvgProps, "aria-label" | "preserveAspectRatio" | "focusable">;
  events: Pick<
    ChartSvgProps,
    | "onClick"
    | "onPointerDown"
    | "onFocus"
    | "onBlur"
    | "onKeyDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerCancel"
    | "onPointerLeave"
    | "onWheel"
  >;
} => {
  const dataAttributes: Record<string, string | number | boolean | undefined> = {};
  const presentation: Pick<ChartSvgProps, "aria-label" | "preserveAspectRatio" | "focusable"> = {};
  const events: Pick<
    ChartSvgProps,
    | "onClick"
    | "onPointerDown"
    | "onFocus"
    | "onBlur"
    | "onKeyDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerCancel"
    | "onPointerLeave"
    | "onWheel"
  > = {};

  if (!svgProps) {
    return { dataAttributes, presentation, events };
  }

  for (const [key, value] of Object.entries(svgProps)) {
    if (PROTECTED_SVG_KEYS.has(key)) {
      if (process.env.NODE_ENV !== "production" && !warnedProtectedKeys.has(key)) {
        warnedProtectedKeys.add(key);
        console.warn(`[kamod-charts] svgProps.${key} is controlled by the chart and was ignored.`);
      }
      continue;
    }
    if (key.startsWith("data-") && key !== "data-kamod-chart-surface") {
      dataAttributes[key] = value as string | number | boolean | undefined;
      continue;
    }
    switch (key) {
      case "aria-label":
        presentation["aria-label"] = value as string | undefined;
        break;
      case "preserveAspectRatio":
        presentation.preserveAspectRatio = value as string | undefined;
        break;
      case "focusable":
        presentation.focusable = value as ChartSvgProps["focusable"];
        break;
      case "onClick":
        events.onClick = value as ChartSvgProps["onClick"];
        break;
      case "onPointerDown":
        events.onPointerDown = value as ChartSvgProps["onPointerDown"];
        break;
      case "onFocus":
        events.onFocus = value as ChartSvgProps["onFocus"];
        break;
      case "onBlur":
        events.onBlur = value as ChartSvgProps["onBlur"];
        break;
      case "onKeyDown":
        events.onKeyDown = value as ChartSvgProps["onKeyDown"];
        break;
      case "onPointerMove":
        events.onPointerMove = value as ChartSvgProps["onPointerMove"];
        break;
      case "onPointerLeave":
        events.onPointerLeave = value as ChartSvgProps["onPointerLeave"];
        break;
      case "onPointerUp":
        events.onPointerUp = value as ChartSvgProps["onPointerUp"];
        break;
      case "onPointerCancel":
        events.onPointerCancel = value as ChartSvgProps["onPointerCancel"];
        break;
      case "onWheel":
        events.onWheel = value as ChartSvgProps["onWheel"];
        break;
      default:
        break;
    }
  }

  return { dataAttributes, presentation, events };
};

export const composeSvgEventHandlers = <E extends Event>(
  internal?: (event: E) => void,
  external?: (event: E) => void,
): ((event: E) => void) | undefined => {
  if (!internal && !external) {
    return undefined;
  }
  if (!external) {
    return internal;
  }
  if (!internal) {
    return external;
  }
  return (event) => {
    internal(event);
    if (!event.defaultPrevented) {
      external(event);
    }
  };
};

export const assignSvgRef = (
  ref: Ref<SVGSVGElement> | undefined,
  element: SVGSVGElement | null,
) => {
  if (!ref) {
    return;
  }
  if (typeof ref === "function") {
    ref(element);
    return;
  }
  ref.current = element;
};
