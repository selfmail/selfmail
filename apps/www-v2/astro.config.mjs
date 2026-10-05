// @ts-check
import node from "@astrojs/node";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://selfmail.app",
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    plugins: [
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        outputStructure: "message-modules",
        cookieName: "LOCALE",
        strategy: ["cookie", "preferredLanguage", "baseLocale"],
      }),
      tailwindcss(),
    ],
  },
});
