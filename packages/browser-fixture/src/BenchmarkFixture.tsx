import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { BarChart } from "@kamod-ch/charts/bar-chart";
import { LineChart } from "@kamod-ch/charts/line-chart";
import { ScatterChart } from "@kamod-ch/charts/scatter-chart";
import { buildBenchSeries, type BenchKind } from "./bench-data";
import {
  BENCH_PROTOCOL_VERSION,
  createEmptySnapshot,
  nextRunId,
  type BenchSnapshot,
} from "./bench-protocol";

declare global {
  interface Window {
    __KAMOD_BENCH__?: {
      protocolVersion: number;
      getSnapshot: () => BenchSnapshot;
      triggerUpdate: (seed: number) => string;
    };
  }
}

const parseKind = (value: string | null): BenchKind => {
  if (value === "stacked-line" || value === "bar" || value === "scatter") {
    return value;
  }
  return "line";
};

const observeFrameBoundary = (callback: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

export const BenchmarkFixture = ({ kind, pointCount }: { kind: BenchKind; pointCount: number }) => {
  const [data, setData] = useState(() => buildBenchSeries(pointCount));
  const runCounter = useRef(0);
  const snapshotRef = useRef<BenchSnapshot | null>(null);

  const barStride = Math.max(1, Math.floor(pointCount / 24));
  const barData = useMemo(
    () => data.filter((_, index) => index % barStride === 0),
    [data, barStride],
  );

  const seriesCount = kind === "scatter" || kind === "stacked-line" ? 2 : 1;
  const visiblePoints = kind === "bar" ? barData.length : data.length;

  const meta = useMemo(
    () => ({
      kind,
      rawPoints: pointCount,
      visiblePoints,
      seriesCount,
      downsampling: "none" as const,
      animation: "default" as const,
    }),
    [kind, pointCount, visiblePoints, seriesCount],
  );

  useEffect(() => {
    const snapshot = createEmptySnapshot(meta);
    snapshot.navigationStart =
      performance.getEntriesByType("navigation")[0]?.fetchStart ?? performance.now();
    snapshotRef.current = snapshot;

    window.__KAMOD_BENCH__ = {
      protocolVersion: BENCH_PROTOCOL_VERSION,
      getSnapshot: () => snapshotRef.current ?? snapshot,
      triggerUpdate: (seed: number) => {
        const current = snapshotRef.current ?? snapshot;
        if (current.pendingRunId) {
          throw new Error(`benchmark update already pending (${current.pendingRunId})`);
        }
        if (current.initialReadyAt == null) {
          throw new Error("benchmark initial-ready not recorded yet");
        }

        runCounter.current += 1;
        const runId = nextRunId(runCounter.current);
        current.pendingRunId = runId;
        current.runs[runId] = {
          runId,
          updateStartAt: null,
          updateCompleteAt: null,
        };

        const updateStartAt = performance.now();
        current.runs[runId]!.updateStartAt = updateStartAt;
        setData(buildBenchSeries(pointCount, seed));

        observeFrameBoundary(() => {
          const run = current.runs[runId];
          if (run) {
            run.updateCompleteAt = performance.now();
          }
          current.pendingRunId = null;
        });

        return runId;
      },
    };

    observeFrameBoundary(() => {
      const current = snapshotRef.current ?? snapshot;
      current.initialReadyAt = performance.now();
    });

    return () => {
      delete window.__KAMOD_BENCH__;
      snapshotRef.current = null;
    };
  }, [kind, pointCount, meta]);

  const common = {
    data: kind === "bar" ? barData : data,
    xKey: "t" as const,
    xScale: "time" as const,
    height: 320,
    width: 960,
    tooltip: true,
    animate: false,
    title: `Benchmark ${kind}`,
    description: `${pointCount} raw points (${visiblePoints} drawn for bar)`,
  };

  if (kind === "bar") {
    return (
      <BarChart
        {...common}
        data={barData}
        xKey="t"
        series={[{ key: "a", label: "A", color: "var(--chart-1)" }]}
      />
    );
  }

  if (kind === "scatter") {
    return (
      <ScatterChart
        {...common}
        series={[
          { key: "a", label: "A", color: "var(--chart-1)" },
          { key: "c", label: "C", color: "var(--chart-2)" },
        ]}
      />
    );
  }

  if (kind === "stacked-line") {
    return (
      <LineChart
        {...common}
        stacked
        series={[
          { key: "a", label: "A", color: "var(--chart-1)" },
          { key: "c", label: "C", color: "var(--chart-2)" },
        ]}
      />
    );
  }

  return (
    <LineChart
      {...common}
      series={[
        { key: "a", label: "A", color: "var(--chart-1)" },
        { key: "c", label: "C", color: "var(--chart-2)" },
      ]}
    />
  );
};

export const parseBenchmarkParams = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    bench: parseKind(params.get("bench")),
    points: Math.max(1, Number(params.get("points") ?? "500") || 500),
  };
};
