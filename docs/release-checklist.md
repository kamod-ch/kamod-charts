# Release checklist for v0.1.0

Do not publish until explicitly approved.

## Required checks

- [ ] `pnpm check`
- [ ] `pnpm test:exports`
- [ ] `pnpm size:report`
- [ ] No runtime `react`, `react-dom`, or `preact/compat` imports.
- [ ] No full `d3`, `d3-selection`, or `d3-axis` imports.
- [ ] README reviewed.
- [ ] Changelog reviewed.
- [ ] Bundle-size report reviewed.
- [ ] Public exports reviewed.
- [ ] NPM auth confirmed only immediately before publishing.

## Publishing

Publishing command, when approved:

```sh
pnpm --filter @kamod-ch/charts publish --access public
```
