import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { client } from "@/lib/client";
import { NavLink } from "./nav-link";

export default function DashboardNavigation({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const { data, error, isFetching } = useQuery({
		queryKey: ["addresses", workspaceId],
		queryFn: async () => {
			const addresses = await client.v1.web.dashboard.addresses.get({
				query: {
					workspaceId,
				},
			});

			if (addresses.error) {
				console.log("API Error:", addresses.error);
				throw new Error("Internal Server Error. Please try again later!");
			}
			return addresses.data;
		},
	});

	if (error && !isFetching) {
		toast.error("Failed to load addresses. Please try again later.");
		console.log(error);
		return (
			<div className="flex w-full flex-row items-start justify-between px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
				<div className="text-red-500">Failed to load navigation data.</div>
			</div>
		);
	}

	if (isFetching) {
		return (
			<div className="flex w-full flex-row items-start justify-between px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
				<div className="text-gray-500">Loading navigation...</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-row items-start justify-between px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Mail</p>
				<NavLink href={`/workspace/${workspaceId}`}>Unified Inbox</NavLink>
				<NavLink href={`/workspace/${workspaceId}/compose`}>
					Compose Email
				</NavLink>
				{data?.map((address) => (
					<NavLink
						key={address.id}
						href={`/workspace/${workspaceId}/address/${address.id}`}
					>
						{address.email}
					</NavLink>
				))}
				{data?.length === 0 && (
					<p className="text-gray-500 text-sm">
						No addresses found.{" "}
						<Link
							to="/workspace/$workspaceId/address/create"
							params={{ workspaceId }}
							className="underline"
						>
							Create a new one.
						</Link>
					</p>
				)}
				{data && data.length < 0 && (
					<div className="flex w-min flex-row items-center space-x-0.5 rounded-md bg-transparent p-2 ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
						<span className="h-1 w-1 rounded-full bg-neutral-600" />
						<span className="h-1 w-1 rounded-full bg-neutral-600" />
						<span className="h-1 w-1 rounded-full bg-neutral-600" />
					</div>
				)}
			</div>
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Workspace</p>
				<NavLink href={`/workspace/${workspaceId}/activity`}>Activity</NavLink>
				<NavLink href={`/workspace/${workspaceId}/members`}>Members</NavLink>
				<NavLink href={`/workspace/${workspaceId}/workflows`}>
					Workflows
				</NavLink>
				<NavLink href={`/workspace/${workspaceId}/billing`}>Billing</NavLink>
			</div>
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Settings</p>
				<NavLink href={`/workspace/${workspaceId}/settings/workspace`}>
					Workspace Settings
				</NavLink>
				<NavLink href={`/workspace/${workspaceId}/settings/profile`}>
					Profile Settings
				</NavLink>
				<NavLink href={`/workspace/${workspaceId}/settings/user`}>
					User Settings
				</NavLink>
				<div className="flex w-min flex-row items-center space-x-0.5 rounded-md bg-transparent p-2 ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
				</div>
			</div>
		</div>
	);
}
