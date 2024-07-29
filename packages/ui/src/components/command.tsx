"use client"
/**
 * The command menu:
 * 
 * The command menu is a search modal with predictions based on the dialog element.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { KBD } from "./kbd";
import { cn } from "../cn";

// Context
const ItemContext = createContext<{
    // get the items from the context
    items: Array<{ value: string }> | undefined,
    // set a new item from the context
    setItem: React.Dispatch<React.SetStateAction<{
        value: string;
    }[] | undefined>>
} | undefined>(undefined)

interface CommandTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode,
    trigger: React.ReactNode
}

export function Command({
    children,
    trigger,
    ...props
}: CommandTriggerProps) {
    const [items, setItem] = useState<Array<{
        value: string
    }>>()
    useEffect(() => {
        console.log(items)
    }, [items])
    return (
        <Dialog>
            <DialogTrigger>
                {trigger}
            </DialogTrigger>
            <DialogContent {...props}>
                <ItemContext.Provider value={{
                    items,
                    setItem
                }}>
                    {children}
                    {items?.map((e) => (
                        <>
                            {e.value}
                        </>
                    ))}
                </ItemContext.Provider>
            </DialogContent>
        </Dialog>
    )
}

export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode,
    value: string,
    key?: string
}

export function CommandItem({
    children,
    value,
    key,
    ...props
}: CommandItemProps) {
    const { setItem } = useContext(ItemContext)!
    console.log(useContext(ItemContext))

    setItem((v) => v === undefined? undefined : [
        ...v.map((e) => e),
        {value}
    ])

    return (
        <div {...props} data-value={value} className={cn("flex items-center justify-between", props.className)}>
            {useContext(ItemContext)?.items?.toString()}
            {value}
            {key && (
                <KBD>
                    {key}
                </KBD>
            )}
        </div>
    )
}

/**
 * A group of CommandItems, this component is for the style. This components provides a group of CommandItems with a 
 * small heading.
 */
export function CommandGroup({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div>

        </div>
    )
}