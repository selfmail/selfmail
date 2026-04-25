import type { z } from "zod";

export function getFirstFieldErrors<TFieldName extends string>(
	error: z.ZodError,
) {
	const errors: Partial<Record<TFieldName, string>> = {};

	for (const issue of error.issues) {
		const fieldName = issue.path[0];

		if (typeof fieldName !== "string") {
			continue;
		}

		const typedFieldName = fieldName as TFieldName;

		if (errors[typedFieldName]) {
			continue;
		}

		errors[typedFieldName] = issue.message;
	}

	return errors;
}
