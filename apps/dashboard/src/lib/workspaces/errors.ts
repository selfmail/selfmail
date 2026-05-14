export function getUniqueErrorTarget(error: unknown) {
	const targetValue =
		error instanceof Error && "meta" in error
			? (error.meta as { target?: string | string[] } | undefined)?.target
			: undefined;

	return new Set(Array.isArray(targetValue) ? targetValue : [targetValue]);
}
