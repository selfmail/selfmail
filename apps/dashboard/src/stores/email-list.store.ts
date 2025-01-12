import { create } from 'zustand'

// the following code is a store for the ids in the table, to mass delete emails for example

type State = {
    ids: number[]
}

type Action = {
    updateIds: (id: State['ids']) => void
}

export const useIdStore = create<State & Action>((set) => ({
    ids: [],
    updateIds: (ids) => set(() => ({ ids })),
}))

export const addId = (index: number) => {
    const { ids } = useIdStore.getState()

    if (ids.includes(index)) {
        return
    }

    useIdStore.setState({
        ids: [...ids, index]
    })
}