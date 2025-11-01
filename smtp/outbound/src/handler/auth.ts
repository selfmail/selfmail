import type {
	SMTPServerAuthentication,
	SMTPServerAuthenticationResponse,
	SMTPServerSession,
} from "smtp-server";
import { AuthenticationUtils } from "../lib/authentication";

type AuthCallback = (
	err: Error | null | undefined,
	response?: SMTPServerAuthenticationResponse,
) => void;

export abstract class Auth {
	static async init(
		auth: SMTPServerAuthentication,
		_session: SMTPServerSession,
		callback: AuthCallback,
	): Promise<ReturnType<AuthCallback>> {
		try {
			const { username, accessToken, password, method } = auth;

			// Plain authentication
			if ((method === "PLAIN" || method === "LOGIN") && username && password) {
				const auth = await AuthenticationUtils.validateCredentials(
					username,
					password,
				);

				if (auth.success) {
					return callback(null, {
						user: {
							id: auth.userId,
						},
					});
				}

				// Invalid credentials
				return callback(
					new Error("AUTH rejected: Invalid username or password"),
				);
			}

			// XOAUTH2 authentication
			if (method === "XOAUTH2" && username && accessToken) {
				// XOAUTH2 authentication
				const auth = await AuthenticationUtils.validateAccessToken(
					username,
					accessToken,
				);

				if (auth.success) {
					return callback(null, {
						user: {
							id: auth.userId,
						},
					});
				}

				// Invalid access token
				return callback(new Error("AUTH rejected: Invalid access token"));
			}

			// Unsupported authentication method
			return callback(
				new Error(
					`AUTH rejected: Unsupported authentication method ${method} or missing credentials.`,
				),
			);
		} catch (_error) {
			return callback(new Error("AUTH rejected: Authentication error"));
		}
	}
}
