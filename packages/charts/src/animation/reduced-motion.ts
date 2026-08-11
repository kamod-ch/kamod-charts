import { useEffect, useState } from "preact/hooks";

export const prefersReducedMotion = (): boolean => {
  if (typeof globalThis.matchMedia !== "function") {
    return false;
  }

  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const useReducedMotion = (): boolean => {
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
