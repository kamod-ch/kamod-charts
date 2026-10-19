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

export { type DownsampleOptions, type MinMaxDownsampleOptions, type MinMaxDownsamplePoint, bisectDate, downsampleByStride, downsampleMinMax, getLargeDatasetWarning, shouldReduceMarkers };
