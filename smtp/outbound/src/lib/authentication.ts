import { readFile } from "node:fs/promises";
import { db } from "database";
import { jwtVerify } from "jose";
import { importSPKI } from "jose/key/import";
import z from "zod";

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
		username: string,
		accessToken: string,
	): Promise<{ success: false } | { success: true; userId: string }> {
		const pubKeyPem = await readFile("./pubkey.pem", "utf8");
		const pubKey = await importSPKI(pubKeyPem, "RS256");

		try {
			const { payload, protectedHeader } = await jwtVerify(
				accessToken,
				pubKey,
				{
					issuer: "https://auth.yourdomain.example",
					audience: "your-audience",
					// optional: maxTokenAge, clockTolerance etc.
				},
			);
			console.log("Payload:", payload);
			console.log("Header:", protectedHeader);

			// Parse payload
			const parse = await z
				.object({
					username: z.string(),
					password: z.string(),
				})
				.safeParseAsync(payload);

			if (!parse.success) {
				console.error("Invalid token payload structure");
				return { success: false };
			}

			// Check credentials
			const credentialsCheck = await AuthenticationUtils.validateCredentials(
				parse.data.username,
				parse.data.password,
			);

			if (!credentialsCheck.success) {
				console.error("Invalid credentials");
				return { success: false };
			}

			return { success: true, userId: credentialsCheck.userId };
		} catch (err) {
			console.error("Invalid token:", err);

			return { success: false };
		}
	}
}
