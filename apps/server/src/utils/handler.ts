export async function handler() {
	const files = new Bun.Glob("**/*.ts");

	for await (const file of files.scan(`${process.cwd()}/src/routes`)) {
		const imp = (await import(`${process.cwd()}/src/routes/${file}`)) as {
			default: () => void | Promise<void>;
		};
		const defaultFunc = imp.default;

		await defaultFunc();
	}
}
