import {
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
  buttonVariants,
  cn,
} from "@selfmail/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type getWorkspaceDomains,
  removeDomain,
  verifyDomain,
} from "#/lib/settings/domains";
import { m } from "#/paraglide/messages";

type Domain = Awaited<
  ReturnType<typeof getWorkspaceDomains>
>["domains"][number];

export function DomainActions({
  canDelete,
  canVerify,
  domain,
  memberId,
  workspaceId,
}: {
  canDelete: boolean;
  canVerify: boolean;
  domain: Domain;
  memberId: string;
  workspaceId: string;
}) {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const mutationOptions = {
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["domains", workspaceId] }),
    onError: (mutationError: Error) => toast.error(mutationError.message),
  };
  const verify = useMutation({
    mutationFn: () =>
      verifyDomain({ data: { domainId: domain.id, memberId, workspaceId } }),
    ...mutationOptions,
  });
  const remove = useMutation({
    mutationFn: () =>
      removeDomain({ data: { domainId: domain.id, memberId, workspaceId } }),
    onSuccess: async () => {
      await mutationOptions.onSuccess();
      setDeleteOpen(false);
    },
    onError: mutationOptions.onError,
  });

  if (!(canDelete || (canVerify && !domain.verified))) {
    return null;
  }

  return (
    <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
      <div className="flex justify-end gap-1">
        {canVerify && !domain.verified ? (
          <Button
            aria-label={`${m["dashboard.settings.domains.verify_records"]()} ${domain.domain}`}
            disabled={verify.isPending}
            onClick={() => verify.mutate()}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <RefreshCwIcon
              aria-hidden="true"
              className={cn("size-4", verify.isPending && "animate-spin")}
            />
          </Button>
        ) : null}
        {canDelete ? (
          <AlertDialogTrigger asChild>
            <Button
              aria-label={`${m["dashboard.settings.domains.delete_domain"]()} ${domain.domain}`}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Trash2Icon
                aria-hidden="true"
                className="size-4 text-destructive"
              />
            </Button>
          </AlertDialogTrigger>
        ) : null}
      </div>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {m["dashboard.settings.domains.delete_title"]({
              label: domain.verified
                ? m["dashboard.settings.domains.delete_domain"]()
                : m["dashboard.settings.domains.delete_draft"](),
              domain: domain.domain,
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {domain.verified
              ? m["dashboard.settings.domains.delete_domain_description"]()
              : m["dashboard.settings.domains.delete_draft_description"]()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          {domain.domain}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">
            {m["dashboard.settings.cancel"]()}
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
            type="button"
          >
            {remove.isPending
              ? m["dashboard.settings.domains.deleting"]()
              : m["dashboard.settings.domains.delete_domain"]()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
