import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
