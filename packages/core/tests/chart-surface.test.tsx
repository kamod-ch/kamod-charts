import renderToString from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { ChartSurface } from "../src/core/chart-surface";

describe("ChartSurface accessibility", () => {
  it("links title and description via aria-labelledby and aria-describedby", () => {
    const markup = renderToString(
      <ChartSurface
        id="chart-1"
        title="Revenue"
        description="Monthly totals"
        width={320}
        height={200}
      />,
    );

    expect(markup).toContain('aria-labelledby="chart-1-title"');
    expect(markup).toContain('aria-describedby="chart-1-description"');
    expect(markup).not.toContain('aria-labelledby="chart-1-title chart-1-description"');
  });
});
