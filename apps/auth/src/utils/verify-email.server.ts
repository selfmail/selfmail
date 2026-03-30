import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-verify-email");

export type VerifyResult =
	| {
			status: "error";
			error: {
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "login_required";
			message: string;
	  }
	| {
			status: "success";
	  };

export abstract class VerifyEmailUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	static async verifyToken({
		token,
	}: {
		token: string;
	}): Promise<VerifyResult> {
		const requestId = VerifyEmailUtils.createRequestId();

		try {
			const tokenHash = await SessionUtils.hashToken(token);
			const emailVerification = await db.emailVerification.findUnique({
				include: {
					user: true,
				},
				where: {
					token: tokenHash,
				},
			});

			if (!emailVerification) {
				return {
					status: "error",
					error: {
						message: m["verify.errors.invalid"](),
						requestId,
					},
				};
			}

			if (emailVerification.expiresAt < new Date()) {
				await db.emailVerification.delete({
					where: {
						id: emailVerification.id,
					},
				});
				SessionUtils.clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["verify.errors.expired"](),
						requestId,
					},
				};
			}

			const tempSessionToken = SessionUtils.getTempSessionCookie();
			const tempSessionHash = tempSessionToken
				? await SessionUtils.hashToken(tempSessionToken)
				: undefined;
			const sameBrowser =
				!!tempSessionHash &&
				!!emailVerification.browserTokenHash &&
				tempSessionHash === emailVerification.browserTokenHash;

			await db.$transaction(async (tx) => {
				if (!emailVerification.user.emailVerified) {
					await tx.user.update({
						data: {
							emailVerified: new Date(),
						},
						where: {
							id: emailVerification.userId,
						},
					});
				}

				await tx.emailVerification.delete({
					where: {
						id: emailVerification.id,
					},
				});
			});

			SessionUtils.clearTempSessionCookie();

			if (!sameBrowser) {
				return {
					status: "login_required",
					message: m["verify.success.description"](),
				};
			}

			await SessionUtils.createSession(emailVerification.userId);

			throw redirect({
				href: SessionUtils.getAppRedirectUrl(),
				statusCode: 302,
			});
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			logger.error(
				"Email verification failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ requestId },
			);

			return {
				status: "error",
				error: {
					message: m["verify.errors.unknown"](),
					requestId,
				},
			};
		}
	}
}
