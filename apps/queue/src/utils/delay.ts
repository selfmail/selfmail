export function calculateNextDelay(delay: number): number | undefined {
	const delays = [
		0, // First attempt: immediate (0ms)
		10 * 1000, // Second attempt: 10 seconds
		5 * 60 * 1000, // Third attempt: 5 minutes
		10 * 60 * 1000, // Fourth attempt: 10 minutes
		60 * 60 * 1000, // Fifth attempt: 1 hour
		5 * 60 * 60 * 1000, // Sixth attempt: 5 hours
		24 * 60 * 60 * 1000, // Seventh attempt: 1 day
		2 * 24 * 60 * 60 * 1000, // Eighth attempt: 2 days
		5 * 24 * 60 * 60 * 1000, // Ninth attempt: 5 days
	];

	const currentIndex = delays.indexOf(delay);

	if (currentIndex === -1) {
		return delays[0];
	}

	if (currentIndex === delays.length - 1) {
		return undefined;
	}

	return delays[currentIndex + 1];
}
