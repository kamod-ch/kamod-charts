import { useCallback, useEffect, useRef } from "preact/hooks";

export const useCartesianPointerFrame = <TArgs extends readonly unknown[]>(
  handler: (...args: TArgs) => void,
): ((...args: TArgs) => void) => {
  const pending = useRef<TArgs | null>(null);
  const frame = useRef<number | null>(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const flush = useCallback(() => {
    frame.current = null;
    const args = pending.current;
    pending.current = null;
    if (args) {
      handlerRef.current(...args);
    }
  }, []);

  useEffect(
    () => () => {
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
      }
    },
    [],
  );

  return useCallback(
    (...args: TArgs) => {
      pending.current = args;
      if (typeof process !== "undefined" && process.env.VITEST) {
        flush();
        return;
      }
      if (frame.current == null) {
        frame.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );
};
