import { readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const dist = resolve(import.meta.dirname, "../packages/core/dist");
const rows = [];

async function walk(dir) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry);
    const info = await stat(path);
    if (info.isDirectory()) {
      await walk(path);
    } else if (entry.endsWith(".js") || entry.endsWith(".css")) {
      rows.push([path.replace(`${dist}/`, ""), info.size]);
    }
  }
}

await walk(dist);
rows.sort((a, b) => a[0].localeCompare(b[0]));
const total = rows.reduce((sum, [, size]) => sum + size, 0);
const markdown = [
  "# Bundle size report",
  "",
  `Generated from current \`packages/core/dist\`. Total JS/CSS bytes: ${total} bytes.`,
  "",
  "| File | Bytes |",
  "| --- | ---: |",
  ...rows.map(([file, size]) => `| ${file} | ${size} |`),
  "",
].join("\n");

await writeFile(resolve(import.meta.dirname, "../docs/bundle-size.md"), markdown);
console.log(markdown);
