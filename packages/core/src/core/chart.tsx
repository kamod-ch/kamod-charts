import type { JSX } from "preact";
import { useId, useMemo } from "preact/hooks";
import { createPlotClipPathId } from "./chart-clip";
import { calculatePlotArea, normalizeMargin, resolveChartSize } from "./chart-layout";
import { ChartProvider } from "./chart-context";
import { ChartSurface } from "./chart-surface";
import { ResponsiveContainer } from "./responsive-container";
import type { ChartContextValue, ChartRootProps } from "./types";

export const defaultEmptyState = (
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">
    Keine Daten verfügbar
  </text>
);

const normalizeIdPart = (value: string): string => value.replace(/[^a-zA-Z0-9_-]/g, "-");

const PlotPointerCapture = ({
  plotArea,
  enabled,
  onPointerMove,
  onPointerLeave,
}: {
  plotArea: { width: number; height: number };
  enabled: boolean;
  onPointerMove?: JSX.PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: JSX.PointerEventHandler<SVGSVGElement>;
}) => {
  if (!enabled || !onPointerMove) {
    return null;
  }

  return (
    <rect
      data-kamod-chart-plot-capture=""
      x={0}
      y={0}
      width={plotArea.width}
      height={plotArea.height}
      fill="transparent"
      aria-hidden="true"
      onPointerMove={onPointerMove as unknown as JSX.PointerEventHandler<SVGRectElement>}
      onPointerLeave={
        onPointerLeave as unknown as JSX.PointerEventHandler<SVGRectElement> | undefined
      }
    />
  );
};

export const ChartRoot = <TDatum,>({
  data,
  width,
  height,
  initialWidth = 640,
  responsive = false,
  aspectRatio,
  margin,
  xKey,
  xScale,
  id,
  title,
  description,
  labelledBy,
  describedBy,
  role = "img",
  children,
  plotLayers,
  defs,
  clipPlotArea = false,
  class: className,
  style,
  tabIndex,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  svgRef,
  svgProps,
  overlay,
  emptyState = defaultEmptyState,
}: ChartRootProps<TDatum>) => {
  const generatedId = useId();
  const rootId = id ?? `kamod-chart-${normalizeIdPart(generatedId)}`;
  const normalizedMargin = useMemo(() => normalizeMargin(margin), [margin]);
  const plotClipPathId = clipPlotArea ? createPlotClipPathId(rootId) : undefined;
  const hasRootDefs = Boolean(defs) || Boolean(plotClipPathId);

  return (
    <ResponsiveContainer
      width={width}
      initialWidth={initialWidth}
      responsive={responsive}
      class={responsive ? "kamod-chart-responsive" : undefined}
    >
      {({ width: resolvedWidth }) => {
        const size = resolveChartSize({
          width,
          height,
          initialWidth,
          responsive,
          aspectRatio,
          measuredWidth: responsive ? resolvedWidth : undefined,
        });
        const plotArea = calculatePlotArea(size, normalizedMargin);
        const context: ChartContextValue<TDatum> = {
          data,
          ids: {
            root: rootId,
            title: `${rootId}-title`,
            description: `${rootId}-description`,
            plotClipPath: plotClipPathId,
          },
          margin: normalizedMargin,
          size,
          plotArea,
          isEmpty: data.length === 0,
          xKey,
          xScale,
        };

        const layeredPlot = plotLayers && !context.isEmpty;
        const legacyPlot = !layeredPlot;
        const clipPathUrl = plotClipPathId ? `url(#${plotClipPathId})` : undefined;

        return (
          <ChartProvider value={context as ChartContextValue<unknown>}>
            <ChartSurface
              id={rootId}
              title={title}
              description={description}
              labelledBy={labelledBy ?? (title ? context.ids.title : undefined)}
              describedBy={describedBy ?? (description ? context.ids.description : undefined)}
              role={role}
              width={size.width}
              height={size.height}
              class={className}
              style={style}
              tabIndex={tabIndex}
              onKeyDown={onKeyDown}
              onPointerMove={layeredPlot ? onPointerMove : undefined}
              onPointerLeave={layeredPlot ? onPointerLeave : undefined}
              svgRef={svgRef}
              svgProps={svgProps}
            >
              {hasRootDefs ? (
                <defs data-kamod-chart-defs="">
                  {plotClipPathId ? (
                    <clipPath id={plotClipPathId} data-kamod-chart-plot-clip="">
                      <rect x={0} y={0} width={plotArea.width} height={plotArea.height} />
                    </clipPath>
                  ) : null}
                  {defs}
                </defs>
              ) : null}
              <g data-kamod-chart-plot="" transform={`translate(${plotArea.x} ${plotArea.y})`}>
                {legacyPlot && !context.isEmpty ? (
                  <PlotPointerCapture
                    plotArea={plotArea}
                    enabled={Boolean(onPointerMove)}
                    onPointerMove={onPointerMove}
                    onPointerLeave={onPointerLeave}
                  />
                ) : null}
                {context.isEmpty ? (
                  emptyState
                ) : layeredPlot ? (
                  <>
                    <PlotPointerCapture
                      plotArea={plotArea}
                      enabled={Boolean(onPointerMove)}
                      onPointerMove={onPointerMove}
                      onPointerLeave={onPointerLeave}
                    />
                    <g data-kamod-chart-layer="clipped" clip-path={clipPathUrl}>
                      {plotLayers.clipped}
                    </g>
                    <g data-kamod-chart-layer="foreground">{plotLayers.foreground}</g>
                    <g data-kamod-chart-layer="axes">{plotLayers.axes}</g>
                  </>
                ) : (
                  children
                )}
              </g>
            </ChartSurface>
            {overlay}
          </ChartProvider>
        );
      }}
    </ResponsiveContainer>
  );
};

export const Chart = ChartRoot;
