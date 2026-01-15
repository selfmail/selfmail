import type { RequestHandler } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";
import { github } from "~/lib/oauth";

const createId = init({ length: 32 });

export const onGet: RequestHandler = async ({ url, cookie, redirect }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookie.get("github_oauth_state")?.value;

	if (!code || !state || !storedState || state !== storedState) {
		throw redirect(302, "/auth/login?error=Invalid%20OAuth%20state");
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
			},
		});

		const githubUser = (await response.json()) as {
			id: number;
			login: string;
			email: string;
			name: string;
			avatar_url: string;
		};

		const emailResponse = await fetch("https://api.github.com/user/emails", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
			},
		});

		const emails = (await emailResponse.json()) as Array<{
			email: string;
			primary: boolean;
			verified: boolean;
		}>;

		const primaryEmail =
			emails.find((email) => email.primary && email.verified)?.email ||
			githubUser.email;

		if (!primaryEmail) {
			throw redirect(302, "/auth/login?error=No%20verified%20email%20found");
		}

		let user = await db.user.findUnique({
			where: { email: primaryEmail },
		});

		if (!user) {
			user = await db.user.create({
				data: {
					email: primaryEmail,
					name: githubUser.name || githubUser.login,
					image: githubUser.avatar_url,
					emailVerified: new Date(),
				},
			});
		}

		const existingAccount = await db.account.findUnique({
			where: {
				provider_providerAccountId: {
					provider: "GITHUB",
					providerAccountId: githubUser.id.toString(),
				},
			},
		});

		if (!existingAccount) {
			await db.account.create({
				data: {
					userId: user.id,
					provider: "GITHUB",
					providerAccountId: githubUser.id.toString(),
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

		cookie.delete("github_oauth_state", { path: "/" });

		const hasMembership = await db.member.findFirst({
			where: { userId: user.id },
		});

		if (!hasMembership) {
			throw redirect(302, "/create");
		}

		throw redirect(302, "/");
	} catch (error) {
		console.error("GitHub OAuth error:", error);
		throw redirect(
			302,
			"/auth/login?error=Authentication%20failed.%20Please%20try%20again",
		);
	}
};
