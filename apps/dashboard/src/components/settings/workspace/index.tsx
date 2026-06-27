import { useQuery } from "@tanstack/react-query";
import { getWorkspaceInformations } from "#/lib/settings/workspace";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";

export function WorkspaceSettingsPage({
  description,
  memberId,
  workspaceId,
}: SettingsPageContext) {
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
