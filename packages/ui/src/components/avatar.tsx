import {
  Fallback as AvatarPrimitiveFallback,
  Image as AvatarPrimitiveImage,
  Root as AvatarPrimitiveRoot,
} from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "size-8",
        default: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

type AvatarProps = ComponentProps<typeof AvatarPrimitiveRoot> &
  VariantProps<typeof avatarVariants>;

function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitiveRoot
      className={cn(avatarVariants({ className, size }))}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitiveImage>) {
  return (
    <AvatarPrimitiveImage
      className={cn("aspect-square size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitiveFallback>) {
  return (
    <AvatarPrimitiveFallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-sm",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage, avatarVariants };
