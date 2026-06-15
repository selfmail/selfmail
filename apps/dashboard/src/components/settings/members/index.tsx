import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2Icon,
  MailPlusIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
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
  Input,
  SettingsBanner,
  SettingsBlock,
  SettingsDialog,
  SettingsDialogContent,
  SettingsDialogDescription,
  SettingsDialogHeader,
  SettingsDialogMain,
  SettingsDialogTitle,
  SettingsGroup,
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
import { settingsDataCache } from "../settings-data-cache.ts";
import type { SettingsPageComponent } from "../settings-pages";

interface RemoveMemberButtonProps {
  member: DashboardWorkspaceMember;
  onRemoved: () => Promise<void>;
  workspaceSlug: string;
}

type PendingWorkspaceMember = DashboardWorkspaceMember & {
  inviteStatus: "pending";
};

type MemberRow = DashboardWorkspaceMember | PendingWorkspaceMember;

interface AddMemberDialogProps {
  existingEmails: Set<string>;
  onAddMember: (email: string) => void;
  onClose: () => void;
  open: boolean;
}

interface RemovePendingMemberButtonProps {
  member: PendingWorkspaceMember;
  onRemove: (memberId: string) => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const isPendingMember = (member: MemberRow): member is PendingWorkspaceMember =>
  "inviteStatus" in member;

const toProfileName = (email: string) => {
  const [localPart] = email.split("@");
  const name = localPart.replace(/[._-]+/g, " ").trim();

  if (!name) {
    return m["dashboard.settings.member_settings.pending_member"]();
  }

  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

function AddMemberDialog({
  existingEmails,
  onAddMember,
  onClose,
  open,
}: AddMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [addedEmail, setAddedEmail] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setError(null);
    setAddedEmail(null);
  };

  const closeDialog = () => {
    reset();
    onClose();
  };

  const submitMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setError(m["dashboard.settings.member_settings.email_invalid"]());
      return;
    }

    if (existingEmails.has(normalizedEmail)) {
      setError(m["dashboard.settings.member_settings.email_duplicate"]());
      return;
    }

    onAddMember(normalizedEmail);
    setAddedEmail(normalizedEmail);
    setEmail("");
    setError(null);
  };

  return (
    <SettingsDialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeDialog();
        }
      }}
      open={open}
    >
      <SettingsDialogContent
        className="max-w-2xl sm:h-[28rem] sm:flex-col"
        closeLabel={m["dashboard.settings.member_settings.close_invite"]()}
      >
        <SettingsDialogMain>
          {addedEmail ? (
            <div className="grid h-full place-items-center text-center">
              <div className="grid max-w-sm gap-4">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2Icon className="size-6" />
                </div>
                <SettingsDialogHeader className="text-center">
                  <SettingsDialogTitle>
                    {m["dashboard.settings.member_settings.staged_title"]({
                      email: addedEmail,
                    })}
                  </SettingsDialogTitle>
                  <SettingsDialogDescription>
                    {m[
                      "dashboard.settings.member_settings.staged_description"
                    ]()}
                  </SettingsDialogDescription>
                </SettingsDialogHeader>
                <div className="flex justify-center">
                  <Button
                    className="px-3 py-1 text-sm"
                    onClick={closeDialog}
                    type="button"
                  >
                    {m["dashboard.settings.member_settings.done"]()}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form className="grid gap-5" noValidate onSubmit={submitMember}>
              <SettingsDialogHeader>
                <SettingsDialogTitle>
                  {m["dashboard.settings.member_settings.add_title"]()}
                </SettingsDialogTitle>
                <SettingsDialogDescription>
                  {m[
                    "dashboard.settings.member_settings.add_dialog_description"
                  ]()}
                </SettingsDialogDescription>
              </SettingsDialogHeader>
              <SettingsGroup>
                <SettingsBlock
                  description={
                    <div className="grid gap-2">
                      <Input
                        aria-describedby={
                          error ? "member-email-error" : undefined
                        }
                        aria-invalid={Boolean(error)}
                        autoComplete="email"
                        id="member-email"
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError(null);
                        }}
                        placeholder={m[
                          "dashboard.settings.member_settings.email_placeholder"
                        ]()}
                        type="email"
                        value={email}
                      />
                      {error ? (
                        <p
                          className="text-destructive text-sm"
                          id="member-email-error"
                          role="alert"
                        >
                          {error}
                        </p>
                      ) : null}
                    </div>
                  }
                  title={
                    <label htmlFor="member-email">
                      {m["dashboard.settings.member_settings.current_email"]()}
                    </label>
                  }
                />
              </SettingsGroup>
              <div className="flex justify-end">
                <Button className="px-3 py-1 text-sm" type="submit">
                  {m["dashboard.settings.member_settings.add"]()}
                </Button>
              </div>
            </form>
          )}
        </SettingsDialogMain>
      </SettingsDialogContent>
    </SettingsDialog>
  );
}

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

function RemovePendingMemberButton({
  member,
  onRemove,
}: RemovePendingMemberButtonProps) {
  return (
    <Button
      className="px-3 py-1 text-sm"
      onClick={() => onRemove(member.id)}
      type="button"
      variant="outline"
    >
      <Trash2Icon className="size-3.5" />
      {m["dashboard.settings.member_settings.remove"]()}
    </Button>
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
  const [data, setData] = useState<DashboardWorkspaceMembersData | null>(
    () => settingsDataCache.members.get(workspaceSlug) ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(
    () => !settingsDataCache.members.has(workspaceSlug)
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<
    PendingWorkspaceMember[]
  >([]);

  const fetchMembers = useCallback(
    () =>
      getWorkspaceMembers({
        data: {
          workspaceSlug,
        },
      }),
    [getWorkspaceMembers, workspaceSlug]
  );
  const setCachedData = useCallback(
    (membersData: DashboardWorkspaceMembersData) => {
      settingsDataCache.members.set(workspaceSlug, membersData);
      setData(membersData);
    },
    [workspaceSlug]
  );

  const loadMembers = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setCachedData(await fetchMembers());
    } catch {
      setError(m["dashboard.settings.member_settings.load_error"]());
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers, setCachedData]);

  useEffect(() => {
    let ignoreResult = false;

    const loadActivePage = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const membersData = await fetchMembers();

        if (!ignoreResult) {
          setCachedData(membersData);
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
  }, [fetchMembers, setCachedData]);

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
  const rows: MemberRow[] = [...members, ...pendingMembers];
  const existingEmails = new Set(
    rows.map((member) => member.email.toLowerCase())
  );
  const addPendingMember = (email: string) => {
    setPendingMembers((currentMembers) => [
      ...currentMembers,
      {
        addressCount: 0,
        email,
        id: `pending-${crypto.randomUUID()}`,
        image: null,
        inviteStatus: "pending",
        isCurrentMember: false,
        isOwner: false,
        joinedAt: new Date().toISOString(),
        permissions: [],
        profileName: toProfileName(email),
        roles: [],
        storageBytes: "0",
      },
    ]);
  };
  const removePendingMember = (memberId: string) => {
    setPendingMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== memberId)
    );
  };
  const columns: readonly SettingsTableColumn<MemberRow>[] = [
    {
      cell: (member) => (
        <div className="grid min-w-48 gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{member.profileName}</span>
            {isPendingMember(member) ? (
              <Badge variant="secondary">
                {m["dashboard.settings.member_settings.pending_invite"]()}
              </Badge>
            ) : null}
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
          {isPendingMember(member) ? (
            <Badge variant="outline">
              {m["dashboard.settings.member_settings.invited"]()}
            </Badge>
          ) : null}
          {!isPendingMember(member) && member.isOwner ? (
            <Badge>{m["dashboard.settings.member_settings.owner"]()}</Badge>
          ) : null}
          {!isPendingMember(member) && member.roles.length
            ? member.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))
            : null}
          {isPendingMember(member) ||
          member.roles.length ||
          member.isOwner ? null : (
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
        <span className="tabular-nums">
          {isPendingMember(member)
            ? m["dashboard.settings.member_settings.pending"]()
            : formatJoinedAt(member.joinedAt)}
        </span>
      ),
      className: "whitespace-nowrap",
      header: m["dashboard.settings.member_settings.joined"](),
      id: "joined",
    },
    {
      cell: (member) => {
        if (isPendingMember(member)) {
          return (
            <RemovePendingMemberButton
              member={member}
              onRemove={removePendingMember}
            />
          );
        }

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
    <div className="grid gap-4">
      <AddMemberDialog
        existingEmails={existingEmails}
        onAddMember={addPendingMember}
        onClose={() => setIsAddMemberOpen(false)}
        open={isAddMemberOpen}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-pretty text-muted-foreground text-sm">
          {m["dashboard.settings.member_settings.add_description"]()}
        </p>
        <Button
          className="px-3 py-1 text-sm"
          onClick={() => setIsAddMemberOpen(true)}
          type="button"
        >
          <PlusIcon className="size-4" />
          {m["dashboard.settings.member_settings.add"]()}
        </Button>
      </div>
      {pendingMembers.length ? (
        <SettingsBanner
          description={m["dashboard.settings.member_settings.pending_banner"]()}
          icon={<MailPlusIcon />}
          title={
            pendingMembers.length === 1
              ? m[
                  "dashboard.settings.member_settings.pending_invite_count_one"
                ]({
                  count: pendingMembers.length,
                })
              : m["dashboard.settings.member_settings.pending_invite_count"]({
                  count: pendingMembers.length,
                })
          }
        />
      ) : null}
      <SettingsTable
        columns={columns}
        emptyAction={
          <Button
            className="px-3 py-1 text-sm"
            onClick={() => setIsAddMemberOpen(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
            {m["dashboard.settings.member_settings.add"]()}
          </Button>
        }
        emptyDescription={m[
          "dashboard.settings.member_settings.empty_description"
        ]()}
        emptyTitle={m["dashboard.settings.member_settings.empty_title"]()}
        getRowKey={(member) => member.id}
        rows={rows}
      />
    </div>
  );
};
