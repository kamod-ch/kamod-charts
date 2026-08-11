// src/interaction/hit-testing.ts
var findNearestPoint = (points, x, y) => {
  let nearest;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const point of points) {
    if (!point.defined || point.x == null || point.y == null) {
      continue;
    }
    const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
};

// src/interaction/keyboard.ts
var clamp = (value, max) => Math.min(Math.max(value, 0), Math.max(max, 0));
var createChartKeyboardHandler = ({
  pointCount,
  seriesCount,
  activeIndex,
  activeSeriesIndex,
  onChange,
  onSelect,
  onEscape
}) => (event) => {
  if (pointCount <= 0 || seriesCount <= 0) {
    return;
  }
  let nextIndex = activeIndex;
  let nextSeriesIndex = activeSeriesIndex;
  if (event.key === "ArrowRight") {
    nextIndex = clamp(activeIndex + 1, pointCount - 1);
  } else if (event.key === "ArrowLeft") {
    nextIndex = clamp(activeIndex - 1, pointCount - 1);
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = pointCount - 1;
  } else if (event.key === "ArrowDown") {
    nextSeriesIndex = clamp(activeSeriesIndex + 1, seriesCount - 1);
  } else if (event.key === "ArrowUp") {
    nextSeriesIndex = clamp(activeSeriesIndex - 1, seriesCount - 1);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect?.({ activeIndex, activeSeriesIndex });
    return;
  } else if (event.key === "Escape") {
    event.preventDefault();
    onEscape?.();
    return;
  } else {
    return;
  }
  event.preventDefault();
  onChange({ activeIndex: nextIndex, activeSeriesIndex: nextSeriesIndex });
};

// src/interaction/pointer.ts
var getPointerPosition = (event, plotArea) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const scaleX = rect.width > 0 ? event.currentTarget.viewBox.baseVal.width / rect.width : 1;
  const scaleY = rect.height > 0 ? event.currentTarget.viewBox.baseVal.height / rect.height : 1;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  return {
    x,
    y,
    plotX: x - plotArea.x,
    plotY: y - plotArea.y
  };
};
var getNearestIndexByX = (plotX, plotWidth, pointCount) => {
  if (pointCount <= 1 || plotWidth <= 0) {
    return 0;
  }
  return Math.min(Math.max(Math.round(plotX / plotWidth * (pointCount - 1)), 0), pointCount - 1);
};

export { createChartKeyboardHandler, findNearestPoint, getNearestIndexByX, getPointerPosition };
//# sourceMappingURL=chunk-DEOCEA5K.js.map
//# sourceMappingURL=chunk-DEOCEA5K.js.map