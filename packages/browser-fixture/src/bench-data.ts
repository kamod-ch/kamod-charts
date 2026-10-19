export type BenchKind = "line" | "stacked-line" | "bar" | "scatter";

export interface BenchRow {
  t: number;
  a: number;
  b: number | null;
  c: number;
}

const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildBenchSeries = (pointCount: number, seed = 42): BenchRow[] => {
  const random = mulberry32(seed);
  const start = Date.UTC(2024, 0, 1);
  const rows: BenchRow[] = [];
  for (let index = 0; index < pointCount; index += 1) {
    const spike = index === Math.floor(pointCount * 0.62) ? 40 : 0;
    const gap = index % 17 === 0 ? null : Math.sin(index / 8) * 12 + random() * 6 + spike;
    rows.push({
      t: start + index * 3_600_000,
      a: gap ?? 0,
      b: gap,
      c: index % 5 === 0 ? (rows[Math.max(0, index - 1)]?.c ?? 0) : Math.cos(index / 5) * 8,
    });
  }
  return rows;
};
