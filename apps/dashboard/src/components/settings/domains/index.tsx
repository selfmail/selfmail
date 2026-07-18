import { Button, cn } from "@selfmail/ui";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  RefreshCwIcon,
} from "lucide-react";
import { getWorkspaceDomains } from "#/lib/settings/domains";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";
import { DomainActions } from "./actions";
import { AddDomainDialog } from "./dialog";

type Domain = Awaited<
  ReturnType<typeof getWorkspaceDomains>
>["domains"][number];

const emptyDomains: Domain[] = [];

export function DomainSettingsPage({
  description,
  workspaceId,
  memberId,
}: SettingsPageContext) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["domains", workspaceId],
    queryFn: () =>
      getWorkspaceDomains({
        data: {
          memberId,
          workspaceId,
        },
      }),
  });

  return (
    <SettingsPage
      description={description?.()}
      error={[error ? m["dashboard.settings.domains.load_error"]() : null]}
      loading={[isLoading && isFetching]}
      onRetry={() => refetch()}
      retryLabel={m["dashboard.settings.domains.retry"]()}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <table className="w-full min-w-lg border-collapse text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th
                  className="border-border border-b px-4 py-3 font-medium"
                  scope="col"
                >
                  {m["dashboard.settings.domains.domain_name"]()}
                </th>
                <th
                  className="border-border border-b px-4 py-3 font-medium"
                  scope="col"
                >
                  {m["dashboard.settings.domains.manage"]()}
                </th>
                <th
                  className="w-12 border-border border-b px-4 py-3"
                  scope="col"
                >
                  <span className="sr-only">
                    {m["dashboard.settings.domains.manage"]()}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.domains ?? emptyDomains).length ? (
                (data?.domains ?? emptyDomains).map((domain) => (
                  <tr className="hover:bg-muted/40" key={domain.id}>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {domain.domain}
                          </p>
                          <p className="truncate text-muted-foreground text-xs">
                            {domain.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-xs",
                          domain.verified
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {domain.verified ? (
                          <CheckCircle2Icon
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        ) : (
                          <CircleDashedIcon
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        )}
                        {domain.verified
                          ? m["dashboard.settings.domains.verified"]()
                          : m["dashboard.settings.domains.draft"]()}
                      </span>
                    </td>
                    <td className="w-12 px-4 py-3.5 align-middle">
                      <DomainActions
                        canDelete={data?.canDeleteDomains ?? false}
                        canVerify={data?.canUpdateDomains ?? false}
                        domain={domain}
                        memberId={memberId}
                        workspaceId={workspaceId}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={3}>
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {m["dashboard.settings.domains.empty_title"]()}
                        </p>
                        <p className="mt-1 text-pretty text-muted-foreground text-sm">
                          {m["dashboard.settings.domains.empty_description"]()}
                        </p>
                      </div>
                      <Button
                        onClick={() => refetch()}
                        type="button"
                        variant="outline"
                      >
                        <RefreshCwIcon aria-hidden="true" className="size-4" />
                        {m["dashboard.settings.domains.retry"]()}
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data?.canAddDomains ? (
        <div className="absolute right-7 bottom-7">
          <AddDomainDialog memberId={memberId} workspaceId={workspaceId} />
        </div>
      ) : null}
    </SettingsPage>
  );
}
