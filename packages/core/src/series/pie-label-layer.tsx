import type { PieLabelLayoutEntry } from "./pie-label";
import { formatPolylinePoints } from "./pie-label";

export interface PieLabelLayerProps {
  layouts: readonly PieLabelLayoutEntry[];
}

export const PieLabelLayer = ({ layouts }: PieLabelLayerProps) => {
  const visibleLayouts = layouts.filter((layout) => layout.visible && layout.content != null);
  if (visibleLayouts.length === 0) {
    return null;
  }

  return (
    <g
      data-kamod-chart-pie-labels=""
      aria-hidden="true"
      pointer-events="none"
      style={{ pointerEvents: "none" }}
    >
      {visibleLayouts.map((layout) => (
        <g key={layout.key} data-kamod-chart-pie-label="" data-kamod-chart-key={layout.key}>
          {layout.kind === "outside" && layout.linePoints ? (
            <polyline
              points={formatPolylinePoints(layout.linePoints)}
              fill="none"
              stroke={layout.lineColor ?? "currentColor"}
              stroke-width={layout.lineStrokeWidth}
              class={layout.lineClass}
              data-kamod-chart-pie-label-line=""
            />
          ) : null}
          <text
            x={layout.textX}
            y={layout.textY}
            text-anchor={layout.textAnchor}
            dominant-baseline={layout.dominantBaseline}
            fill={layout.color}
            class={layout.class}
            data-kamod-chart-pie-label-text=""
          >
            {layout.content}
          </text>
        </g>
      ))}
    </g>
  );
};
