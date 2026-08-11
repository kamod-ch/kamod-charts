import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Chart } from "../src/core";

describe("Chart SSR", () => {
  it("renders fixed dimensions deterministically", () => {
    const first = renderToString(
      <Chart
        data={[{ value: 1 }]}
        width={480}
        height={240}
        id="sales"
        title="Sales"
        description="Monthly sales"
      >
        <circle cx={10} cy={10} r={4} />
      </Chart>,
    );
    const second = renderToString(
      <Chart
        data={[{ value: 1 }]}
        width={480}
        height={240}
        id="sales"
        title="Sales"
        description="Monthly sales"
      >
        <circle cx={10} cy={10} r={4} />
      </Chart>,
    );

    expect(first).toBe(second);
    expect(first).toContain('role="img"');
    expect(first).toContain('width="480"');
    expect(first).toContain('height="240"');
    expect(first).toContain('<title id="sales-title">Sales</title>');
    expect(first).toContain('<desc id="sales-description">Monthly sales</desc>');
  });

  it("uses initialWidth during responsive SSR", () => {
    const markup = renderToString(
      <Chart data={[]} height={200} initialWidth={640} responsive id="empty" />,
    );

    expect(markup).toContain('width="640"');
    expect(markup).toContain('height="200"');
    expect(markup).toContain("Keine Daten verfügbar");
  });
});
