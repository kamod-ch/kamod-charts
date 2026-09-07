# Repository documentation

This folder holds **maintainer and engineering** docs. End-user documentation lives in [`packages/docs/`](../packages/docs/) (PreactPress site).

## Layout

| Path | Purpose |
| --- | --- |
| [`release-checklist.md`](release-checklist.md) | Required gates before publishing `@kamod-ch/charts` |
| [`bundle-size.md`](bundle-size.md) | Generated bundle report (committed; verified in CI) |
| [`adr/`](adr/) | Architecture decision records |
| [`rfc/`](rfc/) | Phase RFCs from initial design |
| [`performance/`](performance/) | SVG dashboard performance targets |
| [`browser-support.md`](browser-support.md) | Supported browsers |

Active implementation plans are in [`plans/`](../plans/).

## User docs

```sh
pnpm docs:dev    # PreactPress dev server
pnpm docs:build  # production build
```
