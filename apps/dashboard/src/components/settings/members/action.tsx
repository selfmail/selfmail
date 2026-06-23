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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@selfmail/ui";
import {
  CalendarIcon,
  CopyIcon,
  EllipsisIcon,
  FingerprintIcon,
  InfoIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";

interface MembersActionButtonProps {
  joinedAt: Date;
  memberId: string;
  memberName: string;
  canRemoveMembers: boolean;
  isCurrentMember: boolean;
  userId: string;
}

export default function MembersActionButton({
  joinedAt,
  memberId,
  canRemoveMembers,
  memberName,
  isCurrentMember,
  userId,
}: MembersActionButtonProps) {
  const memberInitials = getMemberInitials(memberName);

  function blockActionMenuEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
    }
  }

  async function copyUserId() {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success(
        m["dashboard.settings.member_settings.copy_user_id_success"](),
        {
          id: "copy-user-id",
        }
      );
    } catch {
      toast.error(
        m["dashboard.settings.member_settings.copy_user_id_error"](),
        {
          id: "copy-user-id",
        }
      );
    }
  }

  return (
    <Dialog>
      <AlertDialog>
        <Dropdown>
          <DropdownTrigger
            aria-label={`${m["dashboard.settings.member_settings.actions"]()} ${memberName}`}
            className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-accent data-popup-open:text-accent-foreground"
            type="button"
          >
            <EllipsisIcon aria-hidden="true" className="size-4" />
          </DropdownTrigger>
          <DropdownContent onKeyDown={blockActionMenuEscape}>
            <DialogTrigger asChild>
              <DropdownItem icon={<InfoIcon />} variant="default">
                {m["dashboard.settings.member_settings.more_information"]()}
              </DropdownItem>
            </DialogTrigger>
            <DropdownItem
              icon={<CopyIcon />}
              onClick={() => copyUserId()}
              variant="default"
            >
              {m["dashboard.settings.member_settings.copy_user_id"]()}
            </DropdownItem>
            {canRemoveMembers && !isCurrentMember && (
              <AlertDialogTrigger asChild>
                <DropdownItem
                  icon={<Trash2Icon />}
                  iconClassName="text-destructive"
                  variant="destructive"
                >
                  {m["dashboard.settings.member_settings.remove"]()}
                </DropdownItem>
              </AlertDialogTrigger>
            )}
          </DropdownContent>
        </Dropdown>
        <AlertDialogContent
          className="max-w-md gap-6 border-destructive/30 p-0"
          overlayClassName="bg-black/70 dark:bg-black/80"
        >
          <div className="grid gap-5 p-6 pb-0">
            <AlertDialogHeader className="gap-3">
              <div className="grid gap-2">
                <AlertDialogTitle className="text-xl">
                  {m["dashboard.settings.member_settings.remove_title"]({
                    memberName,
                  })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {m["dashboard.settings.cannot_undo"]()}
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
              {memberName}
            </div>
          </div>
          <AlertDialogFooter className="border-border border-t bg-muted/40 p-4">
            <AlertDialogCancel className="hover:border-foreground/20 hover:bg-accent hover:text-foreground">
              {m["dashboard.settings.cancel"]()}
            </AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/85 hover:text-white">
              {m["dashboard.settings.member_settings.remove_confirm"]()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogClose asChild>
          <button
            aria-label={m["dashboard.settings.close"]()}
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </button>
        </DialogClose>
        <div className="grid gap-5 p-6">
          <div className="flex items-start gap-4 pr-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
              {memberInitials}
            </div>
            <div className="grid min-w-0 gap-1.5">
              <DialogTitle className="truncate text-xl">
                {memberName}
              </DialogTitle>
              <DialogDescription className="text-pretty">
                {m["dashboard.settings.member_settings.more_information"]()}
              </DialogDescription>
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-border bg-muted/40 p-2">
            <MemberDetail
              icon={<FingerprintIcon />}
              label="Member ID"
              value={memberId}
            />
            <MemberDetail
              icon={<UserRoundIcon />}
              label="User ID"
              value={userId}
            />
            <MemberDetail
              icon={<CalendarIcon />}
              label={m["dashboard.settings.member_settings.joined"]()}
              value={new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
              }).format(new Date(joinedAt))}
            />
          </div>
        </div>
        <DialogFooter className="border-border border-t bg-muted/40 p-4">
          <DialogClose asChild>
            <Button className="w-full" variant="outline">
              {m["dashboard.settings.close"]()}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MemberDetailProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MemberDetail({ icon, label, value }: MemberDetailProps) {
  return (
    <div className="grid grid-cols-[1rem_1fr] items-start gap-3 rounded-lg bg-background px-3 py-2.5">
      <span className="mt-0.5 flex size-4 items-center justify-center text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="grid min-w-0 gap-1">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="truncate font-mono text-sm tabular-nums">{value}</span>
      </span>
    </div>
  );
}

function getMemberInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
