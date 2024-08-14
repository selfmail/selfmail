"use client";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../cn";

export const ButtonStyles = cva("button", {
  variants: {
    variant: {
      primary: [
        "text-white",
        "bg-[#296dff]",
        "disabled:bg-[#296dffaa]",
        "disabled:cursor-not-allowed",
      ],
      secondary: [
        "bg-[#252525]",
        "text-white",
        "disabled:bg-[#252525aa]",
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

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  VariantProps<typeof ButtonStyles> {
  children: React.ReactNode;
}

export function Button({ variant, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(ButtonStyles({ variant }), props.className, "px-3 text-[16px] h-[32px] rounded-[0.5rem]")}
    >
      {children}
    </button>
  );
}
