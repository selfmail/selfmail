import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/index";

// Create a client with session-based authentication
function createAuthenticatedClient() {
	if (!import.meta.env.VITE_API_BASE_URL) {
		throw new Error("API_BASE_URL is not defined in environment variables");
	}
	// For session-based auth, we don't need to set headers manually
	// The browser will automatically include cookies in same-origin requests
	return treaty<App>(import.meta.env.VITE_API_BASE_URL ?? "", {
		fetch: {
			credentials: "include", // Include cookies in requests
		},
	});
}

export const client = createAuthenticatedClient();

// Function to recreate the client (keeping for compatibility)
export function updateClientAuth() {
	const newClient = createAuthenticatedClient();
	Object.assign(client, newClient);
}
