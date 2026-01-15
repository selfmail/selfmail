import type { RequestHandler } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";

const createId = init({ length: 32 });

export const onGet: RequestHandler = async ({ url, cookie, redirect }) => {
	const token = url.searchParams.get("token");

	if (!token) {
		throw redirect(302, "/auth/login?error=Invalid%20magic%20link");
	}

	const magicLink = await db.magicLink.findUnique({
		where: { token },
	});

	if (!magicLink || magicLink.expiresAt < new Date()) {
		throw redirect(302, "/auth/login?error=Magic%20link%20expired%20or%20invalid");
	}

	let user = await db.user.findUnique({
		where: { email: magicLink.email },
	});

	if (!user) {
		user = await db.user.create({
			data: {
				email: magicLink.email,
				emailVerified: new Date(),
			},
		});
	} else if (!user.emailVerified) {
		await db.user.update({
			where: { id: user.id },
			data: { emailVerified: new Date() },
		});
	}

	await db.magicLink.delete({
		where: { id: magicLink.id },
	});

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

	const hasMembership = await db.member.findFirst({
		where: { userId: user.id },
	});

	if (!hasMembership) {
		throw redirect(302, "/create");
	}

	throw redirect(302, "/");
};
