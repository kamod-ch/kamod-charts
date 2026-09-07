export const roundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string => {
  const safeRadius = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  const right = x + width;
  const bottom = y + height;

  if (safeRadius === 0) {
    return `M${x},${y}H${right}V${bottom}H${x}Z`;
  }

  return `M${x + safeRadius},${y}H${right - safeRadius}Q${right},${y} ${right},${y + safeRadius}V${bottom - safeRadius}Q${right},${bottom} ${right - safeRadius},${bottom}H${x + safeRadius}Q${x},${bottom} ${x},${bottom - safeRadius}V${y + safeRadius}Q${x},${y} ${x + safeRadius},${y}Z`;
};
