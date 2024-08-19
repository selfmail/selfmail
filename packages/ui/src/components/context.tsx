"use client"

import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../cn";

export const ContextMenu = RadixContextMenu.Root;

export const ContextMenuTrigger: React.FC<RadixContextMenu.ContextMenuTriggerProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixContextMenu.Trigger  {...props} className={cn("text-black", props.className)} >{children}</RadixContextMenu.Trigger>;
};

export const ContextMenuContent: React.FC<RadixContextMenu.ContextMenuContentProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixContextMenu.Content {...props} className={cn("text-black", props.className)} >{children}</RadixContextMenu.Content>;
};

export const ContextMenuItem: React.FC<RadixContextMenu.ContextMenuItemProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixContextMenu.Item {...props} className={cn("text-black", props.className)} >{children}</RadixContextMenu.Item>;
};

export const ContextMenuSeparator: React.FC<RadixContextMenu.ContextMenuSeparatorProps> = ({ ...props }) => {
    return <RadixContextMenu.Separator {...props} className={cn("text-black", props.className)} />;
};