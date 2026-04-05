import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/lib/auth";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Billing Portal | Selfmail",
			},
			{
				name: "description",
				content:
					"Manage your Selfmail subscription, billing details, and invoices in one place.",
			},
		],
	}),
	loader: async () => ({
		user: await getCurrentUserFn(),
	}),
	component: App,
});

function App() {
	Route.useLoaderData();

	return (
		<>
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<section>
				<h1 className="text-2xl">Select your Workspace</h1>
			</section>
		</>
	);
}
