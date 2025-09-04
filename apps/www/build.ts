import { $ } from "bun";

// Generate routes first
console.log("🔄 Generating routes...");
await $`bun src/generate-routes.ts`;

// Build Tailwind CSS
console.log("🎨 Building Tailwind CSS...");
await $`bunx @tailwindcss/cli -i ./src/input.css -o ./dist/styles/output.css`;

// Build the client-side bundle
console.log("🔄 Building client bundle...");
const buildResult = await Bun.build({
	entrypoints: ["./src/client.ts"],
	outdir: "./dist",
	naming: "[dir]/client.js",
	minify: process.env.NODE_ENV === "production",
	sourcemap: process.env.NODE_ENV !== "production" ? "external" : "none",
	splitting: false,
	format: "esm",
	target: "browser",
});

if (!buildResult.success) {
	console.error("Build failed:");
	for (const message of buildResult.logs) {
		console.error(message);
	}
	process.exit(1);
}

console.log("✅ Client bundle built successfully!");
console.log("✅ Tailwind CSS compiled successfully!");
console.log("🎉 Build complete!");
