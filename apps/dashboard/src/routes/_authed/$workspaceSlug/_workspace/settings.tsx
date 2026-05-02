import {
	Alert,
	AlertDescription,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	Input,
	Label,
	Textarea,
} from "@selfmail/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { DashboardHeader } from "#/components/dashboard/dashboard-header";
import {
	type DashboardWorkspace,
	deleteWorkspaceFn,
	getDashboardWorkspacesFn,
	updateWorkspaceSettingsFn,
} from "#/lib/workspaces";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/settings",
)({
	component: RouteComponent,
	loader: async () => ({
		workspaces: await getDashboardWorkspacesFn(),
	}),
});

type WorkspaceSettingsFormProps = {
	workspace: DashboardWorkspace;
};

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const { workspaces } = Route.useLoaderData();

	return (
		<div className="flex min-h-dvh w-full flex-col items-center bg-white">
			<div className="flex w-full flex-col gap-10 px-5 py-6 lg:px-24 xl:px-32">
				<DashboardHeader currentWorkspace={workspace} workspaces={workspaces} />
				<main className="flex w-full flex-col gap-8">
					<div className="flex max-w-2xl flex-col gap-2">
						<h1 className="text-balance font-medium text-2xl">
							Workspace settings
						</h1>
						<p className="text-neutral-600 text-pretty text-sm">
							Update the workspace profile, public handle, and destructive
							settings for {workspace.name}.
						</p>
					</div>
					<WorkspaceSettingsForm key={workspace.id} workspace={workspace} />
				</main>
			</div>
		</div>
	);
}

function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
	const navigate = useNavigate();
	const [description, setDescription] = useState(workspace.description ?? "");
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [image, setImage] = useState(workspace.image ?? "");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState(workspace.name);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [slug, setSlug] = useState(workspace.slug);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSaving(true);
		setSaveError(null);
		setSaveMessage(null);

		try {
			const result = await updateWorkspaceSettingsFn({
				data: {
					description,
					image,
					name,
					slug,
					workspaceId: workspace.id,
				},
			});

			if (result.status === "error") {
				setSaveError(result.error);
				return;
			}

			setSaveMessage("Workspace settings updated.");

			if (result.slug !== workspace.slug) {
				await navigate({
					params: {
						workspaceSlug: result.slug,
					},
					to: "/$workspaceSlug/settings",
				});
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		setDeleteError(null);

		try {
			const result = await deleteWorkspaceFn({
				data: {
					workspaceId: workspace.id,
				},
			});

			if (result.status === "error") {
				setDeleteError(result.error);
				return;
			}

			await navigate({
				to: "/",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col">
			<form
				className="grid gap-6 border-neutral-200 border-t py-8 lg:grid-cols-[16rem_minmax(0,42rem)] lg:gap-12"
				noValidate
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col gap-1">
					<h2 className="text-balance font-medium text-lg">General</h2>
					<p className="text-muted-foreground text-pretty text-sm">
						Rename the workspace and update the details shown to members.
					</p>
				</div>

				<div className="grid gap-5">
					<div className="grid gap-2">
						<Label htmlFor="workspace-name">Workspace name</Label>
						<Input
							aria-describedby={saveError ? "workspace-save-error" : undefined}
							aria-invalid={Boolean(saveError)}
							id="workspace-name"
							onChange={(event) => setName(event.target.value)}
							value={name}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="workspace-slug">Workspace handle</Label>
						<Input
							aria-describedby="workspace-slug-help"
							id="workspace-slug"
							onChange={(event) => setSlug(event.target.value.toLowerCase())}
							value={slug}
						/>
						<p
							className="text-muted-foreground text-pretty text-sm"
							id="workspace-slug-help"
						>
							Used in workspace URLs and default selfmail addresses.
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="workspace-description">Description</Label>
						<Textarea
							id="workspace-description"
							onChange={(event) => setDescription(event.target.value)}
							placeholder="What this workspace is for"
							value={description}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="workspace-image">Workspace image URL</Label>
						<Input
							id="workspace-image"
							onChange={(event) => setImage(event.target.value)}
							placeholder="https://example.com/logo.png"
							type="url"
							value={image}
						/>
					</div>

					{saveError ? (
						<Alert
							aria-live="polite"
							id="workspace-save-error"
							variant="destructive"
						>
							<AlertDescription>{saveError}</AlertDescription>
						</Alert>
					) : null}

					{saveMessage ? (
						<Alert aria-live="polite" role="status">
							<AlertDescription>{saveMessage}</AlertDescription>
						</Alert>
					) : null}

					<div className="flex justify-end">
						<Button disabled={isSaving} type="submit">
							{isSaving ? "Saving..." : "Update workspace"}
						</Button>
					</div>
				</div>
			</form>

			<section className="grid gap-6 border-neutral-200 border-t py-8 lg:grid-cols-[16rem_minmax(0,42rem)] lg:gap-12">
				<div className="flex flex-col gap-1">
					<h2 className="text-balance font-medium text-destructive text-lg">
						Delete workspace
					</h2>
					<p className="text-muted-foreground text-pretty text-sm">
						Delete this workspace when you no longer need it. This action cannot
						be undone.
					</p>
				</div>

				<div className="flex flex-col items-start gap-5 sm:items-end">
					{deleteError ? (
						<Alert aria-live="polite" variant="destructive">
							<AlertDescription>{deleteError}</AlertDescription>
						</Alert>
					) : null}

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button disabled={isDeleting} type="button" variant="destructive">
								Delete workspace
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete {workspace.name}?</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently deletes the workspace. You will lose access
									to its settings and related workspace data.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isDeleting}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									className="bg-destructive text-white hover:bg-destructive/90"
									disabled={isDeleting}
									onClick={handleDelete}
								>
									{isDeleting ? "Deleting..." : "Delete workspace"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</section>
		</div>
	);
}
