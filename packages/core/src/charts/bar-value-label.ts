import type { ComponentChildren } from "preact";
import { createBarDatumContext } from "./bar-fill";
import type { BarGeometry } from "./bar-geometry";
import type { BarValueLabelContext, BarValueLabelOptions } from "./types";

export const DEFAULT_VALUE_LABEL_OFFSET = 4;

export type BarLabelPlacement = "inside" | "outside" | "center";

export type BarValueLabelLayout = {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "middle" | "hanging" | "alphabetic";
};

export type BarValueLabelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const formatDefaultBarValueLabel = (value: number): string => String(value);

export const resolveBarValueLabelOptions = <TDatum>(
  chartValueLabels: boolean | BarValueLabelOptions<TDatum> | undefined,
  seriesValueLabels: boolean | BarValueLabelOptions<TDatum> | undefined,
): false | BarValueLabelOptions<TDatum> => {
  const source = seriesValueLabels !== undefined ? seriesValueLabels : chartValueLabels;
  if (!source) {
    return false;
  }

  if (source === true) {
    return { position: "auto" };
  }

  return source;
};

export const barValueLabelUsesFormat = <TDatum>(
  chartValueLabels: boolean | BarValueLabelOptions<TDatum> | undefined,
  bar: BarGeometry<TDatum>,
): boolean => {
  const labelOptions = resolveBarValueLabelOptions(chartValueLabels, bar.series.valueLabels);
  return labelOptions !== false && typeof labelOptions.format === "function";
};

export const createBarValueLabelContext = <TDatum>(
  bar: BarGeometry<TDatum>,
  options: {
    orientation: "vertical" | "horizontal";
    stacked: boolean;
    active: boolean;
  },
): BarValueLabelContext<TDatum> => ({
  ...createBarDatumContext(bar, options),
  defaultLabel: formatDefaultBarValueLabel(bar.value as number),
});

export const resolveAutoBarLabelPosition = <TDatum>(
  bar: BarGeometry<TDatum>,
  bars: readonly BarGeometry<TDatum>[],
  stacked: boolean,
): BarLabelPlacement => {
  if (!stacked) {
    return "outside";
  }

  const peers = bars.filter(
    (candidate) =>
      candidate.defined && candidate.index === bar.index && candidate.category === bar.category,
  );
  if (peers.length <= 1) {
    return "outside";
  }

  const value = bar.value ?? 0;
  if (value >= 0) {
    const positivePeers = peers.filter((candidate) => (candidate.value ?? 0) >= 0);
    if (positivePeers.length === 0) {
      return "center";
    }
    const maxEnd = Math.max(...positivePeers.map((candidate) => candidate.valueEnd));
    return bar.valueEnd === maxEnd ? "outside" : "center";
  }

  const negativePeers = peers.filter((candidate) => (candidate.value ?? 0) < 0);
  if (negativePeers.length === 0) {
    return "center";
  }
  const minEnd = Math.min(...negativePeers.map((candidate) => candidate.valueEnd));
  return bar.valueEnd === minEnd ? "outside" : "center";
};

export const resolveBarValueLabelPlacement = <TDatum>(
  bar: BarGeometry<TDatum>,
  bars: readonly BarGeometry<TDatum>[],
  stacked: boolean,
  options: BarValueLabelOptions<TDatum>,
): BarLabelPlacement => {
  const position = options.position ?? "auto";
  if (position === "auto") {
    return resolveAutoBarLabelPosition(bar, bars, stacked);
  }

  return position;
};

export const resolveBarValueLabelLayout = (
  rect: BarValueLabelRect,
  value: number,
  horizontal: boolean,
  placement: BarLabelPlacement,
  offset: number,
): BarValueLabelLayout => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  if (placement === "center") {
    return {
      x: centerX,
      y: centerY,
      textAnchor: "middle",
      dominantBaseline: "middle",
    };
  }

  if (horizontal) {
    if (placement === "outside") {
      if (value >= 0) {
        return {
          x: rect.x + rect.width + offset,
          y: centerY,
          textAnchor: "start",
          dominantBaseline: "middle",
        };
      }

      return {
        x: rect.x - offset,
        y: centerY,
        textAnchor: "end",
        dominantBaseline: "middle",
      };
    }

    if (value >= 0) {
      return {
        x: rect.x + rect.width - offset,
        y: centerY,
        textAnchor: "end",
        dominantBaseline: "middle",
      };
    }

    return {
      x: rect.x + offset,
      y: centerY,
      textAnchor: "start",
      dominantBaseline: "middle",
    };
  }

  if (placement === "outside") {
    if (value >= 0) {
      return {
        x: centerX,
        y: rect.y - offset,
        textAnchor: "middle",
        dominantBaseline: "middle",
      };
    }

    return {
      x: centerX,
      y: rect.y + rect.height + offset,
      textAnchor: "middle",
      dominantBaseline: "middle",
    };
  }

  if (value >= 0) {
    return {
      x: centerX,
      y: rect.y + offset,
      textAnchor: "middle",
      dominantBaseline: "hanging",
    };
  }

  return {
    x: centerX,
    y: rect.y + rect.height - offset,
    textAnchor: "middle",
    dominantBaseline: "alphabetic",
  };
};

export const resolveBarValueLabelContent = <TDatum>(
  value: number,
  context: BarValueLabelContext<TDatum>,
  options: BarValueLabelOptions<TDatum>,
): ComponentChildren | null => {
  if (options.renderLabel) {
    return options.renderLabel(context);
  }

  if (options.format) {
    const formatted = options.format(value, context);
    if (formatted == null) {
      return null;
    }
    return formatted;
  }

  return context.defaultLabel;
};

export const resolveBarValueLabelPresentation = <TDatum>(
  bar: BarGeometry<TDatum>,
  bars: readonly BarGeometry<TDatum>[],
  rect: BarValueLabelRect,
  options: {
    chartValueLabels: boolean | BarValueLabelOptions<TDatum> | undefined;
    horizontal: boolean;
    stacked: boolean;
    active: boolean;
  },
): {
  layout: BarValueLabelLayout;
  content: ComponentChildren;
  color?: string;
  class?: string;
  animateValue: number;
} | null => {
  const labelOptions = resolveBarValueLabelOptions(
    options.chartValueLabels,
    bar.series.valueLabels,
  );
  if (labelOptions === false || bar.value == null) {
    return null;
  }

  const context = createBarValueLabelContext(bar, {
    orientation: options.horizontal ? "horizontal" : "vertical",
    stacked: options.stacked,
    active: options.active,
  });
  const content = resolveBarValueLabelContent(bar.value, context, labelOptions);
  if (content == null) {
    return null;
  }

  const placement = resolveBarValueLabelPlacement(bar, bars, options.stacked, labelOptions);
  const offset = labelOptions.offset ?? DEFAULT_VALUE_LABEL_OFFSET;
  const layout = resolveBarValueLabelLayout(rect, bar.value, options.horizontal, placement, offset);

  return {
    layout,
    content,
    color: labelOptions.color,
    class: labelOptions.class,
    animateValue: bar.value,
  };
};
