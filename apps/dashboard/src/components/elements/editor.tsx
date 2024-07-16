"use client"
import { defineBasicExtension } from "node_modules/prosekit/dist/_tsup-dts-rollup"
import 'prosekit/basic/style.css'

import { type NodeJSON, createEditor, jsonFromNode } from 'prosekit/core'
import type { ProseMirrorNode } from 'prosekit/pm/model'
import { ProseKit, useDocChange } from 'prosekit/react'
import { useCallback, useMemo } from 'react'


export default function Editor(props: {
    defaultDoc?: NodeJSON
    onDocUpdate?: (doc: NodeJSON) => void
}) {
    const extension = defineBasicExtension()

    const editor = useMemo(() => {
        return createEditor({ extension, })
    }, [])

    const handleDocChange = useCallback(
        (doc: ProseMirrorNode) => props.onDocUpdate?.(jsonFromNode(doc)),
        [props.onDocUpdate],
    )
    useDocChange(handleDocChange, { editor })

    return (
        <ProseKit editor={editor}>
            <div className='box-border h-full w-full min-h-36 overflow-y-hidden overflow-x-hidden rounded-md border border-solid border-gray-200 shadow dark:border-zinc-700 flex flex-col bg-white dark:bg-neutral-900'>
                <div className='relative w-full flex-1 box-border overflow-y-scroll'>
                    <div ref={editor.mount} className='ProseMirror box-border min-h-full px-[max(40px,_calc(50%-330px))] py-[24px] outline-none outline-0 [&_span[data-mention="user"]]:text-blue-500 [&_span[data-mention="tag"]]:text-violet-500 [&_pre]:text-white [&_pre]:bg-zinc-800'></div>
                </div>
            </div>
        </ProseKit>
    )
}