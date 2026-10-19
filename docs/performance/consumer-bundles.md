# Consumer bundle sizes (minified)

Built from `packages/consumer-fixtures` with Vite production minify. **Preact is bundled** in each entry.

Reproduce: `pnpm consumer:report`

| Entry | JS bytes | gzip | brotli |
| --- | ---: | ---: | ---: |
| line.js | 166 | 147 | 122 |
| bar.js | 164 | 145 | 122 |
| donut.js | 7305 | 2649 | 2405 |
| dashboard.js | 240 | 185 | 158 |
