export type UserConfig = Record<string, unknown>;

export function defineConfig<T extends UserConfig>(config: T): T;
export function defineConfig<T extends UserConfig>(
  config: () => T | Promise<T>,
): () => T | Promise<T>;
export function defineConfig<T extends UserConfig>(
  config: T | (() => T | Promise<T>),
): T | (() => T | Promise<T>) {
  return typeof config === "function" ? config : config;
}
