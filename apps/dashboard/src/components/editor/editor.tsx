"use client"

import { useMailStore } from "@/app/(dashboard)/[team]/send/store";
import { cn } from "@/lib/cn";
import { OnChangeHTML, Remirror, useRemirror } from '@remirror/react';
import { useCallback, useEffect, useState } from "react";
import { BoldExtension, CodeExtension, HeadingExtension, ItalicExtension, LinkExtension, PlaceholderExtension, StrikeExtension } from 'remirror/extensions';
import 'remirror/styles/all.css';

export default function Editor() {
  const extensions = useCallback(
    () => [new PlaceholderExtension({
      placeholder: "Your email..."
    }), new BoldExtension({}), new HeadingExtension({ levels: [1, 2, 3] }), new ItalicExtension({}), new LinkExtension({}), new StrikeExtension({}), new CodeExtension({})],
    [],
  );
  const { manager, state } = useRemirror({
    extensions,
    selection: 'start',
    stringHandler: 'html',
  });

  const { content, updateContent } = useMailStore();

  const hooks = [
    () => {
      OnChangeHTML({
        onChange(html) {
          console.log(html);
          updateContent(html);
        },
      })
    }
  ];


  // get the height of the header
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const element = document.getElementById("send-header");

    (document.querySelector(".ProseMirror") as HTMLElement).style.height = `calc(100vh - ${element?.offsetHeight || 0}px - 32px)`;

    setHeight(element?.offsetHeight || 0);
  }, []);
  return (
    <div style={{ minHeight: `calc(100vh - ${height}px - 32px)` }}>
      <Remirror classNames={[cn("px-2 outline-none text-neutral-900 h-46 remirror-editor remirror-a11y-dark", `h-[calc(100vh - ${height}px - 32px)]`)]} manager={manager} initialContent={state} hooks={hooks}>

      </Remirror>
    </div>
  )
}