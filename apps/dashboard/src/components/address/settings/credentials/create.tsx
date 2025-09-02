import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, InfoIcon, PlusIcon } from "lucide-react";
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

type CredentialResponse = {
	id: string;
	title: string;
	description?: string;
	username: string;
	password: string;
	addressEmail: string;
	createdAt: Date;
	activeUntil?: Date;
};

export default function CreateCredentials({
	workspaceId,
	addressId,
}: {
	workspaceId: string;
	addressId: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [newCredentials, setNewCredentials] =
		useState<CredentialResponse | null>(null);
	const [copied, setCopied] = useState<{
		username: boolean;
		password: boolean;
	}>({
		username: false,
		password: false,
	});
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: async (data: {
			title: string;
			description?: string;
			addressId: string;
		}) => {
			const response = await client.v1.web.credentials.post(
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
						: "Failed to create credentials",
				);
			}

			return response.data;
		},
		onSuccess: (data) => {
			setNewCredentials({
				...data,
				description: data.description ?? undefined,
				activeUntil: data.activeUntil ?? undefined,
			});
			// Invalidate credentials list to refresh it
			queryClient.invalidateQueries({
				queryKey: ["credentials", workspaceId, addressId],
			});
		},
		onError: (error) => {
			console.error("Failed to create credentials:", error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		createMutation.mutate({
			title: title.trim(),
			description: description.trim() || undefined,
			addressId,
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
		setTitle("");
		setDescription("");
		setNewCredentials(null);
		setCopied({ username: false, password: false });
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					className="flex cursor-pointer items-center space-x-2"
				>
					<PlusIcon className="h-4 w-4 text-neutral-600" />
					<span className="font-medium text-neutral-600 text-sm">
						Create new Credentials
					</span>
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-md border-none bg-neutral-100 outline-none ring-2 ring-neutral-100">
				{!newCredentials ? (
					<form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4">
						<h2 className="font-semibold text-lg">Create new Credentials</h2>
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
						<div className="flex flex-row items-center space-x-1">
							<InfoIcon className="h-4 w-4 text-neutral-500" />
							<p className="text-neutral-600 text-sm">
								A password for your credential is getting randomly generated.
							</p>
						</div>
						<Button
							variant="default"
							type="submit"
							disabled={!title.trim() || createMutation.isPending}
						>
							{createMutation.isPending ? "Creating..." : "Create"}
						</Button>
						{createMutation.error && (
							<Alert variant="destructive">
								<AlertDescription>
									{createMutation.error.message}
								</AlertDescription>
							</Alert>
						)}
					</form>
				) : (
					<div className="flex flex-col space-y-4 p-4">
						<h2 className="font-semibold text-lg">
							Credentials Created Successfully!
						</h2>

						<Alert>
							<InfoIcon className="h-4 w-4" />
							<AlertDescription>
								<strong>Important:</strong> This is the only time you'll be able
								to see the password. Make sure to copy and save it securely.
							</AlertDescription>
						</Alert>

						<div className="space-y-3">
							<div>
								<label
									htmlFor="username-field"
									className="mb-1 block font-medium text-neutral-700 text-sm"
								>
									Username
								</label>
								<div className="flex items-center space-x-2">
									<Input
										id="username-field"
										type="text"
										value={newCredentials.username}
										readOnly
										className="bg-neutral-200 font-mono"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											copyToClipboard(newCredentials.username, "username")
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
									htmlFor="password-field"
									className="mb-1 block font-medium text-neutral-700 text-sm"
								>
									Password
								</label>
								<div className="flex items-center space-x-2">
									<Input
										id="password-field"
										type="text"
										value={newCredentials.password}
										readOnly
										className="bg-neutral-200 font-mono"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											copyToClipboard(newCredentials.password, "password")
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

							<div>
								<label
									htmlFor="smtp-server-field"
									className="mb-1 block font-medium text-neutral-700 text-sm"
								>
									SMTP Server
								</label>
								<Input
									id="smtp-server-field"
									type="text"
									value="mail.selfmail.app"
									readOnly
									className="bg-neutral-200"
								/>
							</div>
						</div>

						<Button onClick={handleClose} className="mt-4">
							Done
						</Button>
					</div>
				)}
			</DialogContent>
			<DialogOverlay className="bg-black/10" />
		</Dialog>
	);
}
