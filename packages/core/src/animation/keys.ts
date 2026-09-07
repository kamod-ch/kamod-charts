export const domainKey = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? `index:${index}` : value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `n:${value}`;
  }

  if (typeof value === "string" && value.length > 0) {
    return `s:${value}`;
  }

  return `index:${index}`;
};

export const uniquifyKeys = (keys: readonly string[]): string[] => {
  const seen = new Map<string, number>();

  return keys.map((key) => {
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}#${count}`;
  });
};

export const pointKey = (
  seriesId: string,
  xValue: string | number | Date | null | undefined,
  index: number,
  yValue?: number | null,
): string => {
  const base = `${seriesId}::${domainKey(xValue, index)}`;
  if (yValue == null || !Number.isFinite(yValue)) {
    return base;
  }

  return `${base}::n:${yValue}`;
};

export const barKey = (seriesId: string, category: string): string => `${seriesId}::${category}`;

export const sliceKey = (label: string, index: number): string =>
  label.length > 0 ? `s:${label}` : `slice-${index}`;
