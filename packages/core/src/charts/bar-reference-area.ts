import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { ReferenceAreaProps } from "../primitives/reference-area";
import type { CartesianReferenceArea } from "./types";

const hasCompletePair = (start: unknown, end: unknown): boolean => start != null && end != null;

export const resolveBarReferenceAreaProps = <TDatum>(
  area: CartesianReferenceArea<TDatum>,
  options: {
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale: ChartCartesianScaleKind;
    yDomain: readonly [number, number];
    horizontal: boolean;
  },
): ReferenceAreaProps<TDatum> => {
  const shared = {
    id: area.id,
    label: area.label,
    fill: area.fill,
    fillOpacity: area.fillOpacity,
    class: area.class,
  };

  const hasCategory = hasCompletePair(area.x1, area.x2);
  const hasValue = hasCompletePair(area.y1, area.y2);

  if (options.horizontal) {
    if (hasCategory && !hasValue) {
      return {
        ...shared,
        y1: area.x1,
        y2: area.x2,
        yKey: area.xKey ?? area.yKey ?? options.xKey,
        yScale: options.xScale,
      };
    }

    if (hasValue && !hasCategory) {
      return {
        ...shared,
        x1: area.y1,
        x2: area.y2,
        xScale: "linear",
        xDomain: options.yDomain,
      };
    }

    return shared;
  }

  return {
    ...shared,
    x1: area.x1,
    x2: area.x2,
    y1: area.y1,
    y2: area.y2,
    xKey: area.xKey ?? options.xKey,
    yKey: area.yKey,
    xScale: options.xScale,
    yDomain: options.yDomain,
  };
};
