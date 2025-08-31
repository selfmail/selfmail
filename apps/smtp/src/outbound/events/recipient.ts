import { Logs } from "services/logs";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import z from "zod";
import { client } from "@/lib/client";

export async function recipient(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	Logs.log(`Recipient address: ${address.address}`);

	const parse = await z
		.object({
			addressId: z.string(),
			memberId: z.string(),
			workspaceId: z.string(),
		})
		.safeParseAsync(session.user)
		.catch((err) => {
			Logs.error(`Failed to parse user session: ${err}`);
			throw callback(new Error("User session is invalid"));
		});

	if (!parse.success) {
		throw callback(new Error("User session is invalid"));
	}

	const res = await client.outbound["rcpt-to"].post({
		to: address.address,
		addressId: parse.data.addressId,
	});

	if (res.error) {
		Logs.error(`Failed to find recipient address: ${address.address}`);
		return callback(new Error("Recipient address not found"));
	}

	return callback();
}
