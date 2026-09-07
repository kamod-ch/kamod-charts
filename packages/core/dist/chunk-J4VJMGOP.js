// src/performance/binary-search.ts
var bisectDate = (data, target, accessor) => {
  let low = 0;
  let high = data.length;
  const targetTime = target.getTime();
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const datum = data[middle];
    const time = datum ? accessor(datum).getTime() : Number.POSITIVE_INFINITY;
    if (time < targetTime) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return Math.min(low, Math.max(data.length - 1, 0));
};

// src/performance/downsample.ts
var downsampleByStride = (data, { threshold = 2e3 } = {}) => {
  if (data.length <= threshold || threshold <= 0) {
    return data;
  }
  const stride = Math.ceil(data.length / threshold);
  const sampled = data.filter((_datum, index) => index % stride === 0);
  const last = data[data.length - 1];
  if (last && sampled[sampled.length - 1] !== last) {
    return [...sampled, last];
  }
  return sampled;
};
var shouldReduceMarkers = (pointCount, markerThreshold = 500) => pointCount > markerThreshold;
var getLargeDatasetWarning = (pointCount, interactiveLimit = 2e3) => pointCount > interactiveLimit ? `Kamod Charts: ${pointCount} Datenpunkte \xFCberschreiten das SVG-Interaktionsziel von ${interactiveLimit}. Downsampling oder deaktivierte Marker empfohlen.` : void 0;

export { bisectDate, downsampleByStride, getLargeDatasetWarning, shouldReduceMarkers };
//# sourceMappingURL=chunk-J4VJMGOP.js.map
//# sourceMappingURL=chunk-J4VJMGOP.js.map