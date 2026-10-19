#!/usr/bin/env node
/**
 * Pack @kamod-ch/charts and smoke-install into a temp consumer (no workspace links).
 */
import { execSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packDir = join(root, "packages/core");
const tarball = execSync("pnpm pack --pack-destination /tmp", {
  cwd: packDir,
  encoding: "utf8",
}).trim();
const tarballPath = tarball.split("\n").pop();

const work = await mkdtemp(join(tmpdir(), "kamod-charts-smoke-"));
const consumer = join(work, "consumer");
await mkdir(consumer, { recursive: true });
await writeFile(
  join(consumer, "package.json"),
  JSON.stringify(
    {
      name: "kamod-charts-smoke-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@kamod-ch/charts": `file:${tarballPath}`,
        preact: "^10.29.8",
      },
      devDependencies: {
        typescript: "^6.0.3",
      },
    },
    null,
    2,
  ),
);

await writeFile(
  join(consumer, "index.ts"),
  `import { LineChart } from "@kamod-ch/charts";
export const chart = LineChart;
`,
);

execSync("npm install --ignore-scripts", { cwd: consumer, stdio: "inherit" });
execSync(
  "npx tsc --noEmit --skipLibCheck index.ts --moduleResolution bundler --module esnext --jsx react-jsx --jsxImportSource preact",
  {
    cwd: consumer,
    stdio: "inherit",
  },
);

await rm(work, { recursive: true, force: true });
console.log("consumer-smoke: pack install + typecheck OK");
