# ADR 0005: Package structure and exports

Status: Accepted for implementation  
Date: 2026-08-11

## Context

The requested package is `@kamod-ch/charts`. The repository starts empty, while nearby Kamod projects often use pnpm workspaces with publishable packages under `packages/*`.

## Decision

Create a pnpm workspace and place the publishable package in `packages/core`.

Planned root files:

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
tsconfig.base.json
docs/
packages/core/
```

Planned package files:

```text
packages/core/
├── src/
├── tests/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

Use ESM and tree-shakeable subpath exports. Initial export target:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./line": {
    "types": "./dist/charts/line-chart.d.ts",
    "import": "./dist/charts/line-chart.js"
  },
  "./area": {
    "types": "./dist/charts/area-chart.d.ts",
    "import": "./dist/charts/area-chart.js"
  },
  "./bar": {
    "types": "./dist/charts/bar-chart.d.ts",
    "import": "./dist/charts/bar-chart.js"
  },
  "./pie": {
    "types": "./dist/charts/pie-chart.d.ts",
    "import": "./dist/charts/pie-chart.js"
  },
  "./scatter": {
    "types": "./dist/charts/scatter-chart.d.ts",
    "import": "./dist/charts/scatter-chart.js"
  },
  "./core": {
    "types": "./dist/core/index.d.ts",
    "import": "./dist/core/index.js"
  },
  "./theme.css": "./dist/theme/tokens.css"
}
```

Exact generated paths must be confirmed when build entries exist.

## Consequences

Positive:

- Aligns with Kamod package conventions.
- Allows docs/examples packages later.
- Keeps package exports tree-shakeable.

Negative:

- A workspace is slightly heavier than a single-package repository.
- Subpath export maintenance requires build-entry tests.

## Verification

- Phase 1 should add base package structure but only exports for implemented modules.
- Later phases add chart subpath exports as files exist.
- Phase 8 must include package export tests for every documented subpath.
