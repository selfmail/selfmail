"use client"

// Tracks the user space, which page the user last visited, saves this page in the local storage and then displays the page
// when the user returns to the user space.

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { create } from "zustand"
import { persist, PersistOptions } from "zustand/middleware"

type State = {
    href: string
}

type Action = {
    setHref: (href: string) => void
}

export const useUserPageTrackingStore = create<State & Action>()(
    persist<State & Action>(
        (set) => ({
            href: localStorage.getItem("lastPage") || "/",
            setHref: (href) => set(() => ({ href })),
        }),
        {
            name: 'user-page-tracking-store',
        } as PersistOptions<State & Action>
    )
);

export default function UserPageTracking() {
    const pathName = usePathname()

    const { setHref } = useUserPageTrackingStore()

    useEffect(() => {
        setHref(pathName)
        console.log(`Changed User Page to ${pathName}`)
    }, [pathName])

    return (
        <></>
    )
}