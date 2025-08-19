import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	ImageUpload,
	Input,
} from "ui";
import { RequireAuth, useAuth } from "@/lib/auth";
import { client } from "@/lib/client";

export const Route = createFileRoute("/workspace/create/")({
	component: IndexComponent,
});
function IndexComponent() {
	return (
		<RequireAuth>
			<WorkspaceComponent />
		</RequireAuth>
	);
}

// Define the form data structure
type FormData = {
	name: string;
};

// Create a new workspace
function WorkspaceComponent() {
	useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [workspaceImage, setWorkspaceImage] = useState<File | null>(null);

	const navigate = useNavigate();

	const form = useForm<FormData>({
		defaultValues: {
			name: "",
		},
	});

	const handleSubmit = async (values: FormData) => {
		setIsLoading(true);
		setError("");

		try {
			// Let's try a direct fetch approach for the form submission
			const formData = new FormData();
			formData.append("name", values.name);

			// Only include image if it exists
			if (workspaceImage) {
				formData.append("image", workspaceImage);
			}

			// Use fetch directly with FormData
			const response = await client.v1.web.workspace.create.post({
				image: workspaceImage ?? undefined,
				name: values.name,
			});

			if (response.error) {
				console.log(response.error.value);
				if (typeof response.error.value === "string") {
					setError(response.error.value);
					setIsLoading(false);
					return;
				}

				setError(
					response.error.value.message ||
						"An error occurred while creating the workspace",
				);
				setIsLoading(false);
				return;
			}

			// Redirect to the appropriate page
			navigate({ to: "/" });
		} catch (err) {
			console.error("Error creating workspace:", err);
			setError("An unexpected error occurred while creating the workspace");
			setIsLoading(false);
		}
	};

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
								Create Your Workspace
							</h1>
							<p className="text-neutral-500 text-sm">
								Create a workspace to organize your projects and team members.
							</p>
						</div>

						<div className="flex justify-center">
							<ImageUpload
								onImageChange={setWorkspaceImage}
								buttonText="Upload Logo"
								removeButtonText="Remove Logo"
								aria-label="Workspace logo"
							/>
						</div>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Workspace Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter workspace name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
							rules={{
								required: "Workspace name is required",
								minLength: {
									value: 2,
									message: "Workspace name must be at least 2 characters long",
								},
							}}
						/>

						{error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Workspace"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
