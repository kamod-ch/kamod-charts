import { hydrate } from "preact";
import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { LineChart } from "../src";

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
];

describe("SSR hydration", () => {
  it("hydrates LineChart markup without duplicate ids or thrown errors", () => {
    const markup = renderToString(
      <LineChart
        data={data}
        xKey="x"
        height={200}
        width={320}
        title="Hydration test"
        description="Two points"
        series={[{ key: "y", label: "Y", color: "var(--chart-1)" }]}
      />,
    );

    expect(markup).toContain("Hydration test");
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.appendChild(container);

    hydrate(
      <LineChart
        data={data}
        xKey="x"
        height={200}
        width={320}
        title="Hydration test"
        description="Description"
        series={[{ key: "y", label: "Y", color: "var(--chart-1)" }]}
      />,
      container,
    );

    const surfaces = container.querySelectorAll("[data-kamod-chart-surface]");
    expect(surfaces.length).toBe(1);
    document.body.removeChild(container);
  });
});
