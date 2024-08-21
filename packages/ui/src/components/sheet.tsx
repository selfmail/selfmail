import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export const Sheet: React.FC<RadixDialog.DialogProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixDialog.Root {...props}>
        <SheetOverlay />
        {children}
    </RadixDialog.Root>;
};

export const SheetPortal = RadixDialog.Portal;

export const SheetOverlay: React.FC<RadixDialog.DialogOverlayProps> = ({ ...props }) => {
    return <RadixDialog.Overlay {...props} className={cn("bg-black/50 fixed inset-0 z-10", props.className)} />;
};

export const SheetTrigger: React.FC<RadixDialog.DialogTriggerProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixDialog.Trigger {...props} className={cn("text-black", props.className)} >{children}</RadixDialog.Trigger>;
};

export const SheetContent: React.FC<RadixDialog.DialogContentProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixDialog.Content {...props} className={cn("text-black z-20 fixed right-2 top-2 bottom-2 w-[40%] rounded-lg bg-[#e8e8e8] border border-[#DBDBDB] p-3 shadow-md", props.className)} >
        <RadixDialog.Close className="absolute right-2 top-2 text-black cursor-pointer">
            <X className="absolute right-2 top-2 text-black cursor-pointer" />
        </RadixDialog.Close>
        {children}
    </RadixDialog.Content>;
};

export const SheetClose: React.FC<RadixDialog.DialogCloseProps> = ({ ...props }) => {
    return <RadixDialog.Close {...props} className={cn("text-black", props.className)} />;
};

export const SheetTitle: React.FC<RadixDialog.DialogTitleProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <RadixDialog.Title {...props} className={cn("text-black", props.className)} >{children}</RadixDialog.Title>;
};

export const SheetComponent: React.FC<RadixDialog.DialogDescriptionProps & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <div {...props} className={cn("text-black", props.className)} >{children}</div>;
};

export const SheetFooter: React.FC<HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
}> = ({ children, ...props }) => {
    return <div {...props} className={cn("text-black", props.className)} >{children}</div>;
};
