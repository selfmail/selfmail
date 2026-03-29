import { createFileRoute } from "@tanstack/react-router";
import { startGoogleOAuth } from "#/lib/oauth";

export const Route = createFileRoute("/api/login/google")({
	server: {
		handlers: {
			GET: () => startGoogleOAuth(),
		},
	},
});
