import { describe, expect, it } from "vitest";
import { normalizeAccessor, readAccessor } from "../src/core";

interface Datum {
  date: Date;
  revenue?: number | null;
  nested: {
    value: number;
  };
}

describe("accessors", () => {
  const datum: Datum = {
    date: new Date("2026-01-01T00:00:00.000Z"),
    revenue: null,
    nested: { value: 42 },
  };

  it("normalizes object-key accessors", () => {
    const accessor = normalizeAccessor<Datum, number | null | undefined>("revenue");

    expect(accessor(datum, 0)).toBeNull();
  });

  it("normalizes callback accessors", () => {
    const accessor = normalizeAccessor<Datum, number>((item, index) => item.nested.value + index);

    expect(accessor(datum, 2)).toBe(44);
  });

  it("reads date, number, and missing values without coercion", () => {
    expect(readAccessor(datum, 0, "date")).toEqual(new Date("2026-01-01T00:00:00.000Z"));
    expect(readAccessor(datum, 0, "revenue")).toBeNull();
  });
});
