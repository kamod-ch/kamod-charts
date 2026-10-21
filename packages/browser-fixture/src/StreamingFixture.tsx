import { useEffect, useRef } from "preact/hooks";
import { LineChart, useTimeSeriesBuffer } from "@kamod-ch/charts";

export const StreamingFixture = () => {
  const stream = useTimeSeriesBuffer<{ t: Date; value: number }>({
    capacity: 500,
    readTime: (row) => row.t.getTime(),
    windowMs: 60_000,
    retentionMs: 120_000,
    maxUpdateFps: 20,
    outOfOrderPolicy: "reorder-window",
    reorderWindowMs: 5_000,
  });
  const tick = useRef(0);
  const streamRef = useRef(stream);
  streamRef.current = stream;

  useEffect(() => {
    const id = window.setInterval(() => {
      tick.current += 1;
      const now = Date.now();
      streamRef.current.append([
        {
          t: new Date(now),
          value: 40 + Math.sin(tick.current / 8) * 12,
        },
      ]);
    }, 50);
    return () => {
      window.clearInterval(id);
      streamRef.current.clear();
    };
  }, []);

  return (
    <div data-testid="streaming-fixture">
      <div class="fixture-controls">
        <button type="button" data-testid="stream-pause" onClick={() => stream.pause()}>
          Pause
        </button>
        <button type="button" data-testid="stream-live" onClick={() => stream.resumeLive()}>
          Live
        </button>
      </div>
      {stream.historyTruncated ? (
        <p data-testid="stream-truncated">Paused window is no longer fully retained.</p>
      ) : null}
      <LineChart
        data={stream.view.data}
        xKey="t"
        xScale="time"
        xDomain={stream.view.xDomain}
        height={240}
        width={720}
        series={[{ key: "value", id: "value", label: "Value" }]}
        tooltip
        title="Streaming fixture"
        description={`Mode: ${stream.mode}`}
      />
    </div>
  );
};
