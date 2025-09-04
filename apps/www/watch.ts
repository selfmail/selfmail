import { $ } from "bun";
import { watch } from "fs";
import { join } from "path";

// Simple debounce implementation
function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: Timer;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

class ProjectWatcher {
	private isBuilding = false;
	private watchers: Array<{ close: () => void }> = [];

	constructor() {
		console.log("🔍 Starting file watcher...");
		this.startWatching();
	}

	private async buildProject() {
		if (this.isBuilding) {
			console.log("⏳ Build already in progress, skipping...");
			return;
		}

		this.isBuilding = true;
		console.log("\n🔄 File changes detected, rebuilding...");

		try {
			// Generate routes
			console.log("📁 Generating routes...");
			await $`bun src/generate-routes.ts`;

			// Build Tailwind CSS
			console.log("🎨 Building Tailwind CSS...");
			await $`bunx @tailwindcss/cli -i ./src/input.css -o ./dist/styles/output.css --watch=false`;

			// Build client bundle
			console.log("📦 Building client bundle...");
			const buildResult = await Bun.build({
				entrypoints: ["./src/client.ts"],
				outdir: "./dist",
				naming: "[dir]/client.js",
				minify: false,
				sourcemap: "external",
				splitting: false,
				format: "esm",
				target: "browser",
			});

			if (!buildResult.success) {
				console.error("❌ Build failed:");
				for (const message of buildResult.logs) {
					console.error(message);
				}
			} else {
				console.log("✅ Build completed successfully!");
			}
		} catch (error) {
			console.error("❌ Build error:", error);
		} finally {
			this.isBuilding = false;
		}
	}

	private debouncedBuild = debounce(() => this.buildProject(), 1000);

	private isRelevantFile(filename: string | null): boolean {
		if (!filename || filename.includes("generated-routes")) return false;
		return (
			filename.endsWith(".tsx") ||
			filename.endsWith(".ts") ||
			filename.endsWith(".jsx") ||
			filename.endsWith(".js") ||
			filename.endsWith(".css") ||
			filename.includes("pages") ||
			filename.includes("components")
		);
	}

	private startWatching() {
		// Initial build
		this.buildProject();

		// Watch directories
		const watchDirectories = [
			"./src/pages",
			"./src/components",
			"./src/styles",
			"./src",
		];

		watchDirectories.forEach((dir) => {
			try {
				const watcher = watch(
					dir,
					{ recursive: true },
					(eventType, filename) => {
						if (this.isRelevantFile(filename)) {
							console.log(`📝 File ${eventType}: ${join(dir, filename || "")}`);
							this.debouncedBuild();
						}
					},
				);

				this.watchers.push(watcher);
				console.log(`👀 Watching directory: ${dir}`);
			} catch (error) {
				console.warn(`⚠️  Could not watch directory ${dir}:`, error);
			}
		});

		console.log("👀 File watcher is active...");
		console.log("Press Ctrl+C to stop");

		// Handle graceful shutdown
		process.on("SIGINT", () => {
			console.log("\n🛑 Stopping watcher...");
			this.watchers.forEach((watcher) => {
				try {
					watcher.close();
				} catch (error) {
					console.error("Error closing watcher:", error);
				}
			});
			process.exit(0);
		});
	}
}

// Start the watcher
new ProjectWatcher();
