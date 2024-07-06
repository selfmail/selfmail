import fs from "node:fs";
/**
 * The handler: import all of the functions from the "./routes" folder dynamiccaly.
 */
export default async function Handler() {
  // get an array of the filenames in the "./src/routes" directory
  const routes = await fs.promises.readdir("./src/routes");

  // loop over them, and importing them
  for await (const route of routes) {
    // only importing typescript files
    if (!route.endsWith(".ts")) {
      return;
    }
    // running the typescript file
    const { default: defaultRoute }: { default: () => void } = await import(
      `./routes/${route}`
    );
    // running the default export from the file as an function
    defaultRoute();
  }
}
