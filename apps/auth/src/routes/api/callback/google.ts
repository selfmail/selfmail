import { createFileRoute } from "@tanstack/react-router";
import { finishGoogleOAuth } from "#/lib/oauth";

export const Route = createFileRoute("/api/callback/google")({
	server: {
		handlers: {
			GET: ({ request }) => finishGoogleOAuth(request),
		},
	},
});
