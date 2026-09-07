# @kamod-ch/charts docs

PreactPress documentation and kitchen sink for Kamod Charts.

## Scripts

```sh
pnpm --filter @kamod-ch/charts-docs dev
pnpm --filter @kamod-ch/charts-docs build
pnpm --filter @kamod-ch/charts-docs preview
pnpm --filter @kamod-ch/charts-docs typecheck
pnpm --filter @kamod-ch/charts-docs lint
pnpm --filter @kamod-ch/charts-docs format:check
```

## Structure

- `/` — Chart Gallery kitchen sink
- `/charts/*` — Reference Studio detail pages
- `/playground/` — Chart Lab interactive playground
- `/foundations/*` — data, theming, responsive, accessibility
- `/getting-started/`, `/examples/`, `/api/` — docs entry points

Engineering ADRs, RFCs, and release artifacts remain in the repository root [`docs/`](../../docs/) folder and are not part of this PreactPress app.
