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
	image: string | null;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	billingPlan: "free" | "pro" | "premium";
	planChangedAt: Date;
	overlimit: boolean;
	overlimitAt: Date | null;
	slug: string;
	ownerId: string;
};
