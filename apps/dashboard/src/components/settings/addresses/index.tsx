import { Button } from "@selfmail/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { getMemberAddresses } from "#/lib/settings/adresses";
import { getWorkspaceAddressDomainsFn } from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";
import { CreateAddressDialog } from "./create-dialog";
import { AddressTable } from "./table";

export function AddressSettingsPage({
  description,
  memberId,
  workspaceSlug,
}: SettingsPageContext) {
  const queryClient = useQueryClient();
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["workspace-addresses", workspaceSlug, memberId],
    queryFn: () =>
      getMemberAddresses({
        data: {
          workspaceSlug,
        },
      }),
  });
  const domains = useQuery({
    queryKey: ["workspace-address-domains", workspaceSlug],
    queryFn: () =>
      getWorkspaceAddressDomainsFn({
        data: {
          workspaceSlug,
        },
      }),
  });
  const refreshAddresses = () =>
    queryClient.invalidateQueries({
      queryKey: ["workspace-addresses", workspaceSlug],
    });
  const createAddressDialogProps = {
    domains: domains.data ?? [],
    domainsLoading: domains.isLoading || domains.isFetching,
    onCreated: refreshAddresses,
    workspaceSlug,
  };

  return (
    <SettingsPage
      description={description?.()}
      error={[error ? m["dashboard.settings.load_error"]() : null]}
      loading={[isLoading && isFetching]}
      onRetry={() => refetch()}
      retryLabel={m["dashboard.settings.retry"]()}
    >
      <AddressTable
        addresses={data}
        emptyAction={
          <CreateAddressDialog
            memberId={memberId}
            {...createAddressDialogProps}
            trigger={
              <Button type="button" variant="outline">
                <PlusIcon aria-hidden="true" className="size-4" />
                {m["dashboard.address.create.submit"]()}
              </Button>
            }
          />
        }
      />
      <div className="absolute right-7 bottom-7">
        <CreateAddressDialog
          {...createAddressDialogProps}
          memberId={memberId}
          tooltip={m["dashboard.address.add"]()}
          trigger={
            <Button
              aria-label={m["dashboard.address.add"]()}
              className="rounded-full"
              size="icon"
              type="button"
            >
              <PlusIcon aria-hidden="true" className="size-5" />
            </Button>
          }
        />
      </div>
    </SettingsPage>
  );
}
