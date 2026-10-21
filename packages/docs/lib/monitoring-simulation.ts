/** Deterministic simulated host metrics (not real Syncding data). */

export const MONITORING_SIMULATION_SEED = 42;

export type MonitoringMetricRow = {
  t: Date;
  cpuPercent: number | null;
  ramBytes: number | null;
  networkBytesPerSec: number | null;
};

export type MonitoringSimulationOptions = {
  seed?: number;
  /** Tick index when a short outage injects null gaps. */
  outageStartTick?: number;
  outageEndTick?: number;
  deploymentTick?: number;
};

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const createMonitoringSimulation = ({
  seed = MONITORING_SIMULATION_SEED,
  outageStartTick = 240,
  outageEndTick = 260,
  deploymentTick = 180,
}: MonitoringSimulationOptions = {}) => {
  const random = mulberry32(seed);
  let tick = 0;
  const startMs = Date.UTC(2024, 5, 1, 12, 0, 0);

  const rowAt = (index: number): MonitoringMetricRow => {
    const inOutage = index >= outageStartTick && index < outageEndTick;
    const wave = Math.sin(index / 18) * 0.5 + 0.5;
    const cpu = inOutage ? null : 28 + wave * 45 + random() * 6;
    const ramBytes = inOutage
      ? null
      : Math.round((2.2 + wave * 1.4 + random() * 0.1) * 1024 * 1024 * 1024);
    const networkBytesPerSec = inOutage
      ? null
      : Math.round((4 + wave * 12 + random() * 2) * 1024 * 1024);
    return {
      t: new Date(startMs + index * 1000),
      cpuPercent: cpu,
      ramBytes,
      networkBytesPerSec,
    };
  };

  return {
    deploymentTick,
    deploymentTime: () => rowAt(deploymentTick).t,
    bootstrap(count: number): MonitoringMetricRow[] {
      const rows: MonitoringMetricRow[] = [];
      for (let index = 0; index < count; index += 1) {
        rows.push(rowAt(index));
      }
      tick = count;
      return rows;
    },
    next(): MonitoringMetricRow {
      const row = rowAt(tick);
      tick += 1;
      return row;
    },
  };
};
