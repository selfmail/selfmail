"use client"

import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type React from "react";
import { cn } from "../cn";


export const SelectTrigger: React.FC<RadixSelect.SelectTriggerProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixSelect.Trigger {...props} className={cn("flex items-center justify-between outline-none border bg-[#f4f4f4] border-[#DBDBDB]  text-black px-2 py-1 rounded-md", props.className)} >{children} <ChevronDown className="ml-2 h-4 w-4" color="#666666" /></RadixSelect.Trigger>;
};

export const Select = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;
export const SelectContent = RadixSelect.Content;
export const SelectItem = RadixSelect.Item;
export const SelectItemText = RadixSelect.ItemText;
export const SelectItemIndicator = RadixSelect.ItemIndicator;
export const SelectLabel = RadixSelect.Label;   