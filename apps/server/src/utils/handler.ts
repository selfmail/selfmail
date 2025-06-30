import { glob } from "glob";
import { join } from "path";

export async function handler() {
	const routesDir = join(process.cwd(), "src/routes");
	const files = await glob("**/*.ts", { cwd: routesDir });

	for (const file of files) {
		const filePath = join(routesDir, file);
		const imp = (await import(filePath)) as {
			default: () => void | Promise<void>;
		};
		const defaultFunc = imp.default;

		await defaultFunc();
	}
}
