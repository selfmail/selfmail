import {
  Content as TabsPrimitiveContent,
  List as TabsPrimitiveList,
  Root as TabsPrimitiveRoot,
  Trigger as TabsPrimitiveTrigger,
} from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const Tabs = TabsPrimitiveRoot;

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitiveList>) {
  return (
    <TabsPrimitiveList
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground",
        className
      )}
      data-slot="tabs-list"
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitiveTrigger>) {
  return (
    <TabsPrimitiveTrigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitiveContent>) {
  return (
    <TabsPrimitiveContent
      className={cn(
        "mt-2 outline-none focus-visible:ring-2 focus-visible:ring-neutral-200",
        className
      )}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
