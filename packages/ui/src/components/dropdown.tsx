"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type React from "react";
import { cn } from "../cn";



const DropdownMenuContent: React.FC<{
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
    return (
        <DropdownMenuPrimitive.Content
            {...props}
            sideOffset={4}
            className="w-[200px] bg-background-secondary rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
            {children}
        </DropdownMenuPrimitive.Content>
    )
}

const DropdownMenuTrigger: React.FC<{
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
    return (
        <DropdownMenuPrimitive.Trigger
            {...props}
            className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none"
        >
            {children}
        </DropdownMenuPrimitive.Trigger>
    )
}

const DropdownMenuItem: React.FC<{
    children: React.ReactNode;
} & DropdownMenuPrimitive.DropdownMenuItemProps> = ({ children, ...props }) => {
    return (
        <DropdownMenuPrimitive.Item
            {...props}
            className="relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none "
        >
            {children}
        </DropdownMenuPrimitive.Item>
    )
}
const DropdownMenuIcon: React.FC<{
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
    return (
        <div {...props}
            {...props}
            className={cn("flex h-5 w-5 text-text-secondary", props.className)}
        >
            {children}
        </div>
    )
}
const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuIcon, DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuSub,
    DropdownMenuTrigger
};

