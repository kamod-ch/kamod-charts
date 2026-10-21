import { useMemo, useState } from "preact/hooks";
import {
  LineChart,
  LineChartWithXBrush,
  createTrailingTimeWindowDomain,
  inferContinuousXDomainFromData,
  useSynchronizedCartesianXDomain,
} from "@kamod-ch/charts";

const hourly = Array.from({ length: 24 }, (_, hour) => ({
  t: new Date(Date.UTC(2024, 5, 1, hour)),
  views: 40 + hour * 2,
}));

const clicks = [
  { t: new Date(Date.UTC(2024, 5, 1, 1, 15)), clicks: 3 },
  { t: new Date(Date.UTC(2024, 5, 1, 4, 30)), clicks: 7 },
  { t: new Date(Date.UTC(2024, 5, 1, 8, 45)), clicks: 2 },
  { t: new Date(Date.UTC(2024, 5, 1, 15, 10)), clicks: 9 },
];

export const BrushFixture = () => {
  const extents = useMemo(
    () => inferContinuousXDomainFromData(hourly, (row) => row.t, "time")!,
    [hourly],
  );
  const [minutes, setMinutes] = useState(6);
  const trailing = useMemo(
    () => createTrailingTimeWindowDomain(extents[1] as Date, minutes * 60_000, extents),
    [extents, minutes],
  );
  const { xDomain, setXDomain, createChartViewportHandlers } = useSynchronizedCartesianXDomain({
    initialXDomain: trailing,
  });
  const clickExtents = useMemo(
    () => inferContinuousXDomainFromData(clicks, (row) => row.t, "time"),
    [clicks],
  );
  const trafficViewport = useMemo(
    () =>
      createChartViewportHandlers({
        data: hourly,
        xKey: "t",
        xScale: "time",
        peerExtents: [clickExtents],
      }),
    [clickExtents, createChartViewportHandlers, hourly, xDomain],
  );
  const clickViewport = useMemo(
    () =>
      createChartViewportHandlers({
        data: clicks,
        xKey: "t",
        xScale: "time",
        peerExtents: [extents],
      }),
    [clicks, createChartViewportHandlers, extents, xDomain],
  );

  return (
    <div data-testid="brush-fixture">
      <div class="fixture-controls">
        <button
          type="button"
          data-testid="window-3h"
          onClick={() => {
            setMinutes(180);
            setXDomain(createTrailingTimeWindowDomain(extents[1] as Date, 180 * 60_000, extents));
          }}
        >
          3h window
        </button>
        <button type="button" data-testid="apply-trailing" onClick={() => setXDomain(trailing)}>
          Apply trailing
        </button>
      </div>
      <p data-testid="sync-x-domain-start">
        {xDomain?.[0] instanceof Date ? (xDomain[0] as Date).toISOString() : ""}
      </p>
      <LineChartWithXBrush
        data={hourly}
        xKey="t"
        xScale="time"
        xBrush
        height={220}
        width={720}
        tooltip
        series={[{ key: "views", id: "views", label: "Views" }]}
        xDomain={xDomain}
        onXViewportChange={trafficViewport.onXViewportChange}
        xViewportInteraction={{ wheelZoom: "modifier" }}
        title="Traffic with brush"
      />
      <LineChart
        data={clicks}
        xKey="t"
        xScale="time"
        height={180}
        width={720}
        tooltip
        series={[{ key: "clicks", id: "clicks", label: "Clicks" }]}
        xDomain={xDomain}
        onXViewportChange={clickViewport.onXViewportChange}
        title="Clicks (synced window)"
      />
    </div>
  );
};
