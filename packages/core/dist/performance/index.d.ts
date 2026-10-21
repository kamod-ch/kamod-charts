declare const bisectDate: <TDatum>(data: readonly TDatum[], target: Date, accessor: (datum: TDatum) => Date) => number;

interface DownsampleOptions {
    threshold?: number;
}
declare const downsampleByStride: <TDatum>(data: readonly TDatum[], { threshold }?: DownsampleOptions) => readonly TDatum[];
declare const shouldReduceMarkers: (pointCount: number, markerThreshold?: number) => boolean;
declare const getLargeDatasetWarning: (pointCount: number, interactiveLimit?: number) => string | undefined;

interface MinMaxDownsampleOptions {
    /** Maximum number of distinct original indices to return (including endpoints). */
    budget: number;
}
interface MinMaxDownsamplePoint<TDatum> {
    datum: TDatum;
    index: number;
}
/**
 * Min/max bucket downsampling for monotonic numeric X series.
 * Preserves extrema per bucket and always includes first/last indices when budget allows.
 */
declare const downsampleMinMax: <TDatum>(data: readonly TDatum[], readX: (datum: TDatum, index: number) => number | null | undefined, readY: (datum: TDatum, index: number) => number | null | undefined, { budget }: MinMaxDownsampleOptions) => readonly MinMaxDownsamplePoint<TDatum>[];

interface SegmentedMinMaxDownsampleOptions {
    /** Maximum number of drawable numeric points (finite X and Y) across all segments. */
    budget: number;
    /**
     * When set, splits segments when `readX` increases by more than this amount between
     * consecutive valid rows (array order). Must be explicit; never inferred from data.
     */
    gapThreshold?: number;
}
interface SegmentedMinMaxDownsampleSegment {
    firstIndex: number;
    lastIndex: number;
    validCount: number;
}
interface SegmentedMinMaxDownsampleResult<TDatum> {
    points: readonly MinMaxDownsamplePoint<TDatum>[];
    segments: readonly SegmentedMinMaxDownsampleSegment[];
    /** Original indices with invalid or missing Y (explicit value gaps). */
    valueGapIndices: readonly number[];
    /** Original index of the last point before a time-gap split. */
    timeGapAfterIndices: readonly number[];
}
/**
 * Segment-preserving min/max downsampling. Invalid Y values break segments; optional
 * `gapThreshold` splits on large X jumps in array order. Does not reorder or mutate input.
 */
declare const downsampleMinMaxSegmented: <TDatum>(data: readonly TDatum[], readX: (datum: TDatum, index: number) => number | Date | null | undefined, readY: (datum: TDatum, index: number) => number | null | undefined, { budget, gapThreshold }: SegmentedMinMaxDownsampleOptions) => SegmentedMinMaxDownsampleResult<TDatum>;

export { type DownsampleOptions, type MinMaxDownsampleOptions, type MinMaxDownsamplePoint, type SegmentedMinMaxDownsampleOptions, type SegmentedMinMaxDownsampleResult, type SegmentedMinMaxDownsampleSegment, bisectDate, downsampleByStride, downsampleMinMax, downsampleMinMaxSegmented, getLargeDatasetWarning, shouldReduceMarkers };
