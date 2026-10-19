export interface DownsampleOptions {
  threshold?: number;
}

export const downsampleByStride = <TDatum>(
  data: readonly TDatum[],
  { threshold = 2000 }: DownsampleOptions = {},
): readonly TDatum[] => {
  if (data.length <= threshold || threshold <= 0) {
    return data;
  }

  const stride = Math.ceil(data.length / threshold);
  const sampled = data.filter((_datum, index) => index % stride === 0);
  const lastIndex = data.length - 1;
  const last = data[lastIndex];

  if (sampled.length === 0 || sampled[sampled.length - 1] !== last) {
    return [...sampled, last];
  }

  return sampled;
};

export const shouldReduceMarkers = (pointCount: number, markerThreshold = 500): boolean =>
  pointCount > markerThreshold;

export const getLargeDatasetWarning = (
  pointCount: number,
  interactiveLimit = 2000,
): string | undefined =>
  pointCount > interactiveLimit
    ? `Kamod Charts: ${pointCount} Datenpunkte überschreiten das SVG-Interaktionsziel von ${interactiveLimit}. Downsampling oder deaktivierte Marker empfohlen.`
    : undefined;
