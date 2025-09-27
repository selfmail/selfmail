// @ts-check

import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	i18n: {
		locales: ["es", "en", "pt", "fr", "de", "it", "ja", "ko", "zh-CN", "zh-TW"],
		defaultLocale: "en",
	},
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	server: {
		host: "0.0.0.0",
		allowedHosts: ["selfmail.app", "www.selfmail.app"],
	},
	devToolbar: {
		enabled: false,
	},
});
