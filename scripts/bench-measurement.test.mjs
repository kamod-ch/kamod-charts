import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { median, p95, validateBenchRunTimings } from "./bench-measurement.mjs";

describe("validateBenchRunTimings", () => {
  const nav = 100;

  it("accepts initial-ready only when update is not expected", () => {
    assert.equal(
      validateBenchRunTimings({
        navigationStart: nav,
        initialReadyAt: 150,
        updateStartAt: null,
        updateCompleteAt: null,
        expectUpdate: false,
      }),
      null,
    );
  });

  it("rejects updateComplete before updateStart (regression: markUpdated before paint)", () => {
    const error = validateBenchRunTimings({
      navigationStart: nav,
      initialReadyAt: 120,
      updateStartAt: 200,
      updateCompleteAt: 199,
      expectUpdate: true,
    });
    assert.match(error, /updateCompleteAt precedes updateStartAt/);
  });

  it("rejects missing update phases instead of treating as zero", () => {
    assert.equal(
      validateBenchRunTimings({
        navigationStart: nav,
        initialReadyAt: 120,
        updateStartAt: null,
        updateCompleteAt: null,
        expectUpdate: true,
      }),
      "missing or invalid updateStartAt",
    );
  });

  it("rejects negative durations", () => {
    assert.equal(
      validateBenchRunTimings({
        navigationStart: nav,
        initialReadyAt: 90,
        updateStartAt: null,
        updateCompleteAt: null,
        expectUpdate: false,
      }),
      "initialReadyAt precedes navigationStart",
    );
  });
});

describe("median/p95", () => {
  it("returns null for empty or invalid samples", () => {
    assert.equal(median([]), null);
    assert.equal(median([NaN, -1]), null);
  });

  it("computes p95 with coarse sample warning left to caller", () => {
    assert.equal(p95([1, 2, 3, 4, 100]), 100);
  });
});
