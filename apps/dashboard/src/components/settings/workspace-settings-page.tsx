import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	DownloadIcon,
	InfoIcon,
	RefreshCwIcon,
	SaveIcon,
	Trash2Icon,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Badge,
	Button,
	Input,
	SettingsBanner,
	SettingsBlock,
	SettingsGroup,
	Skeleton,
	Textarea,
} from "#/components/ui";
import {
	type DashboardWorkspaceSettingsData,
	deleteWorkspaceFn,
	exportWorkspaceDataFn,
	getWorkspaceSettingsFn,
	updateWorkspaceSettingsFn,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { settingsDataCache } from "./settings-data-cache";
import type { SettingsPageComponent } from "./settings-pages";

function formatStorage(storageBytes: string) {
	const bytes = Number(storageBytes);

	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB", "TB"] as const;
	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1,
	);
	const value = bytes / 1024 ** unitIndex;

	return `${value.toLocaleString(getLocale(), {
		maximumFractionDigits: value >= 10 ? 0 : 1,
	})} ${units[unitIndex]}`;
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat(getLocale(), {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

function WorkspaceSettingsLoading() {
	return (
		<div className="grid gap-6">
			<SettingsGroup>
				{Array.from({ length: 3 }).map((_, index) => (
					<SettingsBlock
						description={<Skeleton className="h-4 w-56" />}
						key={index.toString()}
						title={<Skeleton className="h-4 w-36" />}
					/>
				))}
			</SettingsGroup>
			<SettingsGroup>
				{Array.from({ length: 2 }).map((_, index) => (
					<SettingsBlock
						description={<Skeleton className="h-4 w-64" />}
						key={index.toString()}
						title={<Skeleton className="h-4 w-32" />}
					/>
				))}
			</SettingsGroup>
		</div>
	);
}

export const WorkspaceSettingsPage: SettingsPageComponent = ({
	workspaceName,
	workspaceSlug,
}) => {
	const deleteWorkspace = useServerFn(deleteWorkspaceFn);
	const exportWorkspaceData = useServerFn(exportWorkspaceDataFn);
	const getWorkspaceSettings = useServerFn(getWorkspaceSettingsFn);
	const updateWorkspaceSettings = useServerFn(updateWorkspaceSettingsFn);
	const navigate = useNavigate();
	const router = useRouter();
	const cachedSettingsData =
		settingsDataCache.workspace.get(workspaceSlug) ?? null;
	const [data, setData] = useState<DashboardWorkspaceSettingsData | null>(
		cachedSettingsData,
	);
	const [description, setDescription] = useState(
		() => cachedSettingsData?.workspace.description ?? "",
	);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exportError, setExportError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isLoading, setIsLoading] = useState(!cachedSettingsData);
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState(
		() => cachedSettingsData?.workspace.name ?? workspaceName,
	);
	const [success, setSuccess] = useState<string | null>(null);

	const fetchSettings = useCallback(
		() =>
			getWorkspaceSettings({
				data: {
					workspaceSlug,
				},
			}),
		[getWorkspaceSettings, workspaceSlug],
	);
	const setCachedData = useCallback(
		(settingsData: DashboardWorkspaceSettingsData) => {
			settingsDataCache.workspace.set(workspaceSlug, settingsData);
			setData(settingsData);
		},
		[workspaceSlug],
	);

	const loadSettings = useCallback(async () => {
		setError(null);
		setIsLoading(true);

		try {
			const settingsData = await fetchSettings();
			setCachedData(settingsData);
			setName(settingsData.workspace.name);
			setDescription(settingsData.workspace.description ?? "");
		} catch {
			setError(m["dashboard.settings.load_error"]());
		} finally {
			setIsLoading(false);
		}
	}, [fetchSettings, setCachedData]);

	useEffect(() => {
		let ignoreResult = false;

		const loadActivePage = async () => {
			setError(null);
			setIsLoading(true);

			try {
				const settingsData = await fetchSettings();

				if (!ignoreResult) {
					setCachedData(settingsData);
					setName(settingsData.workspace.name);
					setDescription(settingsData.workspace.description ?? "");
				}
			} catch {
				if (!ignoreResult) {
					setError(m["dashboard.settings.load_error"]());
				}
			} finally {
				if (!ignoreResult) {
					setIsLoading(false);
				}
			}
		};

		loadActivePage();

		return () => {
			ignoreResult = true;
		};
	}, [fetchSettings, setCachedData]);

	const saveWorkspace = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccess(null);

		if (!name.trim()) {
			setError(m["dashboard.settings.name_required"]());
			return;
		}

		setIsSaving(true);

		try {
			const result = await updateWorkspaceSettings({
				data: {
					description,
					name,
					workspaceSlug,
				},
			});

			if (result.status === "error") {
				setError(result.error);
				return;
			}

			setData((currentData) => {
				const nextData = currentData
					? {
							...currentData,
							workspace: result.workspace,
						}
					: currentData;

				if (nextData) {
					settingsDataCache.workspace.set(workspaceSlug, nextData);
				}

				return nextData;
			});
			setName(result.workspace.name);
			setDescription(result.workspace.description ?? "");
			setSuccess(m["dashboard.settings.saved"]());
			await router.invalidate();
		} catch {
			setError(m["dashboard.settings.save_error"]());
		} finally {
			setIsSaving(false);
		}
	};

	const exportData = async () => {
		setExportError(null);
		setIsExporting(true);

		try {
			const result = await exportWorkspaceData({
				data: {
					workspaceSlug,
				},
			});

			if (result.status === "error") {
				setExportError(result.error);
				return;
			}

			const blob = new Blob([JSON.stringify(result.data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.download = `${data?.workspace.slug ?? workspaceSlug}-selfmail-export.json`;
			link.click();
			URL.revokeObjectURL(url);
		} catch {
			setExportError(m["dashboard.settings.export_error"]());
		} finally {
			setIsExporting(false);
		}
	};

	const deleteCurrentWorkspace = async () => {
		setDeleteError(null);
		setIsDeleting(true);

		try {
			const result = await deleteWorkspace({
				data: {
					workspaceSlug,
				},
			});

			if (result.status === "error") {
				setDeleteError(result.error);
				return;
			}

			await navigate({
				to: "/",
			});
		} catch {
			setDeleteError(m["dashboard.settings.delete_error"]());
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading && !data) {
		return <WorkspaceSettingsLoading />;
	}

	if (error && !data) {
		return (
			<div className="grid min-h-64 place-items-center rounded-2xl border border-dashed p-6 text-center">
				<div className="grid gap-3">
					<p className="text-destructive text-sm" role="alert">
						{error}
					</p>
					<Button onClick={loadSettings} type="button" variant="outline">
						<RefreshCwIcon className="size-4" />
						{m["dashboard.settings.retry"]()}
					</Button>
				</div>
			</div>
		);
	}

	if (!data) {
		return null;
	}

	const canDeleteWorkspace = data.permissions.canDeleteWorkspace;
	const canUpdateWorkspace = data.permissions.canUpdateWorkspace;
	const hasProfileChanges =
		name.trim() !== data.workspace.name ||
		description.trim() !== (data.workspace.description ?? "");
	const summaryItems = [
		[
			m["dashboard.settings.summary_members"](),
			data.counts.members.toLocaleString(getLocale()),
		],
		[
			m["dashboard.settings.summary_addresses"](),
			data.counts.addresses.toLocaleString(getLocale()),
		],
		[
			m["dashboard.settings.summary_domains"](),
			data.counts.domains.toLocaleString(getLocale()),
		],
		[
			m["dashboard.settings.summary_emails"](),
			data.counts.emails.toLocaleString(getLocale()),
		],
		[
			m["dashboard.settings.summary_drafts"](),
			data.counts.drafts.toLocaleString(getLocale()),
		],
		[
			m["dashboard.settings.summary_storage"](),
			formatStorage(data.counts.storageBytes),
		],
	] as const;

	return (
		<div className="grid gap-6">
			<form className="grid gap-4" noValidate onSubmit={saveWorkspace}>
				{canUpdateWorkspace ? null : (
					<SettingsBanner
						description={m["dashboard.settings.readonly_description"]()}
						icon={<InfoIcon />}
						title={m["dashboard.settings.readonly_title"]()}
					/>
				)}
				<SettingsGroup>
					<SettingsBlock
						description={
							<div className="grid gap-2">
								<Input
									aria-describedby={
										error ? "workspace-settings-error" : undefined
									}
									aria-invalid={Boolean(error)}
									disabled={!canUpdateWorkspace || isSaving}
									id="workspace-name"
									onChange={(event) => {
										setName(event.target.value);
										setError(null);
										setSuccess(null);
									}}
									value={name}
								/>
							</div>
						}
						title={
							<label htmlFor="workspace-name">
								{m["dashboard.settings.workspace_name"]()}
							</label>
						}
					/>
					<SettingsBlock
						description={
							<div className="grid gap-2">
								<Textarea
									disabled={!canUpdateWorkspace || isSaving}
									id="workspace-description"
									maxLength={280}
									onChange={(event) => {
										setDescription(event.target.value);
										setError(null);
										setSuccess(null);
									}}
									placeholder={m[
										"dashboard.settings.workspace_description_placeholder"
									]()}
									value={description}
								/>
								<span className="text-muted-foreground text-xs tabular-nums">
									{description.length}/280
								</span>
							</div>
						}
						title={
							<label htmlFor="workspace-description">
								{m["dashboard.settings.workspace_description"]()}
							</label>
						}
					/>
					<SettingsBlock
						control={
							<Badge variant={data.workspace.isOwner ? "default" : "outline"}>
								{data.workspace.isOwner
									? m["dashboard.settings.member_settings.owner"]()
									: m["dashboard.settings.member_settings.member_role"]()}
							</Badge>
						}
						description={m["dashboard.settings.created_updated"]({
							createdAt: formatDate(data.workspace.createdAt),
							updatedAt: formatDate(data.workspace.updatedAt),
						})}
						title={m["dashboard.settings.your_access"]()}
					/>
					<SettingsBlock
						description={
							<code className="rounded-md bg-muted px-2 py-1 text-xs">
								{data.workspace.defaultDomain}
							</code>
						}
						title={m["dashboard.settings.default_email_domain"]()}
					/>
				</SettingsGroup>
				<div className="grid gap-2">
					{error ? (
						<p
							className="text-destructive text-sm"
							id="workspace-settings-error"
							role="alert"
						>
							{error}
						</p>
					) : null}
					{success ? (
						<output className="text-primary text-sm">{success}</output>
					) : null}
					<div className="flex justify-end">
						<Button
							className="px-3 py-1 text-sm"
							disabled={!canUpdateWorkspace || isSaving || !hasProfileChanges}
							type="submit"
						>
							<SaveIcon className="size-4" />
							{isSaving
								? m["dashboard.settings.saving"]()
								: m["dashboard.settings.save_changes"]()}
						</Button>
					</div>
				</div>
			</form>

			<section className="grid gap-3">
				<div>
					<h3 className="text-balance font-medium text-sm">
						{m["dashboard.settings.workspace_data"]()}
					</h3>
					<p className="text-pretty text-muted-foreground text-sm">
						{m["dashboard.settings.workspace_data_description"]()}
					</p>
				</div>
				<div className="grid gap-2 sm:grid-cols-3">
					{summaryItems.map(([label, value]) => (
						<div className="rounded-lg border p-3" key={label}>
							<div className="text-muted-foreground text-xs">{label}</div>
							<div className="font-medium tabular-nums">{value}</div>
						</div>
					))}
				</div>
				<SettingsGroup>
					<SettingsBlock
						control={
							<Button
								className="px-3 py-1 text-sm"
								disabled={isExporting}
								onClick={exportData}
								type="button"
								variant="outline"
							>
								<DownloadIcon className="size-4" />
								{isExporting
									? m["dashboard.settings.exporting"]()
									: m["dashboard.settings.export_json"]()}
							</Button>
						}
						description={m["dashboard.settings.export_description"]()}
						title={m["dashboard.settings.export_title"]()}
					/>
				</SettingsGroup>
				{exportError ? (
					<p className="text-destructive text-sm" role="alert">
						{exportError}
					</p>
				) : null}
			</section>

			<section className="grid gap-3">
				<div>
					<h3 className="text-balance font-medium text-sm">
						{m["dashboard.settings.danger_zone"]()}
					</h3>
					<p className="text-pretty text-muted-foreground text-sm">
						{m["dashboard.settings.danger_zone_description"]()}
					</p>
				</div>
				<SettingsGroup>
					<SettingsBlock
						control={
							<AlertDialog
								onOpenChange={(open) => {
									if (!open) {
										setDeleteConfirmation("");
										setDeleteError(null);
									}
								}}
							>
								<AlertDialogTrigger asChild>
									<Button
										className="px-3 py-1 text-sm"
										disabled={!canDeleteWorkspace}
										type="button"
										variant="destructive"
									>
										<Trash2Icon className="size-4" />
										{m["dashboard.settings.delete_trigger"]()}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{m["dashboard.settings.delete_confirm_title"]({
												workspaceName: data.workspace.name,
											})}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{m["dashboard.settings.delete_type_confirm"]({
												workspaceName: data.workspace.name,
											})}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<div className="grid gap-2">
										<Input
											aria-describedby={
												deleteError ? "workspace-delete-error" : undefined
											}
											aria-invalid={Boolean(deleteError)}
											autoComplete="off"
											disabled={isDeleting}
											onChange={(event) => {
												setDeleteConfirmation(event.target.value);
												setDeleteError(null);
											}}
											value={deleteConfirmation}
										/>
										{deleteError ? (
											<p
												className="text-destructive text-sm"
												id="workspace-delete-error"
												role="alert"
											>
												{deleteError}
											</p>
										) : null}
									</div>
									<AlertDialogFooter>
										<AlertDialogCancel disabled={isDeleting}>
											{m["dashboard.settings.cancel"]()}
										</AlertDialogCancel>
										<Button
											disabled={
												isDeleting || deleteConfirmation !== data.workspace.name
											}
											onClick={deleteCurrentWorkspace}
											type="button"
											variant="destructive"
										>
											{isDeleting
												? m["dashboard.settings.deleting"]()
												: m["dashboard.settings.delete_trigger"]()}
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						}
						description={
							canDeleteWorkspace
								? m["dashboard.settings.cannot_undo"]()
								: m["dashboard.settings.delete_unavailable"]()
						}
						title={m["dashboard.settings.delete_title"]()}
					/>
				</SettingsGroup>
			</section>
		</div>
	);
};
