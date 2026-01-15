import type { RequestHandler } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";
import { google } from "~/lib/oauth";

const createId = init({ length: 32 });

export const onGet: RequestHandler = async ({ url, cookie, redirect }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookie.get("google_oauth_state")?.value;
	const codeVerifier = cookie.get("google_code_verifier")?.value;

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		throw redirect(302, "/auth/login?error=Invalid%20OAuth%20state");
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const response = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			},
		);

		const googleUser = (await response.json()) as {
			id: string;
			email: string;
			verified_email: boolean;
			name: string;
			picture: string;
		};

		if (!googleUser.verified_email) {
			throw redirect(302, "/auth/login?error=Email%20not%20verified");
		}

		let user = await db.user.findUnique({
			where: { email: googleUser.email },
		});

		if (!user) {
			user = await db.user.create({
				data: {
					email: googleUser.email,
					name: googleUser.name,
					image: googleUser.picture,
					emailVerified: new Date(),
				},
			});
		}

		const existingAccount = await db.account.findUnique({
			where: {
				provider_providerAccountId: {
					provider: "GOOGLE",
					providerAccountId: googleUser.id,
				},
			},
		});

		if (!existingAccount) {
			await db.account.create({
				data: {
					userId: user.id,
					provider: "GOOGLE",
					providerAccountId: googleUser.id,
					accessToken: tokens.accessToken(),
				},
			});
		}

		const sessionToken = createId();
		await db.session.create({
			data: {
				userId: user.id,
				sessionToken,
				expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});

		cookie.set("selfmail-session-token", sessionToken, {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
		});

		cookie.delete("google_oauth_state", { path: "/" });
		cookie.delete("google_code_verifier", { path: "/" });

		const hasMembership = await db.member.findFirst({
			where: { userId: user.id },
		});

		if (!hasMembership) {
			throw redirect(302, "/create");
		}

		throw redirect(302, "/");
	} catch (error) {
		console.error("Google OAuth error:", error);
		throw redirect(
			302,
			"/auth/login?error=Authentication%20failed.%20Please%20try%20again",
		);
	}
};
