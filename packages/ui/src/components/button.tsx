"use client";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../cn";

export const ButtonStyles = cva("button", {
  variants: {
    variant: {
      primary: [
        "bg-gradient-to-t",
        "text-white",
        "from-[#2d73f0]",
        "to-[#3776f5]",
        "rounded-md",
        "border-t-[1px]",
        "border-t-[#5e91f8]",
        "px-3",
        "py-1",
        "disabled:bg-red-400"
      ],
      secondary: [
        "bg-gradient-to-t",
        "text-white",
        "bg-[#f4f4f4]",
        "rounded-md",
        "border-[2px]",
        "border-neutral-700",
        "px-3",
        "py-1"
      ],
      danger: [
        "bg-gradient-to-t",
        "text-white",
        "from-[#e76176]",
        "to-[#e76171]",
        "rounded-[8px]",
        "border-[2px]",
        "border-[#e76176]",
        "px-2",
      ]
    },
    size: {
      small: ["text-sm", "py-0", "px-1"],
      medium: ["text-base", "py-0", "px-2"],
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "medium",
  },
});

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  VariantProps<typeof ButtonStyles> {
  children: React.ReactNode;
}

export function Button({ variant, children, size, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(ButtonStyles({ variant, size }), props.className)}
    >
      {children}
    </button>
  );
}
