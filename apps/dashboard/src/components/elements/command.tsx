"use client"

import { Command } from "cmdk"
import { Inbox, AtSign, User2, Info, Users, KeyRound, Loader, Loader2 } from "lucide-react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { redirect, useRouter } from "next/navigation"
import React, { KeyboardEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { KBD } from "ui"
import { create } from "zustand"
// Command state
type State = {
    open: boolean,
}
type Action = {
    setOpen: (val: State["open"]) => void
}
export const useCommandStore = create<State & Action>((set) => ({
    open: false,
    setOpen: (state) => set(() => ({ open: state }))
}))

// types for the arrays below
type ActionArrayWithGroup = Array<{
    title: string,
    group: string,
    key?: string,
    action: (router: AppRouterInstance) => void,
    icon: React.ReactNode
}>
type ActionArray = Array<{
    title: string,
    group?: string,
    key?: string,
    action: (router: AppRouterInstance) => void,
    icon: React.ReactNode
}>
type ActionWithGroup = {
    title: string,
    group: string,
    key?: string,
    action: (router: AppRouterInstance) => void,
    icon: React.ReactNode
}

/**
 * Actions of the command menu. All of the actions are a
 * seperate object inside this array.
 */
export const actions: ActionArray = [
    {
        title: "Inbox",
        group: "Mail",
        icon: <Inbox className="h-4 w-4" />,
        action: () => {
            console.log("pressed inbox")
        }
    },
    {
        title: "Adresses",
        group: "Mail",
        icon: <AtSign className="h-4 w-4" />,
        action: (router) => {
            router.push("/adresses")
        },
        key: "Strg 1"
    },
    {
        title: "Teams",
        group: "Platform",
        icon: <Users className="h-4 w-4" />,
        action: () => {

        }
    },
    {
        title: "Settings",
        group: "Platform",
        icon: <User2 className="h-4 w-4" />,
        action: () => { }
    }
]


const actionsWithGroup = actions.filter((a) => {
    if (a.group) {
        return a
    }
}) as ActionArrayWithGroup

// filter the unique groups
let groups: ActionArrayWithGroup = []
actions.map((action) => {
    if (!action.group) return
    const group = groups.find((a) => a.group === action.group)
    if (group) return
    groups.push(action as ActionWithGroup)
})

// a function to get the elements from a specific group
const getActions = (group: string): ActionArrayWithGroup => {
    const values = actions.filter((a) => a.group === group)
    return values as ActionArrayWithGroup
}

export default function CommandMenu() {
    const { open, setOpen } = useCommandStore()
    const style = {
        className: "focus-visible:border border-black"
    }
    const router = useRouter()

    useEffect(() => {
        const action = (e: globalThis.KeyboardEvent) => {
            console.log(e)
            if (e.key === "k" && e.ctrlKey) setOpen(!open)
        }
        document.addEventListener("keypress", (e) => action(e))

        return (() => {
            document.removeEventListener("keypress", (e) => action(e))
        })
    }, [])

    return (
        <>
            {open &&
                (<>
                    <Command.Dialog className="z-20 hidden md:flex flex-col lg:w-[500px]  translate-x-[-50%] translate-y-[-50%] p-2 border fixed left-[50%] top-[50%] rounded-xl bg-white" onOpenChange={setOpen} open={open}>
                        <Command.Input placeholder="Type to search..." className="mb-2 border-2 border-[#dddddddd] p-2 rounded-xl bg-[#f4f4f4] focus-visible:outline-none focus-visible:border-[#666666]" />
                        <Command.Empty className="flex items-center space-x-2">
                            <Info className="h-4 w-4 text-red-400" /> <p>Command not found.</p>
                        </Command.Empty>
                        <Command.List>
                            {groups.map((group) => (
                                <Command.Group key={group.group} className="text-[#666666] text-sm" heading={group.group}>
                                    {getActions(group.group).map((action) => (
                                        <Command.Item contextMenu="hey"  onClick={() => {
                                            action.action(router)
                                            console.log("clicked")
                                        }} className="text-base focus-visible:bg-[#e0e0e0] cursor-pointer py-2 hover:bg-[#e0e0e0] px-2 rounded-xl flex items-center justify-between text-black" key={action.title}>
                                            <div className="flex items-center space-x-2">
                                                {action.icon}
                                                <div>{action.title}</div>
                                            </div>
                                            {action.key && (
                                                <KBD>
                                                    {action.key}
                                                </KBD>
                                            )}
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            ))}
                        </Command.List>
                    </Command.Dialog>
                    <div className="z-10 hidden md:flex fixed top-0 bottom-0 right-0 left-0 bg-[#0000004b]" />
                </>)
            }
        </>
    )
}