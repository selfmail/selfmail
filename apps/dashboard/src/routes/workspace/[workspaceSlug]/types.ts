import type { Member, User, Workspace } from "database";
export type UserInSharedMap = User;

export type MemberInSharedMap = {
  MemberPermission: {
    memberId: string;
    permissionName: string;
    givenAt: Date;
  }[];
} & Member;

export type WorkspaceInSharedMap = Workspace;
