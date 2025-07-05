import { type ChildProcess, spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { $ } from "bun";
import { consola } from "consola";

globalThis.devmode = true;

let serverProcess: ChildProcess | null = null;

async function cleanup() {
	if (serverProcess) {
		consola.log("Shutting down SMTP server...");
		serverProcess.kill("SIGTERM");
		await new Promise((resolve) => setTimeout(resolve, 2000));
		if (!serverProcess.killed) {
			serverProcess.kill("SIGKILL");
		}
		serverProcess = null;
	}
}

async function startServer() {
	consola.log("Development mode enabled. Cleaning up dist directory...");

	await rm(`${process.cwd()}/dist`, { recursive: true, force: true });

	consola.log("Building the SMTP server...");

	await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		sourcemap: "inline",
		minify: false,
		target: "node",
		env: "inline",
	});

	consola.success("Starting SMTP Server in development mode...");

	const path = await $`which node`.quiet();

	if (path.exitCode !== 0) {
		consola.error(
			"Node.js not found. Please ensure it is installed and in your PATH.",
		);
		process.exit(1);
	}

	const nodePath = path.stdout.toString();

	serverProcess = spawn("sudo", ["-E", nodePath, "dist/index.js"], {
		stdio: "inherit",
		env: { ...process.env },
	});

	serverProcess.on("exit", (code: number) => {
		consola.log(`SMTP server exited with code ${code}`);
		serverProcess = null;
	});
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
	await cleanup();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	process.exit(0);
});

await startServer();
