import { useQuery } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { client } from "@/lib/client";
import CreateCredentials from "./credentials/create";
import DeleteCredentials from "./credentials/delete";
import EditCredentials from "./credentials/edit";

type Props = {
	address: string;
	workspaceId: string;
	addressId: string;
};

type CredentialType = {
	id: string;
	title: string;
	description: string | null;
	username: string;
	passwordViewed: boolean;
	addressEmail: string;
	createdAt: Date;
	updatedAt: Date;
	activeUntil: Date | null;
	isExpired: boolean;
	createdBy: string;
};

export default function AddressForm({
	address,
	workspaceId,
	addressId,
}: Props) {
	const {
		data: credentialsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["credentials", workspaceId, addressId],
		queryFn: async () => {
			const response = await client.v1.web.credentials.get({
				query: {
					workspaceId,
					addressId,
					page: 1,
					limit: 50,
				},
			});

			if (response.error) {
				throw new Error("Failed to fetch credentials!");
			}

			return response.data;
		},
	});

	const smtpCredentials = credentialsData?.credentials || [];

	return (
		<div className="flex flex-col space-y-12">
			<h2 className="text-2xl">Manage Address {address}</h2>
			<div className="flex flex-col space-y-6">
				<div className="flex flex-row items-start justify-between">
					<div className="flex w-[50%] flex-col space-y-3">
						<h3 className="text-xl">SMTP Credentials</h3>
						<p>
							SMTP Credentials can be used to access our outbound smtp server at
							mail.selfmail.app. Use your credentials in the authentication
							process.
						</p>
					</div>
					<CreateCredentials addressId={addressId} workspaceId={workspaceId} />
				</div>

				{isLoading && (
					<div className="text-neutral-600 text-sm">Loading credentials...</div>
				)}

				{error && (
					<div className="text-red-600 text-sm">
						Failed to load credentials: {error.message}
					</div>
				)}

				{smtpCredentials.map((credential: CredentialType) => (
					<div
						className="flex w-full flex-row items-center justify-between rounded-lg bg-neutral-100 p-4"
						key={credential.id}
					>
						<div className="flex flex-row items-center space-x-3">
							<div className="flex flex-col">
								<h3 className="font-medium">{credential.title}</h3>
								{credential.description && (
									<p className="text-neutral-600 text-sm">
										{credential.description}
									</p>
								)}
								<p className="text-neutral-500 text-sm">
									Username: {credential.username}
								</p>
								<p className="text-neutral-500 text-sm">
									Created at{" "}
									{new Date(credential.createdAt).toLocaleDateString()}
								</p>
								{credential.activeUntil && (
									<p
										className={`text-sm ${credential.isExpired ? "text-red-600" : "text-neutral-500"}`}
									>
										{credential.isExpired ? "Expired" : "Expires"} on{" "}
										{new Date(credential.activeUntil).toLocaleDateString()}
									</p>
								)}
							</div>
							<div className="flex items-center space-x-1">
								{credential.passwordViewed ? (
									<div title="Password already viewed">
										<EyeOffIcon className="h-4 w-4 text-neutral-400" />
									</div>
								) : (
									<div title="Password can be viewed">
										<EyeIcon className="h-4 w-4 text-blue-600" />
									</div>
								)}
								<span className="text-neutral-500 text-xs">
									{credential.passwordViewed ? "Viewed" : "Not viewed"}
								</span>
							</div>
						</div>

						<div className="flex flex-row space-x-3">
							<EditCredentials
								credential={{
									...credential,
									description: credential.description ?? undefined,
									activeUntil: credential.activeUntil ?? undefined,
								}}
								workspaceId={workspaceId}
								addressId={addressId}
							/>
							<DeleteCredentials
								credential={{
									id: credential.id,
									title: credential.title,
									username: credential.username,
									addressEmail: credential.addressEmail,
								}}
								workspaceId={workspaceId}
								addressId={addressId}
							/>
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-col space-y-6">
				<div className="flex flex-row items-start justify-between">
					<div className="flex w-[50%] flex-col space-y-3">
						<h3 className="text-xl">Members</h3>
						<p>Manage access to members for this address.</p>
					</div>
					{/* TODO: Implement member management */}
					<div className="text-neutral-500 text-sm">Coming soon...</div>
				</div>
			</div>
		</div>
	);
}
