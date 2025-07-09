import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { publicElysia } from "./public";
import { smtp } from "./smtp";
import { web } from "./web";

const app = new Elysia()
	.use(swagger())
	.use(smtp)
	.use(publicElysia)
	.use(web)
	.get("/", () => "Welcome to the Selfmail api!", {
		description: "Welcome to the Selfmail API",
	})
	.listen(3000);

app.get("/hey", () => "Welcome to the Selfmail API!", {
	detail: {
		description: "Welcome to the Selfmail API",
	},
});

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
