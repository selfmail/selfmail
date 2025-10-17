export type UserInSharedMap = {
	id: string;
	name: string;
	password: string;
	email: string;
	workspaceLimit: number;
	twoFactorEnabled: boolean;
	twoFactorSecret: string | null;
	backupCodes: string | null;
	emailVerified: Date | null;
};

export type MemberInSharedMap = {
	MemberPermission: {
		memberId: string;
		permissionName: string;
		givenAt: Date;
	}[];
} & {
	id: string;
	userId: string;
	profileName: string | null;
	description: string | null;
	image: string | null;
	workspaceId: string;
};

export type WorkspaceInSharedMap = {
	id: string;
	name: string;
	description: string | null;
	image: string | null;
	slug: string;
	createdAt: Date;
	updatedAt: Date;
	planId: string;
	planChangedAt: Date;
	overlimit: boolean;
	overlimitAt: Date | null;
	ownerId: string;
};
