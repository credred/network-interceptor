import { configDefaults, defineConfig, UserConfig } from "vitest/config";

export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
  },
  test: {
    globals: true,
    // disable threads on GH actions to speed it up
    threads: !process.env.GITHUB_ACTIONS,
    environmentMatchGlobs: [["packages/{ui}/**", "jsdom"]],
    sequence: {
      hooks: "list",
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
      exclude: [...(configDefaults.coverage.exclude || [])],
    },
  },
}) as UserConfig;
