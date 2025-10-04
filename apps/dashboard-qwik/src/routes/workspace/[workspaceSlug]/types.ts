export type UserInSharedMap = {
	member: ({
		workspace: {
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
	} & {
		id: string;
		image: string | null;
		userId: string;
		profileName: string | null;
		description: string | null;
		workspaceId: string;
	})[];
} & {
	id: string;
	name: string;
	password: string;
	email: string;
	twoFactorEnabled: boolean;
	twoFactorSecret: string | null;
	backupCodes: string | null;
	emailVerified: Date | null;
};

export type MemberInSharedMap = {
	member: {
		workspace: {
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
	} & {
		id: string;
		image: string | null;
		userId: string;
		profileName: string | null;
		description: string | null;
		workspaceId: string;
	};
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
