const pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrame = 1;

// Preact 11 schedules effects with requestAnimationFrame and a 35ms timeout.
// jsdom removes those globals when the Vitest environment tears down, so a
// pending timeout throws ReferenceError. Queue frames as microtasks instead.
globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  const handle = nextFrame++;
  pendingFrames.set(handle, callback);
  queueMicrotask(() => {
    const queued = pendingFrames.get(handle);
    if (!queued) {
      return;
    }
    pendingFrames.delete(handle);
    queued(0);
  });
  return handle;
};

globalThis.cancelAnimationFrame = (handle: number): void => {
  pendingFrames.delete(handle);
};
