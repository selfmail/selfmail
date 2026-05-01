import { create } from "zustand";

interface ViewedEmailStore {
	emailId: string | undefined;
	closePreview: () => void;
	setEmailId: (emailId: string | undefined) => void;
}

export const useViewedEmailStore = create<ViewedEmailStore>((set) => ({
	emailId: undefined,
	closePreview: () => set({ emailId: undefined }),
	setEmailId: (emailId) => set({ emailId }),
}));
