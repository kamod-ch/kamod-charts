# ADR 0001: Preact-native SVG rendering

Status: Accepted for implementation  
Date: 2026-08-11

## Context

`@kamod-ch/charts` must be a Preact-native chart library. The SVG DOM must be owned by Preact, and the package must not use React, React DOM, `preact/compat`, or React chart wrappers.

## Decision

Render all chart structure with Preact components and SVG elements.

- Use Preact JSX with `jsxImportSource: "preact"`.
- Treat `preact` as a peer dependency.
- Never import `react`, `react-dom`, or `preact/compat`.
- Do not use imperative SVG mutations through D3 or other DOM libraries.
- Render axes, ticks, grid lines, labels, series, and interaction layers as Preact components.

## Consequences

Positive:

- SSR output is deterministic and inspectable.
- Preact owns hydration and updates.
- Components remain composable in Preact applications without compatibility overhead.
- The runtime dependency tree can remain small.

Negative:

- Some mature React chart ecosystem pieces cannot be reused.
- D3 examples that rely on selections/axis generators must be translated into declarative components.
- We must implement our own accessibility and interaction layers.

## Verification

Before release and during relevant phases:

- Search source for forbidden imports: `react`, `react-dom`, `preact/compat`, `d3-selection`, full `d3`.
- Add package export tests that import from Preact-native entry points.
- Add SSR render tests using Preact render-to-string.
