import { Button } from "@selfmail/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceDomains, verifyDomain } from "#/lib/settings/domains";
import { domainTxtHost, domainTxtValue } from "#/lib/workspaces/domain-utils";
import { m } from "#/paraglide/messages";
import type { SettingsSubpageContext } from "../menu/subpages";
import { SettingsPage } from "../ui";
import { SettingsSubpageLayout } from "../ui/subpage";
import { DomainActions } from "./actions";

export function DomainConsolePage({
  itemId,
  memberId,
  workspaceId,
  onBack,
  title,
}: SettingsSubpageContext) {
  const queryClient = useQueryClient();
  const verify = useMutation({
    mutationFn: (domainId: string) =>
      verifyDomain({ data: { domainId, memberId, workspaceId } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["domains", workspaceId] }),
  });
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["domains", workspaceId],
    queryFn: () => getWorkspaceDomains({ data: { memberId, workspaceId } }),
  });
  const domain = data?.domains.find((item) => item.id === itemId);
  return (
    <SettingsSubpageLayout
      onBack={onBack}
      parentTitle={title()}
      title={domain?.domain ?? "Domain"}
    >
      <SettingsPage
        error={[error]}
        loading={[isPending]}
        onRetry={() => refetch()}
        retryLabel={m["dashboard.settings.domains.retry"]()}
      >
        {domain ? (
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-border border-b pb-5">
              <div className="min-w-0">
                <h2 className="break-all font-medium text-xl">
                  {domain.domain}
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  {domain.verified
                    ? m["dashboard.settings.domains.verified"]()
                    : m["dashboard.settings.domains.draft"]()}
                </p>
              </div>
              <DomainActions
                canDelete={data?.canDeleteDomains ?? false}
                canVerify={false}
                domain={domain}
                memberId={memberId}
                workspaceId={workspaceId}
              />
            </div>
            {domain.verified ? (
              <dl className="grid gap-2 text-sm">
                <dt className="text-muted-foreground">
                  {m["dashboard.settings.domains.domain_name"]()}
                </dt>
                <dd className="break-all">{domain.domain}</dd>
                <dt className="mt-4 text-muted-foreground">Domain ID</dt>
                <dd className="break-all font-mono text-xs">{domain.id}</dd>
              </dl>
            ) : (
              <section
                aria-labelledby="dns-records-title"
                className="grid min-w-0 gap-4"
              >
                <div>
                  <h3 className="font-medium" id="dns-records-title">
                    Required DNS records
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Add these records at your DNS provider, then recheck. DNS
                    changes can take up to 48 hours to propagate.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Required DNS records for {domain.domain}
                    </caption>
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>
                        {["Type", "Host", "Value", "Priority"].map((label) => (
                          <th
                            className="border-border border-b px-4 py-3 font-medium"
                            key={label}
                            scope="col"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3">TXT</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {domainTxtHost(domain.domain)}
                        </td>
                        <td className="min-w-64 break-all px-4 py-3 font-mono text-xs">
                          {domainTxtValue(domain.verificationToken)}
                        </td>
                        <td className="px-4 py-3">—</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">MX</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {domain.domain}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          mail.selfmail.app
                        </td>
                        <td className="px-4 py-3">10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid justify-items-start gap-2">
                  <Button
                    disabled={verify.isPending || !data?.canUpdateDomains}
                    onClick={() => verify.mutate(domain.id)}
                    type="button"
                  >
                    {verify.isPending
                      ? "Checking DNS records…"
                      : "Recheck DNS records"}
                  </Button>
                  {data?.canUpdateDomains ? null : (
                    <p className="text-muted-foreground text-sm">
                      You don’t have permission to verify this domain.
                    </p>
                  )}
                  {verify.error ? (
                    <p className="text-destructive text-sm" role="alert">
                      {verify.error.message}
                    </p>
                  ) : null}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="grid justify-items-center gap-4 py-12 text-center">
            <p>This domain is no longer available in this workspace.</p>
            <Button onClick={onBack} variant="outline">
              Back to domains
            </Button>
          </div>
        )}
      </SettingsPage>
    </SettingsSubpageLayout>
  );
}
