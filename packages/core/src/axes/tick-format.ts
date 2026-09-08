import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

export type TickValue = string | number | Date;
export type TickFormatter<TValue extends TickValue = TickValue> = (
  value: TValue,
  index: number,
) => string;

export interface TickFormatOptions<TValue extends TickValue = TickValue> {
  formatter?: TickFormatter<TValue>;
  formatSpecifier?: string;
}

/** SI-style compact labels (e.g. 52k) when magnitudes exceed typical left-margin width. */
export const inferNumericTickFormatSpecifier = (
  domain: readonly [number, number],
): string | undefined => {
  const span = Math.max(
    Math.abs(domain[0]),
    Math.abs(domain[1]),
    Math.abs(domain[1] - domain[0]),
  );

  return span >= 1_000 ? "~s" : undefined;
};

export const formatTick = <TValue extends TickValue>(
  value: TValue,
  index: number,
  options: TickFormatOptions<TValue> = {},
): string => {
  if (options.formatter) {
    return options.formatter(value, index);
  }

  if (value instanceof Date) {
    return timeFormat(options.formatSpecifier ?? "%b %d")(value);
  }

  if (typeof value === "number") {
    return format(options.formatSpecifier ?? "~g")(value);
  }

  return value;
};
