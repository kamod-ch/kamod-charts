import { normalizeAccessor } from './chunk-B4X27YLI.js';
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { extent, min, max } from 'd3-array';

var createBandScale = ({
  domain,
  range,
  paddingInner = 0.1,
  paddingOuter = 0.05,
  align = 0.5,
  round = false
}) => scaleBand().domain([...domain]).range([...range]).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align).round(round);
var isValidNumber = (value) => typeof value === "number" && Number.isFinite(value);
var isValidDate = (value) => value instanceof Date && Number.isFinite(value.getTime());
var toNumber = (value) => value instanceof Date ? value.getTime() : value;
var normalizePadding = (padding) => {
  if (typeof padding === "number") {
    return { start: padding, end: padding };
  }
  return { start: padding?.start ?? 0, end: padding?.end ?? 0 };
};
var applyNumericPadding = (domain, padding) => {
  const normalized = normalizePadding(padding);
  const span = domain[1] - domain[0];
  const fallbackSpan = Math.abs(domain[0]) || 1;
  const safeSpan = span === 0 ? fallbackSpan : span;
  return [domain[0] - safeSpan * normalized.start, domain[1] + safeSpan * normalized.end];
};
var ensureNumericDomain = (domain) => {
  if (domain[0] === domain[1]) {
    const delta = Math.abs(domain[0]) || 1;
    return [domain[0] - delta, domain[1] + delta];
  }
  return domain;
};
var inferNumericDomain = ({
  data,
  accessor,
  domain,
  padding
}) => {
  if (domain) {
    return ensureNumericDomain(applyNumericPadding(domain, padding));
  }
  const read = normalizeAccessor(accessor);
  const values = data.map((datum, index) => read(datum, index)).filter(isValidNumber);
  const inferred = extent(values);
  const nextDomain = [inferred[0] ?? 0, inferred[1] ?? 1];
  return ensureNumericDomain(applyNumericPadding(nextDomain, padding));
};
var inferTimeDomain = ({
  data,
  accessor,
  domain,
  padding
}) => {
  if (domain) {
    const padded2 = applyNumericPadding([domain[0].getTime(), domain[1].getTime()], padding);
    const ensured2 = ensureNumericDomain(padded2);
    return [new Date(ensured2[0]), new Date(ensured2[1])];
  }
  const read = normalizeAccessor(accessor);
  const values = data.map((datum, index) => read(datum, index)).filter(isValidDate).map((date) => date.getTime());
  const inferred = extent(values);
  const padded = applyNumericPadding([inferred[0] ?? 0, inferred[1] ?? 1], padding);
  const ensured = ensureNumericDomain(padded);
  return [new Date(ensured[0]), new Date(ensured[1])];
};
var inferCategoricalDomain = (data, accessor, explicitDomain) => {
  if (explicitDomain) {
    return [...explicitDomain];
  }
  const read = normalizeAccessor(accessor);
  const seen = /* @__PURE__ */ new Set();
  for (const [index, datum] of data.entries()) {
    const value = read(datum, index);
    if (value == null) {
      continue;
    }
    seen.add(value instanceof Date ? value.toISOString() : String(value));
  }
  return [...seen];
};
var includeZero = (domain) => [
  min([domain[0], 0]) ?? 0,
  max([domain[1], 0]) ?? 0
];
var createLinearScale = ({
  domain,
  range,
  nice,
  clamp = false
}) => {
  const scale = scaleLinear().domain([...domain]).range([...range]).clamp(clamp);
  if (nice) {
    if (typeof nice === "number") {
      scale.nice(nice);
    } else {
      scale.nice();
    }
  }
  return scale;
};
var createPointScale = ({
  domain,
  range,
  padding = 0.5,
  align = 0.5,
  round = false
}) => scalePoint().domain([...domain]).range([...range]).padding(padding).align(align).round(round);
var createTimeScale = ({
  domain,
  range,
  nice,
  clamp = false
}) => {
  const scale = scaleTime().domain([...domain]).range([...range]).clamp(clamp);
  if (nice) {
    if (typeof nice === "number") {
      scale.nice(nice);
    } else {
      scale.nice();
    }
  }
  return scale;
};

export { createBandScale, createLinearScale, createPointScale, createTimeScale, ensureNumericDomain, includeZero, inferCategoricalDomain, inferNumericDomain, inferTimeDomain, toNumber };
//# sourceMappingURL=chunk-F4XUJBQT.js.map
//# sourceMappingURL=chunk-F4XUJBQT.js.map