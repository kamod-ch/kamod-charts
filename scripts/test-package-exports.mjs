import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(await readFile(resolve(root, "packages/core/package.json"), "utf8"));

for (const [name, entry] of Object.entries(packageJson.exports)) {
  if (name === "./theme.css") {
    continue;
  }

  const importPath = typeof entry === "string" ? entry : entry.import;
  if (!importPath) {
    throw new Error(`Export ${name} has no import path`);
  }

  await import(resolve(root, "packages/core", importPath));
}

console.log("package exports ok");
