import { Logs } from "services/logs";
import type { SMTPServerSession } from "smtp-server";

export async function close(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	Logs.log(`Closing connection to ${session.remoteAddress}`);

	return callback();
}
