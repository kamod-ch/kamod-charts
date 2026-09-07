import { act, render, waitFor } from "./testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chart } from "../src/core";

class ResizeObserverMock implements ResizeObserver {
  static instances: ResizeObserverMock[] = [];

  readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  emit(width: number): void {
    this.callback(
      [
        {
          contentRect: {
            width,
            height: 200,
            x: 0,
            y: 0,
            top: 0,
            right: width,
            bottom: 200,
            left: 0,
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
}

describe("responsive Chart", () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    ResizeObserverMock.instances = [];
  });

  it("measures responsive width after mount without changing initial markup contract", async () => {
    globalThis.ResizeObserver = ResizeObserverMock;
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      callback(0);
      return 1;
    };
    globalThis.cancelAnimationFrame = vi.fn();

    const { container } = render(
      <Chart data={[{ value: 1 }]} height={180} initialWidth={320} responsive />,
    );
    const svg = () => container.querySelector("svg");

    expect(svg()?.getAttribute("width")).toBe("320");
    expect(ResizeObserverMock.instances).toHaveLength(1);

    act(() => {
      ResizeObserverMock.instances[0]?.emit(512);
    });

    await waitFor(() => {
      expect(svg()?.getAttribute("width")).toBe("512");
    });
  });

  it("does not require ResizeObserver", () => {
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;

    const { container } = render(<Chart data={[]} height={180} initialWidth={300} responsive />);

    expect(container.querySelector("svg")?.getAttribute("width")).toBe("300");
  });
});
