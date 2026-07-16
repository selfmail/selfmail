import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { createMemberAddress } from "#/lib/settings/adresses";
import type { DashboardAddressDomain } from "#/lib/workspaces/types";
import { m } from "#/paraglide/messages";
import { toAddressLocalPart } from "./utils";

export interface CreateAddressDialogProps {
  domains: DashboardAddressDomain[];
  domainsLoading: boolean;
  onCreated: () => Promise<unknown>;
  tooltip?: string;
  trigger: ReactNode;
  memberId: string;
  workspaceSlug: string;
}

export function CreateAddressDialog({
  domains,
  domainsLoading,
  onCreated,
  memberId,
  tooltip,
  trigger,
  workspaceSlug,
}: CreateAddressDialogProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<
    string | undefined
  >();
  const addressErrorId = useId();
  const addressId = useId();
  const domainId = useId();
  const selectedDomain =
    domains.find((domain) => domain.id === selectedDomainId) ?? domains[0];
  const domain = selectedDomain?.domain ?? `${workspaceSlug}.selfmail.app`;
  const previewAddress = address ? `${address}@${domain}` : null;
  const createAddress = useMutation({
    mutationFn: () =>
      createMemberAddress({
        data: {
          domain: selectedDomain.domain,
          handle: address,
          memberId,
        },
      }),
    onSuccess: async (_) => {
      await onCreated();
      toast.success("Address created", {
        description: previewAddress ?? undefined,
        id: "create-address",
      });
      setAddress("");
      setError(null);
      setOpen(false);
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : m["dashboard.errors.address_create_failed"]()
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!address) {
      setError(m["dashboard.address.create.error"]());
      return;
    }

    setError(null);
    createAddress.mutate();
  }

  const triggerButton = <DialogTrigger asChild>{trigger}</DialogTrigger>;

  return (
    <TooltipProvider>
      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setError(null);
          }
        }}
        open={open}
      >
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
            <TooltipContent sideOffset={5}>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          triggerButton
        )}
        <DialogContent className="relative max-w-lg gap-0 overflow-hidden p-0">
          <DialogClose
            aria-label={m["dashboard.settings.close"]()}
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </DialogClose>
          <form noValidate onSubmit={handleSubmit}>
            <div className="grid gap-6 p-6">
              <DialogHeader className="pr-8">
                <DialogTitle className="text-balance text-xl">
                  {m["dashboard.address.create.title"]()}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={addressId}>
                    {m["dashboard.address.create.field_label"]()}
                  </Label>
                  <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(9rem,48%)]">
                    <Input
                      aria-describedby={error ? addressErrorId : undefined}
                      aria-invalid={Boolean(error)}
                      className="rounded-r-none border-r border-r-border"
                      id={addressId}
                      onChange={(event) => {
                        setAddress(toAddressLocalPart(event.target.value));
                        setError(null);
                      }}
                      placeholder={m["dashboard.address.create.placeholder"]()}
                      value={address}
                    />
                    <Select
                      disabled={domainsLoading || domains.length === 0}
                      onValueChange={(value) => {
                        setSelectedDomainId(value ?? undefined);
                        setError(null);
                      }}
                      value={selectedDomain?.id}
                    >
                      <SelectTrigger
                        className="min-w-0 rounded-l-none border-l-0 [&>span]:min-w-0 [&>span]:truncate"
                        id={domainId}
                        title={domain}
                      >
                        <SelectValue placeholder={`@ ${domain}`} />
                      </SelectTrigger>
                      <SelectContent align="end" className="w-auto max-w-80">
                        <SelectGroup>
                          {domains.map((domainOption) => (
                            <SelectItem
                              key={domainOption.id}
                              value={domainOption.id}
                            >
                              @ {domainOption.domain}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {error ? (
                    <p
                      className="text-pretty text-destructive text-sm"
                      id={addressErrorId}
                    >
                      {error}
                    </p>
                  ) : null}
                </div>

                {previewAddress ? (
                  <div className="rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground text-sm">
                    <span className="font-medium text-foreground">
                      {previewAddress}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <DialogFooter className="p-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {m["dashboard.settings.cancel"]()}
                </Button>
              </DialogClose>
              <Button disabled={createAddress.isPending} type="submit">
                {createAddress.isPending
                  ? m["dashboard.address.create.saving"]()
                  : m["dashboard.address.create.submit"]()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
