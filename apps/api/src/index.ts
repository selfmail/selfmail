import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { ip } from "elysia-ip";
import { publicElysia } from "./public";
import { web } from "./web";

const app = new Elysia({
	prefix: "/v1",
	name: "selfmail-api",
	detail: {
		description: "The main entry point for the selfmail api.",
	},
})
	.use(ip())
	.use(swagger())
	.use(publicElysia) // The public API for the users to automate stuff with Selfmail
	.use(web)
	.listen(3000);

export type App = typeof app;

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
