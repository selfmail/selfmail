import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "ui";
import UnderConstruction from "@/components/contruction";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/billing")({
	component: App,
});

function App() {
	const { workspaceId } = Route.useParams();
	return (
		<RequireAuth>
			<RequireWorkspace
				permissions={["payments:manage"]}
				workspaceId={workspaceId}
			>
				<BillingPage workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function BillingPage({ workspaceId }: { workspaceId: string }) {
	useTitle("Billing - Selfmail Dashboard", "Billing - Selfmail Dashboard");

	const { data, isLoading, error } = useQuery({
		queryKey: ["workspace", workspaceId, "billing"],
		queryFn: async () => {
			const res = await client.v1.web.payments.currentPlan.get({
				query: {
					workspaceId,
				},
				headers: {},
			});

			return res.data;
		},
	});

	if (error || !data) {
		return <div>Error loading billing information</div>;
	}

	return (
		<DashboardLayout
			showNav={false}
			className="flex flex-1 flex-col"
			showBackButton={true}
			workspaceId={workspaceId}
			title="Billing"
		>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
						<div className="flex flex-col justify-between rounded-md bg-neutral-100 p-4">
							<div className="flex flex-col gap-2">
								<h2>Free Plan</h2>
								<ul>
									<li>Up to 10GB storage</li>
									<li>Basic support</li>
									<li>One Member in a workspace</li>
									<li>Basic API access</li>
								</ul>
							</div>
							{data.plan === "free" && (
								<p>You are currently on the Free plan.</p>
							)}
						</div>
						<div className="flex flex-col justify-between rounded-md bg-neutral-100 p-4">
							<div className="flex flex-col gap-2">
								<h2>Selfmail Plus</h2>
								<p>25 USD / month or 250 USD / year</p>
								<ul>
									<li>Up to 100GB storage</li>
									<li>AI & API access</li>
									<li>Up to 3 Members</li>
									<li>Early Access to new features</li>
									<li>Priority support with Email</li>
								</ul>
							</div>
							{data.plan === "premium" ? (
								<p>You are currently on the Selfmail Plus plan.</p>
							) : (
								// <a
								// 	href={`https://selfmail.com/checkout?workspaceId=${workspaceId}&product=selfmail-plus`}
								// >
								// 	<Button>Upgrade to Selfmail Plus</Button>
								// </a>
								<p>Upgrades are coming soon to selfmail!</p>
							)}
						</div>
						<div className="flex flex-col justify-between rounded-md bg-neutral-100 p-4">
							<div className="flex flex-col gap-2">
								<h2>Selfmail Premium</h2>
								<p>150 USD / month or 1500 USD / year</p>
								<ul>
									<li>Up to 1,000 GB storage</li>
									<li>AI & API access</li>
									<li>Up to 10 Members</li>
									<li>Early Access to new features</li>
									<li>Priority support with Email</li>
									<li>
										Possibility to increase limit (in this case, please contact
										us)
									</li>
								</ul>
							</div>
							{data.plan === "premium" ? (
								<p>You are currently on the Selfmail Premium plan.</p>
							) : (
								// <a
								// 	className="mt-4"
								// 	href={`https://selfmail.com/checkout?workspaceId=${workspaceId}&product=selfmail-premium`}
								// >
								// 	<Button>Upgrade to Selfmail Plus</Button>
								// </a>
								<p>Upgrades are coming soon to selfmail!</p>
							)}
						</div>
					</div>
				</div>
			)}
			<div className="mt-8 flex h-full items-center justify-center">
				<UnderConstruction />
			</div>
		</DashboardLayout>
	);
}
