"use client"

import { X } from "lucide-react"
import { cn } from "../cn"
import { createContext, useContext, useEffect } from "react"
import { create } from "zustand"


const IdContext = createContext<number | undefined>(undefined)

/*
 * The dialog.
 * The dialog is a dialog, where you can open more dialogs inside. This means, the
 * old dialog gets blurred, and a new dialog is in the focus of the user.
 * 
 * The dialog uses it's inputs like the content, will show nothing, and puts the content
 * into the root of the tree. This means, the dialog will be visible.
 * 
 * The state will be tracked with a zustand store.
 */

// The zustand store
type state = {
    open: boolean,
    openId: number | undefined,
    content: React.ReactNode | undefined,
    classNames: string | undefined
}
type action = {
    setOpen: (state: boolean) => void,
    setOpenId: (state: number | undefined) => void,
    setContent: (state: React.ReactNode | undefined) => void,
    setClassNames: (state: string | undefined) => void
}
/**
 * A zustand store for tracking the state of the dialog.
 */
const useDialogStore = create<state & action>((set) => ({
    open: false,
    openId: undefined,
    content: undefined,
    setOpen: (state) => set({ open: state }),
    setOpenId: (state: number | undefined) => set({ openId: state }),
    setContent: (state) => set({ content: state }),
    classNames: undefined,
    setClassNames: (state) => set({ classNames: state })
}))


// The components

/**
 * This is the provider for the dialog.
 * Please use this provider inside of your body. It will render the children, 
 * the dialog and the background for the dialog.
 */
function DialogProvider({ children }: { children: React.ReactNode }) {
    const { open, content, setContent, setOpenId, setOpen, classNames } = useDialogStore()
    return (
        <>
            {children}
            {/* The actuall dialog */}
            {open && content && (
                <>
                    <div className="w-full h-screen flex items-center justify-center fixed z-40 top-0">
                        <div className="w-full h-screen absolute bg-[#00000070] backdrop-brightness-75 " onClick={() => {
                            setContent(undefined)
                            setOpenId(undefined)
                            setOpen(false)
                        }} onKeyDown={() => {
                            setContent(undefined)
                            setOpenId(undefined)
                            setOpen(false)
                        }} />
                        {/*FIXME: This is your modal. You can style it now. */}
                        <div className={cn("absolute z-50 text-black bg-[#f4f4f4] lg:w-[500px] rounded-lg p-2", classNames)}>
                            {content}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}


/**
 *   This component is only for the look in your codebase, this means, all is nice together.
 */
function Dialog({ children }: { children: React.ReactNode }) {
    return (
        <IdContext.Provider value={Math.random()}>
            {children}
        </IdContext.Provider>
    )
}

/**
 * The dialog trigger, this is a button which will automatic show the dialog.
 */
interface TriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}
function DialogTrigger({ children, ...props }: TriggerProps) {
    const { open, setOpen, setOpenId } = useDialogStore()
    const id = useContext(IdContext)
    return (
        <button type="button" {...props} onClick={(e) => {
            setOpen(!open)
            setOpenId(id)

            // running the onClick prop
            if (props.onClick) {
                props.onClick(e)
            }
        }}>
            {children}
        </button>
    )
}


/**
 * The dialog content. This component will not render. The content
 * will be used inside an other element, which will be rendered on the root
 * of the react tree.
 */
function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    const { open, openId, setContent, setClassNames } = useDialogStore()
    const id = useContext(IdContext)

    useEffect(() => {
        if (open && openId === id) {
            setContent(children)
            setClassNames(className)
        }
    }, [children, open, setContent, openId, id, setClassNames, className])

    return <>
    </>
}

// components for the look
interface DialogHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode,
    customIcon?: React.ReactNode,
    showIcon?: boolean
}
function DialogHeader({ children, showIcon = true, customIcon, ...props }: DialogHeaderProps) {
    const { setOpen, setContent, setOpenId } = useDialogStore()
    return (
        <div className="flex justify-between items-center">
            <h2 className={cn("text-lg font-semibold", props.className)} {...props}>
                {children}
            </h2>
            {showIcon && !customIcon &&(
                <X className="cursor-pointer h-4 w-4" onClick={() => {
                    setContent(undefined)
                    setOpenId(undefined)
                    setOpen(false)
                }} onKeyDown={() => {
                    setContent(undefined)
                    setOpenId(undefined)
                    setOpen(false)
                }} />
            )}
            {showIcon && customIcon && (
                <>{customIcon}</>
            )}

        </div>
    )
}
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode,
}
function DialogDescription({children, ...props}: DialogDescriptionProps) {
    return (
        <p className={cn("mt-2 text-neutral-700", props.className)} {...props}>
            {children}
        </p>
    )
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode,
}
function DialogFooter({children, ...props}: DialogFooterProps) {
    return (
        <div className={cn("flex justify-end items-center", props.className)} {...props}>
            {children}
        </div>
    )
}

function DialogClose({children}: {children: React.ReactNode}) {
    const { setOpen, setContent, setOpenId } = useDialogStore()
    return (
        <div onClick={() => {
            setContent(undefined)
            setOpenId(undefined)
            setOpen(false)
        }} onKeyDown={() => {
            setContent(undefined)
            setOpenId(undefined)
            setOpen(false)
        }}>
            {children}
        </div>
    )
}

// export all of the components
export { Dialog, DialogProvider, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter, useDialogStore, DialogClose }