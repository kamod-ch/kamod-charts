# Contributing

## Development

```sh
pnpm install
pnpm check
```

## Rules

- Use Preact only.
- Do not import `react`, `react-dom`, or `preact/compat`.
- Do not install full `d3`.
- Do not use `d3-selection` or imperative axis rendering.
- Keep public APIs generic and D3-independent.
- Keep SSR paths free of unguarded browser APIs.

## Quality gates

Before sending changes, run:

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm test:exports
pnpm size:report
```

No commits or publishing should be done by automation without maintainer approval.
