import { interpolateNumber, interpolateString } from 'd3-interpolate';
import { useState, useEffect } from 'preact/hooks';

// src/animation/interpolate.ts
var interpolateValue = (from, to, t) => {
  const clamped = Math.min(Math.max(t, 0), 1);
  if (typeof from === "number" && typeof to === "number") {
    return interpolateNumber(from, to)(clamped);
  }
  return interpolateString(String(from), String(to))(clamped);
};
var prefersReducedMotion = () => {
  if (typeof globalThis.matchMedia !== "function") {
    return false;
  }
  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
var useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return;
    }
    const media = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
};

// src/animation/transition.ts
var shouldAnimate = ({
  duration = 200,
  disabled = false,
  reducedMotion = false
} = {}) => !disabled && !reducedMotion && duration > 0;

export { interpolateValue, prefersReducedMotion, shouldAnimate, useReducedMotion };
//# sourceMappingURL=chunk-PGSH6753.js.map
//# sourceMappingURL=chunk-PGSH6753.js.map