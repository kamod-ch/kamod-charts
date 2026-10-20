import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const exportRoot = resolve(process.cwd(), "src/export");

describe("export entry isolation", () => {
  it("does not import motion packages", async () => {
    const index = await readFile(resolve(exportRoot, "index.ts"), "utf8");
    const serialize = await readFile(resolve(exportRoot, "serialize.ts"), "utf8");
    const download = await readFile(resolve(exportRoot, "download.ts"), "utf8");
    const combined = `${index}\n${serialize}\n${download}`;
    expect(combined).not.toMatch(/@kamod-ch\/motion/);
    expect(combined).not.toMatch(/from ["']motion/);
  });
});
