import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Textarea,
} from "@selfmail/ui";
import type { FormEvent } from "react";
import { m } from "#/paraglide/messages";
import { SettingsSection } from "./settings-section";

interface GeneralSettingsFormProps {
  description: string;
  image: string;
  isSaving: boolean;
  name: string;
  onDescriptionChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saveError: string | null;
  saveMessage: string | null;
  slug: string;
}

export function GeneralSettingsForm({
  description,
  image,
  isSaving,
  name,
  onDescriptionChange,
  onImageChange,
  onNameChange,
  onSlugChange,
  onSubmit,
  saveError,
  saveMessage,
  slug,
}: GeneralSettingsFormProps) {
  return (
    <SettingsSection
      description={m["dashboard.settings.general_description"]()}
      title={m["dashboard.settings.general"]()}
    >
      <form className="grid gap-5" noValidate onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="workspace-name">
            {m["dashboard.settings.workspace_name"]()}
          </Label>
          <Input
            aria-describedby={saveError ? "workspace-save-error" : undefined}
            aria-invalid={Boolean(saveError)}
            id="workspace-name"
            onChange={(event) => onNameChange(event.target.value)}
            value={name}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="workspace-slug">
            {m["dashboard.settings.workspace_handle"]()}
          </Label>
          <Input
            aria-describedby="workspace-slug-help"
            id="workspace-slug"
            onChange={(event) => onSlugChange(event.target.value.toLowerCase())}
            value={slug}
          />
          <p
            className="text-pretty text-muted-foreground text-sm"
            id="workspace-slug-help"
          >
            {m["dashboard.settings.workspace_handle_help"]()}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="workspace-description">
            {m["dashboard.settings.workspace_description"]()}
          </Label>
          <Textarea
            id="workspace-description"
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder={m[
              "dashboard.settings.workspace_description_placeholder"
            ]()}
            value={description}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="workspace-image">
            {m["dashboard.settings.workspace_image"]()}
          </Label>
          <Input
            id="workspace-image"
            onChange={(event) => onImageChange(event.target.value)}
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
            {isSaving
              ? m["dashboard.settings.saving"]()
              : m["dashboard.settings.update"]()}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
