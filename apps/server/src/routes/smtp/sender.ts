import { z } from "zod/v4";
import { app } from "../../app.js";
import { posthog } from "../../lib/posthog.js";
import {
	handlePermissionsError,
	handleValidationError,
} from "../../utils/error.js";

export default async function SMTPSenderHandler() {
	app.post("/v1/smtp/check-sender", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.check-sender"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				sender: z.email().optional(),
				recipient: z.email(),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		// request body is valid, checking if the sender is blocked by the system
		const { sender, recipient } = parse.data;

		await posthog.capture({
			distinctId: recipient,
			event: "email.check-sender",
		});

		return c.text("Emails route is working!");
	});
}
