import { Logs } from "services/logs";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import z from "zod";
import { client } from "@/lib/client";

export async function mailFrom(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	console.log(session.user);

	if (!session.user) {
		return callback(new Error("User is not authenticated"));
	}

	const parse = await z
		.object({
			addressId: z.string(),
			memberId: z.string(),
			workspaceId: z.string(),
		})
		.safeParseAsync(JSON.parse(session.user));

	if (!parse.success) {
		return callback(new Error("User session is invalid"));
	}

	const res = await client.outbound["mail-from"].post({
		from: address.address,
		addressId: parse.data?.addressId,
	});
	return callback();
}
