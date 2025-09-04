import { SimpleFramework } from "./framework";

// Initialize the framework
new SimpleFramework({
	pagesDir: "./src/pages",
	port: 1234,
	development: process.env.NODE_ENV !== "production",
});
