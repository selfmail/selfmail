// @ts-check

import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://selfmail.app",
	integrations: [mdx(), sitemap(), react()],

	i18n: {
		locales: ["es", "en", "pt", "nl", "it", "es", "fr", "de"],
		defaultLocale: "en",
		routing: {
			prefixDefaultLocale: false,
			fallbackType: "rewrite",
		},
	},

	output: "server",

	vite: {
		plugins: [tailwindcss()],
	},

	adapter: cloudflare(),
});
