import type { ComponentChildren, JSX } from "preact";
import {
  assignSvgRef,
  composeSvgEventHandlers,
  splitChartSvgProps,
  type ChartSurfaceSvgOptions,
} from "./chart-svg-props";
import type { ChartAccessibilityOptions, ChartSize } from "./types";

export interface ChartSurfaceProps
  extends ChartAccessibilityOptions, ChartSize, ChartSurfaceSvgOptions {
  children?: ComponentChildren;
  class?: string;
  style?: JSX.CSSProperties | string;
  tabIndex?: number;
  onKeyDown?: JSX.KeyboardEventHandler<SVGSVGElement>;
  onPointerMove?: JSX.PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: JSX.PointerEventHandler<SVGSVGElement>;
}

export const ChartSurface = ({
  id,
  title,
  description,
  labelledBy,
  describedBy,
  role = "img",
  width,
  height,
  class: className,
  style,
  tabIndex,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  svgRef,
  svgProps,
  children,
}: ChartSurfaceProps) => {
  const titleId = labelledBy ?? (title && id ? `${id}-title` : undefined);
  const descriptionId = describedBy ?? (description && id ? `${id}-description` : undefined);
  const { dataAttributes, presentation, events } = splitChartSvgProps(svgProps);

  return (
    <svg
      ref={(element) => assignSvgRef(svgRef, element)}
      id={id}
      role={role}
      aria-label={presentation["aria-label"]}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      class={className}
      style={style}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={presentation.preserveAspectRatio}
      focusable={presentation.focusable}
      data-kamod-chart-surface=""
      {...dataAttributes}
      tabIndex={tabIndex}
      onKeyDown={composeSvgEventHandlers(onKeyDown, events.onKeyDown)}
      onPointerMove={composeSvgEventHandlers(onPointerMove, events.onPointerMove)}
      onPointerLeave={composeSvgEventHandlers(onPointerLeave, events.onPointerLeave)}
      onClick={events.onClick}
      onPointerDown={events.onPointerDown}
      onFocus={events.onFocus}
      onBlur={events.onBlur}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {description ? <desc id={descriptionId}>{description}</desc> : null}
      {children}
    </svg>
  );
};
