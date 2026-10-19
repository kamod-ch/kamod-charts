import type { ComponentChildren, JSX } from "preact";
import type { ChartAccessibilityOptions, ChartSize } from "./types";

export interface ChartSurfaceProps extends ChartAccessibilityOptions, ChartSize {
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
  children,
}: ChartSurfaceProps) => {
  const titleId = labelledBy ?? (title && id ? `${id}-title` : undefined);
  const descriptionId = describedBy ?? (description && id ? `${id}-description` : undefined);

  return (
    <svg
      id={id}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      class={className}
      style={style}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      data-kamod-chart-surface=""
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {description ? <desc id={descriptionId}>{description}</desc> : null}
      {children}
    </svg>
  );
};
