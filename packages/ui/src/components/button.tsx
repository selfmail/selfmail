"use client";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../cn";

export const ButtonStyles = cva("badge", {
  variants: {
    variant: {
      primary: [
        "bg-gradient-to-t",
        "text-white",
        "from-[#3776f5]",
        "to-[#2d73ff]",
        "rounded-[8px]",
        "border-[2px]",
        "border-[#2b65d8]",
        "px-2",
      ],
      secondary: [
        "bg-gradient-to-t",
        "text-white",
        "from-[#4a4a4a]",
        "to-[#363535]",
        "rounded-[8px]",
        "border-[2px]",
        "border-[#616161]",
        "px-2",
      ],
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
