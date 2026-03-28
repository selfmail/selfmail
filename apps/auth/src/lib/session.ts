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
