import { createFileRoute } from "@tanstack/react-router";
import { startGoogleOAuth } from "#/utils/google-oauth.server";

export const Route = createFileRoute("/api/login/google/")({
	server: {
		handlers: {
			GET: ({ request }) => startGoogleOAuth(request),
		},
	},
});
