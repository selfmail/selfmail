import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import z from "zod";

type JWTKeyCache = {
	privateKey: Awaited<ReturnType<typeof importPKCS8>> | null;
	publicKey: Awaited<ReturnType<typeof importSPKI>> | null;
};

const keyCache: JWTKeyCache = {
	privateKey: null,
	publicKey: null,
};

const jwtPayloadSchema = z.object({
	username: z.string(),
	password: z.string(),
	iat: z.number(),
	jti: z.string(),
});

type JWTCustomPayload = z.infer<typeof jwtPayloadSchema>;

export abstract class JWT {
	private static async getPrivateKey() {
		if (!keyCache.privateKey) {
			const privateKeyPem = await readFile("./privkey.pem", "utf8");
			keyCache.privateKey = await importPKCS8(privateKeyPem, "RS256");
		}
		return keyCache.privateKey;
	}

	private static async getPublicKey() {
		if (!keyCache.publicKey) {
			const publicKeyPem = await readFile("./pubkey.pem", "utf8");
			keyCache.publicKey = await importSPKI(publicKeyPem, "RS256");
		}
		return keyCache.publicKey;
	}

	static async createJWT(username: string, password: string): Promise<string> {
		const privateKey = await JWT.getPrivateKey();

		const jwt = await new SignJWT({
			username,
			password,
		})
			.setProtectedHeader({ alg: "RS256" })
			.setIssuedAt()
			.setJti(randomUUID())
			.sign(privateKey);

		return jwt;
	}

	static async verifyJWT(
		token: string,
	): Promise<
		| { success: false; error: string }
		| { success: true; payload: JWTCustomPayload }
	> {
		try {
			const publicKey = await JWT.getPublicKey();

			const { payload } = await jwtVerify(token, publicKey);

			const parseResult = jwtPayloadSchema.safeParse(payload);

			if (!parseResult.success) {
				return {
					success: false,
					error: "Invalid token payload structure",
				};
			}

			return {
				success: true,
				payload: parseResult.data,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Token verification failed",
			};
		}
	}
}
