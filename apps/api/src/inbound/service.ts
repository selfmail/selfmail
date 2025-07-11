import { status } from "elysia";
import { db } from "../lib/db";
import type { InboundModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This is a static utility class for handling SMTP connections.
export abstract class InboundService {
	/**
	 * Connection of a new SMTP client. We are checking for spam (in the database) and if the
	 * connection comes from the localhost. We are also performing rate-limiting on the client's IP.
	 * @param param0
	 */
	static async handleConnection({
		hostname,
		ip,
	}: InboundModule.ConnectionBody) {}

	static async handleMailFrom({ from }: InboundModule.MailFromBody) {}

	static async handleRcptTo({ to }: InboundModule.RcptToBody) {
		const address = await db.address.findUnique({
			where: {
				email: to,
			},
		});

		if (!address) {
			throw status(404, "Address not found");
		}

		const contact = await db.contact.findUnique({
			where: {
				id: to,
			},
		});
	}

	static async handleData({
		attachments,
		subject,
		text,
		html,
	}: InboundModule.DataBody) {}
}
