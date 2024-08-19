"use client"

import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "../cn";

export const Dialog = RadixDialog.Root;

export const DialogTrigger: React.FC<RadixDialog.DialogTriggerProps & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <RadixDialog.Trigger  {...props} className={cn("text-black", props.className)} >{children}</RadixDialog.Trigger>;
};

export const DialogContent: React.FC<RadixDialog.DialogContentProps & {
  children: React.ReactNode;
}> = ({ children, ...props }) => {
  return <RadixDialog.Content {...props} className={cn("text-black", props.className)} >{children}</RadixDialog.Content>;
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