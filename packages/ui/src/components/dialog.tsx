"use client"

import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "../cn";
import { type ButtonProps, ButtonStyles } from "./button";

export const Dialog = RadixDialog.Root;
export const DialogPortal = RadixDialog.Portal;

export const DialogTrigger: React.FC<RadixDialog.DialogTriggerProps & ButtonProps & {
  children: React.ReactNode;
}> = ({ children, variant, ...props }) => {
  return <RadixDialog.Trigger  {...props} className={cn(ButtonStyles({ variant }), "px-3 text-[16px] h-[32px] rounded-[0.5rem]", props.className)} >{children}</RadixDialog.Trigger>;
};

export const DialogContent: React.FC<RadixDialog.DialogContentProps & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <RadixDialog.Content {...props} className={cn("text-black z-[999] rounded-lg border border-[#DBDBDB] bg-[#f4f4f4] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in-top-dialog p-2 fixed top-[50%] left-[50%]", props.className)} >{children}</RadixDialog.Content>;
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <h3  {...props} className={cn("text-black text-lg font-semibold", props.className)} >{children}</h3>;
};

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement> & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <p  {...props} className={cn("mt-2 text-neutral-700 text-sm", props.className)} >{children}</p>;
};

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <div {...props} className={cn("flex justify-end items-center", props.className)} >{children}</div>;
};
export const DialogClose: React.FC<React.HTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <RadixDialog.Close {...props} className={cn("text-black", props.className)} >{children}</RadixDialog.Close>;
};
export const DialogOverlay: React.FC<RadixDialog.DialogOverlayProps> = ({ children, ...props }) => {
  return <RadixDialog.Overlay {...props} className={cn("bg-black/50 fixed inset-0 data-[state=open]:animate-in-opacity z-[998]", props.className)} >{children}</RadixDialog.Overlay>;
};