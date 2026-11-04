# Release checklist for @kamod-ch/charts v0.2.0

Do not publish until explicitly approved.

## Required checks

- [ ] `pnpm release:check` (full CI gate including docs build and bundle-size report)
- [ ] `pnpm check` (typecheck, lint, format, test, build, export verification)
- [ ] README and CHANGELOG reviewed
- [ ] Bundle-size report reviewed (`docs/bundle-size.md`)
- [ ] No runtime `react`, `react-dom`, or `preact/compat` imports in published code
- [ ] No full `d3`, `d3-selection`, or `d3-axis` imports in published code
- [ ] NPM auth confirmed only immediately before publishing

## Version and tag

1. Update `CHANGELOG.md` with the release date and notes.
2. On `main` with a clean working tree, from the repo root:

```sh
pnpm release          # patch
pnpm release:minor    # or minor / major
pnpm release:dry      # QA + pack check only, no bump or push
```

`scripts/release.mjs` (from [kamod-ch/.github](https://github.com/kamod-ch/.github)) bumps `packages/core`, commits, tags `v*`, and pushes. The tag version must match `@kamod-ch/charts` in `packages/core/package.json`.

## Publish

Preferred flow: push the release tag — `.github/workflows/publish.yml` runs `release:check` then `release:publish` via npm Trusted Publishing (OIDC), with optional `NPM_TOKEN` fallback.

Manual recovery only after explicit maintainer approval:

```sh
pnpm release:auth
pnpm release:publish
```

## After publish

- [ ] Verify [npm package page](https://www.npmjs.com/package/@kamod-ch/charts)
- [ ] Verify [docs site](https://kamod-ch.github.io/kamod-charts/) — `.github/workflows/gh-pages.yml` deploys on every push to `main`
- [ ] Create GitHub release notes from `CHANGELOG.md`
