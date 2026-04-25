import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const plugins = [
	devtools(),
	paraglideVitePlugin({
		project: "./project.inlang",
		outdir: "./src/paraglide",
		cookieName: "LOCALE",
		strategy: ["cookie", "preferredLanguage", "baseLocale"],
	}),
	tsconfigPaths({ projects: ["./tsconfig.json"] }),
	tailwindcss(),
	tanstackStart(),
	viteReact({
		babel: {
			plugins: ["babel-plugin-react-compiler"],
		},
	}),
] as unknown as PluginOption[];

const config = defineConfig({
	resolve: {
		dedupe: ["react", "react-dom"],
	},
	ssr: {
		noExternal: ["@base-ui/react", "@posthog/react", "agentation"],
	},
	plugins,
});

export default config;
