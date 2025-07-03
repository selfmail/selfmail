import { app } from "src/app";
import { handlePermissionsError, handleValidationError } from "src/utils/error";
import z from "zod/v4";

/**
 * This route is used to handle the SMTP data operation.
 * We will check for spam in the email body and subject,
 * as well as for suspicious links.
 */
export default async function SMTPDataHandler() {
	app.post("/v1/smtp/check-sender", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.data"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				sender: z.email(),
				body: z.string(),
				subject: z.string(),
				recipient: z.email(),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		const { sender } = parse.data;

		// Check for spam in the email body and subject, as well as for the sender's email address
	});
}
