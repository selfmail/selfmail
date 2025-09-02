import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import CreateCredentials from "./credentials/create";

type Props = {
	address: string;

	workspaceId: string;
	addressId: string;

	// credentials
	smtpCredentials: {
		id: string;
		title: string;
		description: string | null;
		username: string;
		createdAt: Date;
		updatedAt: Date;
		activeUntil: Date | null;
		isExpired: boolean;
		createdBy: string;
	}[];
};

export default function AddressForm({
	address,
	smtpCredentials,
	workspaceId,
	addressId,
}: Props) {
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

				{smtpCredentials.map((credential) => (
					<div
						className="flex w-full flex-row items-center justify-between rounded-lg bg-neutral-100 p-4"
						key={credential.id}
					>
						<div className="flex flex-row items-center space-x-3">
							<h2>{credential.username}</h2>
							<p>
								Created at {new Date(credential.createdAt).toLocaleDateString()}
							</p>
						</div>

						<div className="flex flex-row space-x-3">
							<button
								type="button"
								className="cursor-pointer text-neutral-600 text-sm"
							>
								Edit
							</button>
							<button
								type="button"
								className="cursor-pointer text-red-600 text-sm"
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
