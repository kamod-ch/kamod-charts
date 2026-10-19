# Implementation contract (Kamod Charts)

Binding rules for roadmap work in `kamod-charts`. Full prompt text: [kamod-charts-cursor-prompts.md](./kamod-charts-cursor-prompts.md).

## Stack and boundaries

- Preact-native, SVG-first; D3 for computation and geometry only (no `d3-selection`, no imperative DOM).
- No React, `react-dom`, `preact/compat`, Radix, or D3 DOM rendering.
- Motion stays optional via `@kamod-ch/charts/motion` and peers; static entries stay motion-free.
- Preserve SSR, hydration, responsive sizing, keyboard interaction, and reduced motion unless a task documents an intentional API change.

## Quality gates

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
node scripts/test-package-exports.mjs
```

Use `pnpm check` when it matches the above. Format only touched supported files with `pnpm exec oxfmt <paths>`.

## Repository hygiene

- Do not `git reset --hard`, `git clean`, or overwrite uncommitted user work.
- Tracked `packages/core/dist/**` is a partial release artifact (entry points + `.d.ts`); most chunk output is gitignored. Build may update tracked dist files — commit only intentional changes.
- Do not commit `node_modules`, Vitest caches, or local `tmp/` artifacts.

## Progress tracking

Update [roadmap-progress.md](./roadmap-progress.md) after each prompt (00–15): status, changes, checks, blockers, next step.
