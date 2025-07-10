import type {
	SMTPServerAuthentication,
	SMTPServerAuthenticationResponse,
	SMTPServerSession,
} from "smtp-server";
import { client } from "@/lib/client";
import { posthog } from "@/lib/posthog";
import { createOutboundLog } from "../../utils/logs";

const authLog = createOutboundLog("auth");

export async function auth(
	auth: SMTPServerAuthentication,
	session: SMTPServerSession,
	callback: (
		err: Error | null | undefined,
		response?: SMTPServerAuthenticationResponse,
	) => void,
): Promise<void> {
	if (auth.method === "XOAUTH2") {
		authLog("XOAUTH2 used as login method. Error was triggered.");
		return callback(
			new Error(
				"XOAUTH2 method is not allowed, expecting LOGIN authentication",
			),
		);
	}

	authLog(
		`Authentication attempt from ${session.remoteAddress}: ${auth.username}`,
	);

	if (!auth.username || !auth.password) {
		authLog("Username or password is missing, returning error.");
		return callback(new Error("Username or password is missing"), {});
	}

	const res = await client.v1["smtp-outgoing"].authentication.post({
		password: auth.password,
		username: auth.username,
	});

	if (res.status !== 200 || res.error || !res.data) {
		posthog.capture({
			distinctId: session.remoteAddress,
			event: "outbound_authentication_failed",
			properties: {
				remoteAddress: session.remoteAddress,
				username: auth.username,
				statusCode: res.status,
				timestamp: new Date().toISOString(),
			},
		});

		authLog(
			`Authentication failed for ${auth.username} with status code ${res.status}`,
		);

		return callback(Error("Authentication failed"), {});
	}

	const data = res.data;

	return callback(null, {
		user: {
			workspaceId: data.credentials.workspaceId,
			addressId: data.credentials.addressId,
			username: auth.username,
		},
	});
}
