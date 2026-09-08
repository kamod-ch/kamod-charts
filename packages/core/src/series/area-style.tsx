import type { AreaFill, AreaGradientDirection } from "./area-fill";
import { isAreaGradientFill } from "./area-fill";

export const normalizeSvgIdPart = (value: string): string => value.replace(/[^a-zA-Z0-9_-]/g, "-");

export const createAreaGradientId = (chartRootId: string, seriesId: string): string =>
  `${normalizeSvgIdPart(chartRootId)}-area-fill-${normalizeSvgIdPart(seriesId)}`;

export interface GradientCoordinates {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

export const gradientCoordinates = (direction: AreaGradientDirection): GradientCoordinates => {
  switch (direction) {
    case "bottom-to-top":
      return { x1: "0", y1: "1", x2: "0", y2: "0" };
    case "left-to-right":
      return { x1: "0", y1: "0", x2: "1", y2: "0" };
    default:
      return { x1: "0", y1: "0", x2: "0", y2: "1" };
  }
};

export interface AreaPathFillStyle {
  fill: string;
  fillOpacity?: number;
}

export const resolveAreaPathFill = (
  fill: AreaFill,
  color: string,
  opacity: number,
  gradientId: string,
): AreaPathFillStyle => {
  if (!isAreaGradientFill(fill)) {
    return { fill: color, fillOpacity: opacity };
  }

  return { fill: `url(#${gradientId})` };
};

export interface AreaGradientStopOpacities {
  fromOpacity: number;
  toOpacity: number;
}

export const resolveAreaGradientOpacities = (
  fill: AreaFill,
  opacity: number,
): AreaGradientStopOpacities => {
  if (!isAreaGradientFill(fill)) {
    return { fromOpacity: opacity, toOpacity: 0 };
  }

  return {
    fromOpacity: fill.fromOpacity ?? opacity,
    toOpacity: fill.toOpacity ?? 0,
  };
};

export interface AreaStrokeStyle {
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export const resolveAreaStrokeStyle = (
  outline: boolean,
  color: string,
  strokeWidth?: number,
  strokeDasharray?: string,
): AreaStrokeStyle => {
  if (!outline) {
    return { stroke: "none" };
  }

  return {
    stroke: color,
    ...(strokeWidth === undefined ? {} : { strokeWidth }),
    ...(strokeDasharray === undefined ? {} : { strokeDasharray }),
  };
};

export const shouldShowAreaPoints = (
  showPoints: boolean | "auto" | undefined,
  pointCount: number,
): boolean => {
  if (showPoints === true) {
    return true;
  }

  if (showPoints === "auto") {
    return pointCount <= 500;
  }

  return false;
};

export interface AreaMarkerPoint {
  key: string;
  index: number;
  x: number;
  y: number;
}

export interface AreaPointMarkersProps {
  points: readonly AreaMarkerPoint[];
  color: string;
  pointRadius: number;
  activeIndex?: number | null;
}

export const AreaPointMarkers = ({
  points,
  color,
  pointRadius,
  activeIndex = null,
}: AreaPointMarkersProps) => (
  <>
    {points.map((point) => {
      const isActive = activeIndex === point.index;
      return (
        <circle
          key={point.key}
          cx={point.x}
          cy={point.y}
          r={isActive ? pointRadius + 1.5 : pointRadius}
          fill={color}
          stroke="var(--chart-tooltip-background)"
          stroke-width={isActive ? 2 : 1}
          data-kamod-chart-key={point.key}
          data-kamod-chart-active={isActive ? "true" : undefined}
        />
      );
    })}
  </>
);

export interface AreaGradientDefProps {
  id: string;
  color: string;
  fill: AreaFill;
  opacity: number;
}

export const AreaGradientDef = ({ id, color, fill, opacity }: AreaGradientDefProps) => {
  if (!isAreaGradientFill(fill)) {
    return null;
  }

  const direction = fill.direction ?? "top-to-bottom";
  const { fromOpacity, toOpacity } = resolveAreaGradientOpacities(fill, opacity);
  const coords = gradientCoordinates(direction);

  return (
    <linearGradient
      id={id}
      gradientUnits="objectBoundingBox"
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
    >
      <stop offset="0%" stop-color={color} stop-opacity={fromOpacity} />
      <stop offset="100%" stop-color={color} stop-opacity={toOpacity} />
    </linearGradient>
  );
};
