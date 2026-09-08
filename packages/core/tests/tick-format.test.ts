import { format } from "d3-format";
import { describe, expect, it } from "vitest";
import { inferNumericTickFormatSpecifier } from "../src/axes/tick-format";

describe("inferNumericTickFormatSpecifier", () => {
  it("uses SI format for large numeric domains", () => {
    expect(inferNumericTickFormatSpecifier([0, 52_100])).toBe("~s");
    expect(format("~s")(50_000)).toBe("50k");
  });

  it("keeps default formatting for small numeric domains", () => {
    expect(inferNumericTickFormatSpecifier([0, 20])).toBeUndefined();
  });
});
