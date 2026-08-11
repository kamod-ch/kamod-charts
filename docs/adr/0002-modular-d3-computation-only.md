# ADR 0002: Modular D3 for computation only

Status: Accepted for implementation  
Date: 2026-08-11

## Context

D3 is valuable for scales, domains, ticks, formatting, interpolation, and path generation, but the library must not let D3 manipulate the DOM. Installing the full `d3` package would increase bundle size and risk accidental imports of selection/axis APIs.

## Decision

Use only modular D3 packages required by implemented features:

- `d3-array`
- `d3-format`
- `d3-interpolate`
- `d3-scale`
- `d3-shape`
- `d3-time-format`

D3 is restricted to pure calculations:

- scale construction
- domain and extent helpers
- tick values and formatters
- interpolation
- SVG path strings for line/area/pie shapes

Forbidden:

- full `d3` package
- `d3-selection`
- imperative `d3-axis` rendering
- direct DOM mutation

## Consequences

Positive:

- Smaller and more tree-shakeable package.
- Preact remains the single SVG renderer.
- Public API can stay independent of D3 types.

Negative:

- Axis rendering and interaction behavior must be implemented in the charts package.
- Some D3 conveniences need wrapper utilities.

## Verification

- Package dependencies must list only modular D3 packages actually used by the current phase.
- Oxlint/import checks and source scans should reject full `d3`, `d3-selection`, and `d3-axis` imports unless a later ADR explicitly changes this.
- Public type tests should ensure common high-level APIs do not require D3-specific types.
