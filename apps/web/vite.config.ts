import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [tailwindcss(), TanStackRouterVite({}), react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			port: 3001,
			host: true,
			open: env.VITE_OPEN_BROWSER === "true",
		},
		preview: {
			port: 3001,
			host: true,
		},
		build: {
			sourcemap: mode === "development",
		},
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
		},
	};
});
