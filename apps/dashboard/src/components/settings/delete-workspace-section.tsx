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
} from "@selfmail/ui";
import { m } from "#/paraglide/messages";
import { SettingsSection } from "./settings-section";

interface DeleteWorkspaceSectionProps {
  deleteError: string | null;
  isDeleting: boolean;
  onDelete: () => void;
  workspaceName: string;
}

export function DeleteWorkspaceSection({
  deleteError,
  isDeleting,
  onDelete,
  workspaceName,
}: DeleteWorkspaceSectionProps) {
  return (
    <SettingsSection
      description={m["dashboard.settings.delete_description"]()}
      title={m["dashboard.settings.delete_title"]()}
      titleClassName="text-destructive"
    >
      <div className="flex flex-col items-start gap-5 sm:items-end">
        {deleteError ? (
          <Alert aria-live="polite" variant="destructive">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isDeleting} type="button" variant="destructive">
              {m["dashboard.settings.delete_trigger"]()}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {m["dashboard.settings.delete_confirm_title"]({
                  workspaceName,
                })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {m["dashboard.settings.delete_confirm_description"]()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {m["dashboard.settings.cancel"]()}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={onDelete}
              >
                {isDeleting
                  ? m["dashboard.settings.deleting"]()
                  : m["dashboard.settings.delete_trigger"]()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsSection>
  );
}
