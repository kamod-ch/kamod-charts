import { BarFixture } from "./BarFixture";
import { BenchmarkFixture, parseBenchmarkParams } from "./BenchmarkFixture";
import { SyncFixture } from "./SyncFixture";

export const App = () => {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");

  if (page === "sync") {
    return <SyncFixture />;
  }

  if (page === "bench") {
    const { bench, points } = parseBenchmarkParams(location.search);
    return <BenchmarkFixture kind={bench} pointCount={points} />;
  }

  const mode = params.get("mode") ?? "vertical";
  return <BarFixture mode={mode === "horizontal" ? "horizontal" : "vertical"} />;
};
