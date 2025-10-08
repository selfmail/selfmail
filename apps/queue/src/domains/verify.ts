import { inngest } from "../client";

export default inngest.createFunction(
	{
		id: "verify-domain",
	},
	{
		event: "domain/verify",
	},
	async ({ event, step }) => {
		const { domain } = event.data;
		await step.run("Verify domain", async () => {
			// Simulate a domain verification process
			console.log(`Verifying domain: ${domain}`);
			// Here you would add the actual verification logic
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async work
			console.log(`Domain ${domain} verified successfully.`);
		});
	}
);
