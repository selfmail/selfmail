import {
	decryptSessionMetadata,
	hashSessionToken,
} from "@selfmail/authentication/session-metadata";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

const emailSchema = z.email().trim().toLowerCase();

const getLoginHref = () =>
	process.env.SELFMAIL_AUTH_URL
		? new URL("/login", process.env.SELFMAIL_AUTH_URL).toString()
		: process.env.NODE_ENV === "production"
			? "https://auth.selfmail.app/login"
			: "https://auth.selfmail.localhost/login";

export const getAuthenticationSettings = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const sessionToken = getCookie("selfmail-session-token");
		const currentSessionTokenHash = sessionToken
			? hashSessionToken(sessionToken)
			: null;
		const [account, sessions] = await Promise.all([
			db.user.findUniqueOrThrow({
				select: {
					accounts: {
						select: { provider: true },
					},
					email: true,
					emailVerified: true,
				},
				where: { id: user.id },
			}),
			db.session.findMany({
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
					encryptedMetadata: true,
					expires: true,
					id: true,
					sessionToken: true,
				},
				where: {
					expires: { gt: new Date() },
					userId: user.id,
				},
			}),
		]);

		return {
			activeSessionCount: sessions.length,
			email: account.email,
			emailVerified: Boolean(account.emailVerified),
			providers: [...new Set(account.accounts.map(({ provider }) => provider))],
			sessions: sessions.map(
				({ createdAt, encryptedMetadata, expires, id, sessionToken }) => {
					const metadata = decryptSessionMetadata(encryptedMetadata);

					return {
						createdAt: createdAt.toISOString(),
						expires: expires.toISOString(),
						id,
						isCurrent: sessionToken === currentSessionTokenHash,
						region: metadata?.region ?? null,
						userAgent: metadata?.userAgent ?? null,
					};
				},
			),
		};
	});

export const changeAccountEmail = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(z.object({ email: emailSchema }))
	.handler(async ({ context: { user }, data: { email } }) => {
		const normalizedEmail = email.toLowerCase();

		if (normalizedEmail === user.email.toLowerCase()) {
			throw new Error("This is already your account email.");
		}

		const emailInUse = await db.user.findFirst({
			select: { id: true },
			where: {
				id: { not: user.id },
				OR: [
					{ email: { equals: normalizedEmail, mode: "insensitive" } },
					{
						accounts: {
							some: {
								provider: "EMAIL",
								providerAccountId: normalizedEmail,
							},
						},
					},
				],
			},
		});

		if (emailInUse) {
			throw new Error("An account already uses this email address.");
		}

		await db.$transaction(async (transaction) => {
			const emailAccount = await transaction.account.findFirst({
				select: { id: true },
				where: { provider: "EMAIL", userId: user.id },
			});

			await transaction.user.update({
				data: {
					email: normalizedEmail,
					emailVerified: null,
				},
				where: { id: user.id },
			});

			if (emailAccount) {
				await transaction.account.update({
					data: { providerAccountId: normalizedEmail },
					where: { id: emailAccount.id },
				});
			} else {
				await transaction.account.create({
					data: {
						provider: "EMAIL",
						providerAccountId: normalizedEmail,
						userId: user.id,
					},
				});
			}

			await Promise.all([
				transaction.emailVerification.deleteMany({
					where: { userId: user.id },
				}),
				transaction.magicLink.deleteMany({ where: { userId: user.id } }),
			]);
		});

		return { email: normalizedEmail };
	});

export const deleteAllSessions = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const { count } = await db.session.deleteMany({
			where: { userId: user.id },
		});

		return { count, loginHref: getLoginHref() };
	});

export const deleteSession = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(z.object({ sessionId: z.string().min(1) }))
	.handler(async ({ context: { user }, data: { sessionId } }) => {
		const session = await db.session.findFirst({
			select: { sessionToken: true },
			where: { id: sessionId, userId: user.id },
		});

		if (!session) {
			throw new Error("Session not found.");
		}

		const currentToken = getCookie("selfmail-session-token");
		const isCurrent = currentToken
			? session.sessionToken === hashSessionToken(currentToken)
			: false;

		await db.session.delete({ where: { id: sessionId } });

		return { isCurrent, loginHref: isCurrent ? getLoginHref() : null };
	});
