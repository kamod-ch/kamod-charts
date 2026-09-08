import type { ComponentChildren, VNode } from "preact";
import type { DonutCenterContext, DonutVariant } from "./types";

export type DonutCenterContentInput<TDatum> =
  | ComponentChildren
  | ((context: DonutCenterContext<TDatum>) => ComponentChildren);

export type DonutFormatTotal<TDatum> = (
  total: number,
  context: DonutCenterContext<TDatum>,
) => ComponentChildren;

const isPrimitiveCenterContent = (value: ComponentChildren): value is string | number =>
  typeof value === "string" || typeof value === "number";

const isVNode = (value: ComponentChildren): value is VNode<unknown> =>
  value != null && typeof value === "object" && "type" in value;

export const renderPrimitiveCenterText = (value: string | number): VNode<unknown> => (
  <text text-anchor="middle" dominant-baseline="middle">
    {String(value)}
  </text>
);

export const resolveDonutCenterContent = <TDatum,>({
  centerContent,
  showTotal,
  formatTotal,
  context,
}: {
  centerContent?: DonutCenterContentInput<TDatum>;
  showTotal: boolean;
  formatTotal?: DonutFormatTotal<TDatum>;
  context: DonutCenterContext<TDatum>;
}): ComponentChildren | null => {
  if (centerContent !== undefined) {
    const resolved = typeof centerContent === "function" ? centerContent(context) : centerContent;

    if (resolved == null) {
      return null;
    }

    if (isPrimitiveCenterContent(resolved)) {
      return renderPrimitiveCenterText(resolved);
    }

    return resolved;
  }

  if (!showTotal) {
    return null;
  }

  const totalContent = formatTotal?.(context.total, context) ?? String(context.total);

  if (isPrimitiveCenterContent(totalContent)) {
    return renderPrimitiveCenterText(totalContent);
  }

  if (isVNode(totalContent)) {
    return totalContent;
  }

  return totalContent;
};

export const createDonutCenterContext = <TDatum,>({
  data,
  variant,
  centerMetrics,
}: {
  data: readonly TDatum[];
  variant: DonutVariant;
  centerMetrics: {
    total: number;
    grandTotal: number;
    visibleCount: number;
    segmentCount: number;
  };
}): DonutCenterContext<TDatum> => ({
  data,
  variant,
  total: centerMetrics.total,
  grandTotal: centerMetrics.grandTotal,
  visibleCount: centerMetrics.visibleCount,
  segmentCount: centerMetrics.segmentCount,
});
