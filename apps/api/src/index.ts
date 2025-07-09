import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { publicElysia } from "./public";
import { smtp } from "./smtp";
import { web } from "./web";

const app = new Elysia({
	prefix: "/v1",
	name: "selfmail-api",
	detail: {
		description: "The main entry point for the selfmail api.",
	},
})
	.use(swagger())
	.use(smtp)
	.use(publicElysia)
	.use(web)
	.listen(3000);

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
