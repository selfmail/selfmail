import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EmailPreview } from "#/components/dashboard/email-preview";
import { getDashboardEmailFn } from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/mail/$emailId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const email = await getDashboardEmailFn({
			data: {
				emailId: params.emailId,
			},
		});

		return {
			email,
		};
	},
});

function RouteComponent() {
	const navigate = useNavigate();
	const { email } = Route.useLoaderData();
	const closeMail = () => {
		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		void navigate({ to: "/" });
	};

	return (
		<div className="h-dvh w-full overflow-hidden bg-white">
			<EmailPreview
				className="flex rounded-none border-l-0"
				emails={[email]}
				onClose={closeMail}
				selectedEmailId={email.id}
			/>
		</div>
	);
}
