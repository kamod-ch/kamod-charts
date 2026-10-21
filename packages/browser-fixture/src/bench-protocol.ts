export const BENCH_PROTOCOL_VERSION = 1;

export type BenchPhase = "boot" | "initial-ready" | "update-complete";

export interface BenchRunRecord {
  runId: string;
  updateStartAt: number | null;
  updateCompleteAt: number | null;
  error?: string;
}

export interface BenchScenarioMeta {
  kind: string;
  rawPoints: number;
  visiblePoints: number;
  seriesCount: number;
  downsampling: "none" | "chart-default";
  animation: "default" | "off";
}

export interface BenchSnapshot {
  protocolVersion: number;
  navigationStart: number;
  initialReadyAt: number | null;
  meta: BenchScenarioMeta;
  runs: Record<string, BenchRunRecord>;
  pendingRunId: string | null;
}

export const createEmptySnapshot = (meta: BenchScenarioMeta): BenchSnapshot => ({
  protocolVersion: BENCH_PROTOCOL_VERSION,
  navigationStart: performance.now(),
  initialReadyAt: null,
  meta,
  runs: {},
  pendingRunId: null,
});

export const nextRunId = (counter: number) => `run-${counter}`;
