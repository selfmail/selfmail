import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { app } from "../../app.js";
import { posthog } from "../../lib/posthog.js";
import {
	handlePermissionsError,
	handleValidationError,
} from "../../utils/error.js";

export default async function VerifySMTPCredentials() {
	app.post("/v1/smtp/check-sender", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.verify-smtp-credentials"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				user: z.string().min(1, "User ID is required"),
				pass: z.string().min(1, "Password is required"),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		// request body is valid, checking if the sender is blocked by the system
		const { pass, user } = parse.data;
	});
}
