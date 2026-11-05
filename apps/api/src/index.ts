import { Elysia } from "elysia";
import { payments } from "./payments";

const app = new Elysia()
  .use(payments)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
