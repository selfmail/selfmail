import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	clearTempSessionCookie,
	createSession,
	getAppRedirectUrl,
	getTempSessionCookie,
	hashToken,
} from "#/lib/session";
import { m } from "#/paraglide/messages";

const schema = z.object({
	token: z.string().min(32).max(64),
});

const logger = createLogger("auth-magic-link");

type VerifyMagicLinkResult =
	| {
			status: "error";
			error: {
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "success";
	  };

const createRequestId = () => crypto.randomUUID();

export const verifyMagicLinkToken = createServerFn({
	method: "POST",
})
	.inputValidator(schema)
	.handler(async (ctx): Promise<VerifyMagicLinkResult> => {
		const requestId = createRequestId();

		try {
			const tokenHash = await hashToken(ctx.data.token);
			const magicLink = await db.magicLink.findUnique({
				where: { token: tokenHash },
			});

			if (!magicLink) {
				return {
					status: "error",
					error: {
						message: m["magic_link.errors.invalid"](),
						requestId,
					},
				};
			}

			if (magicLink.expiresAt < new Date()) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["magic_link.errors.expired"](),
						requestId,
					},
				};
			}

			const tempSessionToken = getTempSessionCookie();
			const tempSessionHash = tempSessionToken
				? await hashToken(tempSessionToken)
				: undefined;

			if (
				!(tempSessionHash && magicLink.browserTokenHash === tempSessionHash)
			) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				clearTempSessionCookie();

				throw redirect({
					search: {
						error: m["magic_link.errors.browser_mismatch"](),
					},
					statusCode: 302,
					to: "/login",
				});
			}

			let user = await db.user.findUnique({
				where: { email: magicLink.email },
			});

			if (!user && magicLink.userId) {
				user = await db.user.findUnique({
					where: { id: magicLink.userId },
				});
			}

			if (!user) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["magic_link.errors.account_missing"](),
						requestId,
					},
				};
			}

			await db.$transaction(async (tx) => {
				if (!user?.emailVerified) {
					await tx.user.update({
						data: {
							emailVerified: new Date(),
						},
						where: {
							id: user.id,
						},
					});
				}

				await tx.magicLink.delete({
					where: {
						id: magicLink.id,
					},
				});
			});

			clearTempSessionCookie();
			await createSession(user.id);

			throw redirect({
				href: getAppRedirectUrl(),
				statusCode: 302,
			});
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			logger.error(
				"Magic link verification failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ requestId, token: ctx.data.token },
			);

			return {
				status: "error",
				error: {
					message: m["magic_link.errors.unknown"](),
					requestId,
				},
			};
		}
	});
