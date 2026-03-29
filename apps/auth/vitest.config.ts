import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^#\/(.*)$/,
        replacement: `${srcDir}$1`,
      },
    ],
  },
  test: {
    environment: "node",
  },
});
