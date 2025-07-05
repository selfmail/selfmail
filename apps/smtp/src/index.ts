import { consola } from "consola";
import { inboundServer } from "./inbound";
import { outboundServer } from "./outbound";

// Global variables for dev mode and logging functions
globalThis.devmode = process.env.NODE_ENV !== "production";

inboundServer.listen(25, () => {
	consola.ready("Inbound SMTP server listening on port 25");
});
outboundServer.listen(587, () => {
	consola.ready("Outbound SMTP server listening on port 587");
});
