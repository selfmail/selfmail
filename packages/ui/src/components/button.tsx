import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { SendIcon, Trash2Icon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        outline:
          "border-2 border-border bg-background text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        discard:
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
        link: "rounded-none px-0 text-primary underline-offset-4 hover:underline",
        send: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-6",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

type ActionButtonProps = Omit<ButtonProps, "children" | "variant"> & {
  children?: ReactNode;
};

function Button({
  asChild,
  className,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      type={type}
      {...props}
    />
  );
}

function SendButton({ children = "Send", ...props }: ActionButtonProps) {
  return (
    <Button variant="send" {...props}>
      <SendIcon />
      {children}
    </Button>
  );
}

function DiscardButton({ children = "Discard", ...props }: ActionButtonProps) {
  return (
    <Button variant="discard" {...props}>
      <Trash2Icon />
      {children}
    </Button>
  );
}

export { Button, DiscardButton, SendButton, type ButtonProps };
