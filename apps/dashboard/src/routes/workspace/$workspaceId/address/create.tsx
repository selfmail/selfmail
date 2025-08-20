import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/address/create")({
	component: AuthComponent,
});

function AuthComponent() {
	const { workspaceId } = Route.useParams();
	return (
		<RequireAuth>
			<RequireWorkspace
				permissions={["addresses:create"]}
				workspaceId={workspaceId}
			>
				<RouteComponent workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

// Define the form data structure
type FormData = {
	localPart: string;
	domain: string;
};

function RouteComponent({ workspaceId }: { workspaceId: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const form = useForm<FormData>({
		defaultValues: {
			localPart: "",
			domain: "",
		},
	});

	// Fetch available domains for the workspace using useQuery
	const {
		data: domains = [],
		isLoading: loadingDomains,
		error: domainsError,
	} = useQuery({
		queryKey: ["workspace-domains", workspaceId],
		queryFn: async () => {
			const response = await client.v1.web.address.domains.get({
				query: {
					workspaceId,
				},
			});

			if (response.error) {
				console.error("Failed to fetch domains:", response.error);

				// Handle specific error types
				if (response.status === 403) {
					throw new Error(
						"You don't have permission to view domains for this workspace",
					);
				}
				if (response.status === 404) {
					throw new Error("Workspace not found");
				}
				if (response.status === 401) {
					throw new Error("Authentication required. Please log in again");
				}

				throw new Error("Failed to fetch available domains");
			}

			if (!response.data || response.data.length === 0) {
				// If no domains are available, still show selfmail.app option
				return [
					{
						id: "selfmail-app",
						domain: "selfmail.app",
					},
				];
			}

			return response.data;
		},
		retry: (failureCount, error) => {
			// Don't retry on permission errors or authentication errors
			if (
				error.message.includes("permission") ||
				error.message.includes("Authentication")
			) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Show error toast if domains failed to load (but only once)
	if (domainsError && !loadingDomains) {
		toast.error(domainsError.message || "Failed to fetch available domains");
	}

	const handleSubmit = async (values: FormData) => {
		setIsLoading(true);
		setError("");

		try {
			const email = `${values.localPart}@${values.domain}`;

			const response = await client.v1.web.address.create.post(
				{
					email,
					domain: values.domain,
				},
				{
					query: {
						workspaceId,
					},
				},
			);

			if (response.error) {
				console.log(response.error.value);

				// Handle specific HTTP status codes
				if (response.status === 403) {
					setError(
						"You don't have permission to create email addresses in this workspace",
					);
					setIsLoading(false);
					return;
				}

				if (response.status === 409) {
					setError(
						"This email address already exists. Please choose a different username or domain.",
					);
					setIsLoading(false);
					return;
				}

				if (response.status === 400) {
					if (typeof response.error.value === "string") {
						setError(response.error.value);
					} else {
						setError(
							response.error.value?.message ||
								"Invalid email address format or domain",
						);
					}
					setIsLoading(false);
					return;
				}

				if (response.status === 401) {
					setError("Authentication required. Please log in again.");
					setIsLoading(false);
					return;
				}

				// Generic error handling
				if (typeof response.error.value === "string") {
					setError(response.error.value);
					setIsLoading(false);
					return;
				}

				setError(
					response.error.value?.message ||
						"An error occurred while creating the email address",
				);
				setIsLoading(false);
				return;
			}

			toast.success(`Email address ${email} created successfully!`);

			// Redirect back to workspace dashboard or addresses list
			navigate({
				to: "/workspace/$workspaceId",
				params: { workspaceId },
			});
		} catch (err) {
			console.error("Error creating address:", err);

			// Handle network errors or other exceptions
			if (err instanceof Error) {
				if (err.message.includes("fetch")) {
					setError(
						"Network error. Please check your connection and try again.",
					);
				} else if (err.message.includes("permission")) {
					setError(
						"You don't have permission to create email addresses in this workspace",
					);
				} else {
					setError(
						err.message ||
							"An unexpected error occurred while creating the email address",
					);
				}
			} else {
				setError(
					"An unexpected error occurred while creating the email address",
				);
			}

			setIsLoading(false);
		}
	};

	if (loadingDomains) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<div className="w-full max-w-md space-y-4">
					<div className="space-y-2 text-center">
						<h1 className="font-bold text-2xl tracking-tight">
							Create Email Address
						</h1>
						<p className="text-neutral-500 text-sm">
							Loading available domains...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (domainsError) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<div className="w-full max-w-md space-y-4">
					<div className="space-y-2 text-center">
						<h1 className="font-bold text-2xl tracking-tight">
							Create Email Address
						</h1>
						<p className="text-red-500 text-sm">
							{domainsError.message || "Failed to load domains."}
						</p>
						{!domainsError.message.includes("permission") && (
							<p className="text-neutral-500 text-xs">
								You can still use @selfmail.app domain.
							</p>
						)}
					</div>
					<div className="flex justify-center space-x-2">
						{!domainsError.message.includes("permission") &&
							!domainsError.message.includes("Authentication") && (
								<Button
									onClick={() => window.location.reload()}
									variant="outline"
								>
									Try Again
								</Button>
							)}
						<Button
							onClick={() =>
								navigate({
									to: "/workspace/$workspaceId",
									params: { workspaceId },
								})
							}
							variant="default"
						>
							Go Back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6 px-5 md:px-0"
					>
						<div className="space-y-2 text-center">
							<h1 className="font-bold text-2xl tracking-tight">
								Create Email Address
							</h1>
							<p className="text-neutral-500 text-sm">
								Create a new email address for your workspace to start receiving
								emails.
							</p>
						</div>

						<div className="space-y-4">
							<FormField
								control={form.control}
								name="localPart"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Username</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter username (e.g., john, support, info)"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
								rules={{
									required: "Username is required",
									minLength: {
										value: 1,
										message: "Username must be at least 1 character long",
									},
									maxLength: {
										value: 64,
										message: "Username must be no more than 64 characters long",
									},
									pattern: {
										value: /^[a-zA-Z0-9._-]+$/,
										message:
											"Username can only contain letters, numbers, dots, underscores, and hyphens",
									},
								}}
							/>

							<FormField
								control={form.control}
								name="domain"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Domain</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a domain" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{domains.map((domain) => (
													<SelectItem key={domain.id} value={domain.domain}>
														<div className="flex w-full items-center justify-between">
															<span>@{domain.domain}</span>
															{domain.domain === "selfmail.app" && (
																<span className="ml-2 rounded-md bg-blue-100 px-2 py-1 text-blue-800 text-xs">
																	Free
																</span>
															)}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
								rules={{
									required: "Domain is required",
								}}
							/>

							{form.watch("localPart") && form.watch("domain") && (
								<div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
									<p className="text-neutral-600 text-sm">
										<strong>Email Preview:</strong>{" "}
										<span className="font-mono">
											{form.watch("localPart")}@{form.watch("domain")}
										</span>
									</p>
									{form.watch("domain") === "selfmail.app" && (
										<p className="mt-2 text-blue-600 text-xs">
											💡 Using @selfmail.app is free and ready to use
											immediately!
										</p>
									)}
								</div>
							)}
						</div>

						{error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || domains.length === 0}
						>
							{isLoading ? "Creating..." : "Create Email Address"}
						</Button>

						{domains.length === 0 && (
							<p className="text-center text-neutral-500 text-sm">
								No verified domains available. Please add and verify a domain
								first.
							</p>
						)}
					</form>
				</Form>
			</div>
		</div>
	);
}
