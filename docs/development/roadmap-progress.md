# Roadmap progress (prompts 00–15)

Plan: [kamod-charts-cursor-prompts.md](./kamod-charts-cursor-prompts.md) · Rules: [implementation-contract.md](./implementation-contract.md) · RC: [release-candidate.md](./release-candidate.md)

| Prompt | Status |
| ---: | --- |
| 00–05 | **erledigt** |
| 06 | **erledigt** | consumer fixtures, `consumer:report`, `smoke:consumer`, dist inventory label |
| 07 | **erledigt** | `cartesian-layout-model` on Line/Area; stack memo; Bar geometry boundary documented |
| 08 | **erledigt** | x-index, rAF batching; scatter spatial index deferred (documented) |
| 09 | **erledigt** | RFC 0009; cartesian layout/domain/format props |
| 10 | **erledigt** | controlled `activeIndex`, `hiddenSeriesIds`, external legend recipe |
| 11 | **erledigt** | `ChartFormatProvider`, tooltip + axis Intl formatters |
| 12 | **erledigt** | `downsampleMinMax` + docs/tests/export |
| 13 | **erledigt** | sync hook, unit test, fixture, E2E smoke |
| 14 | **erledigt** | Devjobs analytics recipe |
| 15 | **erledigt** | `pnpm check`, smoke, RC doc, CHANGELOG Unreleased |

**Open (documented, not blocking checklist):** manual screenreader execution; optional Motion-Bar E2E.

## Verification snapshot

- `pnpm check` — pass (2026-10-18)
- Vitest — **495** tests (47 files)
- Playwright — **7** tests
- `pnpm smoke:consumer` — pass
- `pnpm docs:build` — pass
