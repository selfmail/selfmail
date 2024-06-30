import fs from "node:fs"
/**
 * The handler: import all of the function from the "./routes" folder
 */
export default async function Handler() {
    const routes = await fs.promises.readdir("./src/routes")
    for await (const route of routes) {
        // watch only the .ts files
        if (!route.endsWith(".ts")) {
            return 
        }
        const { default: defaultRoute }: {default: () => void} = await import(`./routes/${route}`);
        defaultRoute();

    }
}