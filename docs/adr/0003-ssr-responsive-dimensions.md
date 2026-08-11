# ADR 0003: SSR-safe responsive dimensions

Status: Accepted for implementation  
Date: 2026-08-11

## Context

Charts must support SSR and hydration without mismatches. Responsive charts need real client-side measurements, but browser APIs are unavailable during SSR and can cause non-deterministic initial markup.

## Decision

Support two dimension modes:

1. Fixed mode:
   - User provides `width` and `height`.
   - Server and client render identical SVG dimensions.

2. Responsive mode:
   - User provides `height` and `initialWidth`.
   - Server renders using `initialWidth`.
   - Client initial render also uses `initialWidth`.
   - After hydration, a guarded `ResizeObserver` measures the container.
   - Resize updates are batched with `requestAnimationFrame` when available.

No code may access `window`, `document`, `ResizeObserver`, `matchMedia`, layout measurements, or animation APIs unless guarded behind runtime checks and effects that do not run during SSR.

## Consequences

Positive:

- Deterministic SSR.
- Responsive charts hydrate safely.
- Consumers can choose fully deterministic fixed-size rendering.

Negative:

- Responsive charts may briefly render at `initialWidth` before measuring.
- Consumers must choose a sensible `initialWidth` for server output.

## Verification

Phase 1 must include tests for:

- Fixed-dimension SSR markup.
- Responsive SSR using `initialWidth`.
- No unguarded browser API access during server render.
- Client resize observer fallback behavior when `ResizeObserver` is unavailable.
