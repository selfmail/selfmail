import { Logs } from "services/logs";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import z from "zod";
import { client } from "@/lib/client";

export async function mailFrom(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	if (!session.user) {
		return callback(new Error("User is not authenticated"));
	}

	const parse = await z
		.object({
			addressId: z.string(),
			memberId: z.string(),
			workspaceId: z.string(),
		})
		.safeParseAsync(session.user);

	if (!parse.success) {
		return callback(new Error("User session is invalid"));
	}

	const res = await client.outbound["mail-from"]
		.post({
			from: address.address,
			addressId: parse.data.addressId,
		})
		.catch((err) => {
			Logs.log("Error while verifying the MAIL FROM command");
			if (err) throw callback(new Error("API Error!"));
		});

	return callback();
}
