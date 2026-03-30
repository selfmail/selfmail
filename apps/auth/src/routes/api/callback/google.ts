import { createFileRoute } from "@tanstack/react-router";
import { OAuthUtils } from "#/utils/oauth.server";

export const Route = createFileRoute("/api/callback/google")({
	server: {
		handlers: {
			GET: ({ request }) => OAuthUtils.finishGoogle(request),
		},
	},
});
