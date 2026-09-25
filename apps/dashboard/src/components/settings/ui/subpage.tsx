import { Dialog } from "@base-ui/react";
import { Divider } from "@selfmail/ui";
import { ChevronLeftIcon, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { m } from "#/paraglide/messages";

interface SettingsSubpageLayoutProps {
  children: ReactNode;
  onBack: () => void;
  parentTitle: string;
  title: string;
}

export function SettingsSubpageLayout({
  children,
  onBack,
  parentTitle,
  title,
}: SettingsSubpageLayoutProps) {
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    headerRef.current?.querySelector("button")?.focus();
  }, []);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
      <header
        className="flex w-full items-center justify-between px-4 py-3 sm:px-6"
        ref={headerRef}
      >
        <div className="flex items-center gap-4">
          <button
            className="-m-1 flex cursor-pointer items-center gap-2 rounded-sm p-1 pr-2 text-foreground hover:bg-accent"
            onClick={onBack}
            type="button"
          >
            <ChevronLeftIcon size={15} />
            <span className="text-foreground text-sm">Back</span>
          </button>
          <Divider orientation="vertical" />
          <Dialog.Title className="ml-auto flex min-w-0 items-center gap-2 text-sm">
            <button
              className="cursor-pointer text-muted-foreground transition-300 hover:text-foreground"
              onClick={onBack}
              type="button"
            >
              {parentTitle}
            </button>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <span className="truncate font-medium">{title}</span>
          </Dialog.Title>
        </div>
        <Dialog.Close
          aria-label={m["dashboard.settings.close"]()}
          className="cursor-pointer rounded-md p-1 text-foreground transition-300 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </Dialog.Close>
      </header>
      <div className="mx-2 mb-2 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md bg-background p-4 [scrollbar-color:gray_transparent] [scrollbar-width:thin] sm:p-6">
        <div>{children}</div>
      </div>
    </div>
  );
}
