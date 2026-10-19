#!/usr/bin/env node
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "packages/consumer-fixtures/dist");

execSync("pnpm --filter @kamod-ch/charts build", { cwd: root, stdio: "inherit" });
execSync("pnpm --filter @kamod-ch/charts-consumer-fixtures build", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, KAMOD_CONSUMER_USE_DIST: "1" },
});

const files = ["line.js", "bar.js", "donut.js", "dashboard.js", "motion-line.js"];
const rows = [];

for (const file of files) {
  const bytes = await readFile(join(dist, file));
  rows.push({
    file,
    bytes: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  });
}

const out = join(root, "docs/performance/consumer-bundles.md");
await mkdir(resolve(out, ".."), { recursive: true });
const markdown = [
  "# Consumer bundle sizes (minified)",
  "",
  "Built from `packages/consumer-fixtures` with Vite production minify. **Preact is bundled** in each entry.",
  "",
  "Reproduce: `pnpm consumer:report`",
  "",
  "| Entry | JS bytes | gzip | brotli |",
  "| --- | ---: | ---: | ---: |",
  ...rows.map((row) => `| ${row.file} | ${row.bytes} | ${row.gzip} | ${row.brotli} |`),
  "",
].join("\n");

await writeFile(out, markdown);
console.log(markdown);
