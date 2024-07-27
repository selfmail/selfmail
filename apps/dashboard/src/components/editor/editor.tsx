"use client"
import 'prosekit/basic/style.css'

import { createEditor, jsonFromNode, type NodeJSON } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { ProseKit, useDocChange } from 'prosekit/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { defineExtension } from './extension'
import InlineMenu from './inline-menu'
import SlashMenu from './slash-menu'
import "@/styles/prosekit.css"
import { cn } from 'lib/cn'
import { useMailStore } from '@/app/(dashboard)/send/store'
export default function Editor({
  defaultContent,
}: {
  defaultContent?: NodeJSON
}) {
  const {updateContent} = useMailStore()
  const docUpdate = (doc: NodeJSON) => {
    updateContent(doc.text)
  }
  const editor = useMemo(() => {
    const extension = defineExtension()
    return createEditor({ extension, defaultDoc: defaultContent })
  }, [defaultContent])

  const handleDocChange = useCallback(
    (doc: ProseMirrorNode) => docUpdate?.(jsonFromNode(doc)),
    [docUpdate],
  )
  useDocChange(handleDocChange, { editor })

  // get the height of the header
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    const element = document.getElementById("send-header")
    setHeight(element?.offsetHeight || 0)
  })
  console.log(height)

  return (
    <ProseKit editor={editor}>
      <div>
        <div className='relative w-full overflow-y-scroll'>
          <div ref={editor.mount} style={{minHeight: `calc(100vh - ${height}px - 32px)`}} className='ProseMirror overflow-y-auto box-border outline-none outline-0 [&_span[data-mention="user"]]:text-blue-500 [&_span[data-mention="tag"]]:text-violet-500 [&_pre]:text-white [&_pre]:bg-zinc-800'></div>
          <SlashMenu />
          <InlineMenu />
        </div>
      </div>
    </ProseKit>
  )
}