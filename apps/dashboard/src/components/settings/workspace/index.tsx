import { useQuery } from "@tanstack/react-query";
import { getMemberPermissions } from "#/lib/settings/workspace";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";

export function WorkspaceSettingsPage({
  description,
  memberId,
  workspaceId,
}: SettingsPageContext) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["workspace-permissions", workspaceId, memberId],
    queryFn: () =>
      getMemberPermissions({
        data: {
          workspaceId,
        },
      }),
  });

  return (
    <SettingsPage
      description={description?.()}
      error={[error ? m["dashboard.settings.load_error"]() : null]}
      loading={[isLoading || isFetching]}
      onRetry={() => refetch()}
      retryLabel={m["dashboard.settings.retry"]()}
    >
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </SettingsPage>
  );
}
