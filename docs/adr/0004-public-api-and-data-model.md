# ADR 0004: Public API and data model

Status: Accepted for implementation  
Date: 2026-08-11

## Context

The chart library needs both high-level and low-level APIs. Users should not need D3 knowledge for normal usage. Types must support object-key access, callback access, dates, numbers, categories, missing values, stable series IDs, interactions, and chart orientation.

## Decision

Define public, generic, engine-independent types in `core` during Phase 1.

Initial direction:

```ts
export type ChartPrimitiveValue = string | number | Date;
export type ChartNullableValue<T extends ChartPrimitiveValue = ChartPrimitiveValue> =
  | T
  | null
  | undefined;

export type DataAccessor<TDatum, TValue = ChartPrimitiveValue> =
  | Extract<keyof TDatum, string | number>
  | ((datum: TDatum, index: number) => TValue);

export type NumericDataAccessor<TDatum> = DataAccessor<TDatum, number | null | undefined>;
export type DomainDataAccessor<TDatum> = DataAccessor<TDatum, ChartNullableValue>;

export interface ChartSeries<TDatum> {
  id: string;
  label?: string;
  value: NumericDataAccessor<TDatum>;
  color?: string;
  hidden?: boolean;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ChartOrientation = "vertical" | "horizontal";

export interface ChartInteraction<TDatum> {
  datum: TDatum;
  seriesId: string;
  index: number;
  value: number | null;
  x: number;
  y: number;
  nativeEvent?: PointerEvent | KeyboardEvent;
}
```

Accessor normalization should convert keys and callbacks into uniform functions internally. Missing values must be represented explicitly, not coerced to zero unless a specific chart option says so.

High-level chart APIs may use ergonomic names such as `xKey` and series entries with `key`, but internally these should normalize to the common accessor and series model.

## Consequences

Positive:

- Users get type inference from their datum type.
- D3 internals remain replaceable.
- Missing values can be handled consistently across chart types.
- Stable IDs support accessibility, animation, and interactions.

Negative:

- Key extraction from `keyof TDatum` cannot perfectly validate runtime data shape.
- Some chart-specific data models, especially pie and stacked charts, will need extensions rather than overloading the core series type too heavily.

## Verification

- Type tests or compile-time examples should cover key and callback accessors.
- Unit tests should cover missing values and stable normalized accessors.
- Public declarations should not expose D3 scale/path types in high-level APIs.
