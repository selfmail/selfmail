"use client";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "prosekit/react/tooltip";
import type { ReactNode } from "react";

export default function Button({
  pressed,
  disabled,
  onClick,
  tooltip,
  children,
}: {
  pressed?: boolean;
  disabled?: boolean;
  onClick?: VoidFunction;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <TooltipRoot>
      <TooltipTrigger className="block">
        <button
          data-state={pressed ? "on" : "off"}
          disabled={disabled}
          onClick={() => onClick?.()}
          onMouseDown={(event) => event.preventDefault()}
          className="outline-unset focus-visible:outline-unset flex min-h-9 min-w-9 items-center justify-center rounded-md bg-transparent p-2 text-sm font-medium transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50 hover:disabled:opacity-50 data-[state=on]:bg-gray-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300 dark:data-[state=on]:bg-gray-700"
        >
          {children}
          {tooltip ? <span className="sr-only">{tooltip}</span> : null}
        </button>
      </TooltipTrigger>
      <TooltipContent className="data-[state=open]:animate-duration-150 data-[state=closed]:animate-duration-200 z-50 overflow-hidden rounded-md border border-solid bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50 shadow-sm will-change-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-2 data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-2 data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-2 dark:bg-zinc-50 dark:text-zinc-900 [&:not([data-state])]:hidden">
        {tooltip}
      </TooltipContent>
    </TooltipRoot>
  );
}
