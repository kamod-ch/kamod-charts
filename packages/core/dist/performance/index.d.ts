declare const bisectDate: <TDatum>(data: readonly TDatum[], target: Date, accessor: (datum: TDatum) => Date) => number;

interface DownsampleOptions {
    threshold?: number;
}
declare const downsampleByStride: <TDatum>(data: readonly TDatum[], { threshold }?: DownsampleOptions) => readonly TDatum[];
declare const shouldReduceMarkers: (pointCount: number, markerThreshold?: number) => boolean;
declare const getLargeDatasetWarning: (pointCount: number, interactiveLimit?: number) => string | undefined;

export { type DownsampleOptions, bisectDate, downsampleByStride, getLargeDatasetWarning, shouldReduceMarkers };
