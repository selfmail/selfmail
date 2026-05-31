import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: {
		dedupe: ["@tanstack/react-router", "react", "react-dom"],
	},
	ssr: {
		noExternal: [
			"@base-ui/react",
			"@base-ui/utils",
			"@tanstack/react-router",
			"agentation",
		],
	},
	plugins: [
		tanstackStart(),
		devtools({
			injectSource: {
				enabled: false,
			},
		}),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			outputStructure: "message-modules",
			cookieName: "LOCALE",
			strategy: ["cookie", "preferredLanguage", "baseLocale"],
		}),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		viteReact({}),
	],
});

export default config;
