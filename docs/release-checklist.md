# Release checklist for @kamod-ch/charts v0.1.0

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

1. Ensure `packages/core/package.json` version matches the intended release (e.g. `0.1.0`).
2. Update `CHANGELOG.md` with the release date and notes.
3. Commit, then tag: `git tag v0.1.0` and push tags.

## Publish

Publishing requires explicit maintainer approval after all checks above pass.

```sh
pnpm release:auth
pnpm release:publish
```

Or push a version tag — `.github/workflows/publish.yml` runs `release:check` then publishes when `NPM_TOKEN` is configured.

Manual publish from the package directory:

```sh
pnpm --filter @kamod-ch/charts publish --access public
```

## After publish

- [ ] Verify [npm package page](https://www.npmjs.com/package/@kamod-ch/charts)
- [ ] Verify [docs site](https://kamod-ch.github.io/kamod-charts/) — `.github/workflows/gh-pages.yml` deploys on every push to `main`
- [ ] Create GitHub release notes from `CHANGELOG.md`
