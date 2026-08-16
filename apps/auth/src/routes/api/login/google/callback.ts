import { createFileRoute } from "@tanstack/react-router";
import { finishGoogleOAuth } from "#/utils/google-oauth.server";

export const Route = createFileRoute("/api/login/google/callback")({
	server: {
		handlers: {
			GET: ({ request }) => finishGoogleOAuth(request),
		},
	},
});
