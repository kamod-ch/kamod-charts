import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { ChartXViewportDomain } from "../charts/x-viewport";
import {
  TimeSeriesBuffer,
  type TimeSeriesAppendStats,
  type TimeSeriesBufferOptions,
  type TimeSeriesTrailingView,
} from "./time-series-buffer";

export type TimeSeriesBufferMode = "live" | "paused";

export interface UseTimeSeriesBufferOptions<T> extends TimeSeriesBufferOptions<T> {
  /** Trailing window for live follow (default 5 minutes). */
  windowMs?: number;
  /** Max visual refresh rate while live (default 30 fps). */
  maxUpdateFps?: number;
  now?: () => number;
}

export interface TimeSeriesBufferView<T> {
  data: readonly T[];
  xDomain: ChartXViewportDomain;
  clippedStart: boolean;
}

export interface UseTimeSeriesBufferResult<T> {
  view: TimeSeriesBufferView<T>;
  mode: TimeSeriesBufferMode;
  pause: () => void;
  resumeLive: () => void;
  append: (batch: readonly T[]) => TimeSeriesAppendStats;
  clear: () => void;
  /** True when the frozen pause anchor is older than retained history. */
  historyTruncated: boolean;
}

const defaultWindowMs = 5 * 60_000;

export const useTimeSeriesBuffer = <T>({
  windowMs = defaultWindowMs,
  maxUpdateFps = 30,
  now = () => Date.now(),
  ...bufferOptions
}: UseTimeSeriesBufferOptions<T>): UseTimeSeriesBufferResult<T> => {
  const bufferRef = useRef<TimeSeriesBuffer<T> | null>(null);
  if (bufferRef.current == null) {
    bufferRef.current = new TimeSeriesBuffer(bufferOptions);
  }

  const [mode, setMode] = useState<TimeSeriesBufferMode>("live");
  const [view, setView] = useState<TimeSeriesBufferView<T>>({
    data: [],
    xDomain: [new Date(now() - windowMs), new Date(now())],
    clippedStart: false,
  });
  const [historyTruncated, setHistoryTruncated] = useState(false);
  const pauseAnchorRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFlushRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const applyView = useCallback((trailing: TimeSeriesTrailingView<T>) => {
    setView({
      data: trailing.items,
      xDomain: trailing.domain as ChartXViewportDomain,
      clippedStart: trailing.clippedStart,
    });
  }, []);

  const flushVisual = useCallback(() => {
    rafRef.current = null;
    const buffer = bufferRef.current!;
    const endMs =
      modeRef.current === "paused" && pauseAnchorRef.current != null
        ? pauseAnchorRef.current
        : (buffer.newestTime ?? now());
    const trailing = buffer.viewTrailing(windowMs, endMs);
    applyView(trailing);
    if (modeRef.current === "paused" && pauseAnchorRef.current != null) {
      const oldest = buffer.oldestTime;
      setHistoryTruncated(oldest != null && pauseAnchorRef.current - windowMs < oldest);
    } else {
      setHistoryTruncated(false);
    }
    lastFlushRef.current = performance.now();
  }, [applyView, now, windowMs]);

  const scheduleFlush = useCallback(() => {
    if (modeRef.current !== "live") {
      return;
    }
    if (rafRef.current != null) {
      return;
    }
    const minInterval = 1000 / Math.max(1, maxUpdateFps);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const elapsed = performance.now() - lastFlushRef.current;
      if (lastFlushRef.current > 0 && elapsed < minInterval) {
        return;
      }
      flushVisual();
    });
  }, [flushVisual, maxUpdateFps]);

  useEffect(
    () => () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  const append = useCallback(
    (batch: readonly T[]) => {
      const stats = bufferRef.current!.append(batch);
      if (modeRef.current === "live") {
        const inVitest =
          (typeof process !== "undefined" && process.env.VITEST) ||
          (typeof import.meta !== "undefined" &&
            (import.meta as { env?: { VITEST?: boolean } }).env?.VITEST);
        if (inVitest) {
          flushVisual();
        } else {
          scheduleFlush();
        }
      }
      return stats;
    },
    [flushVisual, scheduleFlush],
  );

  const pause = useCallback(() => {
    pauseAnchorRef.current = bufferRef.current?.newestTime ?? now();
    setMode("paused");
    flushVisual();
  }, [flushVisual, now]);

  const resumeLive = useCallback(() => {
    pauseAnchorRef.current = null;
    setMode("live");
    setHistoryTruncated(false);
    flushVisual();
  }, [flushVisual]);

  const clear = useCallback(() => {
    bufferRef.current!.clear();
    pauseAnchorRef.current = null;
    setHistoryTruncated(false);
    applyView({
      items: [],
      domain: [new Date(now() - windowMs), new Date(now())],
      clippedStart: false,
    });
  }, [applyView, now, windowMs]);

  return {
    view,
    mode,
    pause,
    resumeLive,
    append,
    clear,
    historyTruncated,
  };
};
