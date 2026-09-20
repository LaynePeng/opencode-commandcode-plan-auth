import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  platform: "neutral",
  // Provided by the opencode runtime / resolved from the plugin's node_modules.
  // Bundling them would duplicate effect, the SDK, and the plugin contract.
  external: ["@opencode/plugin", "@opencode/schema", "@opencode/client", "@opencode/ai", "effect", "zod"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
