import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { ReferenceArea, ReferenceLine, ReferencePoint, ReferenceSegment } from "../primitives";
import type { ChartXViewportDomain } from "./x-viewport";
import type {
  CartesianReferenceArea,
  CartesianReferenceLine,
  CartesianReferencePoint,
  CartesianReferenceSegment,
} from "./types";

export interface CartesianViewportReferenceProps<TDatum> {
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  yDomain: readonly [number, number];
}

export interface CartesianReferenceCollectionProps<
  TDatum,
> extends CartesianViewportReferenceProps<TDatum> {
  referenceAreas?: readonly CartesianReferenceArea<TDatum>[];
  referenceSegments?: readonly CartesianReferenceSegment<TDatum>[];
  referencePoints?: readonly CartesianReferencePoint<TDatum>[];
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}

/** Clipped layer: areas (behind series) and segments. */
export const CartesianReferenceClippedLayers = <TDatum,>({
  xKey,
  xScale,
  xDomain,
  yDomain,
  referenceAreas = [],
  referenceSegments = [],
}: Pick<
  CartesianReferenceCollectionProps<TDatum>,
  "xKey" | "xScale" | "xDomain" | "yDomain" | "referenceAreas" | "referenceSegments"
>) => (
  <>
    {referenceAreas.map((area, index) => (
      <ReferenceArea
        key={area.id ?? `reference-area-${index}`}
        id={area.id}
        x1={area.x1}
        x2={area.x2}
        y1={area.y1}
        y2={area.y2}
        xKey={area.xKey ?? xKey}
        yKey={area.yKey}
        xScale={xScale}
        xDomain={xDomain}
        yDomain={yDomain}
        label={area.label}
        fill={area.fill}
        fillOpacity={area.fillOpacity}
        class={area.class}
      />
    ))}
    {referenceSegments.map((segment, index) => (
      <ReferenceSegment
        key={segment.id ?? `reference-segment-${index}`}
        id={segment.id}
        start={segment.start}
        end={segment.end}
        xKey={segment.xKey ?? xKey}
        yKey={segment.yKey}
        xScale={xScale}
        xDomain={xDomain}
        yDomain={yDomain}
        label={segment.label}
        labelPosition={segment.labelPosition}
        color={segment.color}
        strokeWidth={segment.strokeWidth}
        strokeDasharray={segment.strokeDasharray}
        class={segment.class}
      />
    ))}
  </>
);

/** Foreground layer: points above series, below tooltips/crosshair when placed after crosshair. */
export const CartesianReferencePointLayers = <TDatum,>({
  xKey,
  xScale,
  xDomain,
  yDomain,
  referencePoints = [],
}: Pick<
  CartesianReferenceCollectionProps<TDatum>,
  "xKey" | "xScale" | "xDomain" | "yDomain" | "referencePoints"
>) => (
  <>
    {referencePoints.map((point, index) => (
      <ReferencePoint
        key={point.id ?? `reference-point-${index}`}
        id={point.id}
        x={point.x}
        y={point.y}
        xKey={point.xKey ?? xKey}
        yKey={point.yKey}
        xScale={xScale}
        xDomain={xDomain}
        yDomain={yDomain}
        label={point.label}
        color={point.color}
        size={point.size}
        shape={point.shape}
        labelPosition={point.labelPosition}
        class={point.class}
      />
    ))}
  </>
);

/** Axis layer: horizontal/vertical reference lines (decorative, non-interactive). */
export const CartesianReferenceLineLayers = <TDatum,>({
  xKey,
  xScale,
  xDomain,
  yDomain,
  referenceLines = [],
}: Pick<
  CartesianReferenceCollectionProps<TDatum>,
  "xKey" | "xScale" | "xDomain" | "yDomain" | "referenceLines"
>) => (
  <>
    {referenceLines.map((line, index) => (
      <ReferenceLine
        key={line.y ?? line.x ?? index}
        x={line.x}
        y={line.y}
        yDomain={yDomain}
        label={line.label}
        color={line.color}
        strokeWidth={line.strokeWidth}
        strokeDasharray={line.strokeDasharray}
        yKey={line.yKey}
        xKey={xKey}
        xScale={xScale}
        xDomain={xDomain}
      />
    ))}
  </>
);
