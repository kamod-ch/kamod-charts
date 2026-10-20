import type { ComponentChildren } from "preact";

export interface PointRenderContext<TDatum> {
  datum: TDatum;
  index: number;
  seriesId: string;
  seriesLabel?: string;
  value: number | null;
  x: number;
  y: number;
  color: string;
  opacity: number;
  active: boolean;
  hidden: boolean;
  key: string;
  pointRadius: number;
}

export type RenderPoint<TDatum> = (context: PointRenderContext<TDatum>) => ComponentChildren;

export interface BarRenderContext<TDatum> {
  datum: TDatum;
  index: number;
  value: number;
  valueStart: number;
  valueEnd: number;
  seriesId: string;
  seriesIndex: number;
  seriesLabel?: string;
  orientation: "vertical" | "horizontal";
  stacked: boolean;
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  key: string;
}

export type RenderBar<TDatum> = (context: BarRenderContext<TDatum>) => ComponentChildren;

export const defaultPointCircle = <TDatum,>(
  context: PointRenderContext<TDatum>,
): ComponentChildren => {
  const radius = context.active ? context.pointRadius + 1.5 : context.pointRadius;
  return (
    <circle
      cx={context.x}
      cy={context.y}
      r={radius}
      fill={context.color}
      fill-opacity={context.opacity}
      stroke="var(--chart-tooltip-background)"
      stroke-width={context.active ? 2 : 1}
      stroke-opacity={context.opacity}
      data-kamod-chart-key={context.key}
      data-kamod-chart-active={context.active ? "true" : undefined}
    />
  );
};

export const renderPointSlot = <TDatum,>(
  context: PointRenderContext<TDatum>,
  renderPoint?: RenderPoint<TDatum>,
): ComponentChildren => (
  <g data-kamod-chart-point="" data-kamod-chart-key={context.key}>
    {renderPoint ? (
      <>
        {renderPoint(context)}
        {context.active ? (
          <circle
            cx={context.x}
            cy={context.y}
            r={context.pointRadius}
            fill="transparent"
            stroke="none"
            data-kamod-chart-key={context.key}
            data-kamod-chart-active="true"
            aria-hidden="true"
          />
        ) : null}
      </>
    ) : (
      defaultPointCircle(context)
    )}
  </g>
);

export const defaultBarPath = <TDatum,>(
  context: BarRenderContext<TDatum>,
  path: string,
  onClick?: () => void,
): ComponentChildren => (
  <path
    d={path}
    fill={context.fill}
    fill-opacity={context.opacity}
    data-kamod-chart-bar=""
    data-kamod-chart-key={context.key}
    data-kamod-chart-series-id={context.seriesId}
    data-kamod-chart-index={String(context.index)}
    data-kamod-chart-active={context.active ? "true" : undefined}
    onClick={onClick}
  />
);

export const renderBarSlot = <TDatum,>(
  context: BarRenderContext<TDatum>,
  path: string,
  renderBar?: RenderBar<TDatum>,
  onClick?: () => void,
): ComponentChildren => (
  <g data-kamod-chart-bar-group="" data-kamod-chart-key={context.key}>
    {renderBar ? renderBar(context) : defaultBarPath(context, path, onClick)}
  </g>
);
