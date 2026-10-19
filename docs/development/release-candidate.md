# Release candidate checklist

**Status:** Review-ready WIP for `@kamod-ch/charts` **0.2.0+** (no publish/tag in this roadmap pass).

## Aggregate checks (2026-10-18)

| Check                                         | Command                                          | Result                                            |
| --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| Typecheck, lint, format, test, build, exports | `pnpm check`                                     | **Pass**                                          |
| Docs site                                     | `pnpm docs:build`                                | **Pass** (run after recipe changes)               |
| Browser smoke                                 | `pnpm test:browser`                              | **7** tests (Chromium)                            |
| Tarball consumer                              | `pnpm smoke:consumer`                            | **Pass** (`--skipLibCheck` isolated install)      |
| Consumer bundles                              | `KAMOD_CONSUMER_USE_DIST=1 pnpm consumer:report` | **Pass** → `docs/performance/consumer-bundles.md` |
| Browser benchmarks                            | `pnpm bench:browser`                             | Manual (preview on `:4173`)                       |

## Delivered roadmap scope (prompts 00–14)

- Playwright bar-click, a11y, sync fixture smoke; Vitest hydration & format tests.
- Performance baseline script + benchmark fixture; min/max downsampling export.
- Cartesian API: `yDomain`, margin, empty state, `format`, controlled selection, external legend (`hiddenSeriesIds`).
- `useSynchronizedCartesianSelection`, Devjobs + external legend docs recipes.
- Consumer fixtures (line, bar, donut, dashboard, motion-line) + pack smoke.

## Known limitations (not blocking RC doc)

- **Manual screenreader checklist** not executed ([manual-screenreader-checklist.md](./manual-screenreader-checklist.md)).
- **Scatter spatial index** not added (pointer path reuses candidates; defer unless benchmarks justify).
- **Bar layout** uses `bar-geometry` rather than `cartesian-layout-model` (intentional model boundary).
- Consumer **line/bar** entry sizes in the report are minimal re-export shells; **donut** / **motion** entries pull larger graphs — see `consumer-bundles.md`.
- Motion-Bar Playwright case still optional.

## Suggested next version

Patch/minor bump after product review; do not bump from this file alone.

## Changelog

See root `CHANGELOG.md` **Unreleased** section.
