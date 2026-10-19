import { describe, expect, it } from "vitest";
import { act, fireEvent, render, waitFor } from "./testing-library";
import { useSynchronizedCartesianSelection } from "../src/charts/use-synchronized-cartesian-selection";

const hourly = [
  { t: Date.UTC(2024, 5, 1, 0), views: 1 },
  { t: Date.UTC(2024, 5, 1, 1), views: 2 },
];

const Probe = () => {
  const { xValue, createChartHandlers } = useSynchronizedCartesianSelection({
    maxDeltaMs: 3_600_000,
  });
  const handlers = createChartHandlers({ data: hourly, xKey: "t", xScale: "time" });
  return (
    <div>
      <button
        type="button"
        data-testid="pick"
        onClick={() =>
          handlers.onActiveChange({
            activeIndex: 1,
            activeSeriesId: "views",
            source: "keyboard",
          })
        }
      />
      <span data-testid="x">{String(xValue ?? "")}</span>
      <span data-testid="index">{String(handlers.activeIndex ?? "")}</span>
    </div>
  );
};

describe("useSynchronizedCartesianSelection", () => {
  it("stores canonical xValue from chart selection", async () => {
    const { container } = render(<Probe />);
    const pick = container.querySelector("[data-testid=pick]");
    if (!pick) {
      throw new Error("expected pick button");
    }
    await act(async () => {
      fireEvent.click(pick);
    });
    await waitFor(() => {
      const x = container.querySelector("[data-testid=x]");
      expect(x?.textContent).toBe(String(hourly[1]!.t));
    });
    expect(container.querySelector("[data-testid=index]")?.textContent).toBe("1");
  });
});
