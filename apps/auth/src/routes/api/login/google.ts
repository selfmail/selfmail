import { createFileRoute } from "@tanstack/react-router";
import { OAuthUtils } from "#/utils/oauth.server";

export const Route = createFileRoute("/api/login/google")({
	server: {
		handlers: {
			GET: () => OAuthUtils.startGoogle(),
		},
	},
});
