import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
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
