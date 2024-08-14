"use client"

import type { EditorState } from "@remirror/pm";
import { Remirror, useHelpers, useKeymap, useRemirror } from '@remirror/react';
import { useCallback } from "react";
import { BoldExtension } from 'remirror/extensions';
const hooks = [
  () => {
    const { getJSON } = useHelpers();

    const handleSaveShortcut = useCallback(
      ({ state }: { state: EditorState }) => {
        console.log(`Save to backend: ${JSON.stringify(getJSON(state))}`);

        return true;
      },
      [getJSON],
    );

    useKeymap('Mod-u', handleSaveShortcut);
  },
];
export default function Editor() {
  const { manager, state } = useRemirror({
    extensions: () => [new BoldExtension({
      weight: 50,
    })],
    content: '<p>I love <b>Remirror</b></p>',
    selection: 'start',
    stringHandler: 'html',
  });


  return (
    <Remirror manager={manager} initialContent={state} hooks={hooks}>

    </Remirror>
  )
}