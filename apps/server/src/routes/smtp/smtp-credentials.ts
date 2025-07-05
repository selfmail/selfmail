import { and, eq } from "drizzle-orm";
import { db } from "src/db/index.js";
import { smtpCrendetials } from "src/db/schema/workspace.js";
import { z } from "zod/v4";
import { app } from "../../app.js";
import { posthog } from "../../lib/posthog.js";
import {
	handlePermissionsError,
	handleValidationError,
} from "../../utils/error.js";

export default async function VerifySMTPCredentials() {
	app.post("/v1/smtp/check-credentials", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.verify-smtp-credentials"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				user: z.string().min(1, "User is required"),
				pass: z.string().min(1, "Password is required"),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		// request body is valid, checking if the sender is blocked by the system
		const { pass, user } = parse.data;

		const credentials = await db
			.select()
			.from(smtpCrendetials)
			.where(
				and(eq(smtpCrendetials.user, user), eq(smtpCrendetials.password, pass)),
			)
			.limit(1);

		if (credentials.length === 0) {
			return c.json({ valid: false }, 401);
		}

		return c.json({ valid: true, credentials: credentials[0] }, 200);
	});
}
