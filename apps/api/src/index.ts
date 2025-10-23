import { Elysia } from "elysia";
import { billing } from "./billing";

const app = new Elysia()
	.get("/", () => "Hello Elysia")
	.use(billing)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
