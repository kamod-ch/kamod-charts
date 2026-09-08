import type { ComponentChildren } from "preact";
import type { PieSlice, PieSliceContext } from "./pie-geometry";
import { pieLabelPoint, toPieSliceContext } from "./pie-geometry";

export type PieLabelPosition = "none" | "inside" | "outside";

export type PieLabelCollision = "none" | "shift" | "hide";

export interface PieLabelLineOptions {
  /** Radial segment length from the slice outer edge to the elbow. */
  length?: number;
  /** Horizontal segment length from the elbow to the label anchor. */
  horizontalLength?: number;
  color?: string;
  strokeWidth?: number;
  class?: string;
}

export interface PieLabelOptions<TDatum> {
  position?: PieLabelPosition;
  render?: (context: PieSliceContext<TDatum>) => ComponentChildren | null | undefined;
  /** Minimum slice span in degrees required to show a label and leader line. */
  minAngle?: number;
  collision?: PieLabelCollision;
  line?: PieLabelLineOptions;
  offset?: number;
  class?: string;
  color?: string;
}

export type PieLabels<TDatum> = PieLabelPosition | PieLabelOptions<TDatum>;

export const DEFAULT_PIE_RADIAL_LINE_LENGTH = 12;
export const DEFAULT_PIE_HORIZONTAL_LINE_LENGTH = 16;
export const DEFAULT_PIE_LABEL_OFFSET = 4;
export const DEFAULT_PIE_LABEL_SPACING = 14;
export const DEFAULT_PIE_LABEL_TEXT_HALF_WIDTH = 24;

export interface PieLabelLayoutEntry {
  key: string;
  index: number;
  visible: boolean;
  kind: "inside" | "outside";
  textX: number;
  textY: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "middle";
  linePoints?: readonly [number, number][];
  lineColor?: string;
  lineStrokeWidth: number;
  lineClass?: string;
  content: ComponentChildren | null;
  color?: string;
  class?: string;
}

const DEG_TO_RAD = Math.PI / 180;

export const resolvePieLabelOptions = <TDatum>(
  labels: PieLabels<TDatum> | undefined,
): PieLabelOptions<TDatum> => {
  if (labels === undefined || labels === "inside") {
    return { position: "inside" };
  }

  if (labels === "none") {
    return { position: "none" };
  }

  if (labels === "outside") {
    return { position: "outside", collision: "shift" };
  }

  const position = labels.position ?? "inside";
  return {
    ...labels,
    position,
    collision: labels.collision ?? (position === "outside" ? "shift" : undefined),
  };
};

export const computeOutsideLabelGutter = <TDatum>(options: PieLabelOptions<TDatum>): number => {
  const line = options.line ?? {};
  const radial = line.length ?? DEFAULT_PIE_RADIAL_LINE_LENGTH;
  const horizontal = line.horizontalLength ?? DEFAULT_PIE_HORIZONTAL_LINE_LENGTH;
  const offset = options.offset ?? DEFAULT_PIE_LABEL_OFFSET;
  return radial + horizontal + offset + DEFAULT_PIE_LABEL_TEXT_HALF_WIDTH + 4;
};

export const resolvePieOuterRadius = <TDatum>(
  plotArea: { width: number; height: number },
  explicitOuterRadius: number | undefined,
  labelOptions: PieLabelOptions<TDatum>,
): number => {
  if (explicitOuterRadius !== undefined) {
    return explicitOuterRadius;
  }

  const maxRadius = Math.max(0, Math.min(plotArea.width, plotArea.height) / 2);
  if (labelOptions.position !== "outside") {
    return maxRadius;
  }

  return Math.max(0, maxRadius - computeOutsideLabelGutter(labelOptions));
};

const sliceMidAngle = <TDatum>(slice: PieSlice<TDatum>): number =>
  (slice.startAngle + slice.endAngle) / 2;

const sliceSpanRadians = <TDatum>(slice: PieSlice<TDatum>): number =>
  Math.max(0, slice.endAngle - slice.startAngle);

const pointOnRadius = (radius: number, angle: number): [number, number] => [
  Math.sin(angle) * radius,
  -Math.cos(angle) * radius,
];

const isSliceLabelAngleVisible = <TDatum>(
  slice: PieSlice<TDatum>,
  minAngleDegrees: number | undefined,
): boolean => {
  if (minAngleDegrees == null || minAngleDegrees <= 0) {
    return true;
  }

  return sliceSpanRadians(slice) >= minAngleDegrees * DEG_TO_RAD;
};

const resolveLabelContent = <TDatum>(
  slice: PieSlice<TDatum>,
  activeIndex: number | null,
  options: PieLabelOptions<TDatum>,
): ComponentChildren | null => {
  const context = toPieSliceContext(slice, activeIndex === slice.index);
  if (options.render) {
    const rendered = options.render(context);
    if (rendered == null) {
      return null;
    }
    return rendered;
  }

  return slice.label;
};

export interface OutsideLabelGeometry {
  anchor: [number, number];
  elbow: [number, number];
  label: [number, number];
  side: "left" | "right";
  textAnchor: "start" | "end";
  linePoints: [number, number][];
}

export const computeOutsideLabelGeometry = <TDatum>(
  slice: PieSlice<TDatum>,
  options: PieLabelOptions<TDatum>,
): OutsideLabelGeometry => {
  const line = options.line ?? {};
  const radialLength = line.length ?? DEFAULT_PIE_RADIAL_LINE_LENGTH;
  const horizontalLength = line.horizontalLength ?? DEFAULT_PIE_HORIZONTAL_LINE_LENGTH;
  const offset = options.offset ?? DEFAULT_PIE_LABEL_OFFSET;
  const mid = sliceMidAngle(slice);
  const anchor = pointOnRadius(slice.outerRadius, mid);
  const elbow = pointOnRadius(slice.outerRadius + radialLength + offset, mid);
  const side: "left" | "right" = Math.sin(mid) >= 0 ? "right" : "left";
  const textAnchor = side === "right" ? "start" : "end";
  const label: [number, number] = [
    elbow[0] + (side === "right" ? horizontalLength : -horizontalLength),
    elbow[1],
  ];

  return {
    anchor,
    elbow,
    label,
    side,
    textAnchor,
    linePoints: [anchor, elbow, label],
  };
};

interface MutableOutsideCandidate<TDatum> {
  slice: PieSlice<TDatum>;
  geometry: OutsideLabelGeometry;
  idealY: number;
  y: number;
  visible: boolean;
  content: ComponentChildren | null;
}

const intervalsOverlap = (leftY: number, rightY: number, spacing: number): boolean =>
  Math.abs(leftY - rightY) < spacing;

const resolveShiftCollisions = (
  candidates: MutableOutsideCandidate<unknown>[],
  spacing: number,
  minY: number,
  maxY: number,
): void => {
  const sides: Array<"left" | "right"> = ["left", "right"];

  for (const side of sides) {
    const group = candidates
      .filter((entry) => entry.visible && entry.geometry.side === side)
      .sort((left, right) => left.idealY - right.idealY);

    if (group.length === 0) {
      continue;
    }

    group[0].y = Math.max(minY, Math.min(maxY, group[0].idealY));

    for (let index = 1; index < group.length; index += 1) {
      group[index].y = Math.max(group[index].idealY, group[index - 1].y + spacing);
    }

    if (group[group.length - 1].y > maxY) {
      group[group.length - 1].y = maxY;
      for (let index = group.length - 2; index >= 0; index -= 1) {
        group[index].y = Math.min(group[index].y, group[index + 1].y - spacing);
      }

      if (group[0].y < minY) {
        group[0].y = minY;
        for (let index = 1; index < group.length; index += 1) {
          group[index].y = Math.max(group[index].y, group[index - 1].y + spacing);
        }
      }
    }

    for (const entry of group) {
      entry.y = Math.max(minY, Math.min(maxY, entry.y));
    }
  }
};

const resolveHideCollisions = (
  candidates: MutableOutsideCandidate<unknown>[],
  spacing: number,
): void => {
  const placed: Array<{ side: "left" | "right"; y: number }> = [];
  const ordered = [...candidates]
    .filter((entry) => entry.visible)
    .sort((left, right) => {
      if (right.slice.value !== left.slice.value) {
        return right.slice.value - left.slice.value;
      }

      return left.slice.index - right.slice.index;
    });

  for (const entry of ordered) {
    const overlaps = placed.some(
      (candidate) =>
        candidate.side === entry.geometry.side &&
        intervalsOverlap(candidate.y, entry.idealY, spacing),
    );

    if (overlaps) {
      entry.visible = false;
      continue;
    }

    entry.y = entry.idealY;
    placed.push({ side: entry.geometry.side, y: entry.idealY });
  }
};

const applyOutsideLabelY = (geometry: OutsideLabelGeometry, y: number): OutsideLabelGeometry => {
  const elbow: [number, number] = [geometry.elbow[0], y];
  const label: [number, number] = [geometry.label[0], y];

  return {
    ...geometry,
    elbow,
    label,
    linePoints: [geometry.anchor, elbow, label],
  };
};

export interface LayoutPieLabelsOptions<TDatum> {
  slices: readonly PieSlice<TDatum>[];
  labelOptions: PieLabelOptions<TDatum>;
  plotArea: { width: number; height: number };
  activeIndex?: number | null;
}

export const layoutPieLabels = <TDatum>({
  slices,
  labelOptions,
  plotArea,
  activeIndex = null,
}: LayoutPieLabelsOptions<TDatum>): PieLabelLayoutEntry[] => {
  const position = labelOptions.position ?? "inside";
  if (position === "none") {
    return [];
  }

  const line = labelOptions.line ?? {};
  const lineStrokeWidth = line.strokeWidth ?? 1;
  const verticalBound = plotArea.height / 2 - DEFAULT_PIE_LABEL_SPACING / 2;
  const minY = -verticalBound;
  const maxY = verticalBound;
  const collision = labelOptions.collision ?? (position === "outside" ? "shift" : "none");
  const spacing = DEFAULT_PIE_LABEL_SPACING;

  if (position === "inside") {
    return slices.map((slice) => {
      const content = resolveLabelContent(slice, activeIndex, labelOptions);
      const angleVisible = isSliceLabelAngleVisible(slice, labelOptions.minAngle);
      const visible = angleVisible && content != null;
      const [textX, textY] = pieLabelPoint(slice, "inside");

      return {
        key: slice.key,
        index: slice.index,
        visible,
        kind: "inside",
        textX,
        textY,
        textAnchor: "middle",
        dominantBaseline: "middle",
        lineStrokeWidth,
        content: visible ? content : null,
        color: labelOptions.color,
        class: labelOptions.class,
      };
    });
  }

  const candidates: MutableOutsideCandidate<TDatum>[] = slices.map((slice) => {
    const geometry = computeOutsideLabelGeometry(slice, labelOptions);
    const content = resolveLabelContent(slice, activeIndex, labelOptions);
    const angleVisible = isSliceLabelAngleVisible(slice, labelOptions.minAngle);
    const visible = angleVisible && content != null;

    return {
      slice,
      geometry,
      idealY: geometry.label[1],
      y: geometry.label[1],
      visible,
      content,
    };
  });

  if (collision === "shift") {
    resolveShiftCollisions(candidates, spacing, minY, maxY);
  } else if (collision === "hide") {
    resolveHideCollisions(candidates, spacing);
  }

  return candidates.map((candidate) => {
    const geometry =
      collision === "none"
        ? candidate.geometry
        : applyOutsideLabelY(candidate.geometry, candidate.y);
    const visible = candidate.visible;

    return {
      key: candidate.slice.key,
      index: candidate.slice.index,
      visible,
      kind: "outside",
      textX: geometry.label[0],
      textY: geometry.label[1],
      textAnchor: geometry.textAnchor,
      dominantBaseline: "middle",
      linePoints: visible ? geometry.linePoints : undefined,
      lineColor: line.color,
      lineStrokeWidth,
      lineClass: line.class,
      content: visible ? candidate.content : null,
      color: labelOptions.color,
      class: labelOptions.class,
    };
  });
};

export const formatPolylinePoints = (points: readonly [number, number][]): string =>
  points.map(([x, y]) => `${x},${y}`).join(" ");
