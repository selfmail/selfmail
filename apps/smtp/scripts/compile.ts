/* 
	This is a script to compile every typescript file into
	javascript files for haraka. Haraka has some special 
	things we have to handle. For example, inputs and
	status codes as well as typesafety.
*/

import { type ConsolaInstance, consola } from "consola";
import { transform } from "esbuild";
import { statSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "../types/plugin.js";

type CompilePlugin = Plugin & {
	code: string
}

// compile ts to js, used for compiling the plugins from the /src/ folder to js into the plugins folder
async function compileTypeScript(code: string) {
	const regex = /import \{[^}]*\} from "..\/..\/types\/status\.js";?/g;

	// biome-ignore lint/style/noParameterAssign: otherwise, it would not work
	code = code.replace(regex, '');

	const result = await transform(code, {
		loader: "ts",
		format: "cjs",
	});
	return result.code;
}



// get the content of every plugin.ts file inside the /src/ folder
async function getAllPluginFiles({
	dirPath = "./src",
	pluginArray = [],
	consola
}: {
	dirPath?: string,
	pluginArray?: CompilePlugin[],
	consola: ConsolaInstance
}) {
	const files = await readdir(dirPath);
	for (const file of files) {
		const filePath = path.join(dirPath, file);

		if (statSync(filePath).isDirectory()) {
			// every plugin.ts file is a plugin
			const subfolder = await readdir(filePath);

			for await (const subfolderFile of subfolder) {
				// check if the file is an plugin, if not, go to the next file
				if (subfolderFile === "plugin.ts") {

					const pluginFile = (await readFile(`./${filePath}/plugin.ts`)).toString()
					consola.log(`Read file plugin.ts in ${filePath}`)

					// modify this plugin file, remove the status import
					const plugin = await compileTypeScript(pluginFile)

					const pluginImport = await import(`../src/${file}/plugin.ts`)
					const pluginInformation = pluginImport.default.plugin as Plugin

					pluginArray.push({ ...pluginInformation, code: plugin })
				}
			}
		} else {
			// TODO: implement the function for a normal file
		}
	}
	return pluginArray;
}

// save the plugin into the /plugins/ folder and register them in the plugins file
async function savePlugins(plugins: CompilePlugin[]) {
	// save every plugin in the plugins folder
	for (const plugin of plugins) {
		// save the file into the plugins folder
		await writeFile(`./plugins/${plugin.name}.js`, plugin.code)
		consola.success(`Saved the plugin ${plugin.name} successfully! Please insert now ${plugin.name} into the plugins file (/config/plugins) in the right order!`)
	}
}


// function to use consola and the other async functions
(async () => {
	const consola = (await import("consola")).default;
	consola.start("Starting the compiling process.")
	const plugins = await getAllPluginFiles({
		consola
	})
	consola.info("Got every plugin.ts files. Starting saving them.")
	await savePlugins(plugins)
	consola.success("Everything is compiled and stored successfully!")
})();
