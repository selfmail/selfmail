import type {
	SMTPServerAuthentication,
	SMTPServerAuthenticationResponse,
	SMTPServerSession,
} from "smtp-server";
import { request } from "undici";
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

	const { body, statusCode } = await request(
		"http://localhost:3000/v1/smtp/check-credentials",
		{
			method: "POST",
			body: JSON.stringify({
				user: auth.username,
				pass: auth.password,
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.BACKEND_TOKEN}`,
				"User-Agent": "SelfMail SMTP Server",
			},
		},
	);

	if (statusCode !== 200) {
		posthog.capture({
			distinctId: session.remoteAddress,
			event: "outbound_authentication_failed",
			properties: {
				remoteAddress: session.remoteAddress,
				username: auth.username,
				statusCode,
				timestamp: new Date().toISOString(),
			},
		});

		authLog(
			`Authentication failed for ${auth.username} with status code ${statusCode}`,
		);

		return callback(Error("Authentication failed"), {});
	}

	const data = await body.json();
}
