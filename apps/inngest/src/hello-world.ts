import { inngest } from "./client";

export default inngest.createFunction(
	// config
	{ id: "hello world" },
	// trigger (event or cron)
	{ event: "hello/world" },
	// handler function
	async ({ event, step }) => {
		console.log("Hello World!", event);
	},
);
