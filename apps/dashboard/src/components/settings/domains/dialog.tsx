import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { type ComponentProps, useId, useState } from "react";
import { toast } from "sonner";
import { Input } from "#/components/ui/input";
import { addNewDomain } from "#/lib/settings/domains";
import {
  domainError,
  domainNameSchema,
  toDomainName,
} from "#/lib/workspaces/domain-utils";
import { m } from "#/paraglide/messages";

export function AddDomainDialog({
  memberId,
  workspaceId,
}: {
  memberId: string;
  workspaceId: string;
}) {
  const queryClient = useQueryClient();
  const inputId = useId();
  const errorId = useId();
  const [domain, setDomain] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const addDomain = useMutation({
    mutationFn: (value: string) =>
      addNewDomain({ data: { domain: value, memberId, workspaceId } }),
    onError: (mutationError) => setFormError(mutationError.message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["domains", workspaceId],
      });
      setDomain("");
      setOpen(false);
      toast.success(m["dashboard.settings.domains.add_title"]());
    },
  });

  const handleSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    const result = domainNameSchema.safeParse(domain);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? domainError);
      return;
    }
    addDomain.mutate(result.data);
  };

  return (
    <TooltipProvider>
      <Dialog onOpenChange={setOpen} open={open}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                aria-label={m["dashboard.settings.domains.add"]()}
                className="rounded-full"
                size="icon"
                type="button"
              >
                <PlusIcon aria-hidden="true" className="size-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>
            {m["dashboard.settings.domains.add"]()}
          </TooltipContent>
        </Tooltip>
        <DialogContent className="relative max-w-lg">
          <DialogClose asChild>
            <Button
              aria-label={m["dashboard.settings.close"]()}
              className="absolute top-4 right-4"
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
          <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
            <DialogHeader className="pr-8">
              <DialogTitle>
                {m["dashboard.settings.domains.add_title"]()}
              </DialogTitle>
              <p className="text-pretty text-muted-foreground text-sm">
                {m["dashboard.settings.domains.add_description"]()}
              </p>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={inputId}>
                {m["dashboard.settings.domains.domain_name"]()}
              </Label>
              <Input
                aria-describedby={formError ? errorId : undefined}
                aria-invalid={Boolean(formError)}
                autoFocus
                id={inputId}
                inputMode="url"
                onChange={(event) => {
                  setDomain(toDomainName(event.target.value));
                  setFormError(null);
                }}
                placeholder={m["dashboard.settings.domains.placeholder"]()}
                value={domain}
              />
              {formError ? (
                <p
                  className="text-pretty text-destructive text-sm"
                  id={errorId}
                >
                  {formError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button disabled={addDomain.isPending} type="submit">
                {addDomain.isPending
                  ? m["dashboard.settings.domains.adding"]()
                  : m["dashboard.settings.domains.add"]()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
