import { render } from "@testing-library/preact";
import { act } from "preact/test-utils";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useTimeSeriesBuffer } from "../src/streaming/use-time-series-buffer";

type Row = { t: number; v: number };

const Probe = ({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useTimeSeriesBuffer<Row>>) => void;
}) => {
  const api = useTimeSeriesBuffer<Row>({
    capacity: 50,
    readTime: (row) => row.t,
    windowMs: 100,
    maxUpdateFps: 60,
    now: () => 200,
  });
  onReady(api);
  return null;
};

describe("useTimeSeriesBuffer", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("performance", { now: () => 0 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("decouples ingest from live visual updates and respects pause", () => {
    let api!: ReturnType<typeof useTimeSeriesBuffer<Row>>;
    render(<Probe onReady={(value) => (api = value)} />);

    act(() => {
      api.append([
        { t: 50, v: 1 },
        { t: 120, v: 2 },
        { t: 180, v: 3 },
      ]);
      return undefined;
    });
    expect(api.view.data.length).toBe(2);

    act(() => api.pause());
    expect(api.mode).toBe("paused");
    act(() => {
      api.append([{ t: 190, v: 4 }]);
      return undefined;
    });
    expect(api.view.data.length).toBe(2);

    act(() => api.resumeLive());
    expect(api.mode).toBe("live");
    expect(api.view.data.length).toBe(3);
  });

  it("schedules animation frames outside vitest sync flush", () => {
    const raf = vi.fn(() => 1);
    vi.stubGlobal("requestAnimationFrame", raf);
    const originalVitest = process.env.VITEST;
    process.env.VITEST = "";
    let api!: ReturnType<typeof useTimeSeriesBuffer<Row>>;
    render(<Probe onReady={(value) => (api = value)} />);
    api.append([{ t: 1, v: 1 }]);
    expect(raf).toHaveBeenCalled();
    process.env.VITEST = originalVitest;
  });
});
