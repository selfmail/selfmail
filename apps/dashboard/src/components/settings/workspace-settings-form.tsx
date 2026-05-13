import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useReducer } from "react";
import {
	type DashboardWorkspace,
	deleteWorkspaceFn,
	updateWorkspaceSettingsFn,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import { DeleteWorkspaceSection } from "./delete-workspace-section";
import { GeneralSettingsForm } from "./general-settings-form";

interface WorkspaceSettingsFormProps {
	workspace: DashboardWorkspace;
}

interface WorkspaceSettingsState {
	deleteError: string | null;
	description: string;
	image: string;
	isDeleting: boolean;
	isSaving: boolean;
	name: string;
	saveError: string | null;
	saveMessage: string | null;
	slug: string;
}

interface SetFieldAction {
	field: "description" | "image" | "name" | "slug";
	type: "set-field";
	value: string;
}

interface DeleteEndAction {
	type: "delete-end";
}

interface DeleteErrorAction {
	error: string;
	type: "delete-error";
}

interface DeleteStartAction {
	type: "delete-start";
}

interface SaveEndAction {
	type: "save-end";
}

interface SaveErrorAction {
	error: string;
	type: "save-error";
}

interface SaveStartAction {
	type: "save-start";
}

interface SaveSuccessAction {
	message: string;
	type: "save-success";
}

type WorkspaceSettingsAction =
	| DeleteEndAction
	| DeleteErrorAction
	| DeleteStartAction
	| SaveEndAction
	| SaveErrorAction
	| SaveStartAction
	| SaveSuccessAction
	| SetFieldAction;

function getInitialState(
	workspace: DashboardWorkspace,
): WorkspaceSettingsState {
	return {
		deleteError: null,
		description: workspace.description ?? "",
		image: workspace.image ?? "",
		isDeleting: false,
		isSaving: false,
		name: workspace.name,
		saveError: null,
		saveMessage: null,
		slug: workspace.slug,
	};
}

function reducer(
	state: WorkspaceSettingsState,
	action: WorkspaceSettingsAction,
): WorkspaceSettingsState {
	switch (action.type) {
		case "delete-end":
			return { ...state, isDeleting: false };
		case "delete-error":
			return { ...state, deleteError: action.error };
		case "delete-start":
			return { ...state, deleteError: null, isDeleting: true };
		case "save-end":
			return { ...state, isSaving: false };
		case "save-error":
			return { ...state, saveError: action.error };
		case "save-start":
			return {
				...state,
				isSaving: true,
				saveError: null,
				saveMessage: null,
			};
		case "save-success":
			return { ...state, saveMessage: action.message };
		case "set-field":
			return { ...state, [action.field]: action.value };
	}
}

export function WorkspaceSettingsForm({
	workspace,
}: WorkspaceSettingsFormProps) {
	const navigate = useNavigate();
	const [state, dispatch] = useReducer(reducer, workspace, getInitialState);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		dispatch({ type: "save-start" });

		try {
			const result = await updateWorkspaceSettingsFn({
				data: {
					description: state.description,
					image: state.image,
					name: state.name,
					slug: state.slug,
					workspaceId: workspace.id,
				},
			});

			if (result.status === "error") {
				dispatch({ error: result.error, type: "save-error" });
				return;
			}

			dispatch({
				message: m["dashboard.settings.saved"](),
				type: "save-success",
			});

			if (result.slug !== workspace.slug) {
				await navigate({
					params: {
						workspaceSlug: result.slug,
					},
					to: "/$workspaceSlug/settings",
				});
			}
		} finally {
			dispatch({ type: "save-end" });
		}
	};

	const handleDelete = async () => {
		dispatch({ type: "delete-start" });

		try {
			const result = await deleteWorkspaceFn({
				data: {
					workspaceId: workspace.id,
				},
			});

			if (result.status === "error") {
				dispatch({ error: result.error, type: "delete-error" });
				return;
			}

			await navigate({
				to: "/",
			});
		} finally {
			dispatch({ type: "delete-end" });
		}
	};

	return (
		<div className="flex flex-col">
			<GeneralSettingsForm
				description={state.description}
				image={state.image}
				isSaving={state.isSaving}
				name={state.name}
				onDescriptionChange={(value) =>
					dispatch({ field: "description", type: "set-field", value })
				}
				onImageChange={(value) =>
					dispatch({ field: "image", type: "set-field", value })
				}
				onNameChange={(value) =>
					dispatch({ field: "name", type: "set-field", value })
				}
				onSlugChange={(value) =>
					dispatch({ field: "slug", type: "set-field", value })
				}
				onSubmit={handleSubmit}
				saveError={state.saveError}
				saveMessage={state.saveMessage}
				slug={state.slug}
			/>
			<DeleteWorkspaceSection
				deleteError={state.deleteError}
				isDeleting={state.isDeleting}
				onDelete={handleDelete}
				workspaceName={workspace.name}
			/>
		</div>
	);
}
