import Elysia from "elysia";
import { inboundSmtp } from "./inbound";
import { outboundSmtp } from "./outbound";

const app = new Elysia().use(inboundSmtp).use(outboundSmtp).listen(4001);

export type Smtp = typeof app;

console.log(
	`Smtp-Api is running at http://${app.server?.hostname}:${app.server?.port}`,
);
