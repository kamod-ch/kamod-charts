import { describe, expect, it } from "vitest";
import { TimeSeriesBuffer } from "../src/streaming/time-series-buffer";

type Row = { t: number; v: number };

const readTime = (row: Row) => row.t;

describe("TimeSeriesBuffer", () => {
  it("enforces capacity", () => {
    const buffer = new TimeSeriesBuffer<Row>({ capacity: 3, readTime });
    buffer.append([
      { t: 1, v: 1 },
      { t: 2, v: 2 },
      { t: 3, v: 3 },
      { t: 4, v: 4 },
    ]);
    expect(buffer.size).toBe(3);
    expect(buffer.oldestTime).toBe(2);
    expect(buffer.newestTime).toBe(4);
  });

  it("rejects duplicate timestamps by default", () => {
    const buffer = new TimeSeriesBuffer<Row>({ capacity: 10, readTime });
    const stats = buffer.append([
      { t: 5, v: 1 },
      { t: 5, v: 2 },
    ]);
    expect(stats.accepted).toBe(1);
    expect(stats.rejected).toBe(1);
    expect(buffer.size).toBe(1);
  });

  it("replaces duplicates when configured", () => {
    const buffer = new TimeSeriesBuffer<Row>({
      capacity: 10,
      readTime,
      duplicatePolicy: "replace",
    });
    const stats = buffer.append([
      { t: 5, v: 1 },
      { t: 5, v: 9 },
    ]);
    expect(stats.replaced).toBe(1);
    expect(buffer.toArray()[0]?.v).toBe(9);
  });

  it("drops out-of-order points unless reorder window applies", () => {
    const reject = new TimeSeriesBuffer<Row>({ capacity: 10, readTime });
    reject.append([
      { t: 10, v: 1 },
      { t: 8, v: 2 },
    ]);
    expect(reject.size).toBe(1);

    const windowed = new TimeSeriesBuffer<Row>({
      capacity: 10,
      readTime,
      outOfOrderPolicy: "reorder-window",
      reorderWindowMs: 5,
    });
    windowed.append([
      { t: 10, v: 1 },
      { t: 8, v: 2 },
      { t: 2, v: 3 },
    ]);
    expect(windowed.size).toBe(2);
    expect(windowed.toArray().map((row) => row.t)).toEqual([8, 10]);
  });

  it("trims by retention time", () => {
    const buffer = new TimeSeriesBuffer<Row>({
      capacity: 100,
      readTime,
      retentionMs: 10,
    });
    buffer.append([
      { t: 0, v: 1 },
      { t: 5, v: 2 },
      { t: 20, v: 3 },
    ]);
    expect(buffer.oldestTime).toBe(20);
    expect(buffer.size).toBe(1);
  });

  it("builds trailing views with clippedStart", () => {
    const buffer = new TimeSeriesBuffer<Row>({ capacity: 10, readTime });
    buffer.append([
      { t: 0, v: 1 },
      { t: 50, v: 2 },
      { t: 100, v: 3 },
    ]);
    const view = buffer.viewTrailing(55, 100);
    expect(view.items.map((row) => row.t)).toEqual([50, 100]);
    expect(view.clippedStart).toBe(true);
    expect(view.domain[0].getTime()).toBe(45);
    expect(view.domain[1].getTime()).toBe(100);
  });
});
