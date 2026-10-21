export type TimeSeriesDuplicatePolicy = "reject" | "replace" | "allow";

/** How late-arriving points are handled (never silently re-sorts the whole buffer). */
export type TimeSeriesOutOfOrderPolicy = "reject" | "drop" | "reorder-window";

export interface TimeSeriesBufferOptions<T> {
  capacity: number;
  readTime: (item: T) => number;
  /** Drop points older than `newest - retentionMs` after each append. */
  retentionMs?: number;
  duplicatePolicy?: TimeSeriesDuplicatePolicy;
  outOfOrderPolicy?: TimeSeriesOutOfOrderPolicy;
  /** Only used with `reorder-window`; late points older than this span are dropped. */
  reorderWindowMs?: number;
}

export interface TimeSeriesAppendStats {
  accepted: number;
  rejected: number;
  dropped: number;
  replaced: number;
}

export interface TimeSeriesTrailingView<T> {
  items: readonly T[];
  domain: readonly [Date, Date];
  /** True when older samples exist before the window start (trimmed or outside window). */
  clippedStart: boolean;
}

const bisectLeft = (times: readonly number[], value: number): number => {
  let low = 0;
  let high = times.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (times[mid]! < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
};

export class TimeSeriesBuffer<T> {
  private readonly options: TimeSeriesBufferOptions<T>;
  private items: T[] = [];
  private times: number[] = [];

  constructor(options: TimeSeriesBufferOptions<T>) {
    this.options = {
      duplicatePolicy: "reject",
      outOfOrderPolicy: "reject",
      reorderWindowMs: 60_000,
      ...options,
    };
    if (!Number.isFinite(this.options.capacity) || this.options.capacity <= 0) {
      throw new Error("TimeSeriesBuffer capacity must be a positive number");
    }
  }

  get size(): number {
    return this.items.length;
  }

  get newestTime(): number | null {
    return this.times.length > 0 ? this.times[this.times.length - 1]! : null;
  }

  get oldestTime(): number | null {
    return this.times.length > 0 ? this.times[0]! : null;
  }

  /** Returns the internal ordered snapshot (new array reference). */
  toArray(): readonly T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
    this.times = [];
  }

  append(batch: readonly T[]): TimeSeriesAppendStats {
    const stats: TimeSeriesAppendStats = {
      accepted: 0,
      rejected: 0,
      dropped: 0,
      replaced: 0,
    };
    for (const item of batch) {
      const outcome = this.appendOne(item);
      stats[outcome] += 1;
    }
    this.trim();
    return stats;
  }

  appendOne(item: T): keyof TimeSeriesAppendStats {
    const time = this.options.readTime(item);
    if (!Number.isFinite(time)) {
      return "rejected";
    }

    const duplicateIndex = this.findDuplicateIndex(time);
    if (duplicateIndex >= 0) {
      if (this.options.duplicatePolicy === "allow") {
        this.insertAt(duplicateIndex, item, time);
        return "accepted";
      }
      if (this.options.duplicatePolicy === "replace") {
        this.items[duplicateIndex] = item;
        return "replaced";
      }
      return "rejected";
    }

    const newest = this.newestTime;
    if (newest == null) {
      this.items.push(item);
      this.times.push(time);
      return "accepted";
    }

    if (time > newest) {
      this.items.push(item);
      this.times.push(time);
      return "accepted";
    }

    const policy = this.options.outOfOrderPolicy ?? "reject";
    if (policy === "reject") {
      return "rejected";
    }
    if (policy === "drop") {
      return "dropped";
    }

    const windowMs = this.options.reorderWindowMs ?? 60_000;
    if (time < newest - windowMs) {
      return "dropped";
    }

    const index = bisectLeft(this.times, time);
    this.insertAt(index, item, time);
    return "accepted";
  }

  viewTrailing(windowMs: number, endMs?: number): TimeSeriesTrailingView<T> {
    const end = endMs ?? this.newestTime;
    if (end == null || this.items.length === 0) {
      const anchor = endMs ?? Date.now();
      return {
        items: [],
        domain: [new Date(anchor - windowMs), new Date(anchor)],
        clippedStart: false,
      };
    }
    const start = end - Math.max(1, windowMs);
    const startIndex = bisectLeft(this.times, start);
    const clippedStart = startIndex > 0 || (this.oldestTime != null && this.oldestTime < start);
    return {
      items: this.items.slice(startIndex),
      domain: [new Date(start), new Date(end)],
      clippedStart,
    };
  }

  private findDuplicateIndex(time: number): number {
    const index = bisectLeft(this.times, time);
    if (index < this.times.length && this.times[index] === time) {
      return index;
    }
    if (index > 0 && this.times[index - 1] === time) {
      return index - 1;
    }
    return -1;
  }

  private insertAt(index: number, item: T, time: number): void {
    this.items.splice(index, 0, item);
    this.times.splice(index, 0, time);
  }

  private trim(): void {
    const { capacity, retentionMs } = this.options;
    while (this.items.length > capacity) {
      this.items.shift();
      this.times.shift();
    }
    if (retentionMs != null && this.newestTime != null) {
      const minTime = this.newestTime - retentionMs;
      while (this.oldestTime != null && this.oldestTime < minTime) {
        this.items.shift();
        this.times.shift();
      }
    }
  }
}
