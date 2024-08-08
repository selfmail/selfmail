"use client";
import type { LinkAttrs } from "prosekit/extensions/link";
import type { EditorState } from "prosekit/pm/state";
import { useEditor } from "prosekit/react";
import { InlinePopover } from "prosekit/react/inline-popover";
import { useState } from "react";

import Button from "./button";
import type { EditorExtension } from "./extension";

export default function InlineMenu() {
  const editor = useEditor<EditorExtension>({ update: true });

  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const toggleLinkMenuOpen = () => setLinkMenuOpen((open) => !open);

  const getCurrentLink = (state: EditorState): string | undefined => {
    const { $from } = state.selection;
    const marks = $from.marksAcross($from);
    if (!marks) {
      return;
    }
    for (const mark of marks) {
      if (mark.type.name === "link") {
        return (mark.attrs as LinkAttrs).href;
      }
    }
  };

  const handleLinkUpdate = (href?: string) => {
    if (href) {
      editor.commands.addLink({ href });
    } else {
      editor.commands.removeLink();
    }

    setLinkMenuOpen(false);
    editor.focus();
  };

  return (
    <>
      <InlinePopover
        data-testid="inline-menu-main"
        className="relative z-10 box-border flex min-w-[120px] space-x-1 overflow-auto whitespace-nowrap rounded-md border border-zinc-200 bg-white p-1 text-white shadow-lg dark:border-zinc-800 dark:bg-neutral-900 [&:not([data-state])]:hidden"
        onOpenChange={(open) => {
          if (!open) {
            setLinkMenuOpen(false);
          }
        }}
      >
        <Button
          pressed={editor.marks.bold.isActive()}
          disabled={!editor.commands.toggleBold.canApply()}
          onClick={() => editor.commands.toggleBold()}
          tooltip="Bold"
        >
          <div className="i-lucide-bold h-5 w-5" />
        </Button>

        <Button
          pressed={editor.marks.italic.isActive()}
          disabled={!editor.commands.toggleItalic.canApply()}
          onClick={() => editor.commands.toggleItalic()}
          tooltip="Italic"
        >
          <div className="i-lucide-italic h-5 w-5" />
        </Button>

        <Button
          pressed={editor.marks.underline.isActive()}
          disabled={!editor.commands.toggleUnderline.canApply()}
          onClick={() => editor.commands.toggleUnderline()}
          tooltip="Underline"
        >
          <div className="i-lucide-underline h-5 w-5" />
        </Button>

        <Button
          pressed={editor.marks.strike.isActive()}
          disabled={!editor.commands.toggleStrike.canApply()}
          onClick={() => editor.commands.toggleStrike()}
          tooltip="Strikethrough"
        >
          <div className="i-lucide-strikethrough h-5 w-5" />
        </Button>

        <Button
          pressed={editor.marks.code.isActive()}
          disabled={!editor.commands.toggleCode.canApply()}
          onClick={() => editor.commands.toggleCode()}
          tooltip="Code"
        >
          <div className="i-lucide-code h-5 w-5" />
        </Button>

        {editor.commands.addLink.canApply({ href: "" }) && (
          <Button
            pressed={editor.marks.link.isActive()}
            onClick={() => {
              editor.commands.expandLink();
              toggleLinkMenuOpen();
            }}
            tooltip="Link"
          >
            <div className="i-lucide-link h-5 w-5" />
          </Button>
        )}
      </InlinePopover>

      <InlinePopover
        placement={"bottom"}
        defaultOpen={false}
        open={linkMenuOpen}
        onOpenChange={setLinkMenuOpen}
        data-testid="inline-menu-link"
        className="w-xs relative z-10 box-border flex flex-col items-stretch gap-y-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-neutral-900 [&:not([data-state])]:hidden"
      >
        {linkMenuOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const target = event.target as HTMLFormElement | null;
              const href = target?.querySelector("input")?.value?.trim();
              handleLinkUpdate(href);
            }}
          >
            <input
              placeholder="Paste the link..."
              defaultValue={getCurrentLink(editor.state)}
              className="box-border flex h-9 w-full rounded-md border border-solid border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 ring-transparent transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-neutral-900 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-300"
            />
          </form>
        )}
        {editor.marks.link.isActive() && (
          <button
            type="button"
            onClick={() => handleLinkUpdate()}
            onMouseDown={(event) => event.preventDefault()}
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border-0 bg-zinc-900 px-3 text-sm font-medium text-zinc-50 ring-offset-white transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:ring-offset-neutral-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
          >
            Remove link
          </button>
        )}
      </InlinePopover>
    </>
  );
}
