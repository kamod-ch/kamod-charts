/**
 * Pure helpers for browser benchmark timing validation and aggregation.
 */

export const isFiniteDuration = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

/**
 * Validates a single run's phase ordering relative to navigation start.
 * Returns null when valid, or an error message.
 */
export const validateBenchRunTimings = ({
  navigationStart,
  initialReadyAt,
  updateStartAt,
  updateCompleteAt,
  expectUpdate,
}) => {
  if (!isFiniteDuration(navigationStart)) {
    return "missing or invalid navigationStart";
  }
  if (initialReadyAt == null || !isFiniteDuration(initialReadyAt)) {
    return "missing or invalid initialReadyAt";
  }
  if (initialReadyAt < navigationStart) {
    return "initialReadyAt precedes navigationStart";
  }

  if (!expectUpdate) {
    return null;
  }

  if (updateStartAt == null || !isFiniteDuration(updateStartAt)) {
    return "missing or invalid updateStartAt";
  }
  if (updateCompleteAt == null || !isFiniteDuration(updateCompleteAt)) {
    return "missing or invalid updateCompleteAt";
  }
  if (updateStartAt < initialReadyAt) {
    return "updateStartAt precedes initialReadyAt";
  }
  if (updateCompleteAt < updateStartAt) {
    return "updateCompleteAt precedes updateStartAt";
  }

  return null;
};

export const median = (values) => {
  const finite = values.filter((value) => isFiniteDuration(value));
  if (finite.length === 0) {
    return null;
  }
  const sorted = [...finite].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
};

export const p95 = (values) => {
  const finite = values.filter((value) => isFiniteDuration(value));
  if (finite.length === 0) {
    return null;
  }
  const sorted = [...finite].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, index)] ?? null;
};

export const formatMs = (value) => (value == null ? "—" : value.toFixed(1));
