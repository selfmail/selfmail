import { serve } from "bun";
import type React from "react";

interface PageModule {
	default: React.ComponentType<unknown>;
}

interface RouterMatch {
	filePath: string;
	kind: "exact" | "catch-all" | "optional-catch-all" | "dynamic";
	name: string;
	pathname: string;
	src: string;
	params?: Record<string, string>;
	query?: Record<string, string>;
}

export class SimpleFramework {
	private router: Bun.FileSystemRouter;
	private routeMap: Map<string, string> = new Map();

	constructor(options: {
		pagesDir: string;
		port?: number;
		development?: boolean;
	}) {
		// Initialize Bun's FileSystemRouter
		this.router = new Bun.FileSystemRouter({
			style: "nextjs",
			dir: options.pagesDir,
			origin: `http://localhost:${options.port || 3000}`,
		});

		this.buildRouteMap(options.pagesDir);
		this.startServer(options);
	}

	private async buildRouteMap(pagesDir: string) {
		// Build a map of routes to file paths for client-side routing
		try {
			const files = await this.getFiles(pagesDir);
			for (const file of files) {
				const relativePath = file
					.replace(pagesDir, "")
					.replace(/\.[jt]sx?$/, "");
				let route = relativePath;

				// Convert index files to root routes
				if (route.endsWith("/index")) {
					route = route.replace("/index", "") || "/";
				}

				this.routeMap.set(route, file);
			}
		} catch (error) {
			console.error("Failed to build route map:", error);
		}
	}

	private async getFiles(dir: string): Promise<string[]> {
		const glob = new Bun.Glob("**/*.{tsx,jsx,ts,js}");
		const files: string[] = [];

		for await (const file of glob.scan({ cwd: dir, absolute: true })) {
			files.push(file);
		}

		return files;
	}

	private async loadPageComponent(
		filePath: string,
	): Promise<React.ComponentType<unknown> | null> {
		try {
			const module = (await import(filePath)) as PageModule;
			return module.default;
		} catch (error) {
			console.error(`Failed to load page component from ${filePath}:`, error);
			return null;
		}
	}

	private generateHTML(content: string, title = "Selfmail") {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/styles/output.css">
</head>
<body>
    <div id="root">${content}</div>
    <script type="module" src="/client.js"></script>
</body>
</html>`;
	}

	private async handleRequest(req: Request): Promise<Response> {
		const url = new URL(req.url);

		// Handle static assets
		if (
			url.pathname.startsWith("/styles/") ||
			url.pathname.startsWith("/assets/") ||
			url.pathname === "/client.js"
		) {
			return this.handleStaticAsset(url.pathname);
		}

		// Try to match route
		const match = this.router.match(req) as RouterMatch | null;

		if (!match) {
			return new Response("Not Found", { status: 404 });
		}

		// Load the page component
		const PageComponent = await this.loadPageComponent(match.filePath);

		if (!PageComponent) {
			return new Response("Page component not found", { status: 500 });
		}

		// Render the React component to string (no SSR, just static HTML shell)
		// For a true SPA without SSR, we could just send an empty div and let client hydrate
		const html = this.generateHTML("", "Selfmail");

		return new Response(html, {
			headers: { "Content-Type": "text/html" },
		});
	}

	private async handleStaticAsset(pathname: string): Promise<Response> {
		console.log(`🔍 Requesting static asset: ${pathname}`);
		try {
			// Handle client.js specifically - serve from dist folder
			if (pathname === "/client.js") {
				const file = Bun.file("./dist/client.js");
				if (await file.exists()) {
					console.log("✅ Serving client.js from dist");
					return new Response(file, {
						headers: { "Content-Type": "application/javascript" },
					});
				}
				// Fallback to source file in development
				const srcFile = Bun.file("./src/client.ts");
				if (await srcFile.exists()) {
					console.log("✅ Serving client.js from src (fallback)");
					return new Response(srcFile, {
						headers: { "Content-Type": "application/javascript" },
					});
				}
			}

			// Handle styles from dist folder first, then src
			if (pathname.startsWith("/styles/")) {
				const distFile = Bun.file(`./dist${pathname}`);
				if (await distFile.exists()) {
					console.log(`✅ Serving ${pathname} from dist`);
					return new Response(distFile, {
						headers: { "Content-Type": "text/css" },
					});
				}

				// Try src folder
				const srcFile = Bun.file(`./src${pathname}`);
				if (await srcFile.exists()) {
					console.log(`✅ Serving ${pathname} from src`);
					return new Response(srcFile, {
						headers: { "Content-Type": "text/css" },
					});
				}
			}

			const filePath = `./src${pathname}`;
			const file = Bun.file(filePath);

			if (await file.exists()) {
				console.log(`✅ Serving ${pathname} from src`);
				return new Response(file);
			}

			console.log(`❌ File not found: ${pathname}`);
			return new Response("Not Found", { status: 404 });
		} catch (error) {
			console.error(`❌ Error serving ${pathname}:`, error);
			return new Response("Not Found", { status: 404 });
		}
	}

	private startServer(options: { port?: number; development?: boolean }) {
		const server = serve({
			port: options.port || 3000,
			fetch: (req) => this.handleRequest(req),
			development: options.development && {
				hmr: true,
				console: true,
			},
		});

		console.log(`🚀 Server running at ${server.url}`);
	}
}
