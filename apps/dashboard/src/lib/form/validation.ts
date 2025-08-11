import type { FormState } from "react-hook-form";

/**
 * Formats an error text message for display
 */
export function formatErrorText(message: string): string {
	if (!message) return "";
	return message.trim();
}

/**
 * Gets the first form error message from a form state
 */
export function getFirstFormError(
	formState: FormState<Record<string, any>>,
): string | null {
	if (!formState.errors || Object.keys(formState.errors).length === 0) {
		return null;
	}

	const firstErrorKey = Object.keys(formState.errors)[0];
	if (!firstErrorKey || !formState.errors[firstErrorKey]) {
		return null;
	}

	const error = formState.errors[firstErrorKey];
	return error.message?.toString() || null;
}
