// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import bun from 'astro-bun-adapter';

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    i18n: {
        locales: ["es", "en", "pt", "fr", "de", "it", "ja", "ko", "zh-CN", "zh-TW"],
        defaultLocale: "en",
    },
    output: 'server',
  adapter: node({
    mode: "standalone",
  }),
});