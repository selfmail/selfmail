import { useServerFn } from "@tanstack/react-start";
import { Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  SettingsTable,
  type SettingsTableColumn,
  Skeleton,
} from "#/components/ui";
import { cn } from "#/lib/utils";
import {
  type DashboardWorkspaceMember,
  type DashboardWorkspaceMembersData,
  getWorkspaceMembersFn,
  removeWorkspaceMemberFn,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import type { SettingsPageComponent } from "./settings-pages";

interface RemoveMemberButtonProps {
  member: DashboardWorkspaceMember;
  onRemoved: () => Promise<void>;
  workspaceSlug: string;
}

const formatStorage = (storageBytes: string) => {
  const bytes = Number(storageBytes);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value.toLocaleString(getLocale(), {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  })} ${units[unitIndex]}`;
};

const formatJoinedAt = (joinedAt: string) =>
  new Intl.DateTimeFormat(getLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(joinedAt));

function RemoveMemberButton({
  member,
  onRemoved,
  workspaceSlug,
}: RemoveMemberButtonProps) {
  const removeWorkspaceMember = useServerFn(removeWorkspaceMemberFn);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const removeMember = async () => {
    setError(null);
    setIsRemoving(true);

    try {
      const result = await removeWorkspaceMember({
        data: {
          memberId: member.id,
          workspaceSlug,
        },
      });

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      await onRemoved();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setError(null);
        }
      }}
      open={isOpen}
    >
      <AlertDialogTrigger asChild>
        <Button className="px-3 py-1 text-sm" variant="destructive">
          <Trash2Icon className="size-3.5" />
          {m["dashboard.settings.member_settings.remove"]()}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {m["dashboard.settings.member_settings.remove_title"]({
              memberName: member.profileName,
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {m["dashboard.settings.member_settings.remove_description"]({
              memberEmail: member.email,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>
            {m["dashboard.settings.cancel"]()}
          </AlertDialogCancel>
          <Button
            disabled={isRemoving}
            onClick={removeMember}
            type="button"
            variant="destructive"
          >
            {isRemoving
              ? m["dashboard.settings.member_settings.removing"]()
              : m["dashboard.settings.member_settings.remove_confirm"]()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberSettingsLoadingTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 bg-muted/60 px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-4" key={index.toString()} />
        ))}
      </div>
      <div className="grid gap-0">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-border border-t px-4 py-3"
            key={rowIndex.toString()}
          >
            {Array.from({ length: 6 }).map((_, columnIndex) => (
              <Skeleton
                className={cn("h-5", columnIndex === 5 && "w-20")}
                key={columnIndex.toString()}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const MemberSettingsPage: SettingsPageComponent = ({
  workspaceSlug,
}) => {
  const getWorkspaceMembers = useServerFn(getWorkspaceMembersFn);
  const [data, setData] = useState<DashboardWorkspaceMembersData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(
    () =>
      getWorkspaceMembers({
        data: {
          workspaceSlug,
        },
      }),
    [getWorkspaceMembers, workspaceSlug]
  );

  const loadMembers = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setData(await fetchMembers());
    } catch {
      setError(m["dashboard.settings.member_settings.load_error"]());
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  useEffect(() => {
    let ignoreResult = false;

    const loadActivePage = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const membersData = await fetchMembers();

        if (!ignoreResult) {
          setData(membersData);
        }
      } catch {
        if (!ignoreResult) {
          setError(m["dashboard.settings.member_settings.load_error"]());
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    };

    // The settings registry only mounts this component for ?settings=members,
    // so this fetch runs when the user opens that page instead of during inbox load.
    loadActivePage();

    return () => {
      ignoreResult = true;
    };
  }, [fetchMembers]);

  if (isLoading && !data) {
    return <MemberSettingsLoadingTable />;
  }

  if (error && !data) {
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed p-6 text-center">
        <div className="grid gap-3">
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
          <Button onClick={loadMembers} type="button" variant="outline">
            {m["dashboard.settings.member_settings.retry"]()}
          </Button>
        </div>
      </div>
    );
  }

  const canRemoveMembers = data?.canRemoveMembers ?? false;
  const members = data?.members ?? [];
  const columns: readonly SettingsTableColumn<DashboardWorkspaceMember>[] = [
    {
      cell: (member) => (
        <div className="grid min-w-48 gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{member.profileName}</span>
            {member.isCurrentMember ? (
              <Badge variant="outline">
                {m["dashboard.settings.member_settings.you"]()}
              </Badge>
            ) : null}
          </div>
          <span className="truncate text-muted-foreground text-sm">
            {member.email}
          </span>
        </div>
      ),
      header: m["dashboard.settings.member_settings.member"](),
      id: "member",
    },
    {
      cell: (member) => (
        <div className="flex flex-wrap gap-1.5">
          {member.isOwner ? (
            <Badge>{m["dashboard.settings.member_settings.owner"]()}</Badge>
          ) : null}
          {member.roles.length
            ? member.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))
            : null}
          {member.roles.length || member.isOwner ? null : (
            <Badge variant="outline">
              {m["dashboard.settings.member_settings.member_role"]()}
            </Badge>
          )}
        </div>
      ),
      header: m["dashboard.settings.member_settings.access"](),
      id: "access",
    },
    {
      cell: (member) => (
        <span className="tabular-nums">
          {m["dashboard.settings.member_settings.address_count"]({
            count: member.addressCount,
          })}
        </span>
      ),
      className: "whitespace-nowrap",
      header: m["dashboard.settings.member_settings.addresses"](),
      id: "addresses",
    },
    {
      cell: (member) => (
        <span className="tabular-nums">
          {formatStorage(member.storageBytes)}
        </span>
      ),
      className: "whitespace-nowrap",
      header: m["dashboard.settings.member_settings.storage"](),
      id: "storage",
    },
    {
      cell: (member) => (
        <span className="tabular-nums">{formatJoinedAt(member.joinedAt)}</span>
      ),
      className: "whitespace-nowrap",
      header: m["dashboard.settings.member_settings.joined"](),
      id: "joined",
    },
    {
      cell: (member) => {
        if (member.isOwner) {
          return (
            <span className="text-muted-foreground text-sm">
              {m["dashboard.settings.member_settings.owner_locked"]()}
            </span>
          );
        }

        if (member.isCurrentMember) {
          return (
            <span className="text-muted-foreground text-sm">
              {m["dashboard.settings.member_settings.self_locked"]()}
            </span>
          );
        }

        if (!canRemoveMembers) {
          return (
            <span className="text-muted-foreground text-sm">
              {m["dashboard.settings.member_settings.no_permission"]()}
            </span>
          );
        }

        return (
          <RemoveMemberButton
            member={member}
            onRemoved={loadMembers}
            workspaceSlug={workspaceSlug}
          />
        );
      },
      className: cn("whitespace-nowrap text-right"),
      header: (
        <span className="sr-only">
          {m["dashboard.settings.member_settings.actions"]()}
        </span>
      ),
      id: "actions",
    },
  ];

  return (
    <SettingsTable
      columns={columns}
      emptyDescription={m[
        "dashboard.settings.member_settings.empty_description"
      ]()}
      emptyTitle={m["dashboard.settings.member_settings.empty_title"]()}
      getRowKey={(member) => member.id}
      rows={members}
    />
  );
};
