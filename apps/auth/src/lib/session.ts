import { createServerFn } from "@tanstack/react-start";

export const getCurrentUserFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const { getCurrentUser } = await import("#/lib/session.server");

	return getCurrentUser();
});

export const getAppRedirectUrlFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const { getAppRedirectUrl } = await import("#/lib/session.server");

	return getAppRedirectUrl();
});

export const logoutFn = createServerFn({
	method: "POST",
}).handler(async () => {
	const { destroySession } = await import("#/lib/session.server");

	await destroySession();

	return { success: true };
});
