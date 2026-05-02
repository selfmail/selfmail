import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
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

export function WorkspaceSettingsForm({
  workspace,
}: WorkspaceSettingsFormProps) {
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

      setSaveMessage(m["dashboard.settings.saved"]());

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
      <GeneralSettingsForm
        description={description}
        image={image}
        isSaving={isSaving}
        name={name}
        onDescriptionChange={setDescription}
        onImageChange={setImage}
        onNameChange={setName}
        onSlugChange={setSlug}
        onSubmit={handleSubmit}
        saveError={saveError}
        saveMessage={saveMessage}
        slug={slug}
      />
      <DeleteWorkspaceSection
        deleteError={deleteError}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        workspaceName={workspace.name}
      />
    </div>
  );
}
