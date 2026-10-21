import { BarFixture } from "./BarFixture";
import { BenchmarkFixture, parseBenchmarkParams } from "./BenchmarkFixture";
import { SyncFixture } from "./SyncFixture";
import { ViewportFixture } from "./ViewportFixture";
import { BrushFixture } from "./BrushFixture";
import { StreamingFixture } from "./StreamingFixture";
import { MonitoringFixture } from "./MonitoringFixture";

export const App = () => {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");

  if (page === "sync") {
    return <SyncFixture />;
  }

  if (page === "viewport") {
    return <ViewportFixture />;
  }

  if (page === "brush") {
    return <BrushFixture />;
  }

  if (page === "streaming") {
    return <StreamingFixture />;
  }

  if (page === "monitoring") {
    return <MonitoringFixture />;
  }

  if (page === "bench") {
    const { bench, points } = parseBenchmarkParams(location.search);
    return <BenchmarkFixture kind={bench} pointCount={points} />;
  }

  const mode = params.get("mode") ?? "vertical";
  return <BarFixture mode={mode === "horizontal" ? "horizontal" : "vertical"} />;
};
