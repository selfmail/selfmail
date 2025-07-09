import { join } from "node:path";
import { glob } from "glob";

export async function handler() {
	const routesDir = join(process.cwd(), "src/routes");
	const files = await glob("**/*.ts", { cwd: routesDir });

	for (const file of files) {
		console.log(`Loading route: ${file}`);
		const filePath = join(routesDir, file);
		const imp = (await import(filePath)) as {
			default: () => void | Promise<void>;
		};
		const defaultFunc = imp.default;

		await defaultFunc();
	}
}
