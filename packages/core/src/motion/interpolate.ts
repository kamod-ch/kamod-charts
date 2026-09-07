export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const lerpOptional = (
  from: number | null | undefined,
  to: number | null | undefined,
  t: number,
): number | null => {
  if (typeof from === "number" && typeof to === "number") {
    return lerp(from, to, t);
  }

  return typeof to === "number" ? to : null;
};
