import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import AddressEmailList from "@/components/dashboard/address-email-list";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace } from "@/lib/workspace";
import type { EmailData } from "@/types/email";

export const Route = createFileRoute(
	"/workspace/$workspaceId/address/$addressId/",
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
	const [open, setOpen] = useState(true);
	const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
	const [addressInfo, setAddressInfo] = useState<{
		id: string;
		email: string;
	} | null>(null);

	// Fetch address info and total email count
	const { data: addressData, isLoading: addressLoading } = useQuery({
		queryKey: ["address-info", addressId, workspaceId],
		queryFn: async () => {
			const res = await client.v1.web.address.emails({ addressId }).get({
				query: {
					limit: 1, // We only need the first result to get address info and total count
					page: 1,
					addressId,
					workspaceId,
				},
			});

			if (res.error) {
				const errorText =
					typeof res.error.value === "string"
						? res.error.value
						: res.error.value.message || "Unknown error";
				throw new Error(`Failed to fetch address info: ${errorText}`);
			}

			return res.data;
		},
		retry: 3,
		retryDelay: 1000,
	});

	const handleEmailClick = (email: EmailData) => {
		setSelectedEmail(email);
		setOpen(true);
	};

	const handleAddressLoad = (address: { id: string; email: string }) => {
		setAddressInfo(address);
	};

	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			<DashboardNavigation workspaceId={workspaceId} />

			{/* Page container */}
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32">
				{/* Page header */}
				<div className="flex items-center justify-between py-6">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							{addressData?.address?.email || addressInfo?.email
								? `Emails for ${addressData?.address?.email || addressInfo?.email}`
								: `Loading address ${addressId}...`}
						</h1>
						<p className="mt-1 text-neutral-600 text-sm">
							{addressLoading
								? "Loading email count..."
								: addressData?.totalCount !== undefined
									? `Address has ${addressData.totalCount} email${addressData.totalCount !== 1 ? "s" : ""}`
									: "Email count unavailable"}
						</p>
					</div>
					<div>
						<Link
							to="/workspace/$workspaceId/address/$addressId/settings"
							params={{ addressId, workspaceId }}
							className="flex items-center space-x-2"
						>
							<SettingsIcon className="h-4 w-4 cursor-pointer text-neutral-600" />
							<p>Address Settings</p>
						</Link>
					</div>
				</div>

				<EmailViewer
					setOpen={setOpen}
					open={open}
					selectedEmail={selectedEmail}
				/>

				{/* Email List */}
				<div className="order-1 lg:order-1 lg:col-span-5 xl:col-span-4">
					<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
						<AddressEmailList
							workspace={workspaceId}
							addressId={addressId}
							onEmailClick={handleEmailClick}
							onAddressLoad={handleAddressLoad}
						/>
					</div>
				</div>
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
