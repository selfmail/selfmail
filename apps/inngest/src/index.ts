import { serve } from "inngest/bun";
import { inngest } from "./client";
import helloWorld from "./hello-world";

Bun.serve({
	port: 3005,
	routes: {
		// ...other routes...
		"/api/inngest": (request: Request) => {
			return serve({ client: inngest, functions: [helloWorld] })(request);
		},
	},
});
