import { createFileRoute } from "@tanstack/react-router";
import { KeyIcon, TrashIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "ui";
import { useAddressDetails } from "@/hooks/useAddressDetails";
import { useDeleteAddress } from "@/hooks/useAddressMutations";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace } from "@/lib/workspace";

type SmtpCredential = {
	id: string;
	title: string | null;
	description: string | null;
	username: string;
	createdAt: Date;
	updatedAt: Date;
	activeUntil: Date | null;
	isExpired: boolean;
	createdBy: string;
};

type AddressMember = {
	id: string;
	name: string;
};

type AddressDetails = {
	address: {
		id: string;
		email: string;
		smtpCredentials: SmtpCredential[];
		members: AddressMember[];
	};
};

export const Route = createFileRoute(
	"/workspace/$workspaceId/address/$addressId/settings",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId, addressId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace
				workspaceId={workspaceId}
				permissions={["addresses:view"]}
			>
				<SettingsPageContent workspaceId={workspaceId} addressId={addressId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function SettingsPageContent({
	workspaceId,
	addressId,
}: {
	workspaceId: string;
	addressId: string;
}) {
	const { data: addressDetails, isLoading } = useAddressDetails(
		workspaceId,
		addressId,
	) as {
		data: AddressDetails | undefined;
		isLoading: boolean;
	};
	const deleteAddress = useDeleteAddress();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!addressDetails) {
		return <div className="p-6">Address not found</div>;
	}

	const handleDeleteAddress = async () => {
		try {
			await deleteAddress.mutateAsync({ addressId, workspaceId });
			// Redirect after successful deletion
			window.location.href = `/workspace/${workspaceId}`;
		} catch (error) {
			console.error("Failed to delete address:", error);
		}
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="font-bold text-3xl">Address Settings</h1>
				<p className="text-muted-foreground">
					Manage settings for {addressDetails.address.email}
				</p>
			</div>

			{/* Team Members */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UsersIcon className="h-5 w-5" />
						Team Access
					</CardTitle>
					<CardDescription>Manage who can access this address</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{addressDetails.address.members.length > 0 ? (
						<div className="space-y-2">
							{addressDetails.address.members.map((member) => (
								<div
									key={member.id}
									className="flex items-center justify-between rounded border p-3"
								>
									<p className="font-medium">{member.name}</p>
									<span className="rounded bg-secondary px-2 py-1 text-secondary-foreground text-xs">
										Member
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							No team members assigned.
						</p>
					)}
					<Button variant="outline" disabled>
						Add Team Member (Coming Soon)
					</Button>
				</CardContent>
			</Card>

			{/* SMTP Credentials */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<KeyIcon className="h-5 w-5" />
						SMTP Credentials
					</CardTitle>
					<CardDescription>
						Create and manage SMTP credentials for this address
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{addressDetails.address.smtpCredentials.length > 0 ? (
						<div className="space-y-2">
							{addressDetails.address.smtpCredentials.map((cred) => (
								<div
									key={cred.id}
									className="flex items-center justify-between rounded border p-3"
								>
									<div>
										<p className="font-medium">{cred.username}</p>
										<p className="text-muted-foreground text-sm">
											Created: {new Date(cred.createdAt).toLocaleDateString()}{" "}
											by {cred.createdBy}
										</p>
									</div>
									<span
										className={`rounded px-2 py-1 text-xs ${
											cred.isExpired
												? "bg-destructive text-destructive-foreground"
												: "bg-secondary text-secondary-foreground"
										}`}
									>
										{cred.isExpired ? "Expired" : "Active"}
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							No SMTP credentials created yet.
						</p>
					)}
					<Button variant="outline" disabled>
						Create New Credential (Coming Soon)
					</Button>
				</CardContent>
			</Card>

			{/* Danger Zone - Delete Address */}
			<RequireWorkspace
				workspaceId={workspaceId}
				permissions={["addresses:delete"]}
				fallback={null}
			>
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<TrashIcon className="h-5 w-5" />
							Danger Zone
						</CardTitle>
						<CardDescription>
							Permanently delete this address and all its data
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{!showDeleteConfirm ? (
							<Button
								variant="destructive"
								onClick={() => setShowDeleteConfirm(true)}
							>
								Delete Address
							</Button>
						) : (
							<div className="space-y-3">
								<Alert>
									<AlertDescription>
										This action cannot be undone. This will permanently delete
										the address "{addressDetails.address.email}" and all
										associated emails.
									</AlertDescription>
								</Alert>
								<div className="flex gap-2">
									<Button
										variant="destructive"
										onClick={handleDeleteAddress}
										disabled={deleteAddress.isPending}
									>
										{deleteAddress.isPending
											? "Deleting..."
											: "Yes, Delete Forever"}
									</Button>
									<Button
										variant="outline"
										onClick={() => setShowDeleteConfirm(false)}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</RequireWorkspace>
		</div>
	);
}
