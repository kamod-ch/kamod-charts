import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = resolve(process.cwd(), "src");

const collectFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "motion") {
        continue;
      }
      files.push(...(await collectFiles(path)));
      continue;
    }

    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(path);
    }
  }

  return files;
};

describe("static bundle boundary", () => {
  it("keeps @kamod-ch/motion out of the static source graph", async () => {
    const files = await collectFiles(srcRoot);
    const offenders: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      if (
        /from ["']@kamod-ch\/motion(?:\/[^"']*)?["']/.test(source) ||
        /from ["']motion(?:\/[^"']*)?["']/.test(source)
      ) {
        offenders.push(relative(srcRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });
});
