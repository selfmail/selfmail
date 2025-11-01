import { db } from "database";
import { JWT } from "services";

export abstract class AuthenticationUtils {
	static async validateCredentials(
		username: string,
		password: string,
	): Promise<{ success: false } | { success: true; userId: string }> {
		try {
			const credentials = await db.smtpCredentials.findUnique({
				where: {
					username_password: {
						username,
						password,
					},
				},
			});
			return credentials !== null
				? { success: true, userId: credentials.id }
				: { success: false };
		} catch (error) {
			console.error("Error validating credentials:", error);
			return { success: false };
		}
	}

	static async validateAccessToken(
		_username: string,
		accessToken: string,
	): Promise<{ success: false } | { success: true; userId: string }> {
		const verifyResult = await JWT.verifyJWT(accessToken);

		if (!verifyResult.success) {
			console.error("Token verification failed:", verifyResult.error);
			return { success: false };
		}

		const { payload } = verifyResult;

		const credentialsCheck = await AuthenticationUtils.validateCredentials(
			payload.username,
			payload.password,
		);

		if (!credentialsCheck.success) {
			console.error("Invalid credentials from token");
			return { success: false };
		}

		return { success: true, userId: credentialsCheck.userId };
	}
}
