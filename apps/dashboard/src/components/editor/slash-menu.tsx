"use client";
import { useEditor } from "prosekit/react";
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from "prosekit/react/autocomplete";

import type { EditorExtension } from "./extension";

export default function SlashMenu() {
  const editor = useEditor<EditorExtension>();

  const handleHeadingInsert = (level: number) => {
    editor.commands.insertHeading({ level });
  };

  const handleHeadingConvert = (level: number) => {
    editor.commands.setHeading({ level });
  };

  return (
    <AutocompletePopover
      regex={/\/.*$/iu}
      className="relative z-10 box-border block max-h-[400px] min-w-[120px] select-none overflow-auto whitespace-nowrap rounded-lg border border-zinc-200 bg-white p-1 text-white shadow-lg dark:border-zinc-800 dark:bg-neutral-900 [&:not([data-state])]:hidden"
    >
      <AutocompleteList>
        <AutocompleteEmpty className="relative box-border block min-w-[120px] cursor-default select-none scroll-my-1 whitespace-nowrap rounded px-3 py-1.5 outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800">
          No results
        </AutocompleteEmpty>

        <AutocompleteItem
          className="relative box-border block min-w-[120px] cursor-default select-none scroll-my-1 whitespace-nowrap rounded px-3 py-1.5 outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800"
          onSelect={() => handleHeadingInsert(1)}
        >
          Insert Heading 1
        </AutocompleteItem>
        <AutocompleteItem
          className="relative box-border block min-w-[120px] cursor-default select-none scroll-my-1 whitespace-nowrap rounded px-3 py-1.5 outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800"
          onSelect={() => handleHeadingInsert(2)}
        >
          Insert Heading 2
        </AutocompleteItem>
        <AutocompleteItem
          className="relative box-border block min-w-[120px] cursor-default select-none scroll-my-1 whitespace-nowrap rounded px-3 py-1.5 outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800"
          onSelect={() => handleHeadingConvert(1)}
        >
          Turn into Heading 1
        </AutocompleteItem>
        <AutocompleteItem
          className="relative box-border block min-w-[120px] cursor-default select-none scroll-my-1 whitespace-nowrap rounded px-3 py-1.5 outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800"
          onSelect={() => handleHeadingConvert(2)}
        >
          Turn into Heading 2
        </AutocompleteItem>
      </AutocompleteList>
    </AutocompletePopover>
  );
}
