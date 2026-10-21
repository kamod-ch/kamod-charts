import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Sparkline } from "../src/charts/sparkline";

describe("Sparkline", () => {
  it("renders a compact line surface with accessibility text", () => {
    const data = [
      { t: new Date(Date.UTC(2024, 0, 1, 0, 0)), v: 1 },
      { t: new Date(Date.UTC(2024, 0, 1, 0, 1)), v: 3 },
    ];
    const markup = renderToString(
      <Sparkline
        data={data}
        xKey="t"
        valueKey="v"
        label="CPU trend"
        trendSummary="Synthetic upward trend"
      />,
    );
    expect(markup).toContain("data-kamod-sparkline");
    expect(markup).toContain("CPU trend");
    expect(markup).toContain("Synthetic upward trend");
  });
});
