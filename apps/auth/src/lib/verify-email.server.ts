import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import {
	clearTempSessionCookie,
	createSession,
	getAppRedirectUrl,
	getTempSessionCookie,
	hashToken,
} from "#/lib/session.server";
import { m } from "#/paraglide/messages";

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

const createRequestId = () => crypto.randomUUID();

export const verifyEmailToken = async ({
	token,
}: {
	token: string;
}): Promise<VerifyResult> => {
	const requestId = createRequestId();

	try {
		const emailVerification = await db.emailVerification.findUnique({
			include: {
				user: true,
			},
			where: {
				token,
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
			clearTempSessionCookie();

			return {
				status: "error",
				error: {
					message: m["verify.errors.expired"](),
					requestId,
				},
			};
		}

		const tempSessionToken = getTempSessionCookie();
		const tempSessionHash = tempSessionToken
			? await hashToken(tempSessionToken)
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

		clearTempSessionCookie();

		if (!sameBrowser) {
			return {
				status: "login_required",
				message: m["verify.success.description"](),
			};
		}

		await createSession(emailVerification.userId);

		throw redirect({
			href: getAppRedirectUrl(),
			statusCode: 302,
		});
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}

		logger.error(
			"Email verification failed unexpectedly",
			error instanceof Error ? error : undefined,
			{ requestId, token },
		);

		return {
			status: "error",
			error: {
				message: m["verify.errors.unknown"](),
				requestId,
			},
		};
	}
};
