import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, EditIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import {
	Alert,
	AlertDescription,
	Button,
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogTrigger,
	Input,
} from "ui";
import { client } from "@/lib/client";

type EditCredentialProps = {
	credential: {
		id: string;
		title: string;
		description?: string;
		username: string;
		passwordViewed: boolean;
		addressEmail: string;
		createdAt: Date;
		updatedAt: Date;
		activeUntil?: Date;
		isExpired: boolean;
	};
	workspaceId: string;
	addressId: string;
};

export default function EditCredentials({
	credential,
	workspaceId,
	addressId,
}: EditCredentialProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState(credential.title);
	const [description, setDescription] = useState(credential.description || "");
	const [regeneratedCredentials, setRegeneratedCredentials] = useState<{
		password: string;
		username: string;
	} | null>(null);
	const [copied, setCopied] = useState<{
		username: boolean;
		password: boolean;
	}>({
		username: false,
		password: false,
	});
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: async (data: { title: string; description?: string }) => {
			const response = await client.v1.web
				.credentials({ credentialsId: credential.id })
				.put(
					{
						...data,
					},
					{
						query: { workspaceId },
					},
				);

			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to update credentials",
				);
			}

			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["credentials", workspaceId, addressId],
			});
		},
		onError: (error) => {
			console.error("Failed to update credentials:", error);
		},
	});

	const regenerateMutation = useMutation({
		mutationFn: async () => {
			const response = await client.v1.web
				.credentials({ credentialsId: credential.id })
				["regenerate-password"].post(
					{},
					{
						query: { workspaceId },
					},
				);

			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to regenerate password",
				);
			}

			return response.data;
		},
		onSuccess: (data) => {
			setRegeneratedCredentials({
				password: data.password,
				username: data.username,
			});
			queryClient.invalidateQueries({
				queryKey: ["credentials", workspaceId, addressId],
			});
		},
		onError: (error) => {
			console.error("Failed to regenerate password:", error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		updateMutation.mutate({
			title: title.trim(),
			description: description.trim() || undefined,
		});
	};

	const copyToClipboard = async (
		text: string,
		type: "username" | "password",
	) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied((prev) => ({ ...prev, [type]: true }));
			setTimeout(() => {
				setCopied((prev) => ({ ...prev, [type]: false }));
			}, 2000);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setTitle(credential.title);
		setDescription(credential.description || "");
		setRegeneratedCredentials(null);
		setCopied({ username: false, password: false });
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="cursor-pointer text-neutral-600 text-sm"
				>
					<EditIcon className="h-4 w-4" />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-md border-none bg-neutral-100 outline-none ring-2 ring-neutral-100">
				<div className="flex flex-col space-y-4 p-4">
					<h2 className="font-semibold text-lg">Edit Credentials</h2>

					{regeneratedCredentials && (
						<Alert>
							<AlertDescription>
								<strong>New password generated!</strong> This is the only time
								you'll be able to see it.
							</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
						<Input
							type="text"
							className="bg-neutral-200"
							placeholder="Credential Name"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
						<Input
							type="text"
							className="bg-neutral-200"
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>

						<div className="flex space-x-2">
							<Button
								variant="default"
								type="submit"
								disabled={!title.trim() || updateMutation.isPending}
								className="flex-1"
							>
								{updateMutation.isPending ? "Updating..." : "Update"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => regenerateMutation.mutate()}
								disabled={regenerateMutation.isPending}
								className="flex items-center space-x-1"
							>
								<RefreshCwIcon className="h-4 w-4" />
								<span>
									{regenerateMutation.isPending
										? "Regenerating..."
										: "New Password"}
								</span>
							</Button>
						</div>
					</form>

					{regeneratedCredentials && (
						<div className="space-y-3 border-t pt-4">
							<h3 className="font-medium text-sm">New Credentials</h3>
							<div>
								<label
									htmlFor="regen-username-field"
									className="mb-1 block font-medium text-neutral-700 text-sm"
								>
									Username
								</label>
								<div className="flex items-center space-x-2">
									<Input
										id="regen-username-field"
										type="text"
										value={regeneratedCredentials.username}
										readOnly
										className="bg-neutral-200 font-mono"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											copyToClipboard(
												regeneratedCredentials.username,
												"username",
											)
										}
									>
										{copied.username ? (
											<CheckIcon className="h-4 w-4 text-green-600" />
										) : (
											<CopyIcon className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							<div>
								<label
									htmlFor="regen-password-field"
									className="mb-1 block font-medium text-neutral-700 text-sm"
								>
									Password
								</label>
								<div className="flex items-center space-x-2">
									<Input
										id="regen-password-field"
										type="text"
										value={regeneratedCredentials.password}
										readOnly
										className="bg-neutral-200 font-mono"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											copyToClipboard(
												regeneratedCredentials.password,
												"password",
											)
										}
									>
										{copied.password ? (
											<CheckIcon className="h-4 w-4 text-green-600" />
										) : (
											<CopyIcon className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
						</div>
					)}

					{(updateMutation.error || regenerateMutation.error) && (
						<Alert variant="destructive">
							<AlertDescription>
								{updateMutation.error?.message ||
									regenerateMutation.error?.message}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex space-x-2">
						<Button onClick={handleClose} variant="outline" className="flex-1">
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
			<DialogOverlay className="bg-black/10" />
		</Dialog>
	);
}
