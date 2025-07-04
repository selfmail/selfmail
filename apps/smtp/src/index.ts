import { consola } from "consola";
import { inboundServer } from "./inbound";
import { outboundServer } from "./outbound";

inboundServer.listen(25, () => {
	consola.ready("Inbound SMTP server listening on port 25");
});
outboundServer.listen(587, () => {
	consola.ready("Outbound SMTP server listening on port 587");
});
