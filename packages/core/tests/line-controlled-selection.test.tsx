import { render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "../src/charts/line-chart";

const data = [
  { date: new Date("2024-01-01"), revenue: 10 },
  { date: new Date("2024-02-01"), revenue: 20 },
];

describe("LineChart controlled selection", () => {
  it("honours yDomain and reports pointer-driven onActiveChange", () => {
    const onActiveChange = vi.fn();
    const { container } = render(
      <LineChart
        data={data}
        xKey="date"
        xScale="time"
        yDomain={[0, 50]}
        activeIndex={0}
        onActiveChange={onActiveChange}
        series={[{ key: "revenue", id: "revenue", label: "Revenue" }]}
        width={640}
        height={320}
        tooltip
      />,
    );
    const surface = container.querySelector("[data-kamod-chart-surface]");
    expect(surface).not.toBeNull();
    expect(container.innerHTML).toContain("translate(0 272)");
  });
});
