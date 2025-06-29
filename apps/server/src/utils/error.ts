import type { Context } from "hono";

export function handlePermissionsError(c: Context) {
	return c.json(
		{
			error: "Unauthorized",
			message: "You do not have permission to access this resource.",
		},
		401,
	);
}

export async function handleValidationError(c: Context, message?: string) {
	if (message) {
		return c.json(
			{
				error: "Validation Error",
				message: message,
			},
			400,
		);
	}

	return c.json(
		{
			error: "Unknown Validation Error",
			message: "An unknown validation error occurred.",
		},
		400,
	);
}
