import { createServerFn } from "@tanstack/react-start";

export const verifyEmailTokenFn = createServerFn({
	method: "POST",
}).handler(async (ctx: { data: { token: string } }) => {
	const { verifyEmailToken } = await import("#/lib/verify-email.server");

	return verifyEmailToken(ctx.data);
});
