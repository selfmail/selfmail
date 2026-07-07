import {
  Button,
  Input,
  SettingsBlock,
  SettingsGroup,
  Textarea,
} from "@selfmail/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlusIcon, SaveIcon, XIcon } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  getWorkspaceInformations,
  updateWorkspace,
} from "#/lib/settings/workspace";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";

const maxWorkspaceImageBytes = 512 * 1024;

interface WorkspaceFormState {
  description: string;
  image: string;
  name: string;
}

interface WorkspaceSettingsFormProps {
  canEdit: boolean;
  description?: string | null;
  form: WorkspaceFormState;
  imageError: string | null;
  isDirty: boolean;
  isSaving: boolean;
  nameError: string | null;
  onImageError: (error: string | null) => void;
  onFieldChange: (field: keyof WorkspaceFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saveError: string | null;
  workspaceId: string;
}

interface GeneralSettingsSectionProps {
  canEdit: boolean;
  form: WorkspaceFormState;
  imageError: string | null;
  isSaving: boolean;
  nameError: string | null;
  onImageError: (error: string | null) => void;
  onFieldChange: (field: keyof WorkspaceFormState, value: string) => void;
  workspaceId: string;
}

interface WorkspaceImageDropAreaProps {
  canEdit: boolean;
  image: string;
  imageError: string | null;
  isSaving: boolean;
  onImageChange: (value: string) => void;
  onImageError: (error: string | null) => void;
  workspaceName: string;
}

interface SaveBarProps {
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
}

interface WorkspaceDetails {
  description: string | null;
  image: string | null;
  name: string;
}

const emptyFormState: WorkspaceFormState = {
  description: "",
  image: "",
  name: "",
};

function getWorkspaceFormState(
  workspace: WorkspaceDetails
): WorkspaceFormState {
  return {
    description: workspace.description ?? "",
    image: workspace.image ?? "",
    name: workspace.name,
  };
}

function isWorkspaceFormDirty(
  form: WorkspaceFormState,
  workspace?: WorkspaceDetails
) {
  if (!workspace) {
    return false;
  }

  return (
    form.name.trim() !== workspace.name ||
    form.description.trim() !== (workspace.description ?? "") ||
    form.image.trim() !== (workspace.image ?? "")
  );
}

function ReadOnlyNotice() {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="font-medium text-sm">
        {m["dashboard.settings.readonly_title"]()}
      </p>
      <p className="mt-1 text-pretty text-muted-foreground text-sm">
        {m["dashboard.settings.readonly_description"]()}
      </p>
    </div>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(String(reader.result ?? ""));
    });
    reader.addEventListener("error", () => {
      reject(reader.error);
    });
    reader.readAsDataURL(file);
  });
}

function readWorkspaceImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error(m["dashboard.settings.workspace_image_invalid"]());
  }

  if (file.size > maxWorkspaceImageBytes) {
    throw new Error(m["dashboard.settings.workspace_image_too_large"]());
  }

  return fileToDataUrl(file);
}

function WorkspaceImageDropArea({
  canEdit,
  image,
  imageError,
  isSaving,
  onImageChange,
  onImageError,
  workspaceName,
}: WorkspaceImageDropAreaProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const disabled = !canEdit || isSaving;

  const selectImage = async (file: File) => {
    try {
      onImageChange(await readWorkspaceImage(file));
      onImageError(null);
    } catch (error) {
      onImageError(
        error instanceof Error
          ? error.message
          : m["dashboard.settings.workspace_image_invalid"]()
      );
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (file) {
      selectImage(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      selectImage(file);
    }
  };

  return (
    <div className="grid w-full gap-2 sm:w-80">
      <input
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        id={inputId}
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />
      <button
        className={cn(
          "grid gap-3 rounded-lg border border-border border-dashed bg-muted/40 p-3 text-left outline-none",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
          isDragging && "border-ring bg-accent",
          disabled && "cursor-not-allowed opacity-50"
        )}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        type="button"
      >
        <div className="flex items-center gap-3">
          {image ? (
            <img
              alt={workspaceName}
              className="size-14 rounded-lg object-cover"
              height={56}
              src={image}
              width={56}
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-lg bg-background text-muted-foreground">
              <ImagePlusIcon aria-hidden="true" className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-pretty font-medium text-sm">
              {m["dashboard.settings.workspace_image_drop"]()}
            </p>
            <p className="text-pretty text-muted-foreground text-xs">
              {m["dashboard.settings.workspace_image_helper"]()}
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 font-medium text-xs">
          <ImagePlusIcon aria-hidden="true" className="size-4" />
          {image
            ? m["dashboard.settings.workspace_image_replace"]()
            : m["dashboard.settings.workspace_image_select"]()}
        </span>
      </button>
      {image ? (
        <Button
          aria-label={m["dashboard.settings.workspace_image_remove"]()}
          className="h-8 w-fit rounded-lg px-3 text-xs"
          disabled={disabled}
          onClick={() => {
            onImageChange("");
            onImageError(null);
          }}
          type="button"
          variant="ghost"
        >
          <XIcon aria-hidden="true" className="size-4" />
          {m["dashboard.settings.workspace_image_remove"]()}
        </Button>
      ) : null}
      {imageError ? (
        <p className="text-destructive text-sm">{imageError}</p>
      ) : null}
    </div>
  );
}

function GeneralSettingsSection({
  canEdit,
  form,
  imageError,
  isSaving,
  nameError,
  onImageError,
  onFieldChange,
  workspaceId,
}: GeneralSettingsSectionProps) {
  return (
    <section className="grid gap-2">
      <div>
        <h3 className="text-balance font-medium text-sm">
          {m["dashboard.settings.general"]()}
        </h3>
        <p className="text-pretty text-muted-foreground text-sm">
          {m["dashboard.settings.general_description"]()}
        </p>
      </div>

      <SettingsGroup>
        <SettingsBlock
          description={workspaceId}
          title={m["dashboard.settings.workspace_name"]()}
        >
          <div className="grid w-full gap-1.5 sm:w-80">
            <Input
              aria-invalid={Boolean(nameError)}
              disabled={!canEdit || isSaving}
              onChange={(event) => onFieldChange("name", event.target.value)}
              value={form.name}
            />
            {nameError ? (
              <p className="text-destructive text-sm">{nameError}</p>
            ) : null}
          </div>
        </SettingsBlock>

        <SettingsBlock
          description={m[
            "dashboard.settings.workspace_description_placeholder"
          ]()}
          title={m["dashboard.settings.workspace_description"]()}
        >
          <Textarea
            className="w-full sm:w-80"
            disabled={!canEdit || isSaving}
            maxLength={280}
            onChange={(event) =>
              onFieldChange("description", event.target.value)
            }
            placeholder="Description"
            value={form.description}
          />
        </SettingsBlock>

        <SettingsBlock title={m["dashboard.settings.workspace_image"]()}>
          <WorkspaceImageDropArea
            canEdit={canEdit}
            image={form.image}
            imageError={imageError}
            isSaving={isSaving}
            onImageChange={(value) => onFieldChange("image", value)}
            onImageError={onImageError}
            workspaceName={form.name}
          />
        </SettingsBlock>
      </SettingsGroup>
    </section>
  );
}

function SaveBar({ canEdit, isDirty, isSaving, saveError }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 -mx-2 mt-auto flex items-center justify-end gap-3 border-border border-t bg-background/95 px-2 pt-4 pb-[max(0rem,env(safe-area-inset-bottom))]">
      {saveError ? (
        <p className="mr-auto text-destructive text-sm">{saveError}</p>
      ) : null}
      <Button disabled={!(canEdit && isDirty) || isSaving} type="submit">
        <SaveIcon aria-hidden="true" className="size-4" />
        {isSaving
          ? m["dashboard.settings.saving"]()
          : m["dashboard.settings.save_changes"]()}
      </Button>
    </div>
  );
}

function WorkspaceSettingsForm({
  canEdit,
  description,
  form,
  isDirty,
  isSaving,
  imageError,
  nameError,
  onImageError,
  onFieldChange,
  onSubmit,
  saveError,
  workspaceId,
}: WorkspaceSettingsFormProps) {
  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden"
      onSubmit={onSubmit}
    >
      {description ? (
        <p className="max-w-2xl text-pretty text-muted-foreground text-sm">
          {description}
        </p>
      ) : null}
      {canEdit ? null : <ReadOnlyNotice />}
      <GeneralSettingsSection
        canEdit={canEdit}
        form={form}
        imageError={imageError}
        isSaving={isSaving}
        nameError={nameError}
        onFieldChange={onFieldChange}
        onImageError={onImageError}
        workspaceId={workspaceId}
      />
      <SaveBar
        canEdit={canEdit}
        isDirty={isDirty}
        isSaving={isSaving}
        saveError={saveError}
      />
    </form>
  );
}

export function WorkspaceSettingsPage({
  description,
  memberId,
  workspaceId,
}: SettingsPageContext) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WorkspaceFormState>(emptyFormState);
  const [imageError, setImageError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["workspace-informations", workspaceId, memberId],
    queryFn: () =>
      getWorkspaceInformations({
        data: {
          workspaceId,
          memberId,
        },
      }),
  });

  const update = useMutation({
    mutationFn: updateWorkspace,
    mutationKey: ["update-workspace", workspaceId, memberId],
    onError: () => {
      setSaveError(m["dashboard.settings.save_error"]());
    },
    onSuccess: async () => {
      setSaveError(null);
      await queryClient.invalidateQueries({
        queryKey: ["workspace-informations", workspaceId, memberId],
      });
    },
  });

  useEffect(() => {
    if (!data?.workspace) {
      return;
    }

    setForm(getWorkspaceFormState(data.workspace));
    setImageError(null);
    setNameError(null);
    setSaveError(null);
  }, [data?.workspace]);

  const canEdit = data?.canUpdateWorkspace ?? false;
  const isSaving = update.isPending;
  const isDirty = isWorkspaceFormDirty(form, data?.workspace);
  const pageDescription = description?.();

  function updateField(field: keyof WorkspaceFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSaveError(null);

    if (field === "name") {
      setNameError(null);
    }

    if (field === "image") {
      setImageError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setNameError(m["dashboard.settings.name_required"]());
      return;
    }

    update.mutate({
      data: {
        workspaceId,
        memberId,
        description: form.description,
        image: form.image,
        name,
      },
    });
  }

  return (
    <SettingsPage
      description={pageDescription}
      error={[error ? m["dashboard.settings.load_error"]() : null]}
      loading={[isLoading || isFetching]}
      onRetry={() => refetch()}
      retryLabel={m["dashboard.settings.retry"]()}
    >
      {data ? (
        <WorkspaceSettingsForm
          canEdit={canEdit}
          description={pageDescription}
          form={form}
          imageError={imageError}
          isDirty={isDirty}
          isSaving={isSaving}
          nameError={nameError}
          onFieldChange={updateField}
          onImageError={setImageError}
          onSubmit={handleSubmit}
          saveError={saveError}
          workspaceId={data.workspace.id}
        />
      ) : null}
    </SettingsPage>
  );
}
