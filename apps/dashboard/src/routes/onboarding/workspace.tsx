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
import { client } from "@/lib/client";

export const Route = createFileRoute("/onboarding/workspace")({
	component: WorkspaceComponent,
});

// Define the form data structure
type FormData = {
	name: string;
};

// Create a new workspace
function WorkspaceComponent() {
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
			// First create the workspace
			const response = await client.v1.web.workspace.create.post({
				name: values.name,
			});

			if (response.error) {
				setError(
					typeof response.error.value === "string"
						? response.error.value
						: "An error occurred while creating the workspace",
				);
				setIsLoading(false);
				return;
			}

			// If we have an image and the API supports image upload, handle it here
			// This is a placeholder for workspace avatar upload functionality
			// You'll need to implement the actual API endpoints for this
			if (workspaceImage && response.data) {
				try {
					const formData = new FormData();
					formData.append("file", workspaceImage);

					// This is a placeholder - replace with actual API endpoint when available
					const imageUploadResponse = await fetch(
						"/api/workspace/avatar/upload",
						{
							method: "POST",
							body: formData,
						},
					);

					if (!imageUploadResponse.ok) {
						console.error("Failed to upload workspace image");
					}
				} catch (imageError) {
					console.error("Error uploading workspace image:", imageError);
					// Continue anyway since the workspace was created
				}
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
