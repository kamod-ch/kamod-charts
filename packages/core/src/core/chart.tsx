import { useId, useMemo } from "preact/hooks";
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

export const ChartRoot = <TDatum,>({
  data,
  width,
  height,
  initialWidth = 640,
  responsive = false,
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
  class: className,
  style,
  tabIndex,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  overlay,
  emptyState = defaultEmptyState,
}: ChartRootProps<TDatum>) => {
  const generatedId = useId();
  const rootId = id ?? `kamod-chart-${normalizeIdPart(generatedId)}`;
  const normalizedMargin = useMemo(() => normalizeMargin(margin), [margin]);

  return (
    <ResponsiveContainer
      width={width}
      initialWidth={initialWidth}
      responsive={responsive}
      class={responsive ? "kamod-chart-responsive" : undefined}
    >
      {({ width: resolvedWidth }) => {
        const size = resolveChartSize({
          width: resolvedWidth,
          height,
          initialWidth,
          responsive: false,
        });
        const plotArea = calculatePlotArea(size, normalizedMargin);
        const context: ChartContextValue<TDatum> = {
          data,
          ids: {
            root: rootId,
            title: `${rootId}-title`,
            description: `${rootId}-description`,
          },
          margin: normalizedMargin,
          size,
          plotArea,
          isEmpty: data.length === 0,
          xKey,
          xScale,
        };

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
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            >
              <g data-kamod-chart-plot="" transform={`translate(${plotArea.x} ${plotArea.y})`}>
                {context.isEmpty ? emptyState : children}
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
