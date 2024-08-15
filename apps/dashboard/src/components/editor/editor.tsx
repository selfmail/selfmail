"use client"

import { Remirror, useKeymap, useRemirror } from '@remirror/react';
import { cn } from "lib/cn";
import { useCallback, useEffect, useState } from "react";
import { BoldExtension, CodeExtension, HeadingExtension, ItalicExtension, LinkExtension, PlaceholderExtension, StrikeExtension } from 'remirror/extensions';
import 'remirror/styles/all.css';
const hooks = [
  () => {
    useKeymap('Mod-u', () => {
      console.log('Save to backend');
      return true;
    });
  },
  // writing the logic in here i think
];

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

  // get the height of the header
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const element = document.getElementById("send-header");

    (document.querySelector(".ProseMirror") as HTMLElement).style.height = `calc(100vh - ${element?.offsetHeight || 0}px - 32px)`;

    setHeight(element?.offsetHeight || 0);
  }, []);
  console.log();

  return (
    <div style={{ minHeight: `calc(100vh - ${height}px - 32px)` }}>
      <Remirror data-text={"I'm a placeholder"} classNames={[cn("outline-none text-neutral-900 h-46 remirror-editor remirror-a11y-dark", `h-[calc(100vh - ${height}px - 32px)]`)]} manager={manager} initialContent={state} hooks={hooks}>

      </Remirror>
    </div>
  )
}