import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import type { VerifyMagicLinkResult } from "#/lib/magic-link";
import { m } from "#/paraglide/messages";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-magic-link");

export abstract class MagicLinkUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	static async verify({
		token,
	}: {
		token: string;
	}): Promise<VerifyMagicLinkResult> {
		const requestId = MagicLinkUtils.createRequestId();

		try {
			const tokenHash = await SessionUtils.hashToken(token);
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
				SessionUtils.clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["magic_link.errors.expired"](),
						requestId,
					},
				};
			}

			const tempSessionToken = SessionUtils.getTempSessionCookie();
			const tempSessionHash = tempSessionToken
				? await SessionUtils.hashToken(tempSessionToken)
				: undefined;

			if (!(tempSessionHash && magicLink.browserTokenHash === tempSessionHash)) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				SessionUtils.clearTempSessionCookie();

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
				SessionUtils.clearTempSessionCookie();

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

			SessionUtils.clearTempSessionCookie();
			await SessionUtils.createSession(user.id);

			throw redirect({
				href: SessionUtils.getAppRedirectUrl(),
				statusCode: 302,
			});
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			logger.error(
				"Magic link verification failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ requestId },
			);

			return {
				status: "error",
				error: {
					message: m["magic_link.errors.unknown"](),
					requestId,
				},
			};
		}
	}
}
