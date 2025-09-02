import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import {
	Alert,
	AlertDescription,
	Button,
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogTrigger,
} from "ui";
import { client } from "@/lib/client";

type DeleteCredentialProps = {
	credential: {
		id: string;
		title: string;
		username: string;
		addressEmail: string;
	};
	workspaceId: string;
	addressId: string;
};

export default function DeleteCredentials({
	credential,
	workspaceId,
	addressId,
}: DeleteCredentialProps) {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: async () => {
			const response = await client.v1.web
				.credentials({ credentialsId: credential.id })
				.delete(
					{},
					{
						query: { workspaceId },
					},
				);

			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to delete credentials",
				);
			}

			return response.data;
		},
		onSuccess: () => {
			setIsOpen(false);
			queryClient.invalidateQueries({
				queryKey: ["credentials", workspaceId, addressId],
			});
		},
		onError: (error) => {
			console.error("Failed to delete credentials:", error);
		},
	});

	const handleDelete = () => {
		deleteMutation.mutate();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button type="button" className="cursor-pointer text-red-600 text-sm">
					<TrashIcon className="h-4 w-4" />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-md border-none bg-neutral-100 outline-none ring-2 ring-neutral-100">
				<div className="flex flex-col space-y-4 p-4">
					<div className="flex items-center space-x-2">
						<AlertTriangleIcon className="h-5 w-5 text-red-600" />
						<h2 className="font-semibold text-lg">Delete Credentials</h2>
					</div>

					<Alert variant="destructive">
						<AlertTriangleIcon className="h-4 w-4" />
						<AlertDescription>
							<strong>Warning:</strong> This action cannot be undone. Deleting
							these credentials will permanently remove access using this
							username and password.
						</AlertDescription>
					</Alert>

					<div className="space-y-2">
						<p className="text-sm">
							You are about to delete the following credentials:
						</p>
						<div className="rounded-md bg-neutral-200 p-3">
							<p className="font-semibold text-sm">{credential.title}</p>
							<p className="text-neutral-600 text-sm">
								Username: {credential.username}
							</p>
							<p className="text-neutral-600 text-sm">
								Address: {credential.addressEmail}
							</p>
						</div>
					</div>

					{deleteMutation.error && (
						<Alert variant="destructive">
							<AlertDescription>
								{deleteMutation.error.message}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex space-x-2">
						<Button
							onClick={() => setIsOpen(false)}
							variant="outline"
							className="flex-1"
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDelete}
							variant="destructive"
							className="flex-1"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
			<DialogOverlay className="bg-black/10" />
		</Dialog>
	);
}
