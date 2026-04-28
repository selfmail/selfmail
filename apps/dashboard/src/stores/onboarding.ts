import { create } from "zustand";

export interface OnboardingData {
	workspaceName: string;
	workspaceHandle: string;
	defaultAddress: string;
	customDomain: string;
	useCustomDomain: boolean;
	memberInvites: OnboardingMemberInvite[];
}

export interface OnboardingMemberInvite {
	email: string;
	id: string;
}

interface OnboardingStore {
	data: OnboardingData;
	reset: () => void;
	setCustomDomainEnabled: (enabled: boolean) => void;
	setField: <Key extends keyof OnboardingData>(
		key: Key,
		value: OnboardingData[Key],
	) => void;
	setMemberEmail: (id: string, email: string) => void;
	addMemberEmail: () => void;
	removeMemberEmail: (id: string) => void;
}

const initialData: OnboardingData = {
	workspaceName: "",
	workspaceHandle: "",
	defaultAddress: "",
	customDomain: "",
	useCustomDomain: false,
	memberInvites: [{ email: "", id: "member-1" }],
};

const createMemberInvite = (): OnboardingMemberInvite => ({
	email: "",
	id:
		typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `member-${Date.now().toString(36)}`,
});

export const useOnboardingStore = create<OnboardingStore>((set) => ({
	data: initialData,
	reset: () => set({ data: initialData }),
	setCustomDomainEnabled: (enabled) =>
		set(({ data }) => ({
			data: {
				...data,
				customDomain: enabled ? data.customDomain : "",
				useCustomDomain: enabled,
			},
		})),
	setField: (key, value) =>
		set(({ data }) => ({
			data: {
				...data,
				[key]: value,
			},
		})),
	setMemberEmail: (id, email) =>
		set(({ data }) => ({
			data: {
				...data,
				memberInvites: data.memberInvites.map((memberInvite) =>
					memberInvite.id === id ? { ...memberInvite, email } : memberInvite,
				),
			},
		})),
	addMemberEmail: () =>
		set(({ data }) => ({
			data: {
				...data,
				memberInvites: [...data.memberInvites, createMemberInvite()],
			},
		})),
	removeMemberEmail: (id) =>
		set(({ data }) => {
			const memberInvites = data.memberInvites.filter(
				(memberInvite) => memberInvite.id !== id,
			);

			return {
				data: {
					...data,
					memberInvites:
						memberInvites.length > 0
							? memberInvites
							: [{ email: "", id: "member-1" }],
				},
			};
		}),
}));
