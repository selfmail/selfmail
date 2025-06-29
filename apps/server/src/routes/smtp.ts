import { z } from "zod/v4";
import { handlePermissionsError, handleValidationError } from "@/utils/error";
import { app } from "..";

/**
 * Manage emails for the smtp-server. Here are
 * the checks made to ensure that the emails
 * are valid.
 */
export default async function SMTPEmailHandler() {
	/**
	 * Check if the sender is valid, not blacklisted or any
	 * other suspicious activity.
	 */
	app.post("/v1/smtp/check-sender", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.check-sender"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				sender: z.email().optional(),
				senders: z.array(z.email()).optional(),
				recipient: z.email(),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		if (
			(!parse.data.sender && !parse.data.senders) ||
			(parse.data.sender && parse.data.senders)
		)
			return handleValidationError(c, "Specify either one sender or multiple.");

		// request body is valid, checking if the sender is blocked by the system

		return c.text("Emails route is working!");
	});

	/**
	 * Checking if the recipient is valid, has enough space to
	 * save the email.
	 */
	app.post("/v1/smtp/check-recipient", (c) => {
		return c.text("Emails route is working!");
	});

	/**
	 * Save the email to the database.
	 */
	app.post("/v1/smtp/save", (c) => {
		return c.text("Emails route is working!");
	});
}
