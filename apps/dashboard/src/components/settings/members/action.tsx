import {
  buttonVariants,
  cn,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@selfmail/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, EllipsisIcon, InfoIcon, Trash2Icon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { removeMember } from "#/lib/settings/member";
import { m } from "#/paraglide/messages";
import {
  createMemberInformationDialogHandle,
  createRemoveMemberDialogHandle,
  MemberInformationDialog,
  RemoveMemberDialog,
} from "./action-dialogs";

interface MembersActionButtonProps {
  joinedAt: Date;
  memberId: string;
  memberName: string;
  removeMemberId: string;
  canRemoveMembers: boolean;
  workspaceId: string;
  isCurrentMember: boolean;
  userId: string;
}

export default function MembersActionButton({
  joinedAt,
  memberId,
  canRemoveMembers,
  workspaceId,
  removeMemberId,
  memberName,
  isCurrentMember,
  userId,
}: MembersActionButtonProps) {
  const queryClient = useQueryClient();
  const informationDialogHandle = useMemo(
    createMemberInformationDialogHandle,
    []
  );
  const removeDialogHandle = useMemo(createRemoveMemberDialogHandle, []);

  const { mutate } = useMutation({
    mutationFn: removeMember,
    mutationKey: ["remove-member", workspaceId, memberId],
    onSuccess: () => {
      toast.success(
        m["dashboard.settings.member_settings.remove_success"]({
          memberName,
        }),
        {
          id: "remove-member",
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });

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
    <>
      <Dropdown>
        <DropdownTrigger
          aria-label={`${m["dashboard.settings.member_settings.actions"]()} ${memberName}`}
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "ghost" }),
            "size-6"
          )}
          type="button"
        >
          <EllipsisIcon aria-hidden="true" className="size-4" />
        </DropdownTrigger>
        <DropdownContent onKeyDown={blockActionMenuEscape}>
          <DropdownItem
            icon={<InfoIcon />}
            onClick={() => informationDialogHandle.open(null)}
            variant="default"
          >
            {m["dashboard.settings.member_settings.more_information"]()}
          </DropdownItem>
          <DropdownItem
            icon={<CopyIcon />}
            onClick={() => copyUserId()}
            variant="default"
          >
            {m["dashboard.settings.member_settings.copy_user_id"]()}
          </DropdownItem>
          {canRemoveMembers && !isCurrentMember && (
            <DropdownItem
              icon={<Trash2Icon />}
              iconClassName="text-destructive"
              onClick={() => removeDialogHandle.open(null)}
              variant="destructive"
            >
              {m["dashboard.settings.member_settings.remove"]()}
            </DropdownItem>
          )}
        </DropdownContent>
      </Dropdown>
      <MemberInformationDialog
        handle={informationDialogHandle}
        joinedAt={joinedAt}
        memberId={memberId}
        memberName={memberName}
        userId={userId}
      />
      <RemoveMemberDialog
        handle={removeDialogHandle}
        memberName={memberName}
        onRemove={() =>
          mutate({
            data: {
              memberId,
              workspaceId,
              removeMemberId,
            },
          })
        }
      />
    </>
  );
}
