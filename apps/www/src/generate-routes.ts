import { writeFile } from "fs/promises";

interface RouteInfo {
	path: string;
	filePath: string;
}

async function generateRoutes() {
	const pagesDir = "./src/pages";
	const glob = new Bun.Glob("**/*.{tsx,jsx,ts,js}");
	const routes: RouteInfo[] = [];

	for await (const file of glob.scan({ cwd: pagesDir })) {
		const relativePath = file.replace(/\.[jt]sx?$/, "");
		let route = "/" + relativePath;

		// Convert index files to root routes
		if (route.endsWith("/index")) {
			route = route.replace("/index", "") || "/";
		}

		routes.push({
			path: route,
			filePath: `./pages/${file.replace(/\.[jt]sx?$/, "")}`,
		});
	}

	// Generate the routes file
	const routesContent = `// Auto-generated routes file
export const routes = new Map([
${routes.map((route) => `  ["${route.path}", () => import("${route.filePath}")]`).join(",\n")}
]);
`;

	await writeFile("./src/generated-routes.ts", routesContent);
	console.log(`✅ Generated routes for ${routes.length} pages`);
}

await generateRoutes();
