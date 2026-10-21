import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import {
  LineChart,
  Sparkline,
  createTrailingTimeWindowDomain,
  inferContinuousXDomainFromData,
  useSynchronizedCartesianSelection,
  useSynchronizedCartesianXDomain,
  useTimeSeriesBuffer,
} from "@kamod-ch/charts";
import {
  downloadChartDataCsv,
  downloadChartSvg,
  serializeChartDataCsv,
} from "@kamod-ch/charts/export";
import { downloadChartPng } from "@kamod-ch/charts/export/png";
import { createMonitoringSimulation, type MonitoringMetricRow } from "./monitoring-simulation";

const WINDOW_MINUTES = { short: 5, medium: 15 } as const;

const formatBytes = (value: number) => {
  if (value >= 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GiB`;
  }
  return `${(value / (1024 * 1024)).toFixed(0)} MiB`;
};

const formatMbps = (bytesPerSec: number) => `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MiB/s`;

export function MonitoringFixture(): JSX.Element {
  const simulation = useMemo(() => createMonitoringSimulation(), []);
  const stream = useTimeSeriesBuffer<MonitoringMetricRow>({
    capacity: 4_000,
    readTime: (row) => row.t.getTime(),
    retentionMs: 30 * 60_000,
    windowMs: WINDOW_MINUTES.short * 60_000,
    maxUpdateFps: 24,
    outOfOrderPolicy: "reorder-window",
    reorderWindowMs: 5_000,
  });
  const [windowMinutes, setWindowMinutes] = useState<number>(WINDOW_MINUTES.short);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [visualUpdates, setVisualUpdates] = useState(0);
  const exportRef = useRef<SVGSVGElement | null>(null);
  const streamRef = useRef(stream);
  streamRef.current = stream;

  const extents = useMemo((): [Date, Date] => {
    const inferred = inferContinuousXDomainFromData(stream.view.data, (row) => row.t, "time");
    if (inferred && inferred.length === 2) {
      return [inferred[0] as Date, inferred[1] as Date];
    }
    return [simulation.deploymentTime(), new Date()];
  }, [simulation, stream.view.data]);

  const trailingDomain = useMemo(
    () =>
      createTrailingTimeWindowDomain(
        (extents[1] as Date) ?? new Date(),
        windowMinutes * 60_000,
        extents,
      ),
    [extents, windowMinutes],
  );

  const {
    xDomain: sharedXDomain,
    setXDomain,
    createChartViewportHandlers,
  } = useSynchronizedCartesianXDomain({ initialXDomain: trailingDomain });
  const selection = useSynchronizedCartesianSelection({ maxDeltaMs: 120_000 });

  const cpuViewport = useMemo(
    () =>
      createChartViewportHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
      }),
    [createChartViewportHandlers, sharedXDomain, stream.view.data],
  );
  const ramViewport = useMemo(
    () =>
      createChartViewportHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
        peerExtents: [extents],
      }),
    [createChartViewportHandlers, extents, sharedXDomain, stream.view.data],
  );
  const networkViewport = useMemo(
    () =>
      createChartViewportHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
        peerExtents: [extents],
      }),
    [createChartViewportHandlers, extents, sharedXDomain, stream.view.data],
  );

  const cpuHandlers = useMemo(
    () =>
      selection.createChartHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
      }),
    [selection, stream.view.data],
  );
  const ramHandlers = useMemo(
    () =>
      selection.createChartHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
      }),
    [selection, stream.view.data],
  );
  const networkHandlers = useMemo(
    () =>
      selection.createChartHandlers({
        data: stream.view.data,
        xKey: "t",
        xScale: "time",
      }),
    [selection, stream.view.data],
  );

  useEffect(() => {
    streamRef.current.append(simulation.bootstrap(320));
  }, [simulation]);

  useEffect(() => {
    if (stream.mode !== "live") {
      return undefined;
    }
    const id = window.setInterval(() => {
      streamRef.current.append([simulation.next()]);
      setVisualUpdates((count) => count + 1);
    }, 250);
    return () => window.clearInterval(id);
  }, [simulation, stream.mode]);

  const applyWindow = useCallback(
    (minutes: number) => {
      setWindowMinutes(minutes);
      const end = (extents[1] as Date) ?? new Date();
      setXDomain(createTrailingTimeWindowDomain(end, minutes * 60_000, extents));
    },
    [extents, setXDomain],
  );

  const resetViewport = useCallback(() => {
    stream.resumeLive();
    applyWindow(windowMinutes);
  }, [applyWindow, stream, windowMinutes]);

  const latest = stream.view.data.at(-1);
  const deployment = simulation.deploymentTime();

  const chartProps = {
    xKey: "t" as const,
    xScale: "time" as const,
    height: 200,
    initialWidth: 720,
    responsive: true,
    showGrid: true,
    tooltip: true,
    connectNulls: false,
    xViewportInteraction: { wheelZoom: "modifier" as const },
  };

  return (
    <div class="space-y-4" data-kamod-monitoring-demo="" data-testid="monitoring-fixture">
      <p class="text-sm text-muted-foreground">
        Simulated host metrics for documentation only — not real Syncding telemetry.
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-pause"
          onClick={() => stream.pause()}
        >
          Pause
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-live"
          onClick={() => stream.resumeLive()}
        >
          Live
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          aria-pressed={windowMinutes === WINDOW_MINUTES.short}
          onClick={() => applyWindow(WINDOW_MINUTES.short)}
        >
          5 min
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          aria-pressed={windowMinutes === WINDOW_MINUTES.medium}
          onClick={() => applyWindow(WINDOW_MINUTES.medium)}
        >
          15 min
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-reset"
          onClick={resetViewport}
        >
          Reset zoom
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-export"
          onClick={() => {
            const svg =
              exportRef.current ?? document.querySelector("[data-kamod-monitoring-cpu] svg");
            if (svg instanceof SVGSVGElement) {
              downloadChartSvg(svg, "monitoring-cpu.svg");
            }
          }}
        >
          Export CPU SVG
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-export-png"
          onClick={() => {
            const svg =
              exportRef.current ?? document.querySelector("[data-kamod-monitoring-cpu] svg");
            if (svg instanceof SVGSVGElement) {
              void downloadChartPng(svg, "monitoring-cpu.png", {
                embedStyles: "all-computed",
                backgroundColor: "#ffffff",
              });
            }
          }}
        >
          Export CPU PNG
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-export-csv"
          onClick={() => {
            const csv = serializeChartDataCsv({
              data: stream.view.data,
              scope: "all",
              columns: [
                { key: "t", header: "time", unit: "iso", value: (row) => row.t },
                { key: "cpu", header: "cpu", unit: "%", value: (row) => row.cpuPercent },
                { key: "ram", header: "ram", unit: "bytes", value: (row) => row.ramBytes },
                {
                  key: "net",
                  header: "network",
                  unit: "bytes_per_sec",
                  value: (row) => row.networkBytesPerSec,
                },
              ],
            });
            downloadChartDataCsv(csv, "monitoring-metrics.csv");
          }}
        >
          Export data CSV
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-3 py-1 text-sm"
          data-testid="monitoring-performance"
          aria-pressed={performanceMode}
          onClick={() => setPerformanceMode((value) => !value)}
        >
          Performance mode
        </button>
      </div>
      {stream.historyTruncated ? (
        <p class="text-sm text-amber-700 dark:text-amber-300" role="status">
          Paused window is no longer fully retained in the buffer.
        </p>
      ) : null}
      {performanceMode ? (
        <p class="font-mono text-xs text-muted-foreground" data-testid="monitoring-perf-stats">
          raw buffer={stream.view.data.length} visual updates={visualUpdates} mode={stream.mode}
        </p>
      ) : null}
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="flex items-center gap-3 rounded-lg border border-border p-3">
          <Sparkline
            data={stream.view.data}
            xKey="t"
            valueKey="cpuPercent"
            label="CPU sparkline"
            trendSummary={
              latest?.cpuPercent != null ? `${latest.cpuPercent.toFixed(0)}% latest` : "Gap in data"
            }
            xDomain={cpuViewport.xDomain}
          />
          <div>
            <p class="text-sm font-medium">CPU</p>
            <p class="text-xs text-muted-foreground">
              {latest?.cpuPercent != null ? `${latest.cpuPercent.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-border p-3">
          <Sparkline
            data={stream.view.data}
            xKey="t"
            valueKey="ramBytes"
            label="RAM sparkline"
            trendSummary={latest?.ramBytes != null ? formatBytes(latest.ramBytes) : "Gap in data"}
            xDomain={ramViewport.xDomain}
          />
          <div>
            <p class="text-sm font-medium">RAM</p>
            <p class="text-xs text-muted-foreground">
              {latest?.ramBytes != null ? formatBytes(latest.ramBytes) : "—"}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-border p-3">
          <Sparkline
            data={stream.view.data}
            xKey="t"
            valueKey="networkBytesPerSec"
            label="Network sparkline"
            trendSummary={
              latest?.networkBytesPerSec != null
                ? formatMbps(latest.networkBytesPerSec)
                : "Gap in data"
            }
            xDomain={networkViewport.xDomain}
          />
          <div>
            <p class="text-sm font-medium">Network</p>
            <p class="text-xs text-muted-foreground">
              {latest?.networkBytesPerSec != null ? formatMbps(latest.networkBytesPerSec) : "—"}
            </p>
          </div>
        </div>
      </div>
      <div data-kamod-monitoring-cpu="">
        <LineChart
          {...chartProps}
          data={stream.view.data}
          xDomain={cpuViewport.xDomain}
          onXViewportChange={cpuViewport.onXViewportChange}
          svgRef={exportRef}
          title="CPU utilization (simulated)"
          description="Percent of host CPU"
          series={[{ key: "cpuPercent", id: "cpu", label: "CPU %" }]}
          referencePoints={[
            {
              id: "deploy",
              x: deployment,
              y: 85,
              label: "Deploy",
              shape: "diamond",
            },
          ]}
          activeIndex={cpuHandlers.activeIndex}
          onActiveChange={cpuHandlers.onActiveChange}
        />
      </div>
      <LineChart
        {...chartProps}
        data={stream.view.data}
        xDomain={ramViewport.xDomain}
        onXViewportChange={ramViewport.onXViewportChange}
        title="Memory (simulated)"
        description="Resident memory in bytes"
        series={[{ key: "ramBytes", id: "ram", label: "RAM" }]}
        format={{ number: { notation: "compact" } }}
        activeIndex={ramHandlers.activeIndex}
        onActiveChange={ramHandlers.onActiveChange}
      />
      <LineChart
        {...chartProps}
        data={stream.view.data}
        xDomain={networkViewport.xDomain}
        onXViewportChange={networkViewport.onXViewportChange}
        title="Network throughput (simulated)"
        description="Bytes per second"
        series={[{ key: "networkBytesPerSec", id: "net", label: "Network" }]}
        format={{ number: { notation: "compact" } }}
        activeIndex={networkHandlers.activeIndex}
        onActiveChange={networkHandlers.onActiveChange}
      />
    </div>
  );
}
