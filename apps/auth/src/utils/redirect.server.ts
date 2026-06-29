import {
	getRequestHost,
	getRequestProtocol,
} from "@tanstack/react-start/server";

export function getSafeInternalRedirectUrl(
	redirectPath: string | undefined,
	fallbackUrl: string,
) {
	if (!(redirectPath?.startsWith("/") && !redirectPath.startsWith("//"))) {
		return fallbackUrl;
	}

	const host = getRequestHost({ xForwardedHost: true });
	const protocol = getRequestProtocol({ xForwardedProto: true });

	return new URL(redirectPath, `${protocol}://${host}`).toString();
}
