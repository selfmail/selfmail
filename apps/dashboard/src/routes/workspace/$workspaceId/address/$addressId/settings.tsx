import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import AddressForm from "@/components/address/settings/form";
import DashboardHeader from "@/components/dashboard/header";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute(
	"/workspace/$workspaceId/address/$addressId/settings",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId, addressId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<AddressDashboard workspaceId={workspaceId} addressId={addressId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function AddressDashboard({
	workspaceId,
	addressId,
}: {
	workspaceId: string;
	addressId: string;
}) {
	// Fetch address info and total email count
	const { data, error, isLoading } = useQuery({
		queryKey: ["address-settings", addressId, workspaceId],
		queryFn: async () => {
			const res = await client.v1.web.address.details.get({
				query: {
					addressId,
					workspaceId,
				},
			});

			if (res.error) {
				console.log(res.error);
				throw new Error("Unknown error at fetching details for domain.");
			}

			return res.data;
		},
	});

	if (error) {
		toast.error(
			"We got an unknown error at fetching the details for your address.",
		);
	}

	return (
		<div>
			<DashboardHeader workspaceId={workspaceId} />

			<div className="flex flex-col space-y-5 px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
				{isLoading ? (
					<p>Loading...</p>
				) : error || !data ? (
					<p>Error loading address details.</p>
				) : (
					<AddressForm
						workspaceId={workspaceId}
						addressId={addressId}
						smtpCredentials={data.address.smtpCredentials}
						address={data.address.email}
					/>
				)}
			</div>
		</div>
	);
}
