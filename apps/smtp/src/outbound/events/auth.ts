import { Analytics } from "services/analytics";
import { Logs } from "services/logs";
import type {
	SMTPServerAuthentication,
	SMTPServerAuthenticationResponse,
	SMTPServerSession,
} from "smtp-server";
import { client } from "@/lib/client";

export async function auth(
	auth: SMTPServerAuthentication,
	session: SMTPServerSession,
	callback: (
		err: Error | null | undefined,
		response?: SMTPServerAuthenticationResponse,
	) => void,
): Promise<void> {
	Logs.log("Auth called!");
	if (auth.method === "XOAUTH2") {
		Logs.log("XOAUTH2 used as login method. Error was triggered.");
		return callback(
			new Error(
				"XOAUTH2 method is not allowed, expecting LOGIN authentication",
			),
		);
	}

	Logs.log(
		`Authentication attempt from ${session.remoteAddress}: ${auth.username}`,
	);

	if (!auth.username || !auth.password) {
		Logs.log("Username or password is missing, returning error.");
		return callback(new Error("Username or password is missing"), {});
	}

	const res = await client.outbound.authentication.post({
		password: auth.password,
		username: auth.username,
	});

	if (res.status !== 200 || res.error || !res.data) {
		Analytics.trackEvent("smtp_auth_failed", {
			username: auth.username,
			ip: session.remoteAddress || "unknown",
		});

		Logs.log(
			`Authentication failed for ${auth.username} with status code ${res.status}`,
		);

		return callback(Error("Authentication failed"), {});
	}

	const data = res.data;

	return callback(null, {
		user: {
			workspaceId: data.credentials.workspaceId,
			addressId: data.credentials.addressId,
			memberId: data.credentials.memberId,
		},
	});
}
