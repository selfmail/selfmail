import { component$ } from "@builder.io/qwik";
import { Link, type RequestHandler, z } from "@builder.io/qwik-city";
import { db } from "database";

export const onGet: RequestHandler = async ({ next, query, redirect }) => {
	const queryParse = await z
		.object({
			token: z
				.string()
				.min(32, "Token is required/invalid")
				.max(33, "Token is invalid"),
		})
		.safeParseAsync(Object.fromEntries(query.entries()));

	if (!queryParse.success) {
		throw await next();
	}

	const token = await db.emailVerification.findUnique({
		where: {
			token: queryParse.data.token,
		},
	});

	if (!token || token.expiresAt < new Date()) {
		throw redirect(
			302,
			"/auth/login?error=Invalid%20or%20expired%20verification%20link",
		);
	}

	await db.user.update({
		where: {
			id: token.userId,
		},
		data: {
			emailVerified: new Date(),
		},
	});

	await db.emailVerification.deleteMany({
		where: {
			userId: token.userId,
		},
	});

	throw redirect(
		302,
		"/auth/login?success=Your%20email%20has%20been%20verified%20successfully",
	);
};

export default component$(() => {
	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-center">
			<div class="flex w-full max-w-md flex-col gap-2">
				<h1 class="font-medium text-2xl">Verify your email</h1>
				<p class="text-neutral-500 text-sm">
					We have send you a verification link to your email. Please click <b>on the link inside the email</b>. Also check your spam folder in case you can't find the email. If you receive any error, you can either <Link href="/auth/resend-verification" class="text-blue-500">try it again</Link> or <a href="mailto:support@selfmail.app" class="text-blue-500">contact the support</a>.
				</p>
			</div>
		</div>
	);
});
