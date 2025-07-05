import { eq } from "drizzle-orm";
import { db } from "src/db/index.js";
import { address } from "src/db/schema/addresses.js";
import { z } from "zod/v4";
import { app } from "../../app.js";
import {
	handlePermissionsError,
	handleValidationError,
} from "../../utils/error.js";

export default async function SMTPRecipientHandler() {
	app.post("/v1/smtp/check-recipient", async (c) => {
		if (!c.var.unkey?.permissions?.includes("email.check-recipient"))
			return handlePermissionsError(c);

		const body = await c.req.parseBody();

		// Parse request body
		const parse = await z
			.object({
				recipient: z.email(),
			})
			.safeParseAsync(body);

		if (!parse.success)
			return handleValidationError(c, z.prettifyError(parse.error));

		const { recipient } = parse.data;

		// check if recipient is existing
		const existingRecipient = await db.query.address.findFirst({
			where: eq(address.email, recipient),
		});

		return c.json({ exists: !!existingRecipient });
	});
}
