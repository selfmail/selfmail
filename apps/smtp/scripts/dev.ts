import { rm } from "node:fs/promises";
import { consola } from "consola";

globalThis.devmode = true;

consola.log("Development mode enabled. Cleaning up dist directory...");

await rm(`${process.cwd()}/dist`);

await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	sourcemap: "inline",
	minify: false,
	target: "node",
	env: "inline",
});
