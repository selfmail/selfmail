"use client"
import * as RadixCheckBox from "@radix-ui/react-checkbox";
import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type React from "react";
import { cn } from "../cn";

export const ButtonStyles = cva("checkbox", {
    variants: {
        variant: {
            primary: [
                "text-white",
                "bg-[#33c891]",
                "disabled:bg-[#33c891aa]",
                "disabled:cursor-not-allowed",
            ],
            danger: [
                "text-white",
                "bg-[#e76176]",
                "disabled:bg-[#e76176aa]",
                "disabled:cursor-not-allowed",
            ],
        },
    },
    defaultVariants: {
        variant: "primary",
    },
});

export const Checkbox: React.FC<RadixCheckBox.CheckboxProps> = (props) => {
    return <RadixCheckBox.Root {...props} className={cn("border border-[#DBDBDB] hover:bg-violet3 flex h-[15px] w-[15px] appearance-none items-center justify-center rounded-[4px] bg-white  outline-none ", props.className)} />;
};
export const CheckboxIndicator: React.FC<RadixCheckBox.CheckboxIndicatorProps> = (props) => {
    return (<RadixCheckBox.Indicator {...props} className="flex items-center justify-center h-[15px] border border-[#DBDBDB] w-[15px] rounded-[4px] bg-[#33c891]  text-white">
        <Check strokeWidth={4} className="p-[1px]  font-bold" color="white" />
    </RadixCheckBox.Indicator>)
}