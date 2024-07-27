import { create } from "zustand";

// mail store
type State = {
    subject: string | undefined,
    content: string | undefined,
    recipient: string | undefined,
    adresse: string | undefined
}

type Action = {
    updateAdresse: (adresse: State["adresse"]) => void
    updateContent: (content: State["content"]) => void
    updateRecipient: (recipient: State["recipient"]) => void
    updateSubject: (subject: State["subject"]) => void
}

export const useMailStore = create<State & Action>((set) => ({
    adresse: undefined,
    content: undefined,
    recipient: undefined,
    subject: undefined,
    updateAdresse: (adresse) => set(() => ({ adresse })),
    updateContent: (content) => set(() => ({ content })),
    updateRecipient: (recipient) => set(() => ({ recipient })),
    updateSubject: (subject) => set(() => ({ subject }))
}))